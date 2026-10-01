import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, MapPin, LocateFixed, Map as MapIcon, Loader2, Pencil, LayoutGrid } from 'lucide-react';
import { feature } from 'topojson-client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GeocodedLocation, reverseSpanishLocation, searchSpanishLocations } from '@/utils/geocoding';

export interface LocationSelection extends GeocodedLocation {
  radius: number;
  polygon?: [number, number][];
  polygons?: [number, number][][];
}

type ZoneFeature = GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon, { name: string }>;
type ZoneCollection = GeoJSON.FeatureCollection<GeoJSON.Polygon | GeoJSON.MultiPolygon, { name: string }>;
const zoneCache: Partial<Record<'provinces' | 'municipalities', ZoneCollection>> = {};
const boundsCache = new WeakMap<ZoneFeature, [number, number, number, number]>();

const zoneBounds = (zone: ZoneFeature): [number, number, number, number] => {
  const cached = boundsCache.get(zone);
  if (cached) return cached;
  let south = Infinity, west = Infinity, north = -Infinity, east = -Infinity;
  const visit = (coords: unknown): void => {
    if (!Array.isArray(coords)) return;
    if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      west = Math.min(west, coords[0]); east = Math.max(east, coords[0]);
      south = Math.min(south, coords[1]); north = Math.max(north, coords[1]);
    } else coords.forEach(visit);
  };
  visit(zone.geometry.coordinates);
  const bounds: [number, number, number, number] = [south, west, north, east];
  boundsCache.set(zone, bounds);
  return bounds;
};

const loadZones = async (level: 'provinces' | 'municipalities'): Promise<ZoneCollection> => {
  if (zoneCache[level]) return zoneCache[level];
  const response = await fetch(`/data/spain-${level}.json`);
  if (!response.ok) throw new Error('No se pudieron cargar las zonas');
  const topology = await response.json();
  const collection = feature(topology, topology.objects[level]) as ZoneCollection;
  zoneCache[level] = collection;
  return collection;
};

const simplifyRing = (ring: number[][]): [number, number][] => {
  // Keep URLs compact while retaining the outline at neighbourhood scale.
  const step = Math.max(1, Math.ceil(ring.length / 65));
  return ring.filter((_, index) => index % step === 0).map(([lng, lat]) => [lat, lng]);
};

const featureRings = (zone: ZoneFeature): [number, number][][] => {
  const shapes = zone.geometry.type === 'Polygon' ? [zone.geometry.coordinates] : zone.geometry.coordinates;
  return shapes.map((shape) => simplifyRing(shape[0])).filter((ring) => ring.length >= 3);
};

interface LocationSearchOverlayProps {
  open: boolean;
  initialValue?: string;
  onClose: () => void;
  onSelect: (value: LocationSelection | { address: string }) => void;
}

const RADIUS_OPTIONS = [
  { value: '500', label: '500 m' },
  { value: '1000', label: '1 km' },
  { value: '2000', label: '2 km' },
  { value: '5000', label: '5 km' },
  { value: '10000', label: '10 km' },
];

