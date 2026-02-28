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
  Euro,
  Ruler,
  Calendar,
  CreditCard,
  Save,
  FolderOpen,
  Edit3
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

type UnitType = 'm²' | 'ml' | 'ud' | 'h' | 'pa' | 'kg' | 'm³';

interface BudgetItem {
  id: string;
  chapter: string;
  description: string;
  quantity: number;
  unit: UnitType;
  unitPrice: number;
}

const UNIT_OPTIONS: { value: UnitType; label: string }[] = [
  { value: 'ud', label: 'ud (unidad)' },
  { value: 'm²', label: 'm² (metro cuadrado)' },
  { value: 'ml', label: 'ml (metro lineal)' },
  { value: 'm³', label: 'm³ (metro cúbico)' },
  { value: 'h', label: 'h (hora)' },
  { value: 'pa', label: 'pa (partida alzada)' },
  { value: 'kg', label: 'kg (kilogramo)' },
];

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

const DEFAULT_COMPANY_CIF = '24252878Z';

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
  const [companyCif, setCompanyCif] = useState(DEFAULT_COMPANY_CIF);
  
  // Incident costs state
  const [incidentCosts, setIncidentCosts] = useState<Record<string, { repair_cost: number; materials_cost: number; notes: string; receipts: string[] }>>({});
  const [costRepair, setCostRepair] = useState(0);
  const [costMaterials, setCostMaterials] = useState(0);
  const [costNotes, setCostNotes] = useState('');
  const [costReceipts, setCostReceipts] = useState<string[]>([]);
  const [savingCost, setSavingCost] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  // Budget state
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    { id: '1', chapter: '', description: '', quantity: 1, unit: 'ud' as UnitType, unitPrice: 0 }
  ]);
  const [budgetClient, setBudgetClient] = useState({ name: '', nif: '', address: '', phone: '', email: '' });
  const [budgetTitle, setBudgetTitle] = useState('');
  const [budgetNotes, setBudgetNotes] = useState('');
  const [budgetValidityDays, setBudgetValidityDays] = useState(30);
  const [budgetExecutionDays, setBudgetExecutionDays] = useState('');
  const [budgetPaymentTerms, setBudgetPaymentTerms] = useState('');
  const [savedBudgets, setSavedBudgets] = useState<any[]>([]);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [savingBudget, setSavingBudget] = useState(false);
  const [loadingBudgets, setLoadingBudgets] = useState(false);
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

      // Load incident costs
      const { data: costsData } = await supabase
        .from('incident_costs')
        .select('*');
      if (costsData) {
        const costsMap: Record<string, { repair_cost: number; materials_cost: number; notes: string; receipts: string[] }> = {};
        costsData.forEach((c: any) => {
          costsMap[c.incident_id] = {
            repair_cost: Number(c.repair_cost) || 0,
            materials_cost: Number(c.materials_cost) || 0,
            notes: c.notes || '',
            receipts: c.receipts || [],
          };
        });
        setIncidentCosts(costsMap);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCostForIncident = (incident: Incident) => {
    const cost = incidentCosts[incident.id];
    setCostRepair(cost?.repair_cost || 0);
    setCostMaterials(cost?.materials_cost || 0);
    setCostNotes(cost?.notes || '');
    setCostReceipts(cost?.receipts || []);
  };

  const saveCost = async (incidentId: string) => {
    setSavingCost(true);
    try {
      const existing = incidentCosts[incidentId];
      if (existing) {
        await supabase
          .from('incident_costs')
          .update({ repair_cost: costRepair, materials_cost: costMaterials, notes: costNotes, receipts: costReceipts })
          .eq('incident_id', incidentId);
      } else {
        await supabase
          .from('incident_costs')
          .insert({ incident_id: incidentId, repair_cost: costRepair, materials_cost: costMaterials, notes: costNotes, receipts: costReceipts });
      }
      setIncidentCosts(prev => ({
        ...prev,
        [incidentId]: { repair_cost: costRepair, materials_cost: costMaterials, notes: costNotes, receipts: costReceipts }
      }));
      toast({ title: 'Guardado', description: 'Costes actualizados correctamente' });
    } catch {
      toast({ title: 'Error', description: 'No se pudieron guardar los costes', variant: 'destructive' });
    } finally {
      setSavingCost(false);
    }
  };

  const uploadReceipt = async (incidentId: string, files: FileList) => {
    setUploadingReceipt(true);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const filePath = `${incidentId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from('cost-receipts').upload(filePath, file);
        if (error) {
          console.error('Upload error:', error);
          continue;
        }
        const { data: urlData } = supabase.storage.from('cost-receipts').getPublicUrl(filePath);
        newUrls.push(urlData.publicUrl);
      }
      if (newUrls.length > 0) {
        const updatedReceipts = [...costReceipts, ...newUrls];
        setCostReceipts(updatedReceipts);
        // Auto-save receipts
        const existing = incidentCosts[incidentId];
        if (existing) {
          await supabase.from('incident_costs')
            .update({ receipts: updatedReceipts })
            .eq('incident_id', incidentId);
        } else {
          await supabase.from('incident_costs')
            .insert({ incident_id: incidentId, repair_cost: costRepair, materials_cost: costMaterials, notes: costNotes, receipts: updatedReceipts });
        }
        setIncidentCosts(prev => ({
          ...prev,
          [incidentId]: { repair_cost: costRepair, materials_cost: costMaterials, notes: costNotes, receipts: updatedReceipts }
        }));
        toast({ title: 'Subido', description: `${newUrls.length} archivo(s) adjuntado(s)` });
      }
    } catch {
      toast({ title: 'Error', description: 'Error al subir archivos', variant: 'destructive' });
    } finally {
      setUploadingReceipt(false);
    }
  };

  const removeReceipt = async (incidentId: string, url: string) => {
    const updatedReceipts = costReceipts.filter(r => r !== url);
    setCostReceipts(updatedReceipts);
    await supabase.from('incident_costs')
      .update({ receipts: updatedReceipts })
      .eq('incident_id', incidentId);
    setIncidentCosts(prev => ({
      ...prev,
      [incidentId]: { ...prev[incidentId], receipts: updatedReceipts }
    }));
    // Delete from storage
    const path = url.split('/cost-receipts/')[1];
    if (path) {
      await supabase.storage.from('cost-receipts').remove([decodeURIComponent(path)]);
    }
    toast({ title: 'Eliminado', description: 'Archivo eliminado' });
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
      case 'approval': return 'En aprobación';
      case 'in_progress': return 'En progreso';
      case 'paused': return 'Pausada';
      case 'pending_payment': return 'Pendiente de pago';
      case 'resolved': return 'Resuelto';
      default: return status;
    }
  };

  const approvalIncidents = incidents.filter(i => i.status === 'approval');
  const inProgressIncidents = incidents.filter(i => i.status === 'in_progress');
  const pausedIncidents = incidents.filter(i => i.status === 'paused');
  const pendingPaymentIncidents = incidents.filter(i => i.status === 'pending_payment');
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved');

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  // Budget functions
  const addBudgetItem = () => {
    setBudgetItems(prev => [...prev, { 
      id: Date.now().toString(), chapter: '', description: '', quantity: 1, unit: 'ud' as UnitType, unitPrice: 0 
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
    const budgetNumber = editingBudgetId 
      ? (savedBudgets.find(b => b.id === editingBudgetId)?.budget_number || 'PRE-BORRADOR')
      : 'PRE-BORRADOR';
    const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
    const logoUrl = window.location.origin + '/lovable-uploads/dcb0aee9-6c77-42b4-ac43-890fb3993d1a.png';

    // Group items by chapter
    const chapters = new Map<string, BudgetItem[]>();
    budgetItems.filter(i => i.description).forEach(item => {
      const ch = item.chapter || 'Sin capítulo';
      if (!chapters.has(ch)) chapters.set(ch, []);
      chapters.get(ch)!.push(item);
    });

    const chapterRows = Array.from(chapters.entries()).map(([chapter, items]) => {
      const chapterTotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
      return `
        <tr class="chapter-row"><td colspan="5"><strong>${chapter}</strong></td></tr>
        ${items.map((item, idx) => `
          <tr>
            <td class="item-num">${idx + 1}</td>
            <td>${item.description}</td>
            <td class="center">${item.quantity.toLocaleString('es-ES', { minimumFractionDigits: 2 })} ${item.unit}</td>
            <td class="right">${item.unitPrice.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</td>
            <td class="right">${(item.quantity * item.unitPrice).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</td>
          </tr>
        `).join('')}
        <tr class="chapter-subtotal"><td colspan="4" class="right">Subtotal ${chapter}</td><td class="right"><strong>${chapterTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</strong></td></tr>
      `;
    }).join('');

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html><head><title>Presupuesto ${budgetNumber}</title>
      <style>
        @page { margin: 15mm 20mm; size: A4; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; color: #1a1a1a; font-size: 11pt; line-height: 1.5; }
        .page { max-width: 210mm; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; border-bottom: 3px solid #78716c; margin-bottom: 24px; }
        .logo-section { display: flex; align-items: center; gap: 16px; }
        .logo-section img { height: 60px; width: auto; }
        .company-info { font-size: 9pt; color: #666; line-height: 1.6; }
        .budget-badge { text-align: right; }
        .budget-badge h1 { font-size: 22pt; color: #78716c; letter-spacing: 2px; margin-bottom: 4px; }
        .budget-badge .meta { font-size: 10pt; color: #555; }
        .budget-badge .meta strong { color: #333; }
        .two-col { display: flex; gap: 24px; margin-bottom: 24px; }
        .two-col > div { flex: 1; }
        .info-box { background: #f8f7f6; border: 1px solid #e8e6e3; border-radius: 6px; padding: 16px; }
        .info-box h3 { font-size: 9pt; text-transform: uppercase; letter-spacing: 1px; color: #78716c; margin-bottom: 10px; font-weight: 700; }
        .info-box p { font-size: 10pt; margin-bottom: 3px; color: #444; }
        .info-box p strong { color: #1a1a1a; }
        .title-section { background: linear-gradient(135deg, #78716c 0%, #57534e 100%); color: white; padding: 14px 20px; border-radius: 6px; margin-bottom: 24px; }
        .title-section h2 { font-size: 14pt; font-weight: 600; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
        th { background: #78716c; color: white; padding: 8px 10px; text-align: left; font-size: 9pt; text-transform: uppercase; letter-spacing: 0.5px; }
        td { padding: 7px 10px; border-bottom: 1px solid #eee; font-size: 10pt; vertical-align: top; }
        .center { text-align: center; }
        .right { text-align: right; }
        .item-num { width: 30px; text-align: center; color: #999; font-size: 9pt; }
        .chapter-row { background: #f0efed; }
        .chapter-row td { padding: 10px; font-size: 10pt; color: #57534e; border-bottom: 2px solid #d6d3d1; }
        .chapter-subtotal td { background: #fafaf9; border-bottom: 2px solid #d6d3d1; font-size: 10pt; }
        .totals-section { display: flex; justify-content: flex-end; margin-top: 16px; margin-bottom: 24px; }
        .totals-table { width: 300px; border: 2px solid #78716c; border-radius: 6px; overflow: hidden; }
        .totals-table td { padding: 8px 14px; font-size: 10pt; border-bottom: 1px solid #e5e5e5; }
        .totals-table .label { color: #666; }
        .totals-table .total-row td { background: #78716c; color: white; font-size: 13pt; font-weight: 700; border: none; }
        .conditions { margin-top: 20px; }
        .conditions h3 { font-size: 9pt; text-transform: uppercase; letter-spacing: 1px; color: #78716c; margin-bottom: 8px; font-weight: 700; }
        .conditions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
        .condition-item { background: #f8f7f6; border: 1px solid #e8e6e3; border-radius: 4px; padding: 10px; }
        .condition-item .label { font-size: 8pt; text-transform: uppercase; color: #999; letter-spacing: 0.5px; }
        .condition-item .value { font-size: 10pt; font-weight: 600; color: #333; margin-top: 2px; }
        .notes-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 14px; font-size: 10pt; color: #92400e; white-space: pre-wrap; }
        .footer { margin-top: 30px; text-align: center; border-top: 2px solid #78716c; padding-top: 16px; }
        .footer p { font-size: 9pt; color: #999; }
        .footer .brand { font-size: 10pt; color: #78716c; font-weight: 600; margin-bottom: 4px; }
        .signature { margin-top: 40px; display: flex; justify-content: space-between; }
        .signature-box { width: 45%; border-top: 1px solid #ccc; padding-top: 8px; font-size: 9pt; color: #999; }
        @media print { 
          body { padding: 0; } 
          .page { max-width: none; }
          th { background: #78716c !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .chapter-row { background: #f0efed !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .chapter-subtotal td { background: #fafaf9 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .totals-table .total-row td { background: #78716c !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .info-box { background: #f8f7f6 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .title-section { background: linear-gradient(135deg, #78716c 0%, #57534e 100%) !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .notes-box { background: #fffbeb !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style></head><body>
      <div class="page">
        <div class="header">
          <div class="logo-section">
            <img src="${logoUrl}" alt="Nazarí Homes" />
            <div class="company-info">
              <strong style="font-size:11pt;color:#333;">Nazarí Homes</strong><br>
              CIF: ${companyCif}<br>
              info@nazarihomes.com<br>
              www.nazarihomes.com
            </div>
          </div>
          <div class="budget-badge">
            <h1>PRESUPUESTO</h1>
            <p class="meta"><strong>Nº:</strong> ${budgetNumber}</p>
            <p class="meta"><strong>Fecha:</strong> ${today}</p>
          </div>
        </div>

        <div class="two-col">
          <div class="info-box">
            <h3>Datos del cliente</h3>
            ${budgetClient.name ? `<p><strong>${budgetClient.name}</strong></p>` : ''}
            ${budgetClient.nif ? `<p>NIF/CIF: ${budgetClient.nif}</p>` : ''}
            ${budgetClient.address ? `<p>${budgetClient.address}</p>` : ''}
            ${budgetClient.phone ? `<p>Tel: ${budgetClient.phone}</p>` : ''}
            ${budgetClient.email ? `<p>Email: ${budgetClient.email}</p>` : ''}
          </div>
          <div class="info-box">
            <h3>Datos del presupuesto</h3>
            <p><strong>Referencia:</strong> ${budgetNumber}</p>
            <p><strong>Fecha emisión:</strong> ${today}</p>
            <p><strong>Validez:</strong> ${budgetValidityDays} días</p>
            ${budgetExecutionDays ? `<p><strong>Plazo ejecución:</strong> ${budgetExecutionDays}</p>` : ''}
          </div>
        </div>

        ${budgetTitle ? `<div class="title-section"><h2>${budgetTitle}</h2></div>` : ''}

        <table>
          <thead><tr><th style="width:30px">Nº</th><th>Descripción</th><th class="center" style="width:100px">Medición</th><th class="right" style="width:100px">P. Unitario</th><th class="right" style="width:100px">Importe</th></tr></thead>
          <tbody>${chapterRows}</tbody>
        </table>

        <div class="totals-section">
          <table class="totals-table">
            <tr><td class="label">Base imponible</td><td class="right">${subtotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</td></tr>
            <tr><td class="label">IVA (21%)</td><td class="right">${iva.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</td></tr>
            <tr class="total-row"><td>TOTAL</td><td class="right">${total.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</td></tr>
          </table>
        </div>

        <div class="conditions">
          <h3>Condiciones</h3>
          <div class="conditions-grid">
            <div class="condition-item"><div class="label">Validez</div><div class="value">${budgetValidityDays} días desde emisión</div></div>
            ${budgetExecutionDays ? `<div class="condition-item"><div class="label">Plazo de ejecución</div><div class="value">${budgetExecutionDays}</div></div>` : ''}
            ${budgetPaymentTerms ? `<div class="condition-item"><div class="label">Forma de pago</div><div class="value">${budgetPaymentTerms}</div></div>` : ''}
            <div class="condition-item"><div class="label">IVA</div><div class="value">21% incluido en total</div></div>
          </div>
        </div>

        ${budgetNotes ? `<div class="conditions"><h3>Observaciones</h3><div class="notes-box">${budgetNotes}</div></div>` : ''}

        <div class="signature">
          <div class="signature-box">Fdo. Nazarí Homes</div>
          <div class="signature-box">Fdo. ${budgetClient.name || 'El cliente'}</div>
        </div>

        <div class="footer">
          <p class="brand">Nazarí Homes · Gestión Integral para tu Tranquilidad</p>
          <p>info@nazarihomes.com · www.nazarihomes.com</p>
        </div>
      </div>
      </body></html>
    `);
    printWindow.document.close();
    // Wait for logo image to load before printing
    const logoImg = printWindow.document.querySelector('img');
    if (logoImg && !logoImg.complete) {
      logoImg.onload = () => printWindow.print();
      logoImg.onerror = () => printWindow.print();
    } else {
      printWindow.print();
    }
  };

  const resetBudget = () => {
    setBudgetItems([{ id: '1', chapter: '', description: '', quantity: 1, unit: 'ud' as UnitType, unitPrice: 0 }]);
    setBudgetClient({ name: '', nif: '', address: '', phone: '', email: '' });
    setBudgetTitle('');
    setBudgetNotes('');
    setBudgetValidityDays(30);
    setBudgetExecutionDays('');
    setBudgetPaymentTerms('');
    setEditingBudgetId(null);
  };

  const loadSavedBudgets = async () => {
    setLoadingBudgets(true);
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .order('updated_at', { ascending: false });
      if (!error && data) setSavedBudgets(data);
    } catch (e) {
      console.error('Error loading budgets:', e);
    } finally {
      setLoadingBudgets(false);
    }
  };

  const saveBudget = async () => {
    if (!user) return;
    setSavingBudget(true);
    try {
      let budgetNumber: string;
      if (editingBudgetId) {
        budgetNumber = savedBudgets.find(b => b.id === editingBudgetId)?.budget_number || '';
      } else {
        // Get sequential number from database
        const { data: rpcData, error: rpcError } = await supabase.rpc('generate_budget_number');
        if (rpcError) throw rpcError;
        budgetNumber = rpcData as string;
      }

      const budgetData = {
        user_id: user.id,
        budget_number: budgetNumber,
        title: budgetTitle || null,
        client_name: budgetClient.name || null,
        client_nif: budgetClient.nif || null,
        client_address: budgetClient.address || null,
        client_phone: budgetClient.phone || null,
        client_email: budgetClient.email || null,
        items: budgetItems as any,
        notes: budgetNotes || null,
        validity_days: budgetValidityDays,
        execution_days: budgetExecutionDays || null,
        payment_terms: budgetPaymentTerms || null,
        status: 'draft',
      };

      if (editingBudgetId) {
        const { error } = await supabase.from('budgets').update(budgetData).eq('id', editingBudgetId);
        if (error) throw error;
        toast({ title: 'Guardado', description: 'Presupuesto actualizado correctamente' });
      } else {
        const { data, error } = await supabase.from('budgets').insert(budgetData).select('id').single();
        if (error) throw error;
        setEditingBudgetId(data.id);
        toast({ title: 'Guardado', description: 'Borrador guardado correctamente' });
      }
      await loadSavedBudgets();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'No se pudo guardar', variant: 'destructive' });
    } finally {
      setSavingBudget(false);
    }
  };

  const loadBudget = (budget: any) => {
    setBudgetTitle(budget.title || '');
    setBudgetClient({
      name: budget.client_name || '',
      nif: budget.client_nif || '',
      address: budget.client_address || '',
      phone: budget.client_phone || '',
      email: budget.client_email || '',
    });
    setBudgetItems(budget.items?.length ? budget.items : [{ id: '1', chapter: '', description: '', quantity: 1, unit: 'ud' as UnitType, unitPrice: 0 }]);
    setBudgetNotes(budget.notes || '');
    setBudgetValidityDays(budget.validity_days || 30);
    setBudgetExecutionDays(budget.execution_days || '');
    setBudgetPaymentTerms(budget.payment_terms || '');
    setEditingBudgetId(budget.id);
    toast({ title: 'Cargado', description: `Presupuesto ${budget.budget_number} cargado` });
  };

  const deleteBudget = async (budgetId: string) => {
    const { error } = await supabase.from('budgets').delete().eq('id', budgetId);
    if (!error) {
      toast({ title: 'Eliminado', description: 'Presupuesto eliminado' });
      if (editingBudgetId === budgetId) resetBudget();
      await loadSavedBudgets();
    }
  };

  // Load saved budgets when switching to presupuestos tab
  useEffect(() => {
    if (activeTab === 'presupuestos' && user) {
      loadSavedBudgets();
    }
  }, [activeTab, user]);

  const [draggedIncidentId, setDraggedIncidentId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, incidentId: string) => {
    e.dataTransfer.setData('incidentId', incidentId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedIncidentId(incidentId);
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    setDraggedIncidentId(null);
    const incidentId = e.dataTransfer.getData('incidentId');
    const incident = incidents.find(i => i.id === incidentId);
    if (!incident || incident.status === newStatus) return;
    // Multiservicios can only move to in_progress, paused, resolved
    if (!['in_progress', 'paused', 'pending_payment', 'resolved'].includes(newStatus)) return;
    await updateStatus(incidentId, newStatus);
  };

  const handleDragEnd = () => {
    setDraggedIncidentId(null);
    setDragOverColumn(null);
  };

  const IncidentCard = ({ incident }: { incident: Incident }) => {
    const property = properties[incident.property_id];
    const tenant = tenants[incident.tenant_access_id];
    const owner = property ? owners[property.user_id] : null;
    const isDragging = draggedIncidentId === incident.id;

    return (
      <Card 
        draggable
        onDragStart={(e) => handleDragStart(e, incident.id)}
        onDragEnd={handleDragEnd}
        className={`cursor-grab hover:shadow-md transition-all border-l-4 border-l-stone-400 ${isDragging ? 'opacity-40 scale-95' : ''}`}
        onClick={() => { setSelectedIncident(incident); loadCostForIncident(incident); }}
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
          {incidentCosts[incident.id] && (incidentCosts[incident.id].repair_cost > 0 || incidentCosts[incident.id].materials_cost > 0) && (
            <div className="flex items-center text-xs text-blue-600 font-medium">
              <Euro className="h-3 w-3 mr-1" />
              <span>{(incidentCosts[incident.id].repair_cost + incidentCosts[incident.id].materials_cost).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
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

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 min-h-[60vh]">
              {/* Approval Column - No drop (only owners approve) */}
              <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-200/50">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <h3 className="font-bold text-stone-700 text-sm">En Aprobación</h3>
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                    {approvalIncidents.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {approvalIncidents.length === 0 ? (
                    <p className="text-stone-400 text-sm text-center py-8">Sin incidencias pendientes de aprobación</p>
                  ) : (
                    approvalIncidents.map(incident => (
                      <IncidentCard key={incident.id} incident={incident} />
                    ))
                  )}
                </div>
              </div>

              {/* In Progress Column */}
              <div 
                className={`bg-amber-50/50 rounded-xl p-4 border transition-colors ${dragOverColumn === 'in_progress' ? 'border-amber-400 bg-amber-100/50 ring-2 ring-amber-300/50' : 'border-amber-200/50'}`}
                onDragOver={(e) => handleDragOver(e, 'in_progress')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'in_progress')}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Wrench className="h-5 w-5 text-amber-600" />
                  <h3 className="font-bold text-stone-700 text-sm">En Progreso</h3>
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

              {/* Paused Column */}
              <div 
                className={`bg-orange-50/50 rounded-xl p-4 border transition-colors ${dragOverColumn === 'paused' ? 'border-orange-400 bg-orange-100/50 ring-2 ring-orange-300/50' : 'border-orange-200/50'}`}
                onDragOver={(e) => handleDragOver(e, 'paused')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'paused')}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <h3 className="font-bold text-stone-700 text-sm">Pausada</h3>
                  <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                    {pausedIncidents.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {pausedIncidents.length === 0 ? (
                    <p className="text-stone-400 text-sm text-center py-8">No hay incidencias pausadas</p>
                  ) : (
                    pausedIncidents.map(incident => (
                      <IncidentCard key={incident.id} incident={incident} />
                    ))
                  )}
                </div>
              </div>

              {/* Pending Payment Column */}
              <div 
                className={`bg-blue-50/50 rounded-xl p-4 border transition-colors ${dragOverColumn === 'pending_payment' ? 'border-blue-400 bg-blue-100/50 ring-2 ring-blue-300/50' : 'border-blue-200/50'}`}
                onDragOver={(e) => handleDragOver(e, 'pending_payment')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'pending_payment')}
              >
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <h3 className="font-bold text-stone-700 text-sm">Pdte. Pago</h3>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    {pendingPaymentIncidents.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {pendingPaymentIncidents.length === 0 ? (
                    <p className="text-stone-400 text-sm text-center py-8">No hay incidencias pendientes de pago</p>
                  ) : (
                    pendingPaymentIncidents.map(incident => (
                      <IncidentCard key={incident.id} incident={incident} />
                    ))
                  )}
                </div>
              </div>


              <div 
                className={`bg-green-50/50 rounded-xl p-4 border transition-colors ${dragOverColumn === 'resolved' ? 'border-green-400 bg-green-100/50 ring-2 ring-green-300/50' : 'border-green-200/50'}`}
                onDragOver={(e) => handleDragOver(e, 'resolved')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'resolved')}
              >
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <h3 className="font-bold text-stone-700 text-sm">Resueltos</h3>
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
              {/* Saved Budgets */}
              {savedBudgets.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FolderOpen className="h-4 w-4" />
                      Presupuestos guardados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {savedBudgets.map(b => (
                        <div 
                          key={b.id} 
                          className={`border rounded-lg p-3 cursor-pointer transition-colors hover:border-primary/50 ${editingBudgetId === b.id ? 'border-primary bg-primary/5' : 'border-border'}`}
                          onClick={() => loadBudget(b)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate">{b.title || b.budget_number}</p>
                              <p className="text-xs text-muted-foreground">{b.budget_number}</p>
                              {b.client_name && <p className="text-xs text-muted-foreground mt-1">{b.client_name}</p>}
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(b.updated_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0" onClick={e => { e.stopPropagation(); deleteBudget(b.id); }}>
                              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    {editingBudgetId ? 'Editando presupuesto' : 'Nuevo presupuesto'}
                  </h2>
                  {editingBudgetId && (
                    <p className="text-sm text-muted-foreground">
                      {savedBudgets.find(b => b.id === editingBudgetId)?.budget_number}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => { resetBudget(); }} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nuevo
                  </Button>
                  <Button variant="outline" onClick={saveBudget} disabled={savingBudget} className="gap-2">
                    <Save className="h-4 w-4" />
                    {savingBudget ? 'Guardando...' : 'Guardar'}
                  </Button>
                  <Button onClick={generateBudgetPDF} className="gap-2">
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
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Nombre / Razón social</Label>
                    <Input
                      value={budgetClient.name}
                      onChange={e => setBudgetClient(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nombre del cliente"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">NIF / CIF</Label>
                    <Input
                      value={budgetClient.nif}
                      onChange={e => setBudgetClient(prev => ({ ...prev, nif: e.target.value }))}
                      placeholder="12345678A"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Dirección</Label>
                    <Input
                      value={budgetClient.address}
                      onChange={e => setBudgetClient(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Dirección del inmueble"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Teléfono</Label>
                    <Input
                      value={budgetClient.phone}
                      onChange={e => setBudgetClient(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Teléfono de contacto"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Email</Label>
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
                      <Ruler className="h-4 w-4" />
                      Partidas y mediciones
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={addBudgetItem} className="gap-1">
                      <Plus className="h-4 w-4" />
                      Añadir partida
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Header */}
                  <div className="hidden md:grid grid-cols-24 gap-2 text-xs font-medium text-muted-foreground px-1">
                    <div className="col-span-4">Capítulo</div>
                    <div className="col-span-7">Descripción</div>
                    <div className="col-span-3">Medición</div>
                    <div className="col-span-3">Unidad</div>
                    <div className="col-span-3">P. Unitario</div>
                    <div className="col-span-3 text-right">Importe</div>
                    <div className="col-span-1"></div>
                  </div>

                  {budgetItems.map(item => (
                    <div key={item.id} className="grid grid-cols-24 gap-2 items-center border-b border-border/50 pb-3">
                      <div className="col-span-12 md:col-span-4">
                        <Input
                          value={item.chapter}
                          onChange={e => updateBudgetItem(item.id, 'chapter', e.target.value)}
                          placeholder="Ej. Albañilería"
                          className="text-xs"
                        />
                      </div>
                      <div className="col-span-12 md:col-span-7">
                        <Input
                          value={item.description}
                          onChange={e => updateBudgetItem(item.id, 'description', e.target.value)}
                          placeholder="Descripción del trabajo"
                        />
                      </div>
                      <div className="col-span-4 md:col-span-3">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.quantity}
                          onChange={e => updateBudgetItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="col-span-4 md:col-span-3">
                        <select
                          value={item.unit}
                          onChange={e => updateBudgetItem(item.id, 'unit', e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-2 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {UNIT_OPTIONS.map(u => (
                            <option key={u.value} value={u.value}>{u.value}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-4 md:col-span-3">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice || ''}
                          onChange={e => updateBudgetItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          placeholder="0.00 €"
                        />
                      </div>
                      <div className="col-span-3 md:col-span-3 text-right text-sm font-medium">
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
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Totals */}
                  <div className="border-t pt-4 mt-4 space-y-2">
                    <div className="flex justify-end gap-8 text-sm">
                      <span className="text-muted-foreground">Base imponible</span>
                      <span className="font-medium w-28 text-right">{subtotal.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-end gap-8 text-sm">
                      <span className="text-muted-foreground">IVA (21%)</span>
                      <span className="font-medium w-28 text-right">{iva.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-end gap-8 text-lg font-bold">
                      <span>TOTAL</span>
                      <span className="w-28 text-right">{total.toFixed(2)} €</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Conditions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Condiciones
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">CIF empresa</Label>
                    <Input
                      value={companyCif}
                      onChange={e => setCompanyCif(e.target.value)}
                      placeholder="CIF de la empresa"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Validez (días)</Label>
                    <Input
                      type="number"
                      value={budgetValidityDays}
                      onChange={e => setBudgetValidityDays(parseInt(e.target.value) || 30)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Plazo de ejecución</Label>
                    <Input
                      value={budgetExecutionDays}
                      onChange={e => setBudgetExecutionDays(e.target.value)}
                      placeholder="Ej. 15 días laborables"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Forma de pago</Label>
                    <Input
                      value={budgetPaymentTerms}
                      onChange={e => setBudgetPaymentTerms(e.target.value)}
                      placeholder="Ej. 50% inicio, 50% final"
                      className="mt-1"
                    />
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
                    placeholder="Notas adicionales, garantías, exclusiones..."
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

              {/* Costs section - only for multiservicios */}
              <div className="bg-blue-50 rounded-lg p-3 space-y-3 border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-800 flex items-center gap-1">
                  <Euro className="h-4 w-4" />
                  Costes del servicio
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-blue-700">Coste arreglo (€)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={costRepair || ''}
                      onChange={e => setCostRepair(Number(e.target.value))}
                      placeholder="0.00"
                      className="mt-1 h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-blue-700">Materiales (€)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={costMaterials || ''}
                      onChange={e => setCostMaterials(Number(e.target.value))}
                      placeholder="0.00"
                      className="mt-1 h-8 text-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-blue-800">Total: {(costRepair + costMaterials).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
                  <Button 
                    size="sm" 
                    onClick={() => saveCost(selectedIncident.id)}
                    disabled={savingCost}
                    className="h-7 text-xs"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    {savingCost ? 'Guardando...' : 'Guardar costes'}
                  </Button>
                </div>

                {/* Receipts / Justificantes */}
                <div className="space-y-2">
                  <Label className="text-xs text-blue-700">Justificantes (tickets, facturas, PDFs...)</Label>
                  <div className="flex gap-2">
                    <label className="flex-1">
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            uploadReceipt(selectedIncident.id, e.target.files);
                            e.target.value = '';
                          }
                        }}
                      />
                      <div className="flex items-center justify-center gap-2 border border-dashed border-blue-300 rounded-lg p-2 cursor-pointer hover:bg-blue-50 transition-colors text-xs text-blue-600">
                        <Plus className="h-3 w-3" />
                        {uploadingReceipt ? 'Subiendo...' : 'Adjuntar archivos'}
                      </div>
                    </label>
                  </div>
                  {costReceipts.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {costReceipts.map((url, idx) => {
                        const isPdf = url.toLowerCase().includes('.pdf');
                        const isDoc = url.toLowerCase().includes('.doc');
                        return (
                          <div key={idx} className="relative group">
                            {isPdf || isDoc ? (
                              <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center h-20 bg-stone-100 rounded-lg border text-xs text-stone-500 hover:bg-stone-200">
                                <FileText className="h-6 w-6 mr-1" />
                                {isPdf ? 'PDF' : 'DOC'}
                              </a>
                            ) : (
                              <a href={url} target="_blank" rel="noopener noreferrer">
                                <img src={url} alt={`Justificante ${idx + 1}`} className="h-20 w-full object-cover rounded-lg border" />
                              </a>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); removeReceipt(selectedIncident.id, url); }}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                {/* Approval status - read only for multiservicios */}
                {selectedIncident.status === 'approval' && (
                  <p className="text-sm text-purple-600 text-center py-2">
                    ⏳ Pendiente de aprobación por el propietario
                  </p>
                )}
                {/* In progress - can pause, send to payment, or resolve */}
                {selectedIncident.status === 'in_progress' && (
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      variant="outline"
                      className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50"
                      onClick={() => updateStatus(selectedIncident.id, 'paused')}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Pausar
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                      onClick={() => updateStatus(selectedIncident.id, 'pending_payment')}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pdte. Pago
                    </Button>
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => updateStatus(selectedIncident.id, 'resolved')}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Resolver
                    </Button>
                  </div>
                )}
                {/* Paused - can resume, send to payment, or resolve */}
                {selectedIncident.status === 'paused' && (
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      variant="outline"
                      className="flex-1"
                      onClick={() => updateStatus(selectedIncident.id, 'in_progress')}
                    >
                      <Wrench className="h-4 w-4 mr-2" />
                      Reanudar
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                      onClick={() => updateStatus(selectedIncident.id, 'pending_payment')}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pdte. Pago
                    </Button>
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => updateStatus(selectedIncident.id, 'resolved')}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Resolver
                    </Button>
                  </div>
                )}
                {/* Pending Payment - can resume or resolve */}
                {selectedIncident.status === 'pending_payment' && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      className="flex-1"
                      onClick={() => updateStatus(selectedIncident.id, 'in_progress')}
                    >
                      <Wrench className="h-4 w-4 mr-2" />
                      Reanudar
                    </Button>
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => updateStatus(selectedIncident.id, 'resolved')}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Resolver
                    </Button>
                  </div>
                )}
                {/* Resolved - can reopen */}
                {selectedIncident.status === 'resolved' && (
                  <Button variant="outline" className="flex-1" onClick={() => updateStatus(selectedIncident.id, 'in_progress')}>
                    <Wrench className="h-4 w-4 mr-2" />
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
