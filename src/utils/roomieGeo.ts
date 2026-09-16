import { geocodeSpanishAddress } from '@/utils/geocoding';

export interface Coords {
  lat: number;
  lng: number;
}

const CACHE_KEY = 'roomie_geo_cache';

const readCache = (): Record<string, Coords> => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
};

const writeCache = (cache: Record<string, Coords>) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* ignore quota errors */
  }
};

export const isInsidePolygon = (point: Coords, polygon: [number, number][]): boolean => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [latI, lngI] = polygon[i];
    const [latJ, lngJ] = polygon[j];
    const intersects =
      lngI > point.lng !== lngJ > point.lng &&
      point.lat < ((latJ - latI) * (point.lng - lngI)) / (lngJ - lngI) + latI;
    if (intersects) inside = !inside;
  }
  return inside;
};

interface GeocodableListing {
  id: string;
  address?: string | null;
  municipality?: string | null;
  province?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

/**
 * Resolves coordinates for listings: uses stored lat/lng when available,
 * otherwise geocodes the address once and caches the result locally.
 */
export const resolveListingsCoords = async (
  listings: GeocodableListing[]
): Promise<Record<string, Coords>> => {
  const cache = readCache();
  const result: Record<string, Coords> = {};
  let cacheDirty = false;

  for (const listing of listings) {
    if (typeof listing.latitude === 'number' && typeof listing.longitude === 'number') {
      result[listing.id] = { lat: listing.latitude, lng: listing.longitude };
      continue;
    }
    const key = [listing.address, listing.municipality, listing.province]
      .filter(Boolean)
      .join(', ')
      .toLowerCase();
    if (!key) continue;
    if (cache[key]) {
      result[listing.id] = cache[key];
      continue;
    }
    try {
      const found = await geocodeSpanishAddress(key);
      if (found) {
        cache[key] = { lat: found.lat, lng: found.lng };
        result[listing.id] = cache[key];
        cacheDirty = true;
      }
    } catch {
      /* ignore geocoding failures */
    }
    await new Promise((resolve) => setTimeout(resolve, 1100));
  }

  if (cacheDirty) writeCache(cache);
  return result;
};
