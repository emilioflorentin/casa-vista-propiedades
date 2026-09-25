import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const SetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!strong.test(password)) {
      toast({ title: 'Contraseña débil', description: 'Mínimo 8 caracteres con mayúscula, minúscula, número y símbolo.', variant: 'destructive' });
      return;
    }
    if (password !== confirm) {
      toast({ title: 'Las contraseñas no coinciden', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) {
      toast({ title: 'No se pudo guardar', description: 'El enlace puede haber caducado. Pide una nueva invitación.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Contraseña creada', description: 'Ya puedes gestionar tu empresa.' });
    navigate('/empresa', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10 max-w-md">
        <Card>
          <CardHeader><CardTitle>Crea tu contraseña</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div><Label>Contraseña</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
              <div><Label>Repite la contraseña</Label><Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></div>
              <Button type="submit" className="w-full" disabled={saving}>{saving ? 'Guardando…' : 'Guardar y entrar'}</Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default SetPassword;
