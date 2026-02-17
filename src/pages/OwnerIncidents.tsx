
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Shield, Plus, Copy, CheckCircle, Clock, AlertTriangle, Trash2, Eye, ToggleLeft, ToggleRight, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

interface TenantAccess {
  id: string;
  property_id: string;
  tenant_name: string;
  tenant_email: string | null;
  tenant_phone: string | null;
  access_code: string;
  is_active: boolean;
  created_at: string;
}

interface Incident {
  id: string;
  tenant_access_id: string;
  property_id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  images: string[];
  created_at: string;
  updated_at: string;
}

interface Property {
  id: string;
  title: string;
  location: string;
  reference: string;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendiente", labelEn: "Pending", color: "bg-yellow-100 text-yellow-800" },
  { value: "in_progress", label: "En progreso", labelEn: "In Progress", color: "bg-blue-100 text-blue-800" },
  { value: "resolved", label: "Resuelto", labelEn: "Resolved", color: "bg-green-100 text-green-800" },
];

const CATEGORIES: Record<string, { label: string; labelEn: string }> = {
  plumbing: { label: "Fontanería", labelEn: "Plumbing" },
  electrical: { label: "Electricidad", labelEn: "Electrical" },
  heating: { label: "Calefacción/AC", labelEn: "Heating/AC" },
  structural: { label: "Estructura", labelEn: "Structural" },
  appliances: { label: "Electrodomésticos", labelEn: "Appliances" },
  pests: { label: "Plagas", labelEn: "Pests" },
  other: { label: "Otro", labelEn: "Other" },
};

