import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/roomie/RoomieHeader';
import Footer from '@/components/roomie/RoomieFooter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { uploadRoomieImages } from '@/utils/roomie';
import { geocodeSpanishAddress } from '@/utils/geocoding';

import { ArrowLeft, ArrowRight, Upload } from 'lucide-react';

const STEPS = ['Vivienda', 'Habitación', 'Gastos', 'Convivencia', 'Preferencias', 'Fotos'];

const RoomiePublish = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [homeFiles, setHomeFiles] = useState<File[]>([]);
  const [roomFiles, setRoomFiles] = useState<File[]>([]);

  const [f, setF] = useState({
    title: '', address: '', municipality: '', province: '', property_type: 'apartment',
    total_rooms: '3', bathrooms: '1', total_area: '80',
    room_area: '12', room_private_bath: false, room_furnished: true, room_exterior: true,
    available_from: new Date().toISOString().slice(0, 10),
    rent_amount: '', deposit_amount: '', bills_included: false,
    includes_water: false, includes_electricity: false, includes_gas: false,
    includes_internet: false, includes_community: false, bills_estimate: '',
    flatmates_count: '2', flatmates_age_range: '25-35', flatmates_gender_mix: 'mixed',
    flatmates_occupation: 'both', flatmates_schedule: 'mixed', social_level: 'balanced',
    smokers: false, has_pets: false, pets_allowed: false, cleanliness: 'normal',
    guests_policy: 'occasionally', languages: 'Español', atmosphere: '',
    pref_age_min: '', pref_age_max: '', pref_gender: 'any', pref_occupation: 'any',
    pref_smoker: 'any', pref_pets: 'any', pref_min_stay_months: '',
    contact_phone: '',
  });

  const set = (k: string, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    document.title = 'Publicar habitación | Roomie Finder — Nazarí Homes';
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.info('Inicia sesión para publicar una habitación');
      navigate('/auth');
    }
  }, [authLoading, user, navigate]);

  const validateStep = () => {
    if (step === 0) {
      if (!f.title.trim() || !f.address.trim() || !f.municipality.trim() || !f.province.trim()) {
        toast.error('Completa los datos de la vivienda'); return false;
      }
    }
    if (step === 2) {
      if (!f.rent_amount || Number(f.rent_amount) <= 0) { toast.error('El alquiler mensual es obligatorio'); return false; }
      if (!f.bills_included && !f.bills_estimate) { toast.error('Indica el importe estimado de gastos'); return false; }
      if (!f.contact_phone.trim()) { toast.error('Indica un teléfono de contacto'); return false; }
    }
    if (step === 5) {
      if (homeFiles.length < 3) { toast.error('Sube al menos 3 fotos de la vivienda completa'); return false; }
      if (roomFiles.length < 2) { toast.error('Sube al menos 2 fotos de la habitación libre'); return false; }
    }
    return true;
  };

  const submit = async () => {
    if (!user || !validateStep()) return;
    setSaving(true);
    try {
      const [home_images, room_images] = await Promise.all([
        uploadRoomieImages(homeFiles, user.id, 'home'),
        uploadRoomieImages(roomFiles, user.id, 'room'),
      ]);
      const geo = await geocodeSpanishAddress(
        [f.address.trim(), f.municipality.trim(), f.province.trim()].filter(Boolean).join(', ')
      ).catch(() => null);
      const { data, error } = await supabase.from('roomie_listings').insert({
        user_id: user.id,
        title: f.title.trim(), address: f.address.trim(), municipality: f.municipality.trim(),
        province: f.province.trim(), property_type: f.property_type,
        latitude: geo?.lat ?? null, longitude: geo?.lng ?? null,

        total_rooms: Number(f.total_rooms), bathrooms: Number(f.bathrooms), total_area: Number(f.total_area),
        home_images, room_images,
        room_area: Number(f.room_area), room_private_bath: f.room_private_bath,
        room_furnished: f.room_furnished, room_exterior: f.room_exterior,
        available_from: f.available_from,
        rent_amount: Number(f.rent_amount), deposit_amount: Number(f.deposit_amount || 0),
        bills_included: f.bills_included, includes_water: f.includes_water,
        includes_electricity: f.includes_electricity, includes_gas: f.includes_gas,
        includes_internet: f.includes_internet, includes_community: f.includes_community,
        bills_estimate: Number(f.bills_estimate || 0),
        flatmates_count: Number(f.flatmates_count), flatmates_age_range: f.flatmates_age_range,
        flatmates_gender_mix: f.flatmates_gender_mix, flatmates_occupation: f.flatmates_occupation,
        flatmates_schedule: f.flatmates_schedule, social_level: f.social_level,
        smokers: f.smokers, has_pets: f.has_pets, pets_allowed: f.pets_allowed,
        cleanliness: f.cleanliness, guests_policy: f.guests_policy,
        languages: f.languages.split(',').map((s) => s.trim()).filter(Boolean),
        atmosphere: f.atmosphere,
        pref_age_min: f.pref_age_min ? Number(f.pref_age_min) : null,
        pref_age_max: f.pref_age_max ? Number(f.pref_age_max) : null,
        pref_gender: f.pref_gender, pref_occupation: f.pref_occupation,
        pref_smoker: f.pref_smoker, pref_pets: f.pref_pets,
        pref_min_stay_months: f.pref_min_stay_months ? Number(f.pref_min_stay_months) : null,
        contact_phone: f.contact_phone.trim(),
      }).select('id').single();
      if (error) throw error;
      toast.success('¡Anuncio publicado!');
      navigate(`/roomie-finder/${data.id}`);
    } catch (e) {
      console.error(e);
      toast.error('No se pudo publicar el anuncio');
    } finally {
      setSaving(false);
    }
  };

  const SwitchRow = ({ id, label, k }: { id: string; label: string; k: keyof typeof f }) => (
    <div className="flex items-center justify-between border rounded-lg px-3 py-2">
      <Label htmlFor={id}>{label}</Label>
      <Switch id={id} checked={f[k] as boolean} onCheckedChange={(v) => set(k as string, v)} />
    </div>
  );

  const Picker = ({ label, k, options }: { label: string; k: keyof typeof f; options: [string, string][] }) => (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={f[k] as string} onValueChange={(v) => set(k as string, v)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted">
      <Header />
      <main className="container mx-auto px-6 py-10 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">Publicar habitación</h1>
        <p className="text-muted-foreground mb-6">Los gastos y las fotos de la vivienda y de la habitación son obligatorios.</p>

        <div className="flex flex-wrap gap-2 mb-6">
          {STEPS.map((s, i) => (
            <span key={s} className={`text-xs px-3 py-1 rounded-full border ${i === step ? 'bg-primary text-white border-primary' : i < step ? 'bg-muted border-border' : 'bg-white'}`}>
              {i + 1}. {s}
            </span>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle>{STEPS[step]}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {step === 0 && (
              <>
                <div className="space-y-1.5"><Label htmlFor="title">Título *</Label>
                  <Input id="title" value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="Habitación luminosa en piso compartido" /></div>
                <div className="space-y-1.5"><Label htmlFor="address">Dirección / zona *</Label>
                  <Input id="address" value={f.address} onChange={(e) => set('address', e.target.value)} placeholder="Calle Recogidas" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label htmlFor="mun">Municipio *</Label>
                    <Input id="mun" value={f.municipality} onChange={(e) => set('municipality', e.target.value)} /></div>
                  <div className="space-y-1.5"><Label htmlFor="prov">Provincia *</Label>
                    <Input id="prov" value={f.province} onChange={(e) => set('province', e.target.value)} /></div>
                </div>
                <Picker label="Tipo de vivienda" k="property_type" options={[['apartment','Piso'],['house','Casa'],['loft','Loft'],['studio','Estudio']]} />
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5"><Label htmlFor="tr">Habitaciones</Label><Input id="tr" type="number" value={f.total_rooms} onChange={(e) => set('total_rooms', e.target.value)} /></div>
                  <div className="space-y-1.5"><Label htmlFor="ba">Baños</Label><Input id="ba" type="number" value={f.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} /></div>
                  <div className="space-y-1.5"><Label htmlFor="ta">m² totales</Label><Input id="ta" type="number" value={f.total_area} onChange={(e) => set('total_area', e.target.value)} /></div>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label htmlFor="ra">m² de la habitación</Label><Input id="ra" type="number" value={f.room_area} onChange={(e) => set('room_area', e.target.value)} /></div>
                  <div className="space-y-1.5"><Label htmlFor="af">Disponible desde</Label><Input id="af" type="date" value={f.available_from} onChange={(e) => set('available_from', e.target.value)} /></div>
                </div>
                <SwitchRow id="pb" label="Baño privado" k="room_private_bath" />
                <SwitchRow id="fu" label="Amueblada" k="room_furnished" />
                <SwitchRow id="ex" label="Ventana exterior" k="room_exterior" />
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label htmlFor="rent">Alquiler mensual (€) *</Label><Input id="rent" type="number" value={f.rent_amount} onChange={(e) => set('rent_amount', e.target.value)} /></div>
                  <div className="space-y-1.5"><Label htmlFor="dep">Fianza (€)</Label><Input id="dep" type="number" value={f.deposit_amount} onChange={(e) => set('deposit_amount', e.target.value)} /></div>
                </div>
                <SwitchRow id="bi" label="Gastos incluidos en el alquiler" k="bills_included" />
                <div className="grid grid-cols-2 gap-2">
                  <SwitchRow id="w" label="Agua" k="includes_water" />
                  <SwitchRow id="e" label="Luz" k="includes_electricity" />
                  <SwitchRow id="g" label="Gas" k="includes_gas" />
                  <SwitchRow id="i" label="Internet" k="includes_internet" />
                  <SwitchRow id="c" label="Comunidad" k="includes_community" />
                </div>
                {!f.bills_included && (
                  <div className="space-y-1.5"><Label htmlFor="be">Gastos mensuales estimados (€) *</Label>
                    <Input id="be" type="number" value={f.bills_estimate} onChange={(e) => set('bills_estimate', e.target.value)} /></div>
                )}
                <div className="space-y-1.5"><Label htmlFor="ph">Teléfono de contacto *</Label>
                  <Input id="ph" value={f.contact_phone} onChange={(e) => set('contact_phone', e.target.value)} placeholder="600 000 000" />
                  <p className="text-xs text-muted-foreground">Solo se comparte cuando hay match mutuo.</p></div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label htmlFor="fc">Nº de convivientes</Label><Input id="fc" type="number" value={f.flatmates_count} onChange={(e) => set('flatmates_count', e.target.value)} /></div>
                  <div className="space-y-1.5"><Label htmlFor="fa">Rango de edad</Label><Input id="fa" value={f.flatmates_age_range} onChange={(e) => set('flatmates_age_range', e.target.value)} placeholder="25-35" /></div>
                </div>
                <Picker label="Género de los convivientes" k="flatmates_gender_mix" options={[['mixed','Mixto'],['female','Solo chicas'],['male','Solo chicos']]} />
                <Picker label="Ocupación" k="flatmates_occupation" options={[['works','Trabajan'],['studies','Estudian'],['both','Trabajan y estudian']]} />
                <Picker label="Horarios predominantes" k="flatmates_schedule" options={[['morning','Mañanas'],['afternoon','Tardes'],['night','Noches'],['shifts','Turnos'],['mixed','Variado']]} />
                <Picker label="Nivel de socialización" k="social_level" options={[['social','Muy sociable'],['balanced','Equilibrado'],['quiet','Tranquilo y reservado']]} />
                <Picker label="Limpieza" k="cleanliness" options={[['relaxed','Relajada'],['normal','Normal'],['strict','Muy ordenada']]} />
                <Picker label="Visitas / parejas" k="guests_policy" options={[['yes','Sí'],['occasionally','Puntualmente'],['no','No']]} />
                <SwitchRow id="sm" label="Hay fumadores" k="smokers" />
                <SwitchRow id="hp" label="Hay mascotas" k="has_pets" />
                <SwitchRow id="pa" label="Se admiten mascotas" k="pets_allowed" />
                <div className="space-y-1.5"><Label htmlFor="lang">Idiomas (separados por comas)</Label><Input id="lang" value={f.languages} onChange={(e) => set('languages', e.target.value)} /></div>
                <div className="space-y-1.5"><Label htmlFor="atm">Ambiente de la casa</Label>
                  <Textarea id="atm" rows={4} value={f.atmosphere} onChange={(e) => set('atmosphere', e.target.value)} placeholder="Cómo es el día a día en el piso..." /></div>
              </>
            )}

            {step === 4 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label htmlFor="pmin">Edad mínima</Label><Input id="pmin" type="number" value={f.pref_age_min} onChange={(e) => set('pref_age_min', e.target.value)} /></div>
                  <div className="space-y-1.5"><Label htmlFor="pmax">Edad máxima</Label><Input id="pmax" type="number" value={f.pref_age_max} onChange={(e) => set('pref_age_max', e.target.value)} /></div>
                </div>
                <Picker label="Género preferido" k="pref_gender" options={[['any','Indiferente'],['female','Mujer'],['male','Hombre']]} />
                <Picker label="Ocupación preferida" k="pref_occupation" options={[['any','Indiferente'],['works','Trabaja'],['studies','Estudia']]} />
                <Picker label="Fumador" k="pref_smoker" options={[['any','Indiferente'],['no','No fumador'],['yes','Sí']]} />
                <Picker label="Mascotas" k="pref_pets" options={[['any','Indiferente'],['no','Sin mascotas'],['yes','Sí']]} />
                <div className="space-y-1.5"><Label htmlFor="ms">Estancia mínima (meses)</Label><Input id="ms" type="number" value={f.pref_min_stay_months} onChange={(e) => set('pref_min_stay_months', e.target.value)} /></div>
              </>
            )}

            {step === 5 && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="hi">Fotos de la vivienda completa (mínimo 3) *</Label>
                  <Input id="hi" type="file" accept="image/*" multiple onChange={(e) => setHomeFiles(Array.from(e.target.files || []))} />
                  <p className="text-xs text-muted-foreground">{homeFiles.length} seleccionadas</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ri">Fotos de la habitación libre (mínimo 2) *</Label>
                  <Input id="ri" type="file" accept="image/*" multiple onChange={(e) => setRoomFiles(Array.from(e.target.files || []))} />
                  <p className="text-xs text-muted-foreground">{roomFiles.length} seleccionadas</p>
                </div>
              </>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />Atrás
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={() => validateStep() && setStep((s) => s + 1)}>Siguiente<ArrowRight className="w-4 h-4 ml-2" /></Button>
              ) : (
                <Button onClick={submit} disabled={saving} className="bg-primary hover:bg-primary/90">
                  <Upload className="w-4 h-4 mr-2" />{saving ? 'Publicando...' : 'Publicar anuncio'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default RoomiePublish;