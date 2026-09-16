import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/roomie/RoomieHeader';
import Footer from '@/components/roomie/RoomieFooter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Heart, MessageCircle, X } from 'lucide-react';
import { formatMoney, openRoomieWhatsApp, SOCIAL_LEVELS, OCCUPATIONS, SCHEDULES, CLEANLINESS } from '@/utils/roomie';
import type { RoomieListing } from '@/components/roomie/RoomieListingCard';
import ListingStatsPanel from '@/components/stats/ListingStatsPanel';
import { fetchSeekerMatches, getSeekerToken, type SeekerMatch } from '@/utils/roomieSeeker';

interface Applicant {
  seeker_id: string; full_name: string; age: number | null; gender: string; occupation: string;
  schedule: string; social_level: string; smoker: boolean; has_pets: boolean; cleanliness: string;
  languages: string[]; budget_max: number | null; desired_area: string; move_in_date: string | null;
  bio: string; avatar_url: string | null; liked_at: string; is_matched: boolean;
}

interface MatchRow { id: string; listing_id: string; seeker_id: string; owner_id: string; }

const RoomieMatches = () => {
  const { user, loading: authLoading } = useAuth();
  const [myListings, setMyListings] = useState<RoomieListing[]>([]);
  const [applicants, setApplicants] = useState<Record<string, Applicant[]>>({});
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [listingsById, setListingsById] = useState<Record<string, RoomieListing>>({});
  const [seekerMatches, setSeekerMatches] = useState<SeekerMatch[]>([]);
  const [seekerLoading, setSeekerLoading] = useState(true);

  useEffect(() => { document.title = 'Matches | Roomie Finder — Nazarí Homes'; }, []);

  const load = useCallback(async () => {
    if (!user) return;
    const { data: mine } = await supabase.from('roomie_listings').select('*').eq('user_id', user.id);
    const listings = (mine as RoomieListing[]) || [];
    setMyListings(listings);

    const map: Record<string, Applicant[]> = {};
    for (const l of listings) {
      const { data } = await supabase.rpc('get_roomie_applicants', { p_listing_id: l.id });
      map[l.id] = (data as Applicant[]) || [];
    }
    setApplicants(map);

    const { data: ms } = await supabase.from('roomie_matches').select('*');
    const rows = (ms as MatchRow[]) || [];
    setMatches(rows);
    const ids = [...new Set(rows.map((m) => m.listing_id))];
    if (ids.length) {
      const { data: ls } = await supabase.from('roomie_listings').select('*').in('id', ids);
      const byId: Record<string, RoomieListing> = {};
      ((ls as RoomieListing[]) || []).forEach((l) => { byId[l.id] = l; });
      setListingsById(byId);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (user) { load(); return; }
    if (!getSeekerToken()) { setSeekerLoading(false); return; }
    fetchSeekerMatches().then((m) => { setSeekerMatches(m); }).finally(() => setSeekerLoading(false));
  }, [user, authLoading, load]);

  const acceptApplicant = async (listing: RoomieListing, seekerId: string) => {
    const { error } = await supabase.from('roomie_likes').insert({
      listing_id: listing.id, seeker_id: seekerId, owner_id: listing.user_id, direction: 'owner',
    });
    if (error) toast.error('No se pudo aceptar');
    else { toast.success('¡Match! Ya podéis contactar por WhatsApp'); load(); }
  };

  const rejectApplicant = async (listingId: string, seekerId: string) => {
    await supabase.from('roomie_likes').delete().eq('listing_id', listingId).eq('seeker_id', seekerId).eq('direction', 'seeker');
    toast.success('Perfil descartado');
    load();
  };

  const contact = async (listingId: string, seekerId: string, listingTitle: string) => {
    const { data, error } = await supabase.rpc('get_roomie_match_contact', {
      p_listing_id: listingId, p_seeker_id: seekerId,
    });
    const row = (data as { counterpart_name: string; counterpart_phone: string }[] | null)?.[0];
    if (error || !row?.counterpart_phone) { toast.error('No hay teléfono disponible'); return; }
    const ok = openRoomieWhatsApp(row.counterpart_phone, `Hola ${row.counterpart_name}, te escribo desde Roomie Finder de Nazarí Homes por el anuncio "${listingTitle}". ¡Hemos hecho match!`);
    if (!ok) toast.error('Teléfono no válido');
  };

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-muted">
        <Header />
        <main className="container mx-auto px-6 py-10 max-w-3xl">
          <h1 className="text-3xl font-bold text-foreground mb-2">Mis matches</h1>
          <p className="text-muted-foreground mb-6">
            Sin registro: aquí aparecen las habitaciones cuyo anunciante también te ha elegido.
          </p>
          {seekerLoading ? (
            <p className="text-muted-foreground">Cargando...</p>
          ) : !getSeekerToken() ? (
            <Card>
              <CardContent className="p-6 space-y-3 text-center">
                <p>Todavía no has creado tu ficha de búsqueda.</p>
                <Link to="/roomie-finder/mi-perfil"><Button className="bg-primary hover:bg-primary/90">Rellenar mi ficha</Button></Link>
              </CardContent>
            </Card>
          ) : seekerMatches.length === 0 ? (
            <p className="text-muted-foreground">Todavía no tienes matches. Sigue dando "me gusta" a habitaciones.</p>
          ) : (
            <div className="space-y-4">
              {seekerMatches.map((m) => (
                <Card key={m.listing_id}>
                  <CardContent className="p-4 flex items-center gap-4">
                    {m.image ? (
                      <img src={m.image} alt={m.title} className="w-20 h-20 rounded-lg object-cover" />
                    ) : <div className="w-20 h-20 rounded-lg bg-muted" />}
                    <div className="flex-1">
                      <Link to={`/roomie-finder/${m.listing_id}`} className="font-semibold hover:underline">{m.title}</Link>
                      <p className="text-sm text-muted-foreground">{m.municipality} · {formatMoney(m.rent_amount)}/mes</p>
                      <p className="text-sm text-muted-foreground">Anunciante: {m.owner_name}</p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        if (!m.owner_phone || !openRoomieWhatsApp(m.owner_phone, `Hola, te escribo desde Roomie Finder por "${m.title}". ¡Hemos hecho match!`)) {
                          toast.error('No hay teléfono disponible');
                        }
                      }}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />WhatsApp
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <p className="text-sm text-muted-foreground mt-8">
            ¿Eres anunciante? <Link to="/roomie-finder/acceso" className="text-primary hover:underline">Accede a tu cuenta</Link>.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <Header />
      <main className="container mx-auto px-6 py-10 max-w-4xl">
        <h1 className="text-3xl font-bold text-foreground mb-6">Matches e interesados</h1>
        <Tabs defaultValue="received">
          <TabsList className="mb-6">
            <TabsTrigger value="received">Interesados en mi habitación</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-6">
            {myListings.length === 0 && (
              <p className="text-muted-foreground">Aún no has publicado ninguna habitación. <Link to="/roomie-finder/publicar" className="text-primary hover:underline">Publicar ahora</Link></p>
            )}
            {myListings.map((l) => (
              <Card key={l.id}>
                <CardHeader><CardTitle className="text-lg">{l.title} · {formatMoney(l.rent_amount)}/mes</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {(applicants[l.id] || []).length === 0 && <p className="text-sm text-muted-foreground">Todavía nadie ha mostrado interés.</p>}
                  {(applicants[l.id] || []).map((a) => (
                    <div key={a.seeker_id} className="border rounded-lg p-4 flex gap-4">
                      {a.avatar_url ? (
                        <img src={a.avatar_url} alt={a.full_name} className="w-16 h-16 rounded-full object-cover" />
                      ) : <div className="w-16 h-16 rounded-full bg-muted" />}
                      <div className="flex-1 space-y-2">
                        <p className="font-semibold">{a.full_name}{a.age ? `, ${a.age}` : ''}</p>
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant="secondary">{OCCUPATIONS[a.occupation]}</Badge>
                          <Badge variant="outline">{SCHEDULES[a.schedule]}</Badge>
                          <Badge variant="outline">{SOCIAL_LEVELS[a.social_level]}</Badge>
                          <Badge variant="outline">{CLEANLINESS[a.cleanliness]}</Badge>
                          {a.smoker && <Badge variant="destructive">Fumador</Badge>}
                          {a.has_pets && <Badge variant="secondary">Con mascota</Badge>}
                        </div>
                        {a.bio && <p className="text-sm text-foreground">{a.bio}</p>}
                        <p className="text-xs text-muted-foreground">
                          Presupuesto: {a.budget_max ? formatMoney(a.budget_max) : '—'} · Zona: {a.desired_area || '—'}
                        </p>
                        <div className="flex gap-2 pt-1">
                          {a.is_matched ? (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => contact(l.id, a.seeker_id, l.title)}>
                              <MessageCircle className="w-4 h-4 mr-1" />WhatsApp
                            </Button>
                          ) : (
                            <>
                              <Button size="sm" onClick={() => acceptApplicant(l, a.seeker_id)}><Heart className="w-4 h-4 mr-1" />Aceptar</Button>
                              <Button size="sm" variant="outline" onClick={() => rejectApplicant(l.id, a.seeker_id)}><X className="w-4 h-4 mr-1" />Descartar</Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="matches" className="space-y-4">
            {matches.length === 0 && <p className="text-muted-foreground">Todavía no tienes matches.</p>}
            {matches.map((m) => {
              const l = listingsById[m.listing_id];
              return (
                <Card key={m.id}>
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">{l?.title || 'Anuncio'}</p>
                      <p className="text-sm text-muted-foreground">{l ? `${l.municipality} · ${formatMoney(l.rent_amount)}/mes` : ''}</p>
                    </div>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => contact(m.listing_id, m.seeker_id, l?.title || 'Roomie Finder')}>
                      <MessageCircle className="w-4 h-4 mr-1" />Contactar
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="stats">
            <ListingStatsPanel
              entityType="roomie_listing"
              emptyMessage="Todavía no has publicado ninguna habitación."
              items={myListings.map((l) => ({
                id: l.id,
                title: l.title,
                subtitle: `${l.address}, ${l.municipality} · ${formatMoney(l.rent_amount)}/mes`,
                image: l.room_images?.[0] || l.home_images?.[0] || null,
                extra: [
                  { label: 'Likes recibidos', value: (applicants[l.id] || []).length, icon: 'like' as const },
                  {
                    label: 'Matches',
                    value: matches.filter((m) => m.listing_id === l.id).length,
                    icon: 'match' as const,
                  },
                ],
              }))}
            />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default RoomieMatches;