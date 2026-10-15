import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '@/components/roomie/RoomieHeader';
import Footer from '@/components/roomie/RoomieFooter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { saveSeeker } from '@/utils/roomieSeeker';

const passwordOk = (p: string) =>
  p.length >= 8 && /[a-z]/.test(p) && /[A-Z]/.test(p) && /[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p);

const RoomieRegister = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { signUp, signIn, user } = useAuth();
  const [tab, setTab] = useState(params.get('mode') === 'login' ? 'login' : 'register');
  const [saving, setSaving] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [f, setF] = useState({
    full_name: '', email: '', password: '', phone: '', age: '', gender: 'other',
    occupation: 'works', budget_max: '', desired_area: '', move_in_date: '', bio: '',
  });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => { document.title = 'Crear cuenta | Roomie Finder by PisoGo'; }, []);

  useEffect(() => {
    if (user) navigate('/roomie-finder', { replace: true });
  }, [user, navigate]);

  const register = async () => {
    if (!f.full_name.trim()) { toast.error('El nombre es obligatorio'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) { toast.error('Introduce un email válido'); return; }
    if (!f.phone.trim()) { toast.error('El teléfono es obligatorio'); return; }
    if (!passwordOk(f.password)) {
      toast.error('La contraseña debe tener mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo');
      return;
    }
    setSaving(true);
    try {
      const { error } = await signUp(f.email.trim(), f.password, f.full_name.trim(), 'particular', undefined, 'roomie');
      if (error) { toast.error(error); return; }
      // Guardar también la ficha de búsqueda para poder dar "me gusta" desde ya
      try {
        await saveSeeker({
          full_name: f.full_name.trim(),
          phone: f.phone.trim(),
          age: f.age ? Number(f.age) : null,
          gender: f.gender,
          occupation: f.occupation,
          schedule: 'mixed',
          social_level: 'balanced',
          smoker: false,
          has_pets: false,
          cleanliness: 'normal',
          languages: ['Español'],
          budget_max: f.budget_max ? Number(f.budget_max) : null,
          desired_area: f.desired_area,
          move_in_date: f.move_in_date || null,
          bio: f.bio,
        });
      } catch (e) {
        console.error('No se pudo guardar la ficha de búsqueda', e);
      }
      toast.success('Cuenta de Roomie Finder creada. Revisa tu email para confirmarla.');
      setTab('login');
    } finally { setSaving(false); }
  };

  const login = async () => {
    if (!loginEmail.trim() || !loginPassword) { toast.error('Introduce email y contraseña'); return; }
    setSaving(true);
    try {
      const { error } = await signIn(loginEmail.trim(), loginPassword);
      if (error) { toast.error(error); return; }
      navigate('/roomie-finder');
    } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-muted">
      <Header />
      <main className="container mx-auto px-6 py-10 max-w-xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">Tu cuenta de Roomie Finder</h1>
        <p className="text-muted-foreground mb-6">
          Registro independiente de PisoGo: sirve tanto si buscas habitación como si publicas una.
        </p>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="register">Crear cuenta</TabsTrigger>
            <TabsTrigger value="login">Entrar</TabsTrigger>
          </TabsList>

          <TabsContent value="register">
            <Card>
              <CardHeader><CardTitle>Registro completo</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="rn">Nombre completo *</Label>
                    <Input id="rn" maxLength={100} value={f.full_name} onChange={(e) => set('full_name', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="rp">Teléfono *</Label>
                    <Input id="rp" maxLength={30} value={f.phone} onChange={(e) => set('phone', e.target.value)} placeholder="600 000 000" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="re">Email *</Label>
                  <Input id="re" type="email" maxLength={255} value={f.email} onChange={(e) => set('email', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rpw">Contraseña *</Label>
                  <Input id="rpw" type="password" value={f.password} onChange={(e) => set('password', e.target.value)} />
                  <p className="text-xs text-muted-foreground">Mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="ra">Edad</Label>
                    <Input id="ra" type="number" value={f.age} onChange={(e) => set('age', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Género</Label>
                    <Select value={f.gender} onValueChange={(v) => set('gender', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="female">Mujer</SelectItem>
                        <SelectItem value="male">Hombre</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Ocupación</Label>
                    <Select value={f.occupation} onValueChange={(v) => set('occupation', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="works">Trabajo</SelectItem>
                        <SelectItem value="studies">Estudio</SelectItem>
                        <SelectItem value="both">Trabajo y estudio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="rb">Presupuesto máx. (€)</Label>
                    <Input id="rb" type="number" value={f.budget_max} onChange={(e) => set('budget_max', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="rz">Zona deseada</Label>
                    <Input id="rz" value={f.desired_area} onChange={(e) => set('desired_area', e.target.value)} placeholder="Granada centro" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="rd">Fecha de entrada</Label>
                    <Input id="rd" type="date" value={f.move_in_date} onChange={(e) => set('move_in_date', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rbio">Sobre mí</Label>
                  <Textarea id="rbio" rows={3} maxLength={1000} value={f.bio} onChange={(e) => set('bio', e.target.value)} />
                </div>
                <Button className="w-full bg-roomie-green text-white hover:bg-roomie-ink" onClick={register} disabled={saving}>
                  {saving ? 'Creando cuenta...' : 'Crear mi cuenta de Roomie Finder'}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Al registrarte también se crea tu ficha de búsqueda, que podrás completar en "Mi ficha".
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="login">
            <Card>
              <CardHeader><CardTitle>Entrar a Roomie Finder</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="le">Email</Label>
                  <Input id="le" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lp">Contraseña</Label>
                  <Input id="lp" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                </div>
                <Button className="w-full bg-roomie-green text-white hover:bg-roomie-ink" onClick={login} disabled={saving}>
                  {saving ? 'Entrando...' : 'Entrar'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default RoomieRegister;
