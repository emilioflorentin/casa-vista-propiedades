import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Chrome, LogOut, Building, Phone, Plus, Upload, Edit, Trash2, Camera, Home, Bed, Bath, Square } from "lucide-react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getUserHash, clearUserHash } from "@/utils/userHash";
import { 
  saveLocalProperty, 
  updateLocalProperty, 
  deleteLocalProperty, 
  getUserProperties, 
  generatePropertyReference,
  LocalProperty 
} from "@/utils/localProperties";

interface Property {
  id: string;
  reference: string;
  title: string;
  type: "apartment" | "house" | "loft" | "studio";
  price: number;
  currency: string;
  operation: "rent" | "sale";
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image?: string;
  features?: string[];
  description?: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  user_type?: string;
  company_name?: string;
  phone?: string;
}

const Account = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userProperties, setUserProperties] = useState<LocalProperty[]>([]);
  const [userHash, setUserHash] = useState<string | null>(null);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<LocalProperty | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "",
    companyName: "",
    phone: ""
  });
  const [propertyForm, setPropertyForm] = useState({
    title: "",
    type: "apartment" as "apartment" | "house" | "loft" | "studio",
    price: "",
    currency: "EUR",
    operation: "rent" as "rent" | "sale",
    location: "",
    bedrooms: "1",
    bathrooms: "1",
    area: "",
    description: "",
    features: [] as string[],
    images: [] as File[]
  });
  
  // Características predefinidas
  const predefinedFeatures = [
    "Aire acondicionado",
    "Calefacción",
    "Parking",
    "Terraza",
    "Balcón", 
    "Jardín",
    "Piscina",
    "Ascensor",
    "Amueblado",
    "Cocina equipada",
    "Lavadero",
    "Trastero",
    "Chimenea",
    "Suelo de parquet",
    "Suelo de mármol",
    "Ventanas de aluminio",
    "Puerta blindada",
    "Videoportero",
    "Conserje",
    "Zona verde",
    "Cerca del metro",
    "Cerca de colegios",
    "Zona comercial",
    "Vista al mar",
    "Vista a la montaña",
    "Luminoso",
    "Exterior",
    "Reformado",
    "A estrenar"
  ];
  
  const [customFeature, setCustomFeature] = useState("");

  const { t } = useLanguage();
  const { user, loading, signUp, signIn, signOut, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Cargar perfil y propiedades del usuario
  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadUserHash();
    }
  }, [user]);

  // Cargar propiedades cuando tengamos el hash
  useEffect(() => {
    if (userHash) {
      loadUserProperties();
    }
  }, [userHash]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadUserHash = async () => {
    if (!user) return;
    
    try {
      const hash = await getUserHash();
      setUserHash(hash);
    } catch (error) {
      console.error('Error loading user hash:', error);
    }
  };

  const loadUserProperties = () => {
    if (!userHash) return;
    
    try {
      const properties = getUserProperties(userHash);
      setUserProperties(properties);
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePropertyFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPropertyForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePropertySelectChange = (name: string, value: string) => {
    setPropertyForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFeatureAdd = (feature: string) => {
    if (feature && !propertyForm.features.includes(feature)) {
      setPropertyForm(prev => ({
        ...prev,
        features: [...prev.features, feature]
      }));
    }
  };

  const handleFeatureRemove = (feature: string) => {
    setPropertyForm(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }));
  };

  const handleImageUpload = async (file: File) => {
    if (!user) return null;
    
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('property-images')
        .upload(fileName, file);
      
      if (error) throw error;
      
      const { data: urlData } = supabase.storage
        .from('property-images')
        .getPublicUrl(fileName);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error al subir la imagen');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;
    
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('profile-avatars')
        .upload(fileName, file, { upsert: true });
      
      if (error) throw error;
      
      const { data: urlData } = supabase.storage
        .from('profile-avatars')
        .getPublicUrl(fileName);
      
      // Actualizar perfil con nueva URL del avatar
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      setUserProfile(prev => prev ? {...prev, avatar_url: urlData.publicUrl} : null);
      toast.success('Avatar actualizado correctamente');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Error al subir el avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) return;

    // Validaciones básicas
    if (!formData.email || !formData.password) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    if (!isLogin) {
      // Validaciones para registro
      if (!formData.name) {
        toast.error('El nombre es requerido');
        return;
      }

      if (!formData.userType) {
        toast.error('Debe seleccionar si es particular o empresa');
        return;
      }

      if (formData.userType === 'empresa' && !formData.companyName) {
        toast.error('El nombre de la empresa es requerido');
        return;
      }

      if (!formData.phone) {
        toast.error('El teléfono es requerido');
        return;
      }

      if (!acceptPrivacy) {
        toast.error('Debe aceptar la política de privacidad');
        return;
      }

      if (!captchaToken) {
        toast.error('Debe completar el captcha');
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        toast.error('Las contraseñas no coinciden');
        return;
      }
      
      if (formData.password.length < 6) {
        toast.error('La contraseña debe tener al menos 6 caracteres');
        return;
      }

      // Registrar usuario con datos adicionales
      const { error } = await signUp(formData.email, formData.password, formData.name, {
        user_type: formData.userType,
        company_name: formData.companyName,
        phone: formData.phone
      });
      if (error) {
        toast.error(error);
      } else {
        // Reset form
        setFormData({ 
          name: "", 
          email: "", 
          password: "", 
          confirmPassword: "",
          userType: "",
          companyName: "",
          phone: ""
        });
        setAcceptPrivacy(false);
        setCaptchaToken(null);
      }
    } else {
      // Iniciar sesión
      const { error } = await signIn(formData.email, formData.password);
      if (error) {
        toast.error(error);
      } else {
        navigate('/');
      }
    }
  };

  const handlePropertySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !userHash) return;

    // Validaciones
    if (!propertyForm.title || !propertyForm.location || !propertyForm.price || !propertyForm.area) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      let imageUrls: string[] = [];
      
      // Subir múltiples imágenes si hay alguna
      if (propertyForm.images.length > 0) {
        for (const image of propertyForm.images) {
          const imageUrl = await handleImageUpload(image);
          if (imageUrl) imageUrls.push(imageUrl);
        }
      }

      const propertyData = {
        userHash,
        reference: editingProperty ? editingProperty.reference : generatePropertyReference(),
        title: propertyForm.title,
        type: propertyForm.type,
        price: parseFloat(propertyForm.price),
        currency: propertyForm.currency,
        operation: propertyForm.operation,
        location: propertyForm.location,
        bedrooms: parseInt(propertyForm.bedrooms),
        bathrooms: parseInt(propertyForm.bathrooms),
        area: parseFloat(propertyForm.area),
        description: propertyForm.description,
        features: propertyForm.features,
        images: imageUrls
      };

      if (editingProperty) {
        // Actualizar propiedad existente
        const success = updateLocalProperty(editingProperty.id, propertyData);
        if (!success) throw new Error('No se pudo actualizar la propiedad');
        toast.success('Propiedad actualizada correctamente');
      } else {
        // Crear nueva propiedad
        saveLocalProperty(propertyData);
        toast.success('Propiedad publicada correctamente');
      }

      // Reset form
      setPropertyForm({
        title: "",
        type: "apartment",
        price: "",
        currency: "EUR",
        operation: "rent",
        location: "",
        bedrooms: "1",
        bathrooms: "1",
        area: "",
        description: "",
        features: [],
        images: []
      });
      setShowPropertyForm(false);
      setEditingProperty(null);
      loadUserProperties();
    } catch (error) {
      console.error('Error saving property:', error);
      toast.error('Error al guardar la propiedad');
    }
  };

  const handleDeleteProperty = (propertyId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta propiedad?')) return;
    
    try {
      const success = deleteLocalProperty(propertyId);
      if (!success) throw new Error('No se pudo eliminar la propiedad');
      
      toast.success('Propiedad eliminada correctamente');
      loadUserProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Error al eliminar la propiedad');
    }
  };

  const handleEditProperty = (property: LocalProperty) => {
    setEditingProperty(property);
    setPropertyForm({
      title: property.title,
      type: property.type,
      price: property.price.toString(),
      currency: property.currency,
      operation: property.operation,
      location: property.location,
      bedrooms: property.bedrooms.toString(),
      bathrooms: property.bathrooms.toString(),
      area: property.area.toString(),
      description: property.description || "",
      features: property.features || [],
      images: []
    });
    setShowPropertyForm(true);
  };

  const handleGoogleAuth = async () => {
    if (loading) return;
    
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(error);
    }
  };

  const handleSignOut = async () => {
    await clearUserHash(); // Limpiar hash del usuario
    await signOut();
  };

  // Si el usuario está cargando, mostrar loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600 mx-auto mb-4"></div>
          <p className="text-stone-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si el usuario está autenticado, mostrar perfil y propiedades
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
        <Header />
        
        <main className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-stone-800 mb-2">Mi Cuenta</h1>
              <p className="text-stone-600">Gestiona tu perfil y propiedades</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Mi Perfil</TabsTrigger>
                <TabsTrigger value="properties">Mis Propiedades</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Información Personal</CardTitle>
                    <CardDescription>Gestiona tu información de perfil</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <div className="w-24 h-24 bg-stone-200 rounded-full overflow-hidden">
                          {userProfile?.avatar_url ? (
                            <img 
                              src={userProfile.avatar_url} 
                              alt="Avatar" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="w-8 h-8 text-stone-500" />
                            </div>
                          )}
                        </div>
                        <label className="absolute -bottom-2 -right-2 bg-stone-700 text-white p-2 rounded-full cursor-pointer hover:bg-stone-600 transition-colors">
                          <Camera className="w-4 h-4" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleAvatarUpload(file);
                            }}
                          />
                        </label>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-stone-800">
                          {userProfile?.full_name || 'Usuario'}
                        </h3>
                        <p className="text-stone-600">{user.email}</p>
                        <p className="text-sm text-stone-500">
                          {userProfile?.user_type === 'empresa' ? 'Empresa' : 'Particular'}
                          {userProfile?.company_name && ` - ${userProfile.company_name}`}
                        </p>
                        {userProfile?.phone && (
                          <p className="text-sm text-stone-500">
                            📞 {userProfile.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Miembro desde:</strong> {new Date(user.created_at).toLocaleDateString()}
                      </div>
                      <div>
                        <strong>Email confirmado:</strong> {user.email_confirmed_at ? 'Sí' : 'No'}
                      </div>
                      <div>
                        <strong>Propiedades publicadas:</strong> {userProperties.length}
                      </div>
                    </div>

                    <Button
                      onClick={handleSignOut}
                      variant="outline"
                      className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Cerrar Sesión
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="properties" className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-stone-800">Mis Propiedades</h2>
                    <p className="text-stone-600">Gestiona tus propiedades publicadas</p>
                  </div>
                  <Button
                    onClick={() => {
                      setShowPropertyForm(true);
                      setEditingProperty(null);
                      setPropertyForm({
                        title: "",
                        type: "apartment",
                        price: "",
                        currency: "EUR",
                        operation: "rent",
                        location: "",
                        bedrooms: "1",
                        bathrooms: "1",
                        area: "",
                        description: "",
                        features: [],
        images: []
                      });
                    }}
                    className="bg-stone-700 hover:bg-stone-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Publicar Propiedad
                  </Button>
                </div>

                {showPropertyForm && (
                  <PropertyForm
                    propertyForm={propertyForm}
                    editingProperty={editingProperty}
                    isUploading={isUploading}
                    onSubmit={handlePropertySubmit}
                    onCancel={() => {
                      setShowPropertyForm(false);
                      setEditingProperty(null);
                    }}
                    onFormChange={(field, value) => {
                      setPropertyForm(prev => ({
                        ...prev,
                        [field]: value
                      }));
                    }}
                  />
                )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-stone-700">
                              Título de la propiedad *
                            </label>
                            <Input
                              name="title"
                              value={propertyForm.title}
                              onChange={handlePropertyFormChange}
                              placeholder="Ej: Apartamento moderno en el centro"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-stone-700">
                              Ubicación *
                            </label>
                            <Input
                              name="location"
                              value={propertyForm.location}
                              onChange={handlePropertyFormChange}
                              placeholder="Ej: Madrid Centro"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-stone-700">
                              Tipo de propiedad
                            </label>
                            <Select value={propertyForm.type} onValueChange={(value) => handlePropertySelectChange('type', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="apartment">Apartamento</SelectItem>
                                <SelectItem value="house">Casa</SelectItem>
                                <SelectItem value="loft">Loft</SelectItem>
                                <SelectItem value="studio">Estudio</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-stone-700">
                              Operación
                            </label>
                            <Select value={propertyForm.operation} onValueChange={(value) => handlePropertySelectChange('operation', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="rent">Alquiler</SelectItem>
                                <SelectItem value="sale">Venta</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-stone-700">
                              Precio *
                            </label>
                            <div className="flex">
                              <Input
                                name="price"
                                type="number"
                                value={propertyForm.price}
                                onChange={handlePropertyFormChange}
                                placeholder="1200"
                                className="rounded-r-none"
                                required
                              />
                              <Select value={propertyForm.currency} onValueChange={(value) => handlePropertySelectChange('currency', value)}>
                                <SelectTrigger className="w-20 rounded-l-none">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="EUR">€</SelectItem>
                                  <SelectItem value="USD">$</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-stone-700">
                              Área (m²) *
                            </label>
                            <Input
                              name="area"
                              type="number"
                              value={propertyForm.area}
                              onChange={handlePropertyFormChange}
                              placeholder="85"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-stone-700">
                              Habitaciones
                            </label>
                            <Select value={propertyForm.bedrooms} onValueChange={(value) => handlePropertySelectChange('bedrooms', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[1,2,3,4,5,6].map(num => (
                                  <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-stone-700">
                              Baños
                            </label>
                            <Select value={propertyForm.bathrooms} onValueChange={(value) => handlePropertySelectChange('bathrooms', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[1,2,3,4,5,6].map(num => (
                                  <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-stone-700">
                            Descripción
                          </label>
                          <Textarea
                            name="description"
                            value={propertyForm.description}
                            onChange={handlePropertyFormChange}
                            placeholder="Describe las características principales de tu propiedad..."
                            rows={4}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-stone-700">
                            Características
                          </label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {propertyForm.features.map((feature, index) => (
                              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                {feature}
                                <button
                                  type="button"
                                  onClick={() => handleFeatureRemove(feature)}
                                  className="ml-1 text-red-500 hover:text-red-700"
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Ej: Aire acondicionado"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const target = e.target as HTMLInputElement;
                                  handleFeatureAdd(target.value);
                                  target.value = '';
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={(e) => {
                                const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                                handleFeatureAdd(input.value);
                                input.value = '';
                              }}
                            >
                              Añadir
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-stone-700">
                            Imagen principal
                          </label>
                          <div className="border-2 border-dashed border-stone-300 rounded-lg p-6 text-center">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setPropertyForm(prev => ({ ...prev, images: file ? [file] : [] }));
                                }
                              }}
                              className="hidden"
                              id="property-image"
                            />
                            <label htmlFor="property-image" className="cursor-pointer">
                              <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                              <p className="text-stone-600">
                                {propertyForm.images.length > 0 ? `${propertyForm.images.length} imagen(es)` : 'Selecciona imágenes'}
                              </p>
                            </label>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowPropertyForm(false);
                              setEditingProperty(null);
                            }}
                            className="flex-1"
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="submit"
                            disabled={isUploading}
                            className="flex-1 bg-stone-700 hover:bg-stone-600"
                          >
                            {isUploading ? 'Subiendo...' : editingProperty ? 'Actualizar' : 'Publicar'}
                          </Button>

                {/* Lista de propiedades */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userProperties.map((property) => (
                    <Card key={property.id} className="overflow-hidden shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                      <div className="aspect-video bg-stone-200 relative">
        {property.images && property.images.length > 0 ? (
          <img 
            src={property.images[0]} 
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Home className="w-12 h-12 text-stone-400" />
                          </div>
                        )}
                        <div className="absolute top-2 left-2 flex gap-1">
                          <Badge className="bg-stone-700 text-white">
                            {property.operation === 'rent' ? 'Alquiler' : 'Venta'}
                          </Badge>
                          <Badge variant="secondary">
                            {property.type === 'apartment' ? 'Apartamento' :
                             property.type === 'house' ? 'Casa' :
                             property.type === 'loft' ? 'Loft' : 'Estudio'}
                          </Badge>
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white/80 hover:bg-white"
                            onClick={() => handleEditProperty(property)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white/80 hover:bg-white text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteProperty(property.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg text-stone-800 mb-2 line-clamp-2">
                          {property.title}
                        </h3>
                        
                        <p className="text-stone-600 text-sm mb-2">{property.location}</p>
                        
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-2xl font-bold text-stone-700">
                            {property.price.toLocaleString()} {property.currency}
                            {property.operation === 'rent' && <span className="text-sm font-normal">/mes</span>}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-stone-600">
                          <div className="flex items-center gap-1">
                            <Bed className="w-4 h-4" />
                            {property.bedrooms}
                          </div>
                          <div className="flex items-center gap-1">
                            <Bath className="w-4 h-4" />
                            {property.bathrooms}
                          </div>
                          <div className="flex items-center gap-1">
                            <Square className="w-4 h-4" />
                            {property.area} m²
                          </div>
                        </div>

                        <div className="mt-3 text-xs text-stone-500">
                          Ref: {property.reference}
                        </div>

                        <div className="mt-3">
                          <a
                            href={`https://wa.me/${userProfile?.phone?.replace(/\s+/g, '').replace(/^\+/, '')}?text=Hola, estoy interesado en la propiedad "${property.title}" (Ref: ${property.reference})`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            💬 Chat WhatsApp
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {userProperties.length === 0 && !showPropertyForm && (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Home className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-stone-700 mb-2">
                        No tienes propiedades publicadas
                      </h3>
                      <p className="text-stone-500 mb-6">
                        Comienza publicando tu primera propiedad
                      </p>
                      <Button
                        onClick={() => setShowPropertyForm(true)}
                        className="bg-stone-700 hover:bg-stone-600"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Publicar Primera Propiedad
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      <Header />
      
      <main className="container mx-auto px-6 py-20">
        <div className="max-w-md mx-auto">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-bold text-stone-800">
                {isLogin ? t('account.login') || 'Iniciar Sesión' : t('account.register') || 'Crear Cuenta'}
              </CardTitle>
              <CardDescription className="text-stone-600">
                {isLogin 
                  ? t('account.loginDescription') || 'Accede a tu cuenta para continuar'
                  : t('account.registerDescription') || 'Crea tu cuenta para comenzar'
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Google Auth Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-stone-200 hover:bg-stone-50 text-stone-700"
                onClick={handleGoogleAuth}
              >
                <Chrome className="w-5 h-5 mr-3" />
                {isLogin 
                  ? t('account.continueWithGoogle') || 'Continuar con Google'
                  : t('account.registerWithGoogle') || 'Registrarse con Google'
                }
              </Button>

              <div className="relative">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-white px-4 text-sm text-stone-500">
                    {t('account.or') || 'o'}
                  </span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-stone-700">
                      {t('account.fullName') || 'Nombre completo'}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder={t('account.enterName') || 'Ingresa tu nombre'}
                        value={formData.name}
                        onChange={handleInputChange}
                        className="pl-10 h-12 border-stone-200 focus:border-stone-400"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-stone-700">
                    {t('account.email') || 'Correo electrónico'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder={t('account.enterEmail') || 'Ingresa tu email'}
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 h-12 border-stone-200 focus:border-stone-400"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-stone-700">
                    {t('account.password') || 'Contraseña'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t('account.enterPassword') || 'Ingresa tu contraseña'}
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10 h-12 border-stone-200 focus:border-stone-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-stone-700">
                      {t('account.confirmPassword') || 'Confirmar contraseña'}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder={t('account.confirmPasswordPlaceholder') || 'Confirma tu contraseña'}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="pl-10 h-12 border-stone-200 focus:border-stone-400"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                {/* Cuestionario para registro */}
                {!isLogin && (
                  <div className="space-y-4 p-4 bg-stone-50 rounded-lg border">
                    <h3 className="text-sm font-semibold text-stone-700 mb-3">
                      Información adicional
                    </h3>
                    
                    {/* Tipo de usuario */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-stone-700">
                        ¿Eres particular o empresa?
                      </label>
                      <Select value={formData.userType} onValueChange={(value) => handleSelectChange('userType', value)}>
                        <SelectTrigger className="h-12 border-stone-200 focus:border-stone-400">
                          <SelectValue placeholder="Selecciona una opción" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="particular">Particular</SelectItem>
                          <SelectItem value="empresa">Empresa/Inmobiliaria</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Nombre de empresa (solo si es empresa) */}
                    {formData.userType === 'empresa' && (
                      <div className="space-y-2">
                        <label htmlFor="companyName" className="text-sm font-medium text-stone-700">
                          Nombre de la empresa
                        </label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
                          <Input
                            id="companyName"
                            name="companyName"
                            type="text"
                            placeholder="Ej: Inmobiliaria ABC"
                            value={formData.companyName}
                            onChange={handleInputChange}
                            className="pl-10 h-12 border-stone-200 focus:border-stone-400"
                            required={formData.userType === 'empresa'}
                          />
                        </div>
                      </div>
                    )}

                    {/* Teléfono */}
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium text-stone-700">
                        Teléfono de contacto
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="Ej: +34 600 123 456"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="pl-10 h-12 border-stone-200 focus:border-stone-400"
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  </div>
                 )}

                {/* Política de privacidad y hCAPTCHA para registro */}
                {!isLogin && (
                  <div className="space-y-4">
                    {/* Política de privacidad */}
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="privacy-policy"
                        checked={acceptPrivacy}
                        onCheckedChange={(checked) => setAcceptPrivacy(checked === true)}
                        className="mt-0.5"
                      />
                      <label htmlFor="privacy-policy" className="text-sm text-stone-600 leading-5">
                        Acepto el tratamiento de mis datos conforme a la{' '}
                        <Link 
                          to="/contact" 
                          className="text-stone-700 hover:text-stone-900 underline"
                          target="_blank"
                        >
                          política de privacidad
                        </Link>
                      </label>
                    </div>

                    {/* hCAPTCHA */}
                    <div className="flex justify-center">
                      <HCaptcha
                        sitekey="10000000-ffff-ffff-ffff-000000000001"
                        onVerify={(token) => setCaptchaToken(token)}
                        onExpire={() => setCaptchaToken(null)}
                        onError={() => setCaptchaToken(null)}
                      />
                    </div>
                  </div>
                )}

                {isLogin && (
                  <div className="text-center">
                    <Link 
                      to="/reset-password" 
                      className="text-sm text-stone-600 hover:text-stone-700 underline"
                    >
                      {t('account.forgotPassword') || '¿Olvidaste tu contraseña?'}
                    </Link>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-stone-700 hover:bg-stone-600 text-white font-semibold"
                  disabled={loading}
                >
                  {loading 
                    ? (isLogin ? 'Iniciando sesión...' : 'Creando cuenta...')
                    : (isLogin 
                      ? t('account.login') || 'Iniciar Sesión'
                      : t('account.createAccount') || 'Crear Cuenta'
                    )
                  }
                </Button>
              </form>

              <div className="text-center">
                <span className="text-sm text-stone-600">
                  {isLogin 
                    ? t('account.noAccount') || '¿No tienes cuenta?'
                    : t('account.hasAccount') || '¿Ya tienes cuenta?'
                  }
                </span>
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-1 text-sm font-semibold text-stone-700 hover:text-stone-900 underline"
                >
                  {isLogin 
                    ? t('account.register') || 'Regístrate'
                    : t('account.login') || 'Inicia sesión'
                  }
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Account;