import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, MapPin, LocateFixed, Map as MapIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Suggestion {
  label: string;
  detail: string;
  lat: number;
  lng: number;
}

interface LocationSearchOverlayProps {
  open: boolean;
  initialValue?: string;
  onClose: () => void;
  onSelect: (value: string) => void;
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
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [mapMode, setMapMode] = useState(false);
  const [radius, setRadius] = useState('2000');
  const [picked, setPicked] = useState<Suggestion | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const layerRefs = useRef<{ marker: any; circle: any }>({ marker: null, circle: null });

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
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&countrycodes=es&q=${encodeURIComponent(term)}`
        );
        const data = await res.json();
        if (cancelled) return;
        setSuggestions(
          (data || []).map((item: any) => {
            const parts = String(item.display_name).split(',').map((p: string) => p.trim());
            return {
              label: parts[0],
              detail: parts.slice(1, 4).join(', '),
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
            };
          })
        );
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

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      const a = data?.address || {};
      return a.road || a.suburb || a.city || a.town || a.village || a.county || 'Zona seleccionada';
    } catch {
      return 'Zona seleccionada';
    }
  };

  const handleAroundMe = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const name = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
        onSelect(name);
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
        const { lat, lng } = event.latlng;
        if (layerRefs.current.marker) map.removeLayer(layerRefs.current.marker);
        if (layerRefs.current.circle) map.removeLayer(layerRefs.current.circle);
        layerRefs.current.marker = L.marker([lat, lng]).addTo(map);
        layerRefs.current.circle = L.circle([lat, lng], {
          radius: parseInt(radius, 10),
          color: '#3F6B52',
          fillColor: '#3F6B52',
          fillOpacity: 0.15,
        }).addTo(map);
        const name = await reverseGeocode(lat, lng);
        setPicked({ label: name, detail: '', lat, lng });
      });
      mapInstance.current = map;
      setTimeout(() => map.invalidateSize(), 150);
    })();
    return () => {
      disposed = true;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        layerRefs.current = { marker: null, circle: null };
      }
    };
  }, [mapMode, radius]);

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
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Radio</span>
            <Select value={radius} onValueChange={setRadius}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                {RADIUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div ref={mapRef} className="min-h-[280px] flex-1 overflow-hidden rounded-lg border" />
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {picked ? picked.label : 'Toca el mapa para elegir una zona'}
            </p>
            <Button disabled={!picked} onClick={() => picked && onSelect(picked.label)}>
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
              if (query.trim()) onSelect(query.trim());
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

          {suggestions.length > 0 && (
            <ul className="mt-3 divide-y overflow-hidden rounded-lg border">
              {suggestions.map((s, i) => (
                <li key={`${s.lat}-${s.lng}-${i}`}>
                  <button
                    type="button"
                    onClick={() => onSelect(s.label)}
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
              onClick={() => onSelect(query.trim())}
              className="mt-3 w-full rounded-lg border bg-card px-4 py-3 text-left text-sm font-semibold text-primary hover:bg-secondary"
            >
              Buscar “{query.trim()}” en los anuncios
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