const LocationSearchOverlay = ({ open, initialValue = '', onClose, onSelect }: LocationSearchOverlayProps) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<GeocodedLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [mapMode, setMapMode] = useState(false);
  const [radius, setRadius] = useState('2000');
  const [picked, setPicked] = useState<GeocodedLocation | null>(null);
  const [drawMode, setDrawMode] = useState(false);
  const [polygon, setPolygon] = useState<[number, number][] | null>(null);
  const [polygons, setPolygons] = useState<[number, number][][] | null>(null);
  const [zonesOpen, setZonesOpen] = useState(false);
  const [zonesError, setZonesError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const drawModeRef = useRef(false);
  const zonesOpenRef = useRef(false);
  const zoneLayerRef = useRef<any>(null);
  const drawPointsRef = useRef<[number, number][]>([]);
  const layerRefs = useRef<{ marker: any; circle: any; shape: any }>({ marker: null, circle: null, shape: null });

  // Lock background scroll while the overlay is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery(initialValue);
      setMapMode(false);
      setPicked(null);
      setSuggestions([]);
      setZonesOpen(false);
      setZonesError(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open, initialValue]);

  // Autocomplete (debounced)
  useEffect(() => {
    if (!open || mapMode) return;
    const term = query.trim();
    if (term.length < 3) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await searchSpanishLocations(term);
        if (cancelled) return;
        setSuggestions(data);
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 320);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      setLoading(false);
    };
  }, [query, open, mapMode]);

  const handleAroundMe = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const location = await reverseSpanishLocation(pos.coords.latitude, pos.coords.longitude);
          onSelect({ ...location, radius: Number(radius) });
        } finally {
          setLocating(false);
        }
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  };

  // Leaflet map for zone selection
  useEffect(() => {
    if (!mapMode) return;
    let disposed = false;
    (async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      if (disposed || !mapRef.current || mapInstance.current) return;
      const map = L.map(mapRef.current).setView([40.4168, -3.7038], 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(map);
      map.on('click', async (event: any) => {
        if (drawModeRef.current || zonesOpenRef.current) return;
        const { lat, lng } = event.latlng;
        if (layerRefs.current.marker) map.removeLayer(layerRefs.current.marker);
        if (layerRefs.current.circle) map.removeLayer(layerRefs.current.circle);
        if (layerRefs.current.shape) { map.removeLayer(layerRefs.current.shape); layerRefs.current.shape = null; }
        setPolygon(null);
        setPolygons(null);
        layerRefs.current.marker = L.marker([lat, lng]).addTo(map);
        layerRefs.current.circle = L.circle([lat, lng], {
          radius: parseInt(radius, 10),
          color: '#3F6B52',
          fillColor: '#3F6B52',
          fillOpacity: 0.15,
        }).addTo(map);
        try {
          setPicked(await reverseSpanishLocation(lat, lng));
        } catch {
          setPicked({ address: 'Zona seleccionada', label: 'Zona seleccionada', detail: '', lat, lng });
        }
      });

      // Freehand drawing with finger / mouse
      const container = map.getContainer();
      const toLatLng = (event: PointerEvent): [number, number] => {
        const rect = container.getBoundingClientRect();
        const point = L.point(event.clientX - rect.left, event.clientY - rect.top);
        const ll = map.containerPointToLatLng(point);
        return [ll.lat, ll.lng];
      };
      const onDown = (event: PointerEvent) => {
        if (!drawModeRef.current) return;
        event.preventDefault();
        container.setPointerCapture?.(event.pointerId);
        drawPointsRef.current = [toLatLng(event)];
        if (layerRefs.current.shape) map.removeLayer(layerRefs.current.shape);
        layerRefs.current.shape = L.polyline(drawPointsRef.current, { color: '#C9A227', weight: 3 }).addTo(map);
      };
      const onMove = (event: PointerEvent) => {
        if (!drawModeRef.current || drawPointsRef.current.length === 0) return;
        event.preventDefault();
        drawPointsRef.current.push(toLatLng(event));
        layerRefs.current.shape?.setLatLngs(drawPointsRef.current);
      };
      const onUp = async (event: PointerEvent) => {
        if (!drawModeRef.current || drawPointsRef.current.length === 0) return;
        container.releasePointerCapture?.(event.pointerId);
        const points = drawPointsRef.current;
        drawPointsRef.current = [];
        if (points.length < 3) {
          if (layerRefs.current.shape) { map.removeLayer(layerRefs.current.shape); layerRefs.current.shape = null; }
          return;
        }
        if (layerRefs.current.shape) map.removeLayer(layerRefs.current.shape);
        layerRefs.current.shape = L.polygon(points, {
          color: '#C9A227',
          fillColor: '#C9A227',
          fillOpacity: 0.18,
          weight: 3,
        }).addTo(map);
        if (layerRefs.current.marker) { map.removeLayer(layerRefs.current.marker); layerRefs.current.marker = null; }
        if (layerRefs.current.circle) { map.removeLayer(layerRefs.current.circle); layerRefs.current.circle = null; }
        setPolygon(points);
        setPolygons(null);
        const center = layerRefs.current.shape.getBounds().getCenter();
        try {
          setPicked(await reverseSpanishLocation(center.lat, center.lng));
        } catch {
          setPicked({ address: 'Zona dibujada', label: 'Zona dibujada', detail: '', lat: center.lat, lng: center.lng });
        }
      };
      container.addEventListener('pointerdown', onDown);
      container.addEventListener('pointermove', onMove);
      container.addEventListener('pointerup', onUp);
      container.addEventListener('pointercancel', onUp);
      (map as any)._pisogoCleanup = () => {
        container.removeEventListener('pointerdown', onDown);
        container.removeEventListener('pointermove', onMove);
        container.removeEventListener('pointerup', onUp);
        container.removeEventListener('pointercancel', onUp);
      };

      leafletRef.current = L;
      mapInstance.current = map;
      setTimeout(() => map.invalidateSize(), 150);
    })();
    return () => {
      disposed = true;
      if (mapInstance.current) {
        (mapInstance.current as any)._pisogoCleanup?.();
        mapInstance.current.remove();
        mapInstance.current = null;
        layerRefs.current = { marker: null, circle: null, shape: null };
        zoneLayerRef.current = null;
      }
      drawPointsRef.current = [];
      setPolygon(null);
      setDrawMode(false);
      drawModeRef.current = false;
    };
  }, [mapMode]);

  // A map overlay, not a side list: show provinces at country scale and municipalities when zoomed in.
  useEffect(() => {
    zonesOpenRef.current = zonesOpen;
    const map = mapInstance.current;
    const L = leafletRef.current;
    if (!map || !L || !zonesOpen || drawMode) {
      if (map && zoneLayerRef.current) map.removeLayer(zoneLayerRef.current);
      zoneLayerRef.current = null;
      return;
    }
    let cancelled = false;
    let serial = 0;
    const update = async () => {
      const request = ++serial;
      const level = map.getZoom() >= 10 ? 'municipalities' : 'provinces';
      try {
        const collection = await loadZones(level);
        if (cancelled || request !== serial) return;
        setZonesError(false);
        if (zoneLayerRef.current) map.removeLayer(zoneLayerRef.current);
        const bounds = map.getBounds().pad(0.15);
        const visible = collection.features.filter((zone) => {
          const [south, west, north, east] = zoneBounds(zone);
          return bounds.intersects(L.latLngBounds([south, west], [north, east]));
        });
        const layer = L.geoJSON(visible, {
          style: {
            color: 'hsl(var(--foreground))', weight: 1.5,
            fillColor: 'hsl(var(--primary))', fillOpacity: 0.06,
          },
          onEachFeature: (zone: ZoneFeature, path: any) => {
            path.bindTooltip(zone.properties.name, { sticky: true, direction: 'top' });
            path.on('mouseover', () => path.setStyle({ fillOpacity: 0.28, weight: 2.5 }));
            path.on('mouseout', () => path.setStyle({ fillOpacity: 0.06, weight: 1.5 }));
            path.on('click', (event: any) => {
              L.DomEvent.stopPropagation(event);
              const rings = featureRings(zone);
              if (!rings.length) return;
              if (layerRefs.current.marker) map.removeLayer(layerRefs.current.marker);
              if (layerRefs.current.circle) map.removeLayer(layerRefs.current.circle);
              if (layerRefs.current.shape) map.removeLayer(layerRefs.current.shape);
              layerRefs.current = { marker: null, circle: null, shape: L.geoJSON(zone, {
                style: { color: 'hsl(var(--primary))', weight: 3, fillColor: 'hsl(var(--primary))', fillOpacity: 0.22 },
                interactive: false,
              }).addTo(map) };
              setPolygon(rings[0]);
              setPolygons(rings);
              const center = path.getBounds().getCenter();
              setPicked({ address: zone.properties.name, label: zone.properties.name, detail: '', lat: center.lat, lng: center.lng });
              setZonesOpen(false);
              map.fitBounds(path.getBounds(), { padding: [24, 24], maxZoom: level === 'provinces' ? 9 : 14 });
            });
          },
        }).addTo(map);
        zoneLayerRef.current = layer;
      } catch {
        if (!cancelled) setZonesError(true);
      }
    };
    map.on('moveend', update);
    update();
    return () => {
      cancelled = true;
      map.off('moveend', update);
      if (zoneLayerRef.current) map.removeLayer(zoneLayerRef.current);
      zoneLayerRef.current = null;
    };
  }, [zonesOpen, drawMode, mapMode]);

  // Toggle map dragging while drawing
  useEffect(() => {
    drawModeRef.current = drawMode;
    const map = mapInstance.current;
    if (!map) return;
    if (drawMode) {
      map.dragging.disable();
      map.doubleClickZoom.disable();
      map.touchZoom.disable();
      map.getContainer().style.cursor = 'crosshair';
      map.getContainer().style.touchAction = 'none';
    } else {
      map.dragging.enable();
      map.doubleClickZoom.enable();
      map.touchZoom.enable();
      map.getContainer().style.cursor = '';
      map.getContainer().style.touchAction = '';
    }
  }, [drawMode, mapMode]);

  const clearDrawing = () => {
    const map = mapInstance.current;
    if (map && layerRefs.current.shape) {
      map.removeLayer(layerRefs.current.shape);
      layerRefs.current.shape = null;
    }
    setPolygon(null);
    setPolygons(null);
    setPicked(null);
  };

  useEffect(() => {
    if (layerRefs.current.circle) layerRefs.current.circle.setRadius(Number(radius));
  }, [radius]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col bg-background">
      <div className="flex items-center justify-between gap-4 border-b px-5 py-4">
        <h2 className="text-xl font-bold text-foreground md:text-2xl">
          {mapMode ? 'Selecciona la zona' : '¿Dónde buscas?'}
        </h2>
        <button
          type="button"
          aria-label="Cerrar"
          onClick={() => (mapMode ? setMapMode(false) : onClose())}
          className="rounded-full p-2 text-foreground hover:bg-secondary"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {mapMode ? (
        <div className="flex flex-1 flex-col gap-3 overflow-hidden p-5">
          <div className="flex flex-wrap items-center gap-2">
            {!polygon && (
              <>
                <span className="text-sm text-muted-foreground">Radio</span>
                <Select value={radius} onValueChange={setRadius}>
                  <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                  <SelectContent className="z-[300]" position="popper">
                    {RADIUS_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
            <Button
              type="button"
              size="sm"
              variant={drawMode ? 'default' : 'outline'}
              onClick={() => setDrawMode((v) => !v)}
              className="ml-auto gap-2"
            >
              <Pencil className="h-4 w-4" />
              {drawMode ? 'Dibujando…' : 'Dibujar zona'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={zonesOpen ? 'default' : 'outline'}
              onClick={() => setZonesOpen((v) => !v)}
              className="gap-2"
              aria-pressed={zonesOpen}
            >
              <LayoutGrid className="h-4 w-4" />
              Zonas
            </Button>
            {polygon && (
              <Button type="button" size="sm" variant="ghost" onClick={clearDrawing}>Borrar</Button>
            )}
          </div>
          <div className="relative min-h-[280px] flex-1 overflow-hidden rounded-lg border">
            <div ref={mapRef} className="absolute inset-0" />
            {zonesOpen && (
              <div className="pointer-events-none absolute bottom-3 left-3 z-[500] max-w-[calc(100%-1.5rem)] rounded bg-card/95 px-3 py-2 text-xs font-medium text-foreground shadow-md">
                {zonesError ? 'No se pudieron cargar las zonas' : 'Toca una zona del mapa · Acércate para ver municipios'}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {drawMode
                ? 'Dibuja con el dedo el contorno de la zona'
                : picked
                  ? polygon ? `Zona dibujada · ${picked.label}` : picked.label
                  : 'Toca el mapa o dibuja tu zona'}
            </p>
            <Button
              disabled={!picked}
              onClick={() => picked && onSelect({ ...picked, radius: Number(radius), ...(polygon ? { polygon } : {}), ...(polygons ? { polygons } : {}) })}
            >
              Aplicar zona
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-5 pb-8">
          <form
            className="relative mt-5"
            onSubmit={(e) => {
              e.preventDefault();
               const exact = suggestions[0];
               if (exact) onSelect({ ...exact, radius: Number(radius) });
               else if (query.trim()) onSelect({ address: query.trim() });
            }}
          >
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Municipio, barrio, calle o referencia"
              className="h-14 w-full rounded-lg border bg-card pl-12 pr-12 text-base text-foreground outline-none ring-primary focus:ring-2"
            />
            {loading && <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-muted-foreground" />}
          </form>

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-foreground">Buscar en un radio de</span>
            <Select value={radius} onValueChange={setRadius}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent className="z-[300]" position="popper">{RADIUS_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          {suggestions.length > 0 && (
            <ul className="mt-3 divide-y overflow-hidden rounded-lg border">
              {suggestions.map((s, i) => (
                <li key={`${s.lat}-${s.lng}-${i}`}>
                  <button
                    type="button"
                    onClick={() => onSelect({ ...s, radius: Number(radius) })}
                    className="flex w-full items-start gap-3 bg-card px-4 py-3 text-left hover:bg-secondary"
                  >
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span>
                      <span className="block font-semibold text-foreground">{s.label}</span>
                      <span className="block text-sm text-muted-foreground">{s.detail}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {query.trim().length > 0 && (
            <button
              type="button"
              onClick={() => onSelect({ address: query.trim() })}
              className="mt-3 w-full rounded-lg border bg-card px-4 py-3 text-left text-sm font-semibold text-primary hover:bg-secondary"
            >
               Buscar la referencia “{query.trim()}”
            </button>
          )}

          <p className="mt-7 text-base font-semibold text-foreground">También puedes:</p>
          <div className="mt-3 space-y-3">
            <button
              type="button"
              onClick={() => setMapMode(true)}
              className="flex w-full items-center gap-4 rounded-lg border bg-card px-4 py-4 text-left hover:bg-secondary"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                <MapIcon className="h-6 w-6 text-primary" />
              </span>
              <span className="font-semibold text-foreground">Seleccionar zona en el mapa</span>
            </button>
            <button
              type="button"
              onClick={handleAroundMe}
              className="flex w-full items-center gap-4 rounded-lg border bg-card px-4 py-4 text-left hover:bg-secondary"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                {locating ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <LocateFixed className="h-6 w-6 text-primary" />}
              </span>
              <span className="font-semibold text-foreground">Buscar alrededor de ti</span>
            </button>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};

export default LocationSearchOverlay;
