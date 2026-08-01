import { useEffect, useMemo, useState } from 'react';
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
import { Heart, Plus, UserRound, Sparkles } from 'lucide-react';
import { RoomieListingCard, type RoomieListing } from '@/components/roomie/RoomieListingCard';
import { RoomieSwipeDeck } from '@/components/roomie/RoomieSwipeDeck';

const RoomieFinder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<RoomieListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [seen, setSeen] = useState<string[]>([]);
  const [hasProfile, setHasProfile] = useState(false);

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

      if (user) {
        const [{ data: likes }, { data: profile }] = await Promise.all([
          supabase.from('roomie_likes').select('listing_id').eq('seeker_id', user.id).eq('direction', 'seeker'),
          supabase.from('roomie_profiles').select('id').eq('user_id', user.id).maybeSingle(),
        ]);
        setSeen((likes || []).map((l: { listing_id: string }) => l.listing_id));
        setHasProfile(!!profile);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return listings.filter((l) => {
      if (q && !(`${l.title} ${l.address} ${l.municipality} ${l.province}`.toLowerCase().includes(q))) return false;
      if (maxPrice && Number(l.rent_amount) > Number(maxPrice)) return false;
      if (onlyBillsIncluded && !l.bills_included) return false;
      if (onlyPets && !l.pets_allowed) return false;
      if (noSmokers && l.smokers) return false;
      return true;
    });
  }, [listings, search, maxPrice, onlyBillsIncluded, onlyPets, noSmokers]);

  const deck = useMemo(
    () => filtered.filter((l) => !seen.includes(l.id) && l.user_id !== user?.id),
    [filtered, seen, user]
  );

  const handleLike = async (listing: RoomieListing) => {
    if (!user) {
      toast.info('Inicia sesión para dar "me gusta"');
      navigate('/auth');
      return;
    }
    if (!hasProfile) {
      toast.info('Crea tu perfil de roomie para que el anunciante pueda conocerte');
      navigate('/roomie-finder/mi-perfil');
      return;
    }
    setSeen((s) => [...s, listing.id]);
    const { error } = await supabase.from('roomie_likes').insert({
      listing_id: listing.id,
      seeker_id: user.id,
      owner_id: listing.user_id,
      direction: 'seeker',
    });
    if (error && !error.message.includes('duplicate')) toast.error('No se pudo registrar tu "me gusta"');
    else toast.success('¡Me gusta enviado! Te avisaremos si hay match.');
  };

  const handleSkip = (listing: RoomieListing) => setSeen((s) => [...s, listing.id]);

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <main className="container mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-stone-800">Roomie Finder</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Encuentra compañero de piso con perfiles de convivencia reales, gastos claros y fotos de la vivienda y de la habitación libre.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 md:hidden">
            <Link to="/roomie-finder/publicar">
              <Button className="bg-stone-700 hover:bg-stone-800"><Plus className="w-4 h-4 mr-2" />Publicar habitación</Button>
            </Link>
            <Link to="/roomie-finder/mi-perfil">
              <Button variant="outline"><UserRound className="w-4 h-4 mr-2" />Mi perfil roomie</Button>
            </Link>
            <Link to="/roomie-finder/matches">
              <Button variant="outline"><Heart className="w-4 h-4 mr-2" />Matches</Button>
            </Link>
          </div>
        </div>

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
      </main>
      <Footer />
    </div>
  );
};

export default RoomieFinder;