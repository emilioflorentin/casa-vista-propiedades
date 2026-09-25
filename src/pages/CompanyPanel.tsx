import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyMembership } from '@/hooks/useCompanyMembership';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Building2, UserPlus, Trash2, Eye, Home, Users } from 'lucide-react';

type Member = {
  id: string; user_id: string; role: string; full_name: string;
  email: string; phone: string; is_active: boolean;
};
type Prop = {
  id: string; reference: string; title: string; location: string;
  price: number; is_rented: boolean; user_id: string;
};

const CompanyPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { membership, usage, isCompanyOwner, loading, refresh } = useCompanyMembership();
  const [members, setMembers] = useState<Member[]>([]);
  const [props, setProps] = useState<Prop[]>([]);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [toDelete, setToDelete] = useState<Member | null>(null);
  const [propToDelete, setPropToDelete] = useState<Prop | null>(null);

  useEffect(() => {
    if (!loading && !isCompanyOwner) navigate('/account', { replace: true });
  }, [loading, isCompanyOwner, navigate]);

  const load = useCallback(async () => {
    if (!membership) return;
    const { data: m } = await supabase
      .from('company_members' as any)
      .select('*')
      .eq('company_id', membership.company_id)
      .order('created_at');
    const list = (m as unknown as Member[]) || [];
    setMembers(list);
    const ids = list.map((x) => x.user_id);
    if (ids.length) {
      const { data: p } = await supabase
        .from('properties')
        .select('id, reference, title, location, price, is_rented, user_id')
        .in('user_id', ids)
        .order('created_at', { ascending: false });
      setProps((p as Prop[]) || []);
    }
    refresh();
  }, [membership?.company_id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const call = async (payload: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke('company-admin', { body: payload });
    const msg = (data as any)?.error || (error ? 'Error de conexión' : null);
    if (msg) { toast({ title: 'No se pudo completar', description: msg, variant: 'destructive' }); return false; }
    return true;
  };

  const createAdvisor = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const ok = await call({ action: 'create_advisor', ...form });
    setBusy(false);
    if (ok) {
      toast({ title: 'Asesor creado', description: `Comunica a ${form.fullName} su email y contraseña para entrar.` });
      setForm({ fullName: '', email: '', phone: '', password: '' });
      load();
    }
  };

  const toggle = async (m: Member) => {
    if (await call({ action: 'set_advisor_active', memberId: m.id, active: !m.is_active })) load();
  };

  const removeAdvisor = async () => {
    if (!toDelete) return;
    if (await call({ action: 'delete_advisor', memberId: toDelete.id })) {
      toast({ title: 'Asesor eliminado' });
      load();
    }
    setToDelete(null);
  };

  const toggleRented = async (p: Prop) => {
    const { error } = await supabase.from('properties').update({ is_rented: !p.is_rented }).eq('id', p.id);
    if (error) toast({ title: 'No se pudo actualizar', description: error.message, variant: 'destructive' });
    else load();
  };

  const deleteProp = async () => {
    if (!propToDelete) return;
    const { error } = await supabase.from('properties').delete().eq('id', propToDelete.id);
    if (error) toast({ title: 'No se pudo eliminar', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Anuncio eliminado' }); load(); }
    setPropToDelete(null);
  };

  if (loading || !membership) {
    return <div className="min-h-screen bg-background"><Header /><p className="p-10 text-center text-muted-foreground">Cargando…</p></div>;
  }

  const nameOf = (uid: string) => members.find((m) => m.user_id === uid)?.full_name || '—';
  const countOf = (uid: string) => props.filter((p) => p.user_id === uid).length;
  const pct = usage && usage.max_listings ? Math.min(100, (usage.used_listings / usage.max_listings) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        <div className="flex items-center gap-3">
          <Building2 className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">{membership.company_name}</h1>
            <p className="text-sm text-muted-foreground">Panel de empresa</p>
          </div>
        </div>

        {usage && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Card><CardContent className="pt-6 space-y-2">
              <div className="flex justify-between text-sm"><span className="flex items-center gap-2"><Home className="h-4 w-4" />Anuncios del plan</span><strong>{usage.used_listings}/{usage.max_listings}</strong></div>
              <Progress value={pct} />
            </CardContent></Card>
            <Card><CardContent className="pt-6 space-y-2">
              <div className="flex justify-between text-sm"><span className="flex items-center gap-2"><Users className="h-4 w-4" />Asesores activos</span><strong>{usage.used_advisors}/{usage.max_advisors}</strong></div>
              <Progress value={usage.max_advisors ? (usage.used_advisors / usage.max_advisors) * 100 : 0} />
            </CardContent></Card>
          </div>
        )}
        {usage && usage.company_status !== 'active' && (
          <p className="text-sm text-destructive">Tu empresa no está activa. Contacta con PisoGo.</p>
        )}

        <Tabs defaultValue="advisors">
          <TabsList><TabsTrigger value="advisors">Asesores</TabsTrigger><TabsTrigger value="listings">Anuncios</TabsTrigger></TabsList>

          <TabsContent value="advisors" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><UserPlus className="h-4 w-4" />Nuevo asesor</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={createAdvisor} className="grid gap-3 sm:grid-cols-2">
                  <div><Label>Nombre</Label><Input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
                  <div><Label>Email</Label><Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                  <div><Label>Teléfono</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                  <div><Label>Contraseña inicial</Label><Input required minLength={8} type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
                  <Button type="submit" disabled={busy} className="sm:col-span-2">{busy ? 'Creando…' : 'Dar de alta asesor'}</Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-2">
              {members.map((m) => (
                <Card key={m.id}><CardContent className="py-4 flex flex-wrap items-center gap-3 justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{m.full_name} {m.role === 'owner' && <Badge variant="secondary" className="ml-1">Responsable</Badge>}</p>
                    <p className="text-xs text-muted-foreground truncate">{m.email}{m.phone ? ` · ${m.phone}` : ''} · {countOf(m.user_id)} anuncios</p>
                  </div>
                  {m.role === 'advisor' && (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{m.is_active ? 'Activo' : 'Desactivado'}</span>
                      <Switch checked={m.is_active} onCheckedChange={() => toggle(m)} />
                      <Button size="icon" variant="ghost" onClick={() => setToDelete(m)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  )}
                </CardContent></Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="listings" className="space-y-2">
            {props.length === 0 && <p className="text-sm text-muted-foreground">Todavía no hay anuncios publicados.</p>}
            {props.map((p) => (
              <Card key={p.id}><CardContent className="py-4 flex flex-wrap items-center gap-3 justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground truncate">Ref {p.reference} · {p.location} · {nameOf(p.user_id)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={p.is_rented ? 'secondary' : 'default'}>{p.is_rented ? 'Alquilada' : 'Publicada'}</Badge>
                  <Button size="sm" variant="outline" onClick={() => toggleRented(p)}>{p.is_rented ? 'Republicar' : 'Marcar alquilada'}</Button>
                  <Button size="icon" variant="ghost" asChild><Link to={`/property/${p.id}`}><Eye className="h-4 w-4" /></Link></Button>
                  <Button size="icon" variant="ghost" onClick={() => setPropToDelete(p)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent></Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar a {toDelete?.full_name}?</AlertDialogTitle>
            <AlertDialogDescription>Se borrará su cuenta y todos sus anuncios. Si solo quieres quitarle el acceso, desactívalo.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={removeAdvisor}>Eliminar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={!!propToDelete} onOpenChange={(o) => !o && setPropToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Eliminar este anuncio?</AlertDialogTitle><AlertDialogDescription>{propToDelete?.title}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={deleteProp}>Eliminar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CompanyPanel;
