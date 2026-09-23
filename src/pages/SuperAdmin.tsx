import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Shield,
  Building2,
  Inbox,
  Tags,
  RefreshCw,
  Check,
  X,
  Users,
  Home,
  Euro,
  Trash2,
  Settings2,
  Plus,
} from 'lucide-react';

type PlanRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_monthly: number;
  max_listings: number;
  max_advisors: number;
  is_active: boolean;
  sort_order: number;
};

type CompanyServices = Record<string, boolean>;

type CompanyRow = {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  plan_id: string | null;
  custom_max_listings: number | null;
  custom_max_advisors: number | null;
  services: CompanyServices;
  status: string;
  notes: string;
  created_at: string;
};

type RequestRow = {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
  company_id: string | null;
};

const SERVICE_LABELS: Record<string, string> = {
  publish_properties: 'Publicar viviendas',
  roomie_finder: 'Roomie Finder',
  rental_management: 'Gestión de alquiler',
  incidents: 'Incidencias',
  documents: 'Generar documentación',
  budgets: 'Presupuestos',
};

const DEFAULT_SERVICES: CompanyServices = {
  publish_properties: true,
  roomie_finder: false,
  rental_management: false,
  incidents: false,
  documents: false,
  budgets: false,
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Activa',
  paused: 'En pausa',
  suspended: 'Suspendida',
};

