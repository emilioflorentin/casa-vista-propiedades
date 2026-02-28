import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  CheckCircle2, 
  Wrench,
  MapPin,
  User,
  Phone,
  RefreshCw,
  Image as ImageIcon,
  FileText,
  Plus,
  Trash2,
  Download,
  Euro
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Incident {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  images: string[] | null;
  created_at: string;
  updated_at: string;
  property_id: string;
  tenant_access_id: string;
}

interface PropertyInfo {
  id: string;
  title: string;
  location: string;
  user_id: string;
}

interface TenantInfo {
  id: string;
  tenant_name: string;
  tenant_phone: string | null;
}

interface OwnerInfo {
  full_name: string;
  phone: string;
  email: string;
}

interface BudgetItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  plumbing: '🔧 Fontanería',
  electrical: '⚡ Electricidad',
  appliances: '🏠 Electrodomésticos',
  structural: '🧱 Estructura',
  painting: '🎨 Pintura',
  locksmith: '🔑 Cerrajería',
  cleaning: '🧹 Limpieza',
  pests: '🐛 Plagas',
  other: '📋 Otros',
};

const ServiceBoard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [properties, setProperties] = useState<Record<string, PropertyInfo>>({});
  const [tenants, setTenants] = useState<Record<string, TenantInfo>>({});
  const [owners, setOwners] = useState<Record<string, OwnerInfo>>({});
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [activeTab, setActiveTab] = useState('mantenimiento');

  // Budget state
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0 }
  ]);
  const [budgetClient, setBudgetClient] = useState({ name: '', address: '', phone: '', email: '' });
  const [budgetTitle, setBudgetTitle] = useState('');
  const [budgetNotes, setBudgetNotes] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (!authLoading && user?.email !== 'multiservicios@nazarihomes.com') {
      navigate('/account');
      return;
    }
    if (user) {
      loadData();
    }
  }, [user, authLoading]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: incidentsData, error: incidentsError } = await supabase
        .from('incidents')
        .select('*')
        .order('updated_at', { ascending: false });

      if (incidentsError) {
        console.error('Error loading incidents:', incidentsError);
        return;
      }

      setIncidents(incidentsData || []);

      const propertyIds = [...new Set((incidentsData || []).map(i => i.property_id))];
      const tenantAccessIds = [...new Set((incidentsData || []).map(i => i.tenant_access_id))];

      if (propertyIds.length > 0) {
        const { data: propsData } = await supabase
          .from('properties')
          .select('id, title, location, user_id')
          .in('id', propertyIds);

        if (propsData) {
          const propsMap: Record<string, PropertyInfo> = {};
          const ownerIds = [...new Set(propsData.map(p => p.user_id))];
          propsData.forEach(p => { propsMap[p.id] = p; });
          setProperties(propsMap);

          for (const ownerId of ownerIds) {
            const { data: ownerData } = await supabase
              .rpc('get_complete_profile_info', { profile_user_id: ownerId });
            if (ownerData) {
              setOwners(prev => ({ ...prev, [ownerId]: ownerData as unknown as OwnerInfo }));
            }
          }
        }
      }

      if (tenantAccessIds.length > 0) {
        const { data: tenantsData } = await supabase
          .from('tenant_access')
          .select('id, tenant_name, tenant_phone')
          .in('id', tenantAccessIds);

        if (tenantsData) {
          const tenantsMap: Record<string, TenantInfo> = {};
          tenantsData.forEach(t => { tenantsMap[t.id] = t; });
          setTenants(tenantsMap);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (incidentId: string, newStatus: string) => {
    const { error } = await supabase
      .from('incidents')
      .update({ status: newStatus })
      .eq('id', incidentId);

    if (error) {
      toast({ title: 'Error', description: 'No se pudo actualizar el estado', variant: 'destructive' });
    } else {
      toast({ title: 'Actualizado', description: `Estado cambiado a ${getStatusLabel(newStatus)}` });
      loadData();
      setSelectedIncident(null);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_progress': return 'En progreso';
      case 'resolved': return 'Resuelto';
      default: return status;
    }
  };

  const inProgressIncidents = incidents.filter(i => i.status === 'in_progress');
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved');

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  // Budget functions
  const addBudgetItem = () => {
    setBudgetItems(prev => [...prev, { 
      id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0 
    }]);
  };

  const removeBudgetItem = (id: string) => {
    if (budgetItems.length > 1) {
      setBudgetItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const updateBudgetItem = (id: string, field: keyof BudgetItem, value: string | number) => {
    setBudgetItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const subtotal = budgetItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const iva = subtotal * 0.21;
  const total = subtotal + iva;

  const generateBudgetPDF = () => {
    const budgetNumber = `PRE-${Date.now().toString().slice(-6)}`;
    const today = new Date().toLocaleDateString('es-ES');

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html><head><title>Presupuesto ${budgetNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #78716c; padding-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; color: #78716c; }
        .logo-sub { font-size: 12px; color: #999; }
        .budget-info { text-align: right; }
        .budget-info h2 { font-size: 20px; color: #78716c; margin-bottom: 8px; }
        .budget-info p { font-size: 13px; color: #666; }
        .section { margin-bottom: 24px; }
        .section-title { font-size: 14px; font-weight: 600; color: #78716c; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .client-info { background: #f5f5f4; padding: 16px; border-radius: 8px; }
        .client-info p { font-size: 13px; margin-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th { background: #78716c; color: white; padding: 10px 12px; text-align: left; font-size: 13px; }
        th:last-child, th:nth-child(3), th:nth-child(2) { text-align: right; }
        td { padding: 10px 12px; border-bottom: 1px solid #e5e5e5; font-size: 13px; }
        td:last-child, td:nth-child(3), td:nth-child(2) { text-align: right; }
        .totals { margin-top: 16px; display: flex; justify-content: flex-end; }
        .totals-table { width: 280px; }
        .totals-table tr td { padding: 6px 12px; }
        .totals-table .total-row { font-weight: bold; font-size: 16px; border-top: 2px solid #78716c; color: #78716c; }
        .notes { background: #fafaf9; padding: 16px; border-radius: 8px; font-size: 13px; color: #666; white-space: pre-wrap; }
        .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #e5e5e5; padding-top: 16px; }
        @media print { body { padding: 20px; } }
      </style></head><body>
        <div class="header">
          <div>
            <div class="logo">NAZARÍ HOMES</div>
            <div class="logo-sub">Gestión Integral para tu Tranquilidad</div>
          </div>
          <div class="budget-info">
            <h2>PRESUPUESTO</h2>
            <p><strong>Nº:</strong> ${budgetNumber}</p>
            <p><strong>Fecha:</strong> ${today}</p>
          </div>
        </div>

        ${budgetTitle ? `<div class="section"><h3 style="font-size:18px;color:#444;margin-bottom:16px;">${budgetTitle}</h3></div>` : ''}

        <div class="section">
          <div class="section-title">Datos del cliente</div>
          <div class="client-info">
            ${budgetClient.name ? `<p><strong>${budgetClient.name}</strong></p>` : ''}
            ${budgetClient.address ? `<p>${budgetClient.address}</p>` : ''}
            ${budgetClient.phone ? `<p>Tel: ${budgetClient.phone}</p>` : ''}
            ${budgetClient.email ? `<p>Email: ${budgetClient.email}</p>` : ''}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Detalle del presupuesto</div>
          <table>
            <thead><tr><th>Descripción</th><th>Cantidad</th><th>Precio unitario</th><th>Total</th></tr></thead>
            <tbody>
              ${budgetItems.filter(i => i.description).map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>${item.unitPrice.toFixed(2)} €</td>
                  <td>${(item.quantity * item.unitPrice).toFixed(2)} €</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="totals">
            <table class="totals-table">
              <tr><td>Subtotal</td><td>${subtotal.toFixed(2)} €</td></tr>
              <tr><td>IVA (21%)</td><td>${iva.toFixed(2)} €</td></tr>
              <tr class="total-row"><td>TOTAL</td><td>${total.toFixed(2)} €</td></tr>
            </table>
          </div>
        </div>

        ${budgetNotes ? `<div class="section"><div class="section-title">Observaciones</div><div class="notes">${budgetNotes}</div></div>` : ''}

        <div class="footer">
          <p>Nazarí Homes · info@nazarihomes.com · www.nazarihomes.com</p>
          <p style="margin-top:4px;">Este presupuesto tiene una validez de 30 días desde su fecha de emisión.</p>
        </div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const resetBudget = () => {
    setBudgetItems([{ id: '1', description: '', quantity: 1, unitPrice: 0 }]);
    setBudgetClient({ name: '', address: '', phone: '', email: '' });
    setBudgetTitle('');
    setBudgetNotes('');
  };

  const IncidentCard = ({ incident }: { incident: Incident }) => {
    const property = properties[incident.property_id];
    const tenant = tenants[incident.tenant_access_id];
    const owner = property ? owners[property.user_id] : null;

    return (
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-stone-400"
        onClick={() => setSelectedIncident(incident)}
      >
        <CardContent className="p-4 space-y-2">
          <div className="flex items-start justify-between">
            <h4 className="font-semibold text-sm text-stone-800 line-clamp-1">{incident.title}</h4>
            <Badge variant="outline" className="text-xs shrink-0 ml-2">
              {CATEGORY_LABELS[incident.category] || incident.category}
            </Badge>
          </div>
          <p className="text-xs text-stone-500 line-clamp-2">{incident.description}</p>
          {property && (
            <div className="flex items-center text-xs text-stone-500">
              <MapPin className="h-3 w-3 mr-1" />
              <span className="line-clamp-1">{property.title} - {property.location}</span>
            </div>
          )}
          {tenant && (
            <div className="flex items-center text-xs text-stone-500">
              <User className="h-3 w-3 mr-1" />
              <span>{tenant.tenant_name}</span>
            </div>
          )}
          {owner && (
            <div className="flex items-center text-xs text-stone-400">
              <span>Propietario: {owner.full_name}</span>
            </div>
          )}
          {incident.images && incident.images.length > 0 && (
            <div className="flex items-center text-xs text-stone-400">
              <ImageIcon className="h-3 w-3 mr-1" />
              <span>{incident.images.length} foto(s)</span>
            </div>
          )}
          <div className="text-xs text-stone-400">{formatDate(incident.created_at)}</div>
        </CardContent>
      </Card>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-stone-400" />
          <p className="mt-4 text-stone-500">Cargando panel de servicios...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-800 flex items-center gap-2">
            <Wrench className="h-8 w-8" />
            Panel de Multiservicios
          </h1>
          <p className="text-stone-500 mt-1">Gestión de mantenimiento y presupuestos</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="mantenimiento" className="gap-2">
              <Wrench className="h-4 w-4" />
              Mantenimiento
            </TabsTrigger>
            <TabsTrigger value="presupuestos" className="gap-2">
              <FileText className="h-4 w-4" />
              Presupuestos
            </TabsTrigger>
          </TabsList>

          {/* MANTENIMIENTO TAB */}
          <TabsContent value="mantenimiento">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-stone-700">Panel de Mantenimiento</h2>
              <Button variant="outline" onClick={loadData} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Actualizar
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[60vh]">
              {/* In Progress Column */}
              <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-200/50">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-amber-600" />
                  <h3 className="font-bold text-stone-700">En Progreso</h3>
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                    {inProgressIncidents.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {inProgressIncidents.length === 0 ? (
                    <p className="text-stone-400 text-sm text-center py-8">No hay incidencias en progreso</p>
                  ) : (
                    inProgressIncidents.map(incident => (
                      <IncidentCard key={incident.id} incident={incident} />
                    ))
                  )}
                </div>
              </div>

              {/* Resolved Column */}
              <div className="bg-green-50/50 rounded-xl p-4 border border-green-200/50">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <h3 className="font-bold text-stone-700">Resueltos</h3>
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    {resolvedIncidents.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {resolvedIncidents.length === 0 ? (
                    <p className="text-stone-400 text-sm text-center py-8">No hay incidencias resueltas</p>
                  ) : (
                    resolvedIncidents.map(incident => (
                      <IncidentCard key={incident.id} incident={incident} />
                    ))
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* PRESUPUESTOS TAB */}
          <TabsContent value="presupuestos">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-stone-700">Generador de Presupuestos</h2>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={resetBudget} className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Limpiar
                  </Button>
                  <Button onClick={generateBudgetPDF} className="gap-2 bg-stone-700 hover:bg-stone-600 text-white">
                    <Download className="h-4 w-4" />
                    Generar PDF
                  </Button>
                </div>
              </div>

              {/* Budget Title */}
              <Card>
                <CardContent className="p-6">
                  <Label className="text-sm font-medium text-stone-600">Título del presupuesto</Label>
                  <Input
                    value={budgetTitle}
                    onChange={e => setBudgetTitle(e.target.value)}
                    placeholder="Ej. Reforma integral cocina, Reparación fontanería..."
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              {/* Client Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Datos del cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-stone-600">Nombre</Label>
                    <Input
                      value={budgetClient.name}
                      onChange={e => setBudgetClient(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nombre del cliente"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-stone-600">Dirección</Label>
                    <Input
                      value={budgetClient.address}
                      onChange={e => setBudgetClient(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Dirección del inmueble"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-stone-600">Teléfono</Label>
                    <Input
                      value={budgetClient.phone}
                      onChange={e => setBudgetClient(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Teléfono de contacto"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-stone-600">Email</Label>
                    <Input
                      value={budgetClient.email}
                      onChange={e => setBudgetClient(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Email del cliente"
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Budget Items */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Euro className="h-4 w-4" />
                      Partidas
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={addBudgetItem} className="gap-1">
                      <Plus className="h-4 w-4" />
                      Añadir partida
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Header */}
                  <div className="hidden md:grid grid-cols-12 gap-2 text-xs font-medium text-stone-500 px-1">
                    <div className="col-span-6">Descripción</div>
                    <div className="col-span-2">Cantidad</div>
                    <div className="col-span-2">Precio unitario</div>
                    <div className="col-span-1 text-right">Total</div>
                    <div className="col-span-1"></div>
                  </div>

                  {budgetItems.map(item => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-12 md:col-span-6">
                        <Input
                          value={item.description}
                          onChange={e => updateBudgetItem(item.id, 'description', e.target.value)}
                          placeholder="Descripción del trabajo"
                        />
                      </div>
                      <div className="col-span-4 md:col-span-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => updateBudgetItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-4 md:col-span-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice || ''}
                          onChange={e => updateBudgetItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="col-span-3 md:col-span-1 text-right text-sm font-medium text-stone-700">
                        {(item.quantity * item.unitPrice).toFixed(2)} €
                      </div>
                      <div className="col-span-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBudgetItem(item.id)}
                          disabled={budgetItems.length === 1}
                          className="p-1 h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4 text-stone-400" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Totals */}
                  <div className="border-t pt-4 mt-4 space-y-2">
                    <div className="flex justify-end gap-8 text-sm">
                      <span className="text-stone-500">Subtotal</span>
                      <span className="font-medium w-24 text-right">{subtotal.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-end gap-8 text-sm">
                      <span className="text-stone-500">IVA (21%)</span>
                      <span className="font-medium w-24 text-right">{iva.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-end gap-8 text-lg font-bold text-stone-800">
                      <span>TOTAL</span>
                      <span className="w-24 text-right">{total.toFixed(2)} €</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Observaciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={budgetNotes}
                    onChange={e => setBudgetNotes(e.target.value)}
                    placeholder="Condiciones, plazos de ejecución, garantías..."
                    rows={4}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedIncident(null)}>
          <Card className="max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{selectedIncident.title}</CardTitle>
                <Badge variant="outline">
                  {CATEGORY_LABELS[selectedIncident.category] || selectedIncident.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-stone-600">{selectedIncident.description}</p>

              {selectedIncident.images && selectedIncident.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {selectedIncident.images.map((img, i) => (
                    <img key={i} src={img} alt={`Foto ${i + 1}`} className="rounded-lg w-full h-32 object-cover" />
                  ))}
                </div>
              )}

              {properties[selectedIncident.property_id] && (
                <div className="bg-stone-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-stone-400" />
                    <span className="font-medium">{properties[selectedIncident.property_id].title}</span>
                  </div>
                  <p className="text-xs text-stone-500 ml-6">{properties[selectedIncident.property_id].location}</p>
                </div>
              )}

              {tenants[selectedIncident.tenant_access_id] && (
                <div className="bg-stone-50 rounded-lg p-3 space-y-1">
                  <p className="text-sm font-medium flex items-center">
                    <User className="h-4 w-4 mr-2 text-stone-400" />
                    {tenants[selectedIncident.tenant_access_id].tenant_name}
                  </p>
                  {tenants[selectedIncident.tenant_access_id].tenant_phone && (
                    <a 
                      href={`https://wa.me/${tenants[selectedIncident.tenant_access_id].tenant_phone?.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-600 flex items-center ml-6 hover:underline"
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      {tenants[selectedIncident.tenant_access_id].tenant_phone}
                    </a>
                  )}
                </div>
              )}

              {properties[selectedIncident.property_id] && owners[properties[selectedIncident.property_id].user_id] && (
                <div className="bg-stone-50 rounded-lg p-3 space-y-1">
                  <p className="text-sm font-medium">Propietario: {owners[properties[selectedIncident.property_id].user_id].full_name}</p>
                  {owners[properties[selectedIncident.property_id].user_id].phone && (
                    <a 
                      href={`https://wa.me/${owners[properties[selectedIncident.property_id].user_id].phone?.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-600 flex items-center hover:underline"
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      {owners[properties[selectedIncident.property_id].user_id].phone}
                    </a>
                  )}
                </div>
              )}

              <p className="text-xs text-stone-400">
                Creado: {formatDate(selectedIncident.created_at)} · Actualizado: {formatDate(selectedIncident.updated_at)}
              </p>

              <div className="flex gap-2 pt-2">
                {selectedIncident.status === 'in_progress' && (
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => updateStatus(selectedIncident.id, 'resolved')}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Marcar como resuelto
                  </Button>
                )}
                {selectedIncident.status === 'resolved' && (
                  <Button variant="outline" className="flex-1" onClick={() => updateStatus(selectedIncident.id, 'in_progress')}>
                    <Clock className="h-4 w-4 mr-2" />
                    Reabrir
                  </Button>
                )}
                <Button variant="ghost" onClick={() => setSelectedIncident(null)}>Cerrar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ServiceBoard;
