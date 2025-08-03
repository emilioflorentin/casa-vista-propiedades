import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
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
  Trash2
} from 'lucide-react';
import { getUserHash } from '../utils/userHash';
import { getUserProperties, deleteLocalProperty, saveLocalProperty, updateLocalProperty } from '../utils/localProperties';
import type { LocalProperty } from '../utils/localProperties';
import { supabase } from '@/integrations/supabase/client';
import { generatePropertyReference } from '../utils/localProperties';

const Account = () => {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<LocalProperty | null>(null);
  const [userProperties, setUserProperties] = useState<LocalProperty[]>([]);
  const [userHash, setUserHash] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile form state
  const [profileData, setProfileData] = useState({
    full_name: '',
    phone: '',
    description: ''
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
    images: [] as File[]
  });

  // Load user properties on mount and when user changes
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        const hash = await getUserHash();
        if (hash) {
          setUserHash(hash);
          setUserProperties(getUserProperties(hash));
        }
        
        // Load user profile data
        const { data: profiles } = await supabase
          .from('profiles')
          .select('avatar_url, full_name, phone, description')
          .eq('id', user.id);
        
        if (profiles && profiles.length > 0) {
          const profile = profiles[0];
          if (profile.avatar_url) {
            setAvatarUrl(profile.avatar_url);
          }
          setProfileData({
            full_name: profile.full_name || user.user_metadata?.full_name || '',
            phone: profile.phone || user.user_metadata?.phone || '',
            description: profile.description || ''
          });
        } else {
          // Set initial data from user metadata if no profile exists
          setProfileData({
            full_name: user.user_metadata?.full_name || '',
            phone: user.user_metadata?.phone || '',
            description: ''
          });
        }
      }
    };
    loadUserData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleDeleteProperty = (propertyId: string) => {
    if (userHash) {
      deleteLocalProperty(propertyId);
      setUserProperties(getUserProperties(userHash));
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
      description: property.description || '',
      features: property.features || [],
      images: []
    });
    setShowPropertyForm(true);
  };

  const handleFormChange = (field: string, value: any) => {
    setPropertyForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePropertySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userHash) return;

    setIsUploading(true);
    
    try {
      const propertyData = {
        userHash,
        reference: editingProperty?.reference || generatePropertyReference(),
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
        features: propertyForm.features
      };
      
      if (editingProperty) {
        await updateLocalProperty(editingProperty.id, propertyData, propertyForm.images);
      } else {
        await saveLocalProperty(propertyData, propertyForm.images);
      }
      
      setUserProperties(getUserProperties(userHash));
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
        images: []
      });
    } catch (error) {
      console.error('Error saving property:', error);
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
          avatar_url: avatarUrl,
          user_type: user.user_metadata?.user_type || 'particular',
          company_name: user.user_metadata?.company_name || ''
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Error updating profile:', error);
        return;
      }

      console.log('Profile saved successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Mi Perfil</TabsTrigger>
              <TabsTrigger value="properties">Mis Propiedades</TabsTrigger>
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
                  <p className="text-stone-600">Gestiona tus propiedades publicadas</p>
                </div>
                <Button
                  onClick={() => setShowPropertyForm(true)}
                  className="bg-stone-700 hover:bg-stone-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Propiedad
                </Button>
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

              {userProperties.length === 0 && !showPropertyForm && (
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
};

export default Account;