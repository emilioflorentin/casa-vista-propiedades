
import { useState, useEffect, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useSearchParams } from "react-router-dom";
import { Shield, Send, Camera, MessageCircle, AlertTriangle, CheckCircle, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

interface TenantInfo {
  tenant_access_id: string;
  property_id: string;
  tenant_name: string;
  property_title: string;
  property_location: string;
  owner_phone?: string;
  property_reference?: string;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  images: string[];
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  { value: "plumbing", label: "Fontanería", labelEn: "Plumbing" },
  { value: "electrical", label: "Electricidad", labelEn: "Electrical" },
  { value: "heating", label: "Calefacción/AC", labelEn: "Heating/AC" },
  { value: "structural", label: "Estructura", labelEn: "Structural" },
  { value: "appliances", label: "Electrodomésticos", labelEn: "Appliances" },
  { value: "pests", label: "Plagas", labelEn: "Pests" },
  { value: "other", label: "Otro", labelEn: "Other" },
];

const STATUS_CONFIG: Record<string, { color: string; icon: typeof Clock; label: string; labelEn: string }> = {
  pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock, label: "Pendiente", labelEn: "Pending" },
  approval: { color: "bg-purple-100 text-purple-800", icon: Clock, label: "En aprobación", labelEn: "In Approval" },
  in_progress: { color: "bg-blue-100 text-blue-800", icon: AlertTriangle, label: "En progreso", labelEn: "In Progress" },
  paused: { color: "bg-orange-100 text-orange-800", icon: Clock, label: "Pausada", labelEn: "Paused" },
  resolved: { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Resuelto", labelEn: "Resolved" },
  rejected: { color: "bg-red-100 text-red-800", icon: AlertTriangle, label: "Rechazada", labelEn: "Rejected" },
};

const TenantIncidents = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [accessCode, setAccessCode] = useState(searchParams.get("code") || "");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const loadIncidents = useCallback(async (code: string) => {
    const { data, error } = await supabase.rpc("get_tenant_incidents", { p_access_code: code });
    if (!error && data) {
      setIncidents(data as Incident[]);
    }
  }, []);

  const validateCode = async () => {
    if (!accessCode.trim()) return;
    setIsValidating(true);
    try {
      const { data, error } = await supabase.rpc("validate_tenant_access", { p_access_code: accessCode.trim() });
      if (error || !data || (data as any[]).length === 0) {
        toast({
          title: language === "es" ? "Código no válido" : "Invalid code",
          description: language === "es" ? "El código de acceso no es válido o ha sido desactivado." : "The access code is invalid or has been deactivated.",
          variant: "destructive",
        });
        return;
      }
      const info = (data as any[])[0];
      
      // Fetch owner's phone number and property reference
      const { data: ownerData } = await supabase.rpc("get_property_owner_contact", { property_id: info.property_id });
      const ownerPhone = ownerData && (ownerData as any[]).length > 0 ? (ownerData as any[])[0].phone : null;
      
      const { data: propData } = await supabase.from("properties").select("reference").eq("id", info.property_id).single();
      const propertyReference = propData?.reference || null;
      
      setTenantInfo({ ...info, owner_phone: ownerPhone, property_reference: propertyReference });
      await loadIncidents(accessCode.trim());
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsValidating(false);
    }
  };

  // Auto-validate if code comes from URL
  useEffect(() => {
    if (searchParams.get("code")) {
      validateCode();
    }
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 5) {
      toast({
        title: language === "es" ? "Máximo 5 imágenes" : "Maximum 5 images",
        variant: "destructive",
      });
      return;
    }
    setImageFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreviews((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setIsSubmitting(true);

    try {
      // Upload images
      const imageUrls: string[] = [];
      for (const file of imageFiles) {
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("incident-images")
          .upload(fileName, file);
        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage.from("incident-images").getPublicUrl(uploadData.path);
          imageUrls.push(urlData.publicUrl);
        }
      }

      const { error } = await supabase.rpc("create_incident", {
        p_access_code: accessCode.trim(),
        p_title: title.trim(),
        p_description: description.trim(),
        p_category: category,
        p_images: imageUrls,
      });

      if (error) throw error;

      toast({
        title: language === "es" ? "Incidencia reportada" : "Incident reported",
        description: language === "es" ? "Tu incidencia ha sido enviada correctamente." : "Your incident has been submitted successfully.",
      });

      // Reset form
      setTitle("");
      setDescription("");
      setCategory("other");
      setImageFiles([]);
      setImagePreviews([]);
      setShowForm(false);
      await loadIncidents(accessCode.trim());
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ownerPhone = tenantInfo?.owner_phone;
  const formattedPhone = ownerPhone
    ? (ownerPhone.startsWith("+") ? ownerPhone.replace(/\D/g, "") : `34${ownerPhone.replace(/\D/g, "")}`)
    : null;
  const propertyRef = tenantInfo?.property_reference;
  const whatsappMessage = encodeURIComponent(
    language === "es"
      ? `Hola, soy inquilino de la vivienda${propertyRef ? ` con referencia ${propertyRef}` : ""}. Necesito reportar una incidencia urgente.`
      : `Hello, I'm a tenant at property${propertyRef ? ` ref. ${propertyRef}` : ""}. I need to report an urgent incident.`
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      <Header />

      <main className="container mx-auto px-6 py-12">
        {!tenantInfo ? (
          /* Access Code Validation */
          <div className="max-w-md mx-auto">
            <Card className="shadow-xl border-stone-200">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-stone-600" />
                </div>
                <CardTitle className="text-2xl">
                  {language === "es" ? "Acceso para inquilinos" : "Tenant Access"}
                </CardTitle>
                <p className="text-stone-500 text-sm mt-2">
                  {language === "es"
                    ? "Introduce el código de acceso que te proporcionó tu inmobiliaria al firmar el contrato."
                    : "Enter the access code provided by your property manager when signing the contract."}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder={language === "es" ? "Código de acceso (UUID)" : "Access code (UUID)"}
                  className="text-center font-mono"
                />
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="privacy-policy"
                    checked={privacyAccepted}
                    onCheckedChange={(checked) => setPrivacyAccepted(checked === true)}
                  />
                  <label htmlFor="privacy-policy" className="text-sm text-stone-600 leading-tight cursor-pointer">
                    {language === "es" ? (
                      <>He leído y acepto la <a href="/privacy-policy" target="_blank" className="underline text-stone-800 hover:text-stone-900">política de privacidad</a></>
                    ) : (
                      <>I have read and accept the <a href="/privacy-policy" target="_blank" className="underline text-stone-800 hover:text-stone-900">privacy policy</a></>
                    )}
                  </label>
                </div>
                <Button
                  onClick={validateCode}
                  disabled={!accessCode.trim() || isValidating || !privacyAccepted}
                  className="w-full bg-stone-600 hover:bg-stone-700"
                >
                  {isValidating
                    ? language === "es" ? "Verificando..." : "Verifying..."
                    : language === "es" ? "Acceder" : "Access"}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Tenant Dashboard */
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Property Info */}
            <Card className="border-stone-200">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-sm text-stone-500">
                      {language === "es" ? "Bienvenido/a," : "Welcome,"}
                    </p>
                    <h2 className="text-2xl font-bold text-stone-800">{tenantInfo.tenant_name}</h2>
                    <p className="text-stone-600">{tenantInfo.property_title} — {tenantInfo.property_location}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setShowForm(true)} className="bg-stone-600 hover:bg-stone-700">
                      <Send className="h-4 w-4 mr-2" />
                      {language === "es" ? "Nueva incidencia" : "New incident"}
                    </Button>
                    {formattedPhone && (
                      <Button
                        variant="outline"
                        className="border-green-500 text-green-700 hover:bg-green-50"
                        onClick={() => window.open(`https://api.whatsapp.com/send?phone=${formattedPhone}&text=${whatsappMessage}`, '_blank')}
                      >
                        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        WhatsApp
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* New Incident Form */}
            {showForm && (
              <Card className="border-stone-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-stone-600" />
                    {language === "es" ? "Reportar incidencia" : "Report incident"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-stone-700">
                        {language === "es" ? "Título" : "Title"} *
                      </label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={language === "es" ? "Ej: Fuga de agua en el baño" : "E.g.: Water leak in bathroom"}
                        maxLength={200}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-700">
                        {language === "es" ? "Categoría" : "Category"}
                      </label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {language === "es" ? cat.label : cat.labelEn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-700">
                        {language === "es" ? "Descripción" : "Description"} *
                      </label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={language === "es" ? "Describe la incidencia con detalle..." : "Describe the incident in detail..."}
                        rows={4}
                        maxLength={2000}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-700">
                        {language === "es" ? "Fotos (máx. 5)" : "Photos (max 5)"}
                      </label>
                      <div className="mt-2">
                        <label className="flex items-center gap-2 cursor-pointer bg-stone-50 border border-dashed border-stone-300 rounded-lg p-4 hover:bg-stone-100 transition-colors">
                          <Camera className="h-5 w-5 text-stone-500" />
                          <span className="text-sm text-stone-600">
                            {language === "es" ? "Añadir fotos" : "Add photos"}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {imagePreviews.length > 0 && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {imagePreviews.map((preview, idx) => (
                            <div key={idx} className="relative w-20 h-20">
                              <img src={preview} alt="" className="w-full h-full object-cover rounded-lg" />
                              <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                        {language === "es" ? "Cancelar" : "Cancel"}
                      </Button>
                      <Button type="submit" disabled={isSubmitting} className="bg-stone-600 hover:bg-stone-700">
                        {isSubmitting
                          ? language === "es" ? "Enviando..." : "Sending..."
                          : language === "es" ? "Enviar incidencia" : "Submit incident"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Incidents List */}
            <div>
              <h3 className="text-xl font-semibold text-stone-800 mb-4">
                {language === "es" ? "Mis incidencias" : "My incidents"}
                <span className="text-sm font-normal text-stone-500 ml-2">({incidents.length})</span>
              </h3>
              {incidents.length === 0 ? (
                <Card className="border-stone-200">
                  <CardContent className="py-12 text-center text-stone-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-400" />
                    <p>{language === "es" ? "No tienes incidencias reportadas" : "You have no reported incidents"}</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {incidents.map((incident) => {
                    const statusCfg = STATUS_CONFIG[incident.status] || STATUS_CONFIG.pending;
                    const StatusIcon = statusCfg.icon;
                    const catLabel = CATEGORIES.find((c) => c.value === incident.category);
                    return (
                      <Card key={incident.id} className="border-stone-200">
                        <CardContent className="pt-6">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-stone-800">{incident.title}</h4>
                                <Badge className={statusCfg.color}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {language === "es" ? statusCfg.label : statusCfg.labelEn}
                                </Badge>
                              </div>
                              <Badge variant="outline" className="mb-2">
                                {language === "es" ? catLabel?.label : catLabel?.labelEn}
                              </Badge>
                              <p className="text-sm text-stone-600 mt-1">{incident.description}</p>
                              {incident.images && incident.images.length > 0 && (
                                <div className="flex gap-2 mt-3 flex-wrap">
                                  {incident.images.map((img, idx) => (
                                    <a key={idx} href={img} target="_blank" rel="noopener noreferrer">
                                      <img src={img} alt="" className="w-16 h-16 object-cover rounded-lg border" />
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                            <span className="text-xs text-stone-400 whitespace-nowrap">
                              {new Date(incident.created_at).toLocaleDateString(language === "es" ? "es-ES" : "en-US")}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            <Button variant="ghost" onClick={() => { setTenantInfo(null); setIncidents([]); }} className="text-stone-500">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {language === "es" ? "Cerrar sesión de inquilino" : "Log out tenant"}
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default TenantIncidents;
