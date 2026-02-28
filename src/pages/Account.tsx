import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { PropertyForm } from '../components/PropertyForm';
import { 
  User, 
  MapPin, 
  Camera, 
  LogOut, 
  Plus, 
  Home, 
  Edit2, 
  Trash2,
  Check,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Property type for Supabase data
interface PropertyData {
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
  image: string | null;
  features: string[] | null;
  description: string | null;
  is_rented: boolean;
  user_id: string;
  energy_consumption_rating: string | null;
  energy_consumption_value: number | null;
  energy_emissions_rating: string | null;
  energy_emissions_value: number | null;
}

const Account = () => {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect multiservicios to their dedicated panel
  useEffect(() => {
    if (user?.email === 'multiservicios@nazarihomes.com') {
      navigate('/service-board', { replace: true });
    }
  }, [user, navigate]);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<PropertyData | null>(null);
  const [userProperties, setUserProperties] = useState<PropertyData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prefetch heavy editor library (Fabric) while the user is on Account
  const prefetchFabricRef = useRef(false);
  const prefetchFabric = () => {
    if (prefetchFabricRef.current) return;
    prefetchFabricRef.current = true;
    import('fabric').then(() => console.info('Prefetch: Fabric loaded'));
  };
  useEffect(() => {
    // Warm up during idle time for instant editor open
    // @ts-ignore
    const ric = (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 1000));
    ric(prefetchFabric);
  }, []);
  // Profile form state
  const [profileData, setProfileData] = useState({
    full_name: '',
    phone: '',
    description: '',
    location: '',
    user_type: ''
  });

  const [propertyForm, setPropertyForm] = useState({
    title: '',
    type: 'apartment' as "apartment" | "house" | "loft" | "studio",
    price: '',
    currency: 'EUR',
    operation: 'rent' as "rent" | "sale",
    location: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    description: '',
    features: [] as string[],
    images: [] as File[],
    email: '',
    phone: '',
    useRegisteredPhone: false,
    energyConsumptionRating: '',
    energyConsumptionValue: '',
    energyEmissionsRating: '',
    energyEmissionsValue: ''
  });

  // Load user properties from Supabase
  const loadUserProperties = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error loading properties from Supabase:', error);
        return;
      }
      
      if (data) {
        const formattedProperties: PropertyData[] = data.map(p => ({
          id: p.id,
          reference: p.reference,
          title: p.title,
          type: p.type as "apartment" | "house" | "loft" | "studio",
          price: Number(p.price),
          currency: p.currency,
          operation: p.operation as "rent" | "sale",
          location: p.location,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          area: Number(p.area),
          image: p.image,
          features: p.features,
          description: p.description,
          is_rented: p.is_rented,
          user_id: p.user_id,
          energy_consumption_rating: p.energy_consumption_rating,
          energy_consumption_value: p.energy_consumption_value,
          energy_emissions_rating: p.energy_emissions_rating,
          energy_emissions_value: p.energy_emissions_value
        }));
        console.log('ACCOUNT: properties loaded from Supabase:', formattedProperties.length);
        setUserProperties(formattedProperties);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  };

  // Load user data on mount and when user changes
  useEffect(() => {
    const loadUserData = async () => {
      console.log('ACCOUNT: loadUserData called, user:', user?.id);
      if (user) {
        // Load properties from Supabase
        await loadUserProperties();

        // Initialize email in property form
        setPropertyForm(prev => ({
          ...prev,
          email: user.email || ''
        }));
        
        // Load user profile data
        const { data: profiles } = await supabase
          .from('profiles')
          .select('avatar_url, full_name, phone, description, location, user_type')
          .eq('id', user.id);
        
        if (profiles && profiles.length > 0) {
          const profile = profiles[0];
          if (profile.avatar_url) {
            setAvatarUrl(profile.avatar_url);
          }
          setProfileData({
            full_name: profile.full_name || user.user_metadata?.full_name || '',
            phone: profile.phone || user.user_metadata?.phone || '',
            description: profile.description || '',
            location: profile.location || '',
            user_type: profile.user_type || user.user_metadata?.user_type || 'particular'
          });
        } else {
          // Set initial data from user metadata if no profile exists
          setProfileData({
            full_name: user.user_metadata?.full_name || '',
            phone: user.user_metadata?.phone || '',
            description: '',
            location: '',
            user_type: user.user_metadata?.user_type || 'particular'
          });
        }
      }
    };
    loadUserData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      await loadUserProperties();
      toast({
        title: "Éxito",
        description: "Propiedad eliminada correctamente",
      });
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        title: "Error",
        description: "Error al eliminar la propiedad",
        variant: "destructive"
      });
    }
  };

  const handleMarkAsRented = async (propertyId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('properties')
        .update({ is_rented: true })
        .eq('id', propertyId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      await loadUserProperties();
      toast({
        title: "Éxito",
        description: "Propiedad marcada como alquilada",
      });
    } catch (error) {
      console.error('Error updating property:', error);
      toast({
        title: "Error",
        description: "Error al actualizar la propiedad",
        variant: "destructive"
      });
    }
  };

  const handleMarkAsAvailable = async (propertyId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('properties')
        .update({ is_rented: false })
        .eq('id', propertyId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      await loadUserProperties();
      toast({
        title: "Éxito",
        description: "Propiedad marcada como disponible",
      });
    } catch (error) {
      console.error('Error updating property:', error);
      toast({
        title: "Error",
        description: "Error al actualizar la propiedad",
        variant: "destructive"
      });
    }
  };

  const handleEditProperty = (property: PropertyData) => {
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
      description: property.description || '',
      features: property.features || [],
      images: [],
      email: user?.email || '',
      phone: '',
      useRegisteredPhone: false,
      energyConsumptionRating: property.energy_consumption_rating || '',
      energyConsumptionValue: property.energy_consumption_value?.toString() || '',
      energyEmissionsRating: property.energy_emissions_rating || '',
      energyEmissionsValue: property.energy_emissions_value?.toString() || ''
    });
    setShowPropertyForm(true);
  };

  const handleFormChange = (field: string, value: any) => {
    setPropertyForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleShowNewPropertyForm = () => {
    // Verificar límite para usuarios particulares
    if (profileData.user_type === 'particular' && userProperties.length >= 3) {
      toast({
        title: "Límite alcanzado",
        description: "Los usuarios particulares pueden publicar máximo 3 propiedades. Para publicaciones ilimitadas, cambia a cuenta profesional.",
        variant: "destructive"
      });
      return;
    }

    setEditingProperty(null);
    // Reset form with user email
    setPropertyForm({
      title: '',
      type: 'apartment',
      price: '',
      currency: 'EUR',
      operation: 'rent',
      location: '',
      bedrooms: '',
      bathrooms: '',
      area: '',
      description: '',
      features: [],
      images: [],
      email: user?.email || '',
      phone: '',
      useRegisteredPhone: false,
      energyConsumptionRating: '',
      energyConsumptionValue: '',
      energyEmissionsRating: '',
      energyEmissionsValue: ''
    });
    setShowPropertyForm(true);
  };

  const handlePropertySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUploading(true);
    
    try {
      // Validate energy certificate fields
      if (!propertyForm.energyConsumptionRating || !propertyForm.energyConsumptionValue ||
          !propertyForm.energyEmissionsRating || !propertyForm.energyEmissionsValue) {
        toast({
          title: "Error",
          description: "El certificado energético es obligatorio. Por favor, completa todos los campos.",
          variant: "destructive"
        });
        setIsUploading(false);
        return;
      }

      // Compress and upload images to Supabase storage if provided
      let imageUrl: string | null = editingProperty?.image || null;
      
      if (propertyForm.images && propertyForm.images.length > 0) {
        const uploadedUrls: string[] = [];
        
        const compressImage = (file: File, maxWidth = 1920, quality = 0.82): Promise<Blob> => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const ratio = Math.min(maxWidth / img.width, 1);
              canvas.width = img.width * ratio;
              canvas.height = img.height * ratio;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
              canvas.toBlob(
                (blob) => blob ? resolve(blob) : reject(new Error('Compression failed')),
                'image/jpeg',
                quality
              );
              URL.revokeObjectURL(img.src);
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
          });
        };

        for (const file of propertyForm.images) {
          try {
            const compressed = file.type.startsWith('image/') 
              ? await compressImage(file) 
              : file;
            const fileName = `${user.id}/${Date.now()}_${crypto.randomUUID()}.jpg`;
            
            const { error: uploadError } = await supabase.storage
              .from('property-images')
              .upload(fileName, compressed, { 
                contentType: 'image/jpeg',
                upsert: true 
              });
            
            if (uploadError) {
              console.error('Error uploading image:', uploadError);
              continue;
            }
            
            const { data: urlData } = supabase.storage
              .from('property-images')
              .getPublicUrl(fileName);
            
            uploadedUrls.push(urlData.publicUrl);
          } catch (err) {
            console.error('Error compressing image:', err);
            continue;
          }
        }

        const failedCount = propertyForm.images.length - uploadedUrls.length;
        
        if (uploadedUrls.length > 0) {
          imageUrl = uploadedUrls.join(',');
          if (failedCount > 0) {
            toast({
              title: "Aviso",
              description: `Se subieron ${uploadedUrls.length} de ${propertyForm.images.length} imágenes. ${failedCount} fallaron (posiblemente por tamaño o formato).`,
              variant: "destructive"
            });
          }
        } else {
          throw new Error('Error al subir las imágenes');
        }
      }

      const propertyData = {
        user_id: user.id,
        title: propertyForm.title,
        type: propertyForm.type,
        price: parseInt(propertyForm.price),
        currency: propertyForm.currency,
        operation: propertyForm.operation,
        location: propertyForm.location,
        bedrooms: parseInt(propertyForm.bedrooms),
        bathrooms: parseInt(propertyForm.bathrooms),
        area: parseInt(propertyForm.area),
        description: propertyForm.description,
        features: propertyForm.features,
        image: imageUrl,
        contact_phone: propertyForm.phone || null,
        energy_consumption_rating: propertyForm.energyConsumptionRating,
        energy_consumption_value: parseInt(propertyForm.energyConsumptionValue),
        energy_emissions_rating: propertyForm.energyEmissionsRating,
        energy_emissions_value: parseInt(propertyForm.energyEmissionsValue)
      };
      
      if (editingProperty) {
        const { error } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', editingProperty.id)
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        toast({
          title: "Éxito",
          description: "Propiedad actualizada correctamente",
        });
      } else {
        const { error } = await supabase
          .from('properties')
          .insert({
            ...propertyData,
            reference: '' // Will be auto-generated by database trigger
          });
        
        if (error) throw error;
        
        toast({
          title: "Éxito",
          description: "Propiedad publicada correctamente",
        });
      }
      
      await loadUserProperties();
      setShowPropertyForm(false);
      setEditingProperty(null);
      
      // Reset form
      setPropertyForm({
        title: '',
        type: 'apartment',
        price: '',
        currency: 'EUR',
        operation: 'rent',
        location: '',
        bedrooms: '',
        bathrooms: '',
        area: '',
        description: '',
        features: [],
        images: [],
        email: user?.email || '',
        phone: '',
        useRegisteredPhone: false,
        energyConsumptionRating: '',
        energyConsumptionValue: '',
        energyEmissionsRating: '',
        energyEmissionsValue: ''
      });
    } catch (error: any) {
      console.error('Error saving property:', error);
      toast({
        title: "Error",
        description: "Error al guardar la propiedad: " + (error.message || 'Unknown error'),
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSavingProfile(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profileData.full_name,
          phone: profileData.phone,
          description: profileData.description,
          location: profileData.location,
          avatar_url: avatarUrl,
          user_type: user.user_metadata?.user_type || 'particular',
          company_name: user.user_metadata?.company_name || '',
          email: user.email
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Error",
          description: "No se pudieron guardar los cambios del perfil",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Éxito", 
        description: "Perfil actualizado correctamente"
      });
      console.log('Profile saved successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Error al guardar el perfil",
        variant: "destructive"
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleProfileDataChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    
    try {
      // Upload file to Supabase storage with user ID as folder
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-avatars')
        .upload(fileName, file, {
          upsert: true
        });

      if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        return;
      }

      // Get the public URL
      const { data } = supabase.storage
        .from('profile-avatars')
        .getPublicUrl(fileName);

      const publicUrl = data.publicUrl;

      // Update user profile in database - use upsert to handle both insert and update
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: publicUrl,
          full_name: user.user_metadata?.full_name || '',
          user_type: user.user_metadata?.user_type || 'particular',
          company_name: user.user_metadata?.company_name || '',
          phone: user.user_metadata?.phone || ''
        }, {
          onConflict: 'id'
        });

      if (updateError) {
        console.error('Error updating profile:', updateError);
        return;
      }

      setAvatarUrl(publicUrl);
    } catch (error) {
      console.error('Error handling avatar upload:', error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-stone-800">
                  {t('account.accessAccount')}
                </CardTitle>
                <p className="text-stone-600 mt-2">
                  {t('account.loginRequired')}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Link 
                    to="/auth"
                    className="w-full bg-stone-700 hover:bg-stone-600 text-white py-3 px-4 rounded-lg font-medium transition-colors block text-center"
                  >
                    {t('account.login')}
                  </Link>
                  
                  <div className="text-center">
                    <span className="text-stone-600 text-sm">
                      {t('account.noAccount')}
                    </span>
                  </div>
                  
                  <Link 
                    to="/auth"
                    className="w-full border border-stone-300 hover:bg-stone-50 text-stone-700 py-3 px-4 rounded-lg font-medium transition-colors block text-center"
                  >
                    {t('account.register')}
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-stone-800 mb-2">Mi Cuenta</h1>
            <p className="text-stone-600">Gestiona tu perfil y propiedades</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Mi Perfil</TabsTrigger>
              <TabsTrigger value="properties">Mis Propiedades</TabsTrigger>
              <TabsTrigger value="rented">Alquiladas</TabsTrigger>
              <TabsTrigger value="tenants">Inquilinos</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Información Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback className="bg-stone-700 text-white text-xl">
                        {user?.email?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={triggerFileInput}
                        disabled={uploadingAvatar}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        {uploadingAvatar ? 'Subiendo...' : 'Cambiar foto'}
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre completo</Label>
                      <Input 
                        id="name"
                        value={profileData.full_name}
                        onChange={(e) => handleProfileDataChange('full_name', e.target.value)}
                        placeholder="Tu nombre completo"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo electrónico</Label>
                      <Input 
                        id="email"
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-stone-50"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input 
                        id="phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => handleProfileDataChange('phone', e.target.value)}
                        placeholder="+34 600 000 000"
                      />
                    </div>
                    
                     <div className="space-y-2">
                       <Label htmlFor="location">Ubicación</Label>
                       <Input 
                         id="location"
                         value={profileData.location}
                         onChange={(e) => handleProfileDataChange('location', e.target.value)}
                         placeholder="Tu ciudad"
                       />
                     </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Biografía</Label>
                    <Textarea 
                      id="bio"
                      value={profileData.description}
                      onChange={(e) => handleProfileDataChange('description', e.target.value)}
                      placeholder="Cuéntanos sobre ti..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      className="bg-stone-700 hover:bg-stone-600"
                    >
                      {savingProfile ? 'Guardando...' : 'Guardar cambios'}
                    </Button>
                    <Button variant="outline">
                      Cancelar
                    </Button>
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
                  <div className="flex items-center gap-2">
                    <p className="text-stone-600">Gestiona tus propiedades publicadas</p>
                    {profileData.user_type === 'particular' && (
                      <Badge variant="outline" className="text-xs">
                        {userProperties.length}/3 propiedades
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <Button
                    onClick={handleShowNewPropertyForm}
                    className="bg-stone-700 hover:bg-stone-600"
                    disabled={profileData.user_type === 'particular' && userProperties.length >= 3}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Propiedad
                  </Button>
                  {profileData.user_type === 'particular' && userProperties.length >= 3 && (
                    <p className="text-xs text-stone-500 mt-1">
                      Límite de propiedades alcanzado
                    </p>
                  )}
                </div>
              </div>

              {showPropertyForm && (
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>
                      {editingProperty ? 'Editar Propiedad' : 'Nueva Propiedad'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PropertyForm
                      propertyForm={propertyForm}
                      editingProperty={editingProperty}
                      isUploading={isUploading}
                      onSubmit={handlePropertySubmit}
                      onCancel={() => {
                        setShowPropertyForm(false);
                        setEditingProperty(null);
                      }}
                      onFormChange={handleFormChange}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Lista de propiedades disponibles */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(() => {
                  const availableProperties = userProperties.filter(property => !property.is_rented);
                  console.log('ACCOUNT: Rendering available properties:', availableProperties.length, 'out of total:', userProperties.length);
                  console.log('ACCOUNT: All userProperties:', userProperties);
                  console.log('ACCOUNT: Available properties:', availableProperties);
                  return availableProperties;
                })().map((property) => (
                  <Card key={property.id} className="overflow-hidden shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <div className="aspect-video bg-stone-200 relative">
                      {property.image ? (
                        <img 
                          src={property.image} 
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
                            property.type === 'studio' ? 'Estudio' : 'Loft'}
                         </Badge>
                      </div>
                       <div className="absolute top-2 right-2 flex gap-1">
                         <Button
                           size="sm"
                           variant="outline"
                           className="bg-white/80 backdrop-blur-sm"
                           onClick={() => handleEditProperty(property)}
                         >
                           <Edit2 className="w-3 h-3" />
                         </Button>
                         <Button
                           size="sm"
                           variant="outline"
                           className="bg-white/80 backdrop-blur-sm text-green-600 hover:bg-green-50"
                           onClick={() => handleMarkAsRented(property.id)}
                         >
                           <Check className="w-3 h-3" />
                         </Button>
                         <Button
                           size="sm"
                           variant="outline"
                           className="bg-white/80 backdrop-blur-sm text-red-600 hover:bg-red-50"
                           onClick={() => handleDeleteProperty(property.id)}
                         >
                           <Trash2 className="w-3 h-3" />
                         </Button>
                       </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 text-stone-800">{property.title}</h3>
                      <div className="flex items-center text-stone-600 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">{property.location}</span>
                      </div>
                      <div className="text-2xl font-bold text-stone-700 mb-3">
                        €{property.price.toLocaleString()}
                        {property.operation === 'rent' && <span className="text-sm font-normal">/mes</span>}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {property.features.slice(0, 3).map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {property.features.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{property.features.length - 3}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {userProperties.filter(property => !property.is_rented).length === 0 && !showPropertyForm && (
                <Card className="text-center p-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent>
                    <Home className="w-16 h-16 text-stone-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-stone-800 mb-2">
                      No tienes propiedades aún
                    </h3>
                    <p className="text-stone-600 mb-6">
                      ¡Publica tu primera propiedad y comienza a recibir consultas!
                    </p>
                    <Button
                      onClick={handleShowNewPropertyForm}
                      className="bg-stone-700 hover:bg-stone-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Publicar Primera Propiedad
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="rented" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-stone-800">Mis Propiedades Alquiladas</h2>
                  <p className="text-stone-600">Propiedades que ya están alquiladas</p>
                </div>
              </div>

              {/* Lista de propiedades alquiladas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userProperties.filter(property => property.is_rented).map((property) => (
                  <Card key={property.id} className="overflow-hidden shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <div className="aspect-video bg-stone-200 relative">
                      {property.image ? (
                        <img 
                          src={property.image} 
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="w-12 h-12 text-stone-400" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2 flex gap-1">
                        <Badge className="bg-green-600 text-white">
                          Alquilada
                        </Badge>
                        <Badge className="bg-stone-700 text-white">
                          {property.operation === 'rent' ? 'Alquiler' : 'Venta'}
                        </Badge>
                         <Badge variant="secondary">
                           {property.type === 'apartment' ? 'Apartamento' :
                            property.type === 'house' ? 'Casa' :
                            property.type === 'studio' ? 'Estudio' : 'Loft'}
                         </Badge>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white/80 backdrop-blur-sm text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteProperty(property.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <h3 className="font-semibold text-lg text-stone-800">{property.title}</h3>
                      <div className="flex items-center text-stone-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">{property.location}</span>
                      </div>
                      <div className="text-2xl font-bold text-stone-700">
                        €{property.price.toLocaleString()}
                        {property.operation === 'rent' && <span className="text-sm font-normal">/mes</span>}
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {property.features.slice(0, 3).map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {property.features.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{property.features.length - 3}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 pt-2 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-orange-600 hover:bg-orange-50 border-orange-200"
                          onMouseEnter={prefetchFabric}
                          onClick={() => window.location.href = `/manage-rental/${property.id}`}
                        >
                          Gestionar Alquiler
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-blue-600 hover:bg-blue-50 border-blue-200"
                          onClick={() => handleMarkAsAvailable(property.id)}
                        >
                          Marcar como Disponible
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {userProperties.filter(property => property.is_rented).length === 0 && (
                <Card className="text-center p-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent>
                    <Home className="w-16 h-16 text-stone-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-stone-800 mb-2">
                      No tienes propiedades alquiladas
                    </h3>
                    <p className="text-stone-600">
                      Cuando marques una propiedad como alquilada, aparecerá aquí.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="tenants" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-stone-800">Gestión de Inquilinos</h2>
                  <p className="text-stone-600">Genera códigos de acceso y gestiona incidencias de tus inquilinos</p>
                </div>
              </div>

              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center space-y-4">
                  <Shield className="w-16 h-16 text-stone-400 mx-auto" />
                  <h3 className="text-xl font-semibold text-stone-800">
                    Panel de Incidencias
                  </h3>
                  <p className="text-stone-600 max-w-md mx-auto">
                    Desde aquí puedes generar códigos UUID para tus inquilinos, ver las incidencias que reportan y gestionar su estado.
                  </p>
                  <Link to="/owner-incidents">
                    <Button className="bg-stone-700 hover:bg-stone-600">
                      <Shield className="w-4 h-4 mr-2" />
                      Ir al panel de incidencias
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Account;