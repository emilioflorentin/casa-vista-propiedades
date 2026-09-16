export interface GeocodedLocation {
  address: string;
  label: string;
  detail: string;
  lat: number;
  lng: number;
}

interface NominatimResult {
  display_name?: string;
  lat?: string;
  lon?: string;
  address?: Record<string, string>;
}

const buildLocation = (item: NominatimResult): GeocodedLocation | null => {
  const lat = Number(item.lat);
  const lng = Number(item.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const address = item.address ?? {};
  const road = address.road || address.pedestrian || address.square || address.neighbourhood;
  const municipality = address.city || address.town || address.village || address.municipality;
  const province = address.province || address.state;
  const label = [road && address.house_number ? `${road}, ${address.house_number}` : road, municipality]
    .filter(Boolean).join(', ') || item.display_name?.split(',')[0]?.trim() || 'Zona seleccionada';
  const detail = [address.suburb || address.city_district, municipality, province]
    .filter((part, index, parts) => part && parts.indexOf(part) === index).join(', ');
  return { address: item.display_name?.trim() || [label, detail].filter(Boolean).join(', '), label, detail, lat, lng };
};

export const searchSpanishLocations = async (query: string, limit = 6): Promise<GeocodedLocation[]> => {
  const params = new URLSearchParams({ format: 'jsonv2', addressdetails: '1', countrycodes: 'es', limit: String(limit), dedupe: '1', q: query });
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('No se pudo localizar la dirección');
  const data = await response.json() as NominatimResult[];
  return data.map(buildLocation).filter((location): location is GeocodedLocation => location !== null);
};

export const reverseSpanishLocation = async (lat: number, lng: number): Promise<GeocodedLocation> => {
  const params = new URLSearchParams({ format: 'jsonv2', addressdetails: '1', lat: String(lat), lon: String(lng) });
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('No se pudo localizar la zona');
  const location = buildLocation(await response.json() as NominatimResult);
  if (!location) throw new Error('No se pudo localizar la zona');
  return location;
};

export const geocodeSpanishAddress = async (address: string): Promise<GeocodedLocation | null> => {
  const results = await searchSpanishLocations(address, 1);
  return results[0] ?? null;
};