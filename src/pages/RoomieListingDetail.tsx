import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '@/components/roomie/RoomieHeader';
import Footer from '@/components/roomie/RoomieFooter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Heart, MapPin, Check, X } from 'lucide-react';
import type { RoomieListing } from '@/components/roomie/RoomieListingCard';
import {
  formatMoney, includedBills, SOCIAL_LEVELS, CLEANLINESS, SCHEDULES,
  OCCUPATIONS, GUESTS_POLICY, GENDER_MIX, GENDERS, PROPERTY_TYPES,
} from '@/utils/roomie';
import { trackListingEvent } from '@/utils/analyticsEvents';
import { fetchSeekerLikes, seekerLike, getSeekerToken } from '@/utils/roomieSeeker';

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between gap-4 py-1.5 border-b border-stone-100 last:border-0 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-right">{value}</span>
  </div>
);

const Gallery = ({ images, alt }: { images: string[]; alt: string }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
    {images.map((src, i) => (
      <a key={i} href={src} target="_blank" rel="noreferrer" className="block aspect-[4/3] bg-stone-100 rounded-lg overflow-hidden">
        <img src={src} alt={`${alt} ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform" loading="lazy" />
      </a>
    ))}
  </div>
);

const RoomieListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState<RoomieListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const { data } = await supabase.from('roomie_listings').select('*').eq('id', id).maybeSingle();
      setListing((data as RoomieListing) || null);
      if (data) {
        document.title = `${data.title} | Roomie Finder — Nazarí Homes`;
        trackListingEvent('roomie_listing', data.id, 'view', data.user_id);
      }
      if (getSeekerToken()) {
        const likes = await fetchSeekerLikes();
        setLiked(likes.some((l) => l.listing_id === id));
      }
      setLoading(false);
    };
    load();
  }, [id, user]);

  const like = async () => {
    if (!listing) return;
    if (!getSeekerToken()) {
      toast.info('Rellena tu ficha básica (sin registro) para dar "me gusta"');
      navigate('/roomie-finder/mi-perfil');
      return;
    }
    try {
      await seekerLike(listing.id);
      setLiked(true);
      toast.success('¡Me gusta enviado! Te avisaremos si hay match.');
    } catch {
      toast.error('No se pudo enviar tu "me gusta"');
    }
  };

  if (loading) return <div className="min-h-screen bg-stone-50"><Header /><p className="text-center py-20 text-muted-foreground">Cargando...</p><Footer /></div>;
  if (!listing) return <div className="min-h-screen bg-stone-50"><Header /><p className="text-center py-20">Anuncio no encontrado.</p><Footer /></div>;

  const bills = includedBills(listing);
  const yn = (v: boolean) => (v ? <Check className="w-4 h-4 text-green-600 inline" /> : <X className="w-4 h-4 text-red-500 inline" />);

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <main className="container mx-auto px-6 py-8">
        <Link to="/roomie-finder" className="inline-flex items-center text-sm text-muted-foreground hover:text-stone-800 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Volver a Roomie Finder
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-stone-800">{listing.title}</h1>
              <p className="text-muted-foreground flex items-center gap-1 mt-2">
                <MapPin className="w-4 h-4" />{listing.address}, {listing.municipality} ({listing.province})
              </p>
            </div>

            <section>
              <h2 className="text-xl font-semibold mb-3">Habitación libre</h2>
              {listing.room_images?.length ? <Gallery images={listing.room_images} alt="Habitación" /> : <p className="text-muted-foreground text-sm">Sin fotos.</p>}
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">La vivienda</h2>
              {listing.home_images?.length ? <Gallery images={listing.home_images} alt="Vivienda" /> : <p className="text-muted-foreground text-sm">Sin fotos.</p>}
            </section>

            <Card>
              <CardHeader><CardTitle className="text-lg">Convivencia</CardTitle></CardHeader>
              <CardContent>
                <Row label="Convivientes actuales" value={listing.flatmates_count} />
                <Row label="Rango de edad" value={listing.flatmates_age_range || '—'} />
                <Row label="Género" value={GENDER_MIX[listing.flatmates_gender_mix] || listing.flatmates_gender_mix} />
                <Row label="Ocupación" value={OCCUPATIONS[listing.flatmates_occupation] || listing.flatmates_occupation} />
                <Row label="Horarios" value={SCHEDULES[listing.flatmates_schedule] || listing.flatmates_schedule} />
                <Row label="Socialización" value={SOCIAL_LEVELS[listing.social_level] || listing.social_level} />
                <Row label="Limpieza" value={CLEANLINESS[listing.cleanliness] || listing.cleanliness} />
                <Row label="Visitas" value={GUESTS_POLICY[listing.guests_policy] || listing.guests_policy} />
                <Row label="Fumadores en casa" value={yn(listing.smokers)} />
                <Row label="Hay mascotas" value={yn(listing.has_pets)} />
                <Row label="Se admiten mascotas" value={yn(listing.pets_allowed)} />
                <Row label="Idiomas" value={listing.languages?.join(', ') || '—'} />
                {listing.atmosphere && <p className="pt-3 text-sm text-stone-700 whitespace-pre-line">{listing.atmosphere}</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Compañero que buscan</CardTitle></CardHeader>
              <CardContent>
                <Row label="Edad" value={listing.pref_age_min || listing.pref_age_max ? `${listing.pref_age_min ?? '—'} - ${listing.pref_age_max ?? '—'} años` : 'Indiferente'} />
                <Row label="Género" value={GENDERS[listing.pref_gender || 'any']} />
                <Row label="Ocupación" value={OCCUPATIONS[listing.pref_occupation || 'any']} />
                <Row label="Fumador" value={listing.pref_smoker === 'any' ? 'Indiferente' : listing.pref_smoker === 'no' ? 'No fumador' : 'Sí'} />
                <Row label="Mascotas" value={listing.pref_pets === 'any' ? 'Indiferente' : listing.pref_pets === 'no' ? 'Sin mascotas' : 'Sí'} />
                <Row label="Estancia mínima" value={listing.pref_min_stay_months ? `${listing.pref_min_stay_months} meses` : 'Indiferente'} />
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-2xl">{formatMoney(listing.rent_amount)}<span className="text-sm font-normal text-muted-foreground">/mes</span></CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Row label="Fianza" value={formatMoney(listing.deposit_amount)} />
                <Row label="Gastos incluidos" value={listing.bills_included ? 'Sí' : 'No'} />
                <Row label="Suministros" value={bills.length ? bills.join(', ') : '—'} />
                {!listing.bills_included && <Row label="Gastos estimados" value={`${formatMoney(listing.bills_estimate)}/mes`} />}
                <Row label="Disponible desde" value={new Date(listing.available_from).toLocaleDateString('es-ES')} />
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <Badge variant="secondary">{PROPERTY_TYPES[listing.property_type] || listing.property_type}</Badge>
                  <Badge variant="secondary">{listing.total_rooms} hab.</Badge>
                  <Badge variant="secondary">{listing.bathrooms} baños</Badge>
                  <Badge variant="secondary">{listing.total_area} m²</Badge>
                  <Badge variant="secondary">Habitación {listing.room_area} m²</Badge>
                  {listing.room_private_bath && <Badge>Baño privado</Badge>}
                  {listing.room_furnished && <Badge>Amueblada</Badge>}
                  {listing.room_exterior && <Badge>Exterior</Badge>}
                </div>

                {user?.id === listing.user_id ? (
                  <Link to="/roomie-finder/matches" className="block">
                    <Button className="w-full mt-3" variant="outline">Ver interesados</Button>
                  </Link>
                ) : (
                  <Button className="w-full mt-3 bg-green-600 hover:bg-green-700" onClick={like} disabled={liked}>
                    <Heart className="w-4 h-4 mr-2" />{liked ? 'Me gusta enviado' : 'Me interesa'}
                  </Button>
                )}
                <p className="text-xs text-muted-foreground text-center">El contacto se desbloquea cuando hay match mutuo.</p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RoomieListingDetail;