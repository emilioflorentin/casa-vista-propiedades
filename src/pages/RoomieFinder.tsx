import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/roomie/RoomieHeader';
import Footer from '@/components/roomie/RoomieFooter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { MapPin, Sparkles } from 'lucide-react';
import { RoomieListingCard, type RoomieListing } from '@/components/roomie/RoomieListingCard';
import { RoomieSwipeDeck } from '@/components/roomie/RoomieSwipeDeck';
import RoomieIntro from '@/components/roomie/RoomieIntro';
import { fetchSeeker, fetchSeekerLikes, seekerLike } from '@/utils/roomieSeeker';

const RoomieFinder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<RoomieListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [seen, setSeen] = useState<string[]>([]);
  const [hasProfile, setHasProfile] = useState(false);
  const exploreRef = useRef<HTMLDivElement>(null);

  const [zone, setZone] = useState<string | null>(() => localStorage.getItem('roomie_zone'));
  const [zoneQuery, setZoneQuery] = useState('');

  const [search, setSearch] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [onlyBillsIncluded, setOnlyBillsIncluded] = useState(false);
  const [onlyPets, setOnlyPets] = useState(false);
  const [noSmokers, setNoSmokers] = useState(false);

  useEffect(() => {
    document.title = 'Roomie Finder | Encuentra compañero de piso — Nazarí Homes';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Encuentra compañeros de piso compatibles: habitaciones con gastos detallados, fotos de la vivienda y perfiles de convivencia.');
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('roomie_listings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) toast.error('No se pudieron cargar los anuncios');
      setListings((data as RoomieListing[]) || []);

      const [profile, likes] = await Promise.all([fetchSeeker(), fetchSeekerLikes()]);
      setHasProfile(!!profile);
      setSeen(likes.map((l) => l.listing_id));
      setLoading(false);
    };
    load();
  }, [user]);

  const zones = useMemo(() => {
    const map = new Map<string, { name: string; province: string; count: number }>();
    listings.forEach((l) => {
      const key = l.municipality?.trim();
      if (!key) return;
      const current = map.get(key.toLowerCase());
      if (current) current.count += 1;
      else map.set(key.toLowerCase(), { name: key, province: l.province, count: 1 });
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [listings]);

  const visibleZones = useMemo(() => {
    const q = zoneQuery.trim().toLowerCase();
    if (!q) return zones;
    return zones.filter((z) => `${z.name} ${z.province}`.toLowerCase().includes(q));
  }, [zones, zoneQuery]);

  const chooseZone = (name: string) => {
    setZone(name);
    localStorage.setItem('roomie_zone', name);
  };

  const clearZone = () => {
    setZone(null);
    localStorage.removeItem('roomie_zone');
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const z = zone?.trim().toLowerCase();
    return listings.filter((l) => {
      if (z && `${l.municipality} ${l.province}`.toLowerCase().indexOf(z) === -1) return false;
      if (q && !(`${l.title} ${l.address} ${l.municipality} ${l.province}`.toLowerCase().includes(q))) return false;
      if (maxPrice && Number(l.rent_amount) > Number(maxPrice)) return false;
      if (onlyBillsIncluded && !l.bills_included) return false;
      if (onlyPets && !l.pets_allowed) return false;
      if (noSmokers && l.smokers) return false;
      return true;
    });
  }, [listings, zone, search, maxPrice, onlyBillsIncluded, onlyPets, noSmokers]);

  const deck = useMemo(
    () => filtered.filter((l) => !seen.includes(l.id) && l.user_id !== user?.id),
    [filtered, seen, user]
  );

  const handleLike = async (listing: RoomieListing) => {
    if (!hasProfile) {
      toast.info('Rellena tu ficha básica (sin registro) para dar "me gusta"');
      navigate('/roomie-finder/mi-perfil');
      return;
    }
    setSeen((s) => [...s, listing.id]);
    try {
      await seekerLike(listing.id);
      toast.success('¡Me gusta enviado! Te avisaremos si hay match.');
    } catch {
      toast.error('No se pudo registrar tu "me gusta"');
    }
  };

  const handleSkip = (listing: RoomieListing) => setSeen((s) => [...s, listing.id]);


  return (
    <div className="min-h-screen bg-roomie-sand">
      <Header />
      <main className="container mx-auto px-4 md:px-6 py-5 md:py-10">
        <RoomieIntro onStart={() => exploreRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} />

        <div ref={exploreRef} className="scroll-mt-24 mt-10 md:mt-2 mb-5 md:mb-8">
          <h2 className="text-2xl md:text-4xl font-bold text-roomie-ink">
            {zone ? `Habitaciones en ${zone}` : '¿En qué zona estás interesada?'}
          </h2>
          <p className="text-sm md:text-base text-roomie-ink/60 mt-1 md:mt-2 max-w-2xl">
            {zone
              ? 'Descubre una a una o consulta el listado completo con filtros.'
              : 'Elige una zona para ver solo las habitaciones disponibles allí.'}
          </p>
          {zone && (
            <Button variant="outline" size="sm" className="mt-3" onClick={clearZone}>
              <MapPin className="w-4 h-4 mr-2" />Cambiar zona
            </Button>
          )}
        </div>

        {!zone ? (
          <div className="bg-white rounded-xl border p-4 md:p-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="roomie-zone">Busca tu zona</Label>
              <Input
                id="roomie-zone"
                value={zoneQuery}
                onChange={(e) => setZoneQuery(e.target.value)}
                placeholder="Granada, Jaén, Albolote..."
              />
            </div>

            {loading ? (
              <p className="text-center text-muted-foreground py-10">Cargando zonas...</p>
            ) : visibleZones.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <p className="text-muted-foreground">No hay habitaciones publicadas en esa zona.</p>
                {zoneQuery.trim() && (
                  <Button variant="outline" onClick={() => chooseZone(zoneQuery.trim())}>
                    Buscar igualmente en "{zoneQuery.trim()}"
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {visibleZones.map((z) => (
                  <button
                    key={z.name}
                    onClick={() => chooseZone(z.name)}
                    className="text-left rounded-xl border bg-roomie-sand/60 hover:bg-roomie-sand p-4 transition-colors"
                  >
                    <span className="flex items-center gap-2 font-semibold text-roomie-ink">
                      <MapPin className="w-4 h-4 text-roomie-green" />
                      {z.name}
                    </span>
                    <span className="block text-sm text-roomie-ink/60 mt-1">
                      {z.province} · {z.count} {z.count === 1 ? 'habitación' : 'habitaciones'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
        <Tabs defaultValue="discover">
          <TabsList className="mb-6">
            <TabsTrigger value="discover"><Sparkles className="w-4 h-4 mr-2" />Descubrir</TabsTrigger>
            <TabsTrigger value="grid">Listado</TabsTrigger>
          </TabsList>


          <TabsContent value="discover">
            {loading ? (
              <p className="text-center text-muted-foreground py-20">Cargando anuncios...</p>
            ) : deck.length === 0 ? (
              <div className="text-center py-20 space-y-3">
                <p className="text-lg font-medium">No quedan anuncios por ver</p>
                <p className="text-muted-foreground">Ajusta los filtros del listado o vuelve más tarde.</p>
              </div>
            ) : (
              <RoomieSwipeDeck listings={deck} onLike={handleLike} onSkip={handleSkip} />
            )}
          </TabsContent>

          <TabsContent value="grid">
            <div className="bg-white rounded-xl border p-4 mb-6 grid gap-4 md:grid-cols-5 items-end">
              <div className="md:col-span-2 space-y-1.5">
                <Label htmlFor="roomie-search">Zona o título</Label>
                <Input id="roomie-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Granada, Centro..." />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="roomie-price">Precio máx. (€)</Label>
                <Input id="roomie-price" type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="500" />
              </div>
              <div className="flex items-center gap-2">
                <Switch id="f-bills" checked={onlyBillsIncluded} onCheckedChange={setOnlyBillsIncluded} />
                <Label htmlFor="f-bills">Gastos incluidos</Label>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Switch id="f-pets" checked={onlyPets} onCheckedChange={setOnlyPets} />
                  <Label htmlFor="f-pets">Admite mascotas</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="f-smoke" checked={noSmokers} onCheckedChange={setNoSmokers} />
                  <Label htmlFor="f-smoke">Sin fumadores</Label>
                </div>
              </div>
            </div>

            {loading ? (
              <p className="text-center text-muted-foreground py-20">Cargando anuncios...</p>
            ) : filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-20">No hay anuncios que coincidan con tu búsqueda.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((l) => (
                  <RoomieListingCard key={l.id} listing={l} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default RoomieFinder;