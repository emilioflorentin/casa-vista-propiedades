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
import { toast } from 'sonner';
import { fetchSeeker, saveSeeker, getSeekerToken } from '@/utils/roomieSeeker';

const RoomieProfile = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [f, setF] = useState({
    full_name: '', age: '', gender: 'other', occupation: 'works', schedule: 'mixed',
    social_level: 'balanced', smoker: false, has_pets: false, cleanliness: 'normal',
    languages: 'Español', budget_max: '', desired_area: '', move_in_date: '', bio: '', phone: '',
  });
  const set = (k: string, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => { document.title = 'Mi ficha de búsqueda | Roomie Finder — Nazarí Homes'; }, []);

  useEffect(() => {
    if (!getSeekerToken()) return;
    fetchSeeker().then((data) => {
      if (!data) return;
      setHasProfile(true);
      setF({
        full_name: data.full_name || '', age: data.age?.toString() || '', gender: data.gender,
        occupation: data.occupation, schedule: data.schedule, social_level: data.social_level,
        smoker: data.smoker, has_pets: data.has_pets, cleanliness: data.cleanliness,
        languages: (data.languages || []).join(', '), budget_max: data.budget_max?.toString() || '',
        desired_area: data.desired_area || '', move_in_date: data.move_in_date || '',
        bio: data.bio || '', phone: data.phone || '',
      });
    });
  }, []);

  const save = async () => {
    if (!f.full_name.trim() || !f.phone.trim()) { toast.error('Nombre y teléfono son obligatorios'); return; }
    setSaving(true);
    try {
      await saveSeeker({
        full_name: f.full_name.trim(),
        phone: f.phone.trim(),
        age: f.age ? Number(f.age) : null,
        gender: f.gender, occupation: f.occupation, schedule: f.schedule,
        social_level: f.social_level, smoker: f.smoker, has_pets: f.has_pets,
        cleanliness: f.cleanliness,
        languages: f.languages.split(',').map((s) => s.trim()).filter(Boolean),
        budget_max: f.budget_max ? Number(f.budget_max) : null,
        desired_area: f.desired_area,
        move_in_date: f.move_in_date || null,
        bio: f.bio,
      });
      toast.success('Ficha guardada. Ya puedes dar "me gusta" a habitaciones.');
      navigate('/roomie-finder');
    } catch (e) {
      console.error(e);
      toast.error('No se pudo guardar la ficha');
    } finally { setSaving(false); }
  };

  const Picker = ({ label, k, options }: { label: string; k: keyof typeof f; options: [string, string][] }) => (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={f[k] as string} onValueChange={(v) => set(k as string, v)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>{options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <main className="container mx-auto px-6 py-10 max-w-2xl">
        <h1 className="text-3xl font-bold text-stone-800 mb-2">Mi ficha de búsqueda</h1>
        <p className="text-muted-foreground mb-6">
          Sin registro ni contraseña: rellena este formulario básico y ya podrás dar "me gusta" a las habitaciones.
          Así te verán los anunciantes. Tu teléfono solo se comparte cuando hay match mutuo.
        </p>
        <Card>
          <CardHeader><CardTitle>{hasProfile ? 'Editar mi ficha' : 'Datos y convivencia'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label htmlFor="n">Nombre *</Label><Input id="n" maxLength={100} value={f.full_name} onChange={(e) => set('full_name', e.target.value)} /></div>
              <div className="space-y-1.5"><Label htmlFor="a">Edad</Label><Input id="a" type="number" value={f.age} onChange={(e) => set('age', e.target.value)} /></div>
            </div>
            <Picker label="Género" k="gender" options={[['female','Mujer'],['male','Hombre'],['other','Otro']]} />
            <Picker label="Ocupación" k="occupation" options={[['works','Trabajo'],['studies','Estudio'],['both','Trabajo y estudio']]} />
            <Picker label="Horarios" k="schedule" options={[['morning','Mañanas'],['afternoon','Tardes'],['night','Noches'],['shifts','Turnos'],['mixed','Variado']]} />
            <Picker label="Nivel de socialización" k="social_level" options={[['social','Muy sociable'],['balanced','Equilibrado'],['quiet','Tranquilo y reservado']]} />
            <Picker label="Limpieza" k="cleanliness" options={[['relaxed','Relajada'],['normal','Normal'],['strict','Muy ordenada']]} />
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between border rounded-lg px-3 py-2"><Label htmlFor="sm">Fumador</Label><Switch id="sm" checked={f.smoker} onCheckedChange={(v) => set('smoker', v)} /></div>
              <div className="flex items-center justify-between border rounded-lg px-3 py-2"><Label htmlFor="hp">Tengo mascotas</Label><Switch id="hp" checked={f.has_pets} onCheckedChange={(v) => set('has_pets', v)} /></div>
            </div>
            <div className="space-y-1.5"><Label htmlFor="l">Idiomas</Label><Input id="l" value={f.languages} onChange={(e) => set('languages', e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label htmlFor="b">Presupuesto máx. (€)</Label><Input id="b" type="number" value={f.budget_max} onChange={(e) => set('budget_max', e.target.value)} /></div>
              <div className="space-y-1.5"><Label htmlFor="d">Fecha de entrada</Label><Input id="d" type="date" value={f.move_in_date} onChange={(e) => set('move_in_date', e.target.value)} /></div>
            </div>
            <div className="space-y-1.5"><Label htmlFor="z">Zona deseada</Label><Input id="z" value={f.desired_area} onChange={(e) => set('desired_area', e.target.value)} placeholder="Granada centro" /></div>
            <div className="space-y-1.5"><Label htmlFor="bio">Sobre mí</Label><Textarea id="bio" rows={4} maxLength={1000} value={f.bio} onChange={(e) => set('bio', e.target.value)} /></div>
            <div className="space-y-1.5"><Label htmlFor="ph">Teléfono *</Label>
              <Input id="ph" maxLength={30} value={f.phone} onChange={(e) => set('phone', e.target.value)} placeholder="600 000 000" />
              <p className="text-xs text-muted-foreground">Solo se comparte cuando hay match mutuo.</p></div>
            <Button className="w-full bg-stone-700 hover:bg-stone-800" onClick={save} disabled={saving}>
              {saving ? 'Guardando...' : hasProfile ? 'Guardar cambios' : 'Guardar y empezar a buscar'}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Tu ficha se guarda en este dispositivo. Si borras los datos del navegador tendrás que rellenarla de nuevo.
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default RoomieProfile;