const SuperAdmin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isSuperAdmin, loading: roleLoading, user } = useSuperAdmin();

  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [editing, setEditing] = useState<CompanyRow | null>(null);
  const [editingPlan, setEditingPlan] = useState<PlanRow | null>(null);
  const [newPlan, setNewPlan] = useState<PlanRow | null>(null);
  const [planToDelete, setPlanToDelete] = useState<PlanRow | null>(null);
  const [toDelete, setToDelete] = useState<CompanyRow | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (roleLoading) return;
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!isSuperAdmin) {
      navigate('/account');
    }
  }, [roleLoading, isSuperAdmin, user, navigate]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [planRes, companyRes, requestRes] = await Promise.all([
      supabase.from('plans').select('*').order('sort_order'),
      supabase.from('companies').select('*').order('created_at', { ascending: false }),
      supabase.from('company_requests').select('*').order('created_at', { ascending: false }),
    ]);
    setPlans((planRes.data as PlanRow[]) || []);
    setCompanies(
      ((companyRes.data as unknown as CompanyRow[]) || []).map((c) => ({
        ...c,
        services: { ...DEFAULT_SERVICES, ...(c.services || {}) },
      })),
    );
    setRequests((requestRes.data as RequestRow[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isSuperAdmin) loadData();
  }, [isSuperAdmin, loadData]);

  const planName = (id: string | null) => plans.find((p) => p.id === id)?.name || 'Sin plan';

  const approveRequest = async (req: RequestRow) => {
    const defaultPlan = plans[0];
    const { data, error } = await supabase
      .from('companies')
      .insert({
        company_name: req.company_name,
        contact_name: req.contact_name,
        email: req.email,
        phone: req.phone,
        plan_id: defaultPlan?.id ?? null,
        request_id: req.id,
        services: DEFAULT_SERVICES,
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'No se pudo dar de alta la empresa', description: error.message, variant: 'destructive' });
      return;
    }

    await supabase
      .from('company_requests')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id ?? null,
        company_id: data.id,
      })
      .eq('id', req.id);

    toast({ title: 'Empresa dada de alta', description: `${req.company_name} ya aparece en Empresas.` });
    loadData();
  };

  const rejectRequest = async (req: RequestRow) => {
    const { error } = await supabase
      .from('company_requests')
      .update({ status: 'rejected', reviewed_at: new Date().toISOString(), reviewed_by: user?.id ?? null })
      .eq('id', req.id);
    if (error) {
      toast({ title: 'No se pudo rechazar', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Solicitud rechazada' });
    loadData();
  };

  const saveCompany = async () => {
    if (!editing) return;
    setSaving(true);
    const { error } = await supabase
      .from('companies')
      .update({
        company_name: editing.company_name,
        contact_name: editing.contact_name,
        email: editing.email,
        phone: editing.phone,
        plan_id: editing.plan_id,
        custom_max_listings: editing.custom_max_listings,
        custom_max_advisors: editing.custom_max_advisors,
        services: editing.services,
        status: editing.status,
        notes: editing.notes,
      })
      .eq('id', editing.id);
    setSaving(false);
    if (error) {
      toast({ title: 'No se pudieron guardar los cambios', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Cambios guardados' });
    setEditing(null);
    loadData();
  };

  const savePlan = async () => {
    if (!editingPlan) return;
    setSaving(true);
    const { error } = await supabase
      .from('plans')
      .update({
        name: editingPlan.name,
        description: editingPlan.description,
        price_monthly: editingPlan.price_monthly,
        max_listings: editingPlan.max_listings,
        max_advisors: editingPlan.max_advisors,
        is_active: editingPlan.is_active,
      })
      .eq('id', editingPlan.id);
    setSaving(false);
    if (error) {
      toast({ title: 'No se pudo guardar el plan', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Plan actualizado' });
    setEditingPlan(null);
    loadData();
  };

  const deleteCompany = async () => {
    if (!toDelete) return;
    const { error } = await supabase.from('companies').delete().eq('id', toDelete.id);
    setToDelete(null);
    if (error) {
      toast({ title: 'No se pudo eliminar', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Empresa eliminada' });
    loadData();
  };

  if (roleLoading || !isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const pending = requests.filter((r) => r.status === 'pending');
  const reviewed = requests.filter((r) => r.status !== 'pending');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-10">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">Panel de superadministración</h1>
              <p className="text-sm text-muted-foreground">Empresas, tarifas y servicios de PisoGo</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Empresas</p><p className="text-2xl font-bold">{companies.length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Activas</p><p className="text-2xl font-bold">{companies.filter(c => c.status === 'active').length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Solicitudes</p><p className="text-2xl font-bold">{pending.length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Planes</p><p className="text-2xl font-bold">{plans.length}</p></CardContent></Card>
        </div>

        <Tabs defaultValue="requests">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="requests"><Inbox className="h-4 w-4 mr-1" />Solicitudes</TabsTrigger>
            <TabsTrigger value="companies"><Building2 className="h-4 w-4 mr-1" />Empresas</TabsTrigger>
            <TabsTrigger value="plans"><Tags className="h-4 w-4 mr-1" />Planes</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="mt-4 space-y-3">
            {pending.length === 0 && (
              <p className="text-sm text-muted-foreground">No hay solicitudes pendientes.</p>
            )}
            {pending.map((req) => (
              <Card key={req.id}>
                <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{req.company_name}</p>
                    <p className="text-sm text-muted-foreground">{req.contact_name} · {req.email} · {req.phone}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(req.created_at).toLocaleDateString('es-ES')}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => approveRequest(req)}><Check className="h-4 w-4 mr-1" />Dar de alta</Button>
                    <Button size="sm" variant="outline" onClick={() => rejectRequest(req)}><X className="h-4 w-4 mr-1" />Rechazar</Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {reviewed.length > 0 && (
              <div className="pt-4">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Revisadas</h3>
                <div className="space-y-2">
                  {reviewed.map((req) => (
                    <div key={req.id} className="flex items-center justify-between text-sm border rounded-lg px-3 py-2">
                      <span>{req.company_name} · {req.email}</span>
                      <Badge variant={req.status === 'approved' ? 'default' : 'secondary'}>
                        {req.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="companies" className="mt-4 space-y-3">
            {companies.length === 0 && <p className="text-sm text-muted-foreground">Todavía no hay empresas dadas de alta.</p>}
            {companies.map((company) => (
              <Card key={company.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base">{company.company_name}</CardTitle>
                    <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                      {STATUS_LABELS[company.status] || company.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{company.contact_name} · {company.email} · {company.phone}</p>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="inline-flex items-center gap-1"><Euro className="h-4 w-4 text-primary" />{planName(company.plan_id)}</span>
                    <span className="inline-flex items-center gap-1"><Home className="h-4 w-4 text-primary" />{company.custom_max_listings ?? plans.find(p => p.id === company.plan_id)?.max_listings ?? '-'} anuncios</span>
                    <span className="inline-flex items-center gap-1"><Users className="h-4 w-4 text-primary" />{company.custom_max_advisors ?? plans.find(p => p.id === company.plan_id)?.max_advisors ?? '-'} asesores</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(company.services).filter(([, v]) => v).map(([k]) => (
                      <Badge key={k} variant="outline">{SERVICE_LABELS[k] || k}</Badge>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" onClick={() => setEditing(company)}>
                      <Settings2 className="h-4 w-4 mr-1" />Gestionar
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setToDelete(company)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="plans" className="mt-4 grid gap-3 md:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{plan.name}</CardTitle>
                    <Badge variant={plan.is_active ? 'default' : 'secondary'}>{plan.is_active ? 'Activo' : 'Oculto'}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-2xl font-bold">{plan.price_monthly} €<span className="text-sm font-normal text-muted-foreground">/mes</span></p>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                  <p className="text-sm">{plan.max_listings} anuncios · {plan.max_advisors} asesores</p>
                  <Button size="sm" variant="outline" onClick={() => setEditingPlan(plan)}>Editar plan</Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />

      {/* Editar empresa */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Gestionar empresa</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre de la empresa</Label>
                <Input value={editing.company_name} onChange={(e) => setEditing({ ...editing, company_name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Contacto</Label>
                  <Input value={editing.contact_name} onChange={(e) => setEditing({ ...editing, contact_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Correo electrónico</Label>
                <Input value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Plan</Label>
                  <Select value={editing.plan_id ?? 'none'} onValueChange={(v) => setEditing({ ...editing, plan_id: v === 'none' ? null : v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin plan</SelectItem>
                      {plans.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name} · {p.price_monthly} €</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select value={editing.status} onValueChange={(v) => setEditing({ ...editing, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activa</SelectItem>
                      <SelectItem value="paused">En pausa</SelectItem>
                      <SelectItem value="suspended">Suspendida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Anuncios (opcional)</Label>
                  <Input
                    type="number"
                    placeholder="Según plan"
                    value={editing.custom_max_listings ?? ''}
                    onChange={(e) => setEditing({ ...editing, custom_max_listings: e.target.value === '' ? null : Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Asesores (opcional)</Label>
                  <Input
                    type="number"
                    placeholder="Según plan"
                    value={editing.custom_max_advisors ?? ''}
                    onChange={(e) => setEditing({ ...editing, custom_max_advisors: e.target.value === '' ? null : Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Servicios</Label>
                <div className="space-y-2 rounded-lg border p-3">
                  {Object.keys(SERVICE_LABELS).map((key) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm">{SERVICE_LABELS[key]}</span>
                      <Switch
                        checked={!!editing.services[key]}
                        onCheckedChange={(v) => setEditing({ ...editing, services: { ...editing.services, [key]: v } })}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notas internas</Label>
                <Textarea value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} rows={3} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button onClick={saveCompany} disabled={saving}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Editar plan */}
      <Dialog open={!!editingPlan} onOpenChange={(o) => !o && setEditingPlan(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar plan</DialogTitle></DialogHeader>
          {editingPlan && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input value={editingPlan.name} onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Input value={editingPlan.description} onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>€/mes</Label>
                  <Input type="number" value={editingPlan.price_monthly} onChange={(e) => setEditingPlan({ ...editingPlan, price_monthly: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Anuncios</Label>
                  <Input type="number" value={editingPlan.max_listings} onChange={(e) => setEditingPlan({ ...editingPlan, max_listings: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Asesores</Label>
                  <Input type="number" value={editingPlan.max_advisors} onChange={(e) => setEditingPlan({ ...editingPlan, max_advisors: Number(e.target.value) })} />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm">Plan visible</span>
                <Switch checked={editingPlan.is_active} onCheckedChange={(v) => setEditingPlan({ ...editingPlan, is_active: v })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPlan(null)}>Cancelar</Button>
            <Button onClick={savePlan} disabled={saving}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar {toDelete?.company_name}?</AlertDialogTitle>
            <AlertDialogDescription>
              La empresa dejará de aparecer en el panel. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={deleteCompany}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SuperAdmin;