const OwnerIncidents = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();

  const [properties, setProperties] = useState<Property[]>([]);
  const [tenantAccesses, setTenantAccesses] = useState<TenantAccess[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // New tenant access form
  const [newTenantName, setNewTenantName] = useState("");
  const [newTenantEmail, setNewTenantEmail] = useState("");
  const [newTenantPhone, setNewTenantPhone] = useState("");
  const [newTenantPropertyId, setNewTenantPropertyId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const [propsRes, accessRes, incidentsRes] = await Promise.all([
        supabase.from("properties").select("id, title, location, reference").eq("user_id", user.id),
        supabase.from("tenant_access").select("*").order("created_at", { ascending: false }),
        supabase.from("incidents").select("*").order("created_at", { ascending: false }),
      ]);
      if (propsRes.data) setProperties(propsRes.data);
      if (accessRes.data) setTenantAccesses(accessRes.data as TenantAccess[]);
      if (incidentsRes.data) setIncidents(incidentsRes.data as Incident[]);
      setLoading(false);
    };
    load();
  }, [user]);

  const createTenantAccess = async () => {
    if (!newTenantName.trim() || !newTenantPropertyId || !user) return;
    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from("tenant_access")
        .insert({
          property_id: newTenantPropertyId,
          tenant_name: newTenantName.trim(),
          tenant_email: newTenantEmail.trim() || null,
          tenant_phone: newTenantPhone.trim() || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      setTenantAccesses((prev) => [data as TenantAccess, ...prev]);
      setNewTenantName("");
      setNewTenantEmail("");
      setNewTenantPhone("");
      setNewTenantPropertyId("");
      setDialogOpen(false);
      toast({
        title: language === "es" ? "Acceso creado" : "Access created",
        description: language === "es" ? "El código de acceso ha sido generado." : "The access code has been generated.",
      });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const toggleAccessActive = async (access: TenantAccess) => {
    const { error } = await supabase
      .from("tenant_access")
      .update({ is_active: !access.is_active })
      .eq("id", access.id);
    if (!error) {
      setTenantAccesses((prev) =>
        prev.map((a) => (a.id === access.id ? { ...a, is_active: !a.is_active } : a))
      );
    }
  };

  const updateIncidentStatus = async (incidentId: string, newStatus: string) => {
    const { error } = await supabase
      .from("incidents")
      .update({ status: newStatus })
      .eq("id", incidentId);
    if (!error) {
      setIncidents((prev) =>
        prev.map((i) => (i.id === incidentId ? { ...i, status: newStatus } : i))
      );
      toast({
        title: language === "es" ? "Estado actualizado" : "Status updated",
      });
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: language === "es" ? "Código copiado" : "Code copied" });
  };

  const filteredIncidents = selectedProperty === "all"
    ? incidents
    : incidents.filter((i) => i.property_id === selectedProperty);

  const getTenantName = (accessId: string) =>
    tenantAccesses.find((a) => a.id === accessId)?.tenant_name || "—";

  const getPropertyTitle = (propId: string) =>
    properties.find((p) => p.id === propId)?.title || "—";

  const getPropertyReference = (propId: string) =>
    properties.find((p) => p.id === propId)?.reference || "";

  const shareToWhatsApp = (incident: Incident) => {
    const cat = CATEGORIES[incident.category] || CATEGORIES.other;
    const catName = language === "es" ? cat.label : cat.labelEn;
    const statusLabel = STATUS_OPTIONS.find((s) => s.value === incident.status);
    const statusName = language === "es" ? statusLabel?.label : statusLabel?.labelEn;
    const propRef = getPropertyReference(incident.property_id);
    const propTitle = getPropertyTitle(incident.property_id);
    const tenantName = getTenantName(incident.tenant_access_id);
    const date = new Date(incident.created_at).toLocaleDateString(language === "es" ? "es-ES" : "en-US");

    let message = language === "es"
      ? `🔧 *Incidencia en vivienda${propRef ? ` (Ref: ${propRef})` : ""}*\n\n`
        + `📍 *Propiedad:* ${propTitle}\n`
        + `👤 *Inquilino:* ${tenantName}\n`
        + `📅 *Fecha:* ${date}\n`
        + `📂 *Categoría:* ${catName}\n`
        + `📊 *Estado:* ${statusName}\n\n`
        + `📝 *Título:* ${incident.title}\n\n`
        + `*Descripción:*\n${incident.description}`
      : `🔧 *Property Incident${propRef ? ` (Ref: ${propRef})` : ""}*\n\n`
        + `📍 *Property:* ${propTitle}\n`
        + `👤 *Tenant:* ${tenantName}\n`
        + `📅 *Date:* ${date}\n`
        + `📂 *Category:* ${catName}\n`
        + `📊 *Status:* ${statusName}\n\n`
        + `📝 *Title:* ${incident.title}\n\n`
        + `*Description:*\n${incident.description}`;

    if (incident.images && incident.images.length > 0) {
      message += language === "es" ? `\n\n📸 *Fotos:*\n` : `\n\n📸 *Photos:*\n`;
      incident.images.forEach((img) => { message += `${img}\n`; });
    }

    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
        <Header />
        <div className="container mx-auto px-6 py-20 text-center">
          <p className="text-stone-600 mb-4">
            {language === "es" ? "Debes iniciar sesión para gestionar incidencias." : "You must log in to manage incidents."}
          </p>
          <Link to="/account">
            <Button className="bg-stone-600 hover:bg-stone-700">
              {language === "es" ? "Iniciar sesión" : "Log in"}
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      <Header />

      <main className="container mx-auto px-6 py-12 space-y-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-stone-800">
              {language === "es" ? "Gestión de incidencias" : "Incident Management"}
            </h1>
            <p className="text-stone-500">
              {language === "es" ? "Gestiona los accesos de tus inquilinos y sus incidencias" : "Manage your tenants' access and their incidents"}
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-stone-600 hover:bg-stone-700">
                <Plus className="h-4 w-4 mr-2" />
                {language === "es" ? "Nuevo acceso inquilino" : "New tenant access"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {language === "es" ? "Crear acceso para inquilino" : "Create tenant access"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">{language === "es" ? "Propiedad" : "Property"} *</label>
                  <Select value={newTenantPropertyId} onValueChange={setNewTenantPropertyId}>
                    <SelectTrigger><SelectValue placeholder={language === "es" ? "Seleccionar propiedad" : "Select property"} /></SelectTrigger>
                    <SelectContent>
                      {properties.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">{language === "es" ? "Nombre del inquilino" : "Tenant name"} *</label>
                  <Input value={newTenantName} onChange={(e) => setNewTenantName(e.target.value)} maxLength={100} />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input value={newTenantEmail} onChange={(e) => setNewTenantEmail(e.target.value)} type="email" maxLength={255} />
                </div>
                <div>
                  <label className="text-sm font-medium">{language === "es" ? "Teléfono" : "Phone"}</label>
                  <Input value={newTenantPhone} onChange={(e) => setNewTenantPhone(e.target.value)} maxLength={20} />
                </div>
                <Button onClick={createTenantAccess} disabled={!newTenantName.trim() || !newTenantPropertyId || isCreating} className="w-full bg-stone-600 hover:bg-stone-700">
                  {isCreating ? "..." : language === "es" ? "Crear acceso" : "Create access"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tenant Access Codes */}
        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {language === "es" ? "Accesos de inquilinos" : "Tenant access codes"}
            <span className="text-sm font-normal text-stone-500">({tenantAccesses.length})</span>
          </h2>
          {tenantAccesses.length === 0 ? (
            <Card className="border-stone-200">
              <CardContent className="py-8 text-center text-stone-500">
                {language === "es" ? "No hay accesos creados. Crea uno para que tus inquilinos puedan reportar incidencias." : "No accesses created. Create one so your tenants can report incidents."}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tenantAccesses.map((access) => (
                <Card key={access.id} className={`border-stone-200 ${!access.is_active ? "opacity-60" : ""}`}>
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-stone-800">{access.tenant_name}</h4>
                      <button onClick={() => toggleAccessActive(access)} title={access.is_active ? "Desactivar" : "Activar"}>
                        {access.is_active ? (
                          <ToggleRight className="h-6 w-6 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-6 w-6 text-stone-400" />
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-stone-500">{getPropertyTitle(access.property_id)}</p>
                    <div className="flex items-center gap-2 bg-stone-50 rounded-lg p-2">
                      <code className="text-xs flex-1 truncate text-stone-600">{access.access_code}</code>
                      <Button variant="ghost" size="sm" onClick={() => copyCode(access.access_code)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    {access.tenant_email && <p className="text-xs text-stone-400">{access.tenant_email}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Incidents */}
        <section>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h2 className="text-xl font-semibold text-stone-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {language === "es" ? "Incidencias" : "Incidents"}
              <span className="text-sm font-normal text-stone-500">({filteredIncidents.length})</span>
            </h2>
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === "es" ? "Todas las propiedades" : "All properties"}</SelectItem>
                {properties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredIncidents.length === 0 ? (
            <Card className="border-stone-200">
              <CardContent className="py-12 text-center text-stone-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-400" />
                <p>{language === "es" ? "No hay incidencias" : "No incidents"}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredIncidents.map((incident) => {
                const statusCfg = STATUS_OPTIONS.find((s) => s.value === incident.status) || STATUS_OPTIONS[0];
                const cat = CATEGORIES[incident.category] || CATEGORIES.other;
                return (
                  <Card key={incident.id} className="border-stone-200">
                    <CardContent className="pt-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-stone-800">{incident.title}</h4>
                            <Badge className={statusCfg.color}>
                              {language === "es" ? statusCfg.label : statusCfg.labelEn}
                            </Badge>
                            <Badge variant="outline">{language === "es" ? cat.label : cat.labelEn}</Badge>
                          </div>
                          <p className="text-sm text-stone-500">
                            {language === "es" ? "Inquilino:" : "Tenant:"} {getTenantName(incident.tenant_access_id)} · {getPropertyTitle(incident.property_id)}
                          </p>
                          <p className="text-sm text-stone-600">{incident.description}</p>
                          {incident.images && incident.images.length > 0 && (
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {incident.images.map((img, idx) => (
                                <a key={idx} href={img} target="_blank" rel="noopener noreferrer">
                                  <img src={img} alt="" className="w-20 h-20 object-cover rounded-lg border" />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <span className="text-xs text-stone-400">
                            {new Date(incident.created_at).toLocaleDateString(language === "es" ? "es-ES" : "en-US")}
                          </span>
                          <Select
                            value={incident.status}
                            onValueChange={(val) => updateIncidentStatus(incident.id, val)}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                  {language === "es" ? s.label : s.labelEn}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-green-500 text-green-700 hover:bg-green-50 w-40"
                            onClick={() => shareToWhatsApp(incident)}
                          >
                            <Share2 className="h-4 w-4 mr-1" />
                            {language === "es" ? "Enviar a profesional" : "Send to pro"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default OwnerIncidents;
