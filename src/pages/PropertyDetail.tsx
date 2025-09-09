import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Heart, Share2, MapPin, Bed, Bath, Square, Car, Wifi, Tv, Wind, Phone, Mail, Calendar, Send, Upload, FileText, CreditCard, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
// Removed static properties import - only using user properties now
import MapComponent from "@/components/MapComponent";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocalProperties, updateLocalProperty } from "@/utils/localProperties";
import { supabase } from "@/integrations/supabase/client";
import { getUserHash } from "@/utils/userHash";

// Removed static agent data - only using property owners now

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [property, setProperty] = useState<any>(null);
  const [propertyAgent, setPropertyAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [reservationData, setReservationData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dni: "",
    signedContract: null as File | null
  });

  useEffect(() => {
    const loadPropertyAndAgent = async () => {
      let foundProperty = null;
      let agentInfo = null;

      // Check if ID is a UUID format (database property) or timestamp (local property)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

      if (isUUID) {
        // Try to find in database properties
        try {
          const { data: dbProperty, error } = await supabase
            .from('properties')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (!error && dbProperty) {
          foundProperty = {
            id: parseInt(dbProperty.id.slice(-8), 16),
            reference: dbProperty.reference,
            title: dbProperty.title,
            type: dbProperty.type,
            price: dbProperty.price,
            currency: dbProperty.currency,
            operation: dbProperty.operation,
            location: dbProperty.location,
            bedrooms: dbProperty.bedrooms,
            bathrooms: dbProperty.bathrooms,
            area: dbProperty.area,
            image: dbProperty.image || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
            features: dbProperty.features || [],
            description: dbProperty.description,
            managedBy: 'database' as const,
            user_id: dbProperty.user_id
          };

          // Get the property owner's profile directly from profiles table
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', dbProperty.user_id)
              .maybeSingle();

            if (!profileError && profile) {
              agentInfo = {
                name: profile.full_name || 'Propietario',
                phone: profile.phone || 'No disponible',
                email: profile.email || 'contacto@propietario.com',
                image: profile.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
                agency: profile.company_name || 'Propietario particular',
                whatsapp: profile.phone || '+34600000000'
              };
              console.log('Found property owner profile:', profile);
            } else {
              console.log('No profile found for user_id:', dbProperty.user_id);
            }
          } catch (profileError) {
            console.error('Error fetching property owner profile:', profileError);
          }
        }
      } catch (error) {
        console.error('Error fetching database property:', error);
      }
      }

      // Skip static properties search - only use database and local properties

      // If still not found, try local properties
      if (!foundProperty) {
        const localProperties = getLocalProperties();
        const localProperty = localProperties.find(p => p.id === id);
        
        if (localProperty) {
          foundProperty = {
            id: Number(localProperty.id),
            title: localProperty.title,
            price: localProperty.price,
            currency: localProperty.currency,
            operation: localProperty.operation,
            location: localProperty.location,
            bedrooms: localProperty.bedrooms,
            bathrooms: localProperty.bathrooms,
            area: localProperty.area,
            type: localProperty.type,
            image: localProperty.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
            features: localProperty.features || [],
            reference: localProperty.reference,
            managedBy: 'local' as const
          };

          // DEBUG: Log local property data
          console.log('🔍 DEBUG - Local Property Data:', {
            propertyId: localProperty.id,
            userId: localProperty.userId,
            userHash: localProperty.userHash,
            hasUserId: !!localProperty.userId,
            hasUserHash: !!localProperty.userHash
          });

          // Try to find the owner of this local property using the userId
          if (localProperty.userId) {
            console.log('🔍 DEBUG - Searching for profile with userId:', localProperty.userId);
            try {
              // Get the property owner's profile directly using the userId
              const { data: profileData, error } = await supabase
                .rpc('get_complete_profile_info', { profile_user_id: localProperty.userId })
                .maybeSingle();
              
              const profile = profileData as {
                id: string;
                full_name: string;
                user_type: string;
                company_name: string;
                phone: string;
                email: string;
                avatar_url: string;
              } | null;

              console.log('🔍 DEBUG - Profile query result:', { profile, error, hasProfile: !!profile });

              if (!error && profile) {
                console.log('🔍 DEBUG - Profile found:', {
                  id: profile.id,
                  full_name: profile.full_name,
                  company_name: profile.company_name,
                  email: profile.email
                });

                // Update email if missing
                if (!profile.email) {
                  try {
                    await supabase.rpc('update_profile_email');
                    const { data: updatedProfile } = await supabase
                      .from('profiles')
                      .select('*')
                      .eq('id', profile.id)
                      .maybeSingle();
                    if (updatedProfile) {
                      profile.email = updatedProfile.email;
                    }
                  } catch (updateError) {
                    console.error('Error updating profile email:', updateError);
                  }
                }

                agentInfo = {
                  name: profile.full_name || 'Propietario',
                  phone: profile.phone || 'No disponible',
                  email: profile.email || 'contacto@propietario.com',
                  image: profile.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
                  agency: profile.company_name || 'Propietario particular',
                  whatsapp: profile.phone || '+34600000000'
                };
                console.log('🔍 DEBUG - Agent info set from profile:', agentInfo);
              } else {
                console.log('🔍 DEBUG - No profile found or error occurred');
              }
            } catch (error) {
              console.error('🔍 DEBUG - Error fetching local property owner profile:', error);
            }
          } else {
            console.log('🔍 DEBUG - No userId found in local property, trying to find real owner');
            // For older properties without userId, try to find the owner by checking if this property 
            // exists in the database (which would mean it was published by an authenticated user)
            try {
              const { data: dbProperty, error } = await supabase
                .from('properties')
                .select('user_id')
                .eq('reference', localProperty.reference)
                .maybeSingle();

              if (!error && dbProperty) {
                console.log('🔍 DEBUG - Found property in database, fetching owner profile');
                const { data: profileData, error: profileError } = await supabase
                  .rpc('get_complete_profile_info', { profile_user_id: dbProperty.user_id })
                  .maybeSingle();
                
                const profile = profileData as {
                  id: string;
                  full_name: string;
                  user_type: string;
                  company_name: string;
                  phone: string;
                  email: string;
                  avatar_url: string;
                } | null;

                if (!profileError && profile) {
                  console.log('🔍 DEBUG - Found real property owner:', profile.full_name);
                  
                  // Update local property with the real userId for future
                  await updateLocalProperty(localProperty.id, { userId: dbProperty.user_id });

                  agentInfo = {
                    name: profile.full_name || 'Propietario',
                    phone: profile.phone || 'No disponible',
                    email: profile.email || 'contacto@propietario.com',
                    image: profile.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
                    agency: profile.company_name || 'Propietario particular',
                    whatsapp: profile.phone || '+34600000000'
                  };
                }
              } else {
                console.log('🔍 DEBUG - Property not found in database, truly local-only property');
              }
            } catch (error) {
              console.error('🔍 DEBUG - Error searching for property owner:', error);
            }
          }

          // Only set agentInfo if we found a real owner - no random/generic agents
        }
      }
      
      setProperty(foundProperty);
      setPropertyAgent(agentInfo);
      setLoading(false);
    };

    if (id) {
      loadPropertyAndAgent();
    }
  }, [id]);

  // Show loading while fetching property data
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600 mx-auto mb-4"></div>
          <p className="text-stone-600">Cargando propiedad...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-stone-800 mb-4">{t('property.not_found')}</h1>
          <Link to="/properties">
            <Button className="bg-stone-600 hover:bg-stone-700">{t('property.back_to_properties')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Generate multiple images for the property
  const getPropertyImages = () => {
    // For local properties, use uploaded images
    if (property.managedBy === 'local') {
      const localProperties = getLocalProperties();
      const localProperty = localProperties.find(p => p.id === id);
      if (localProperty && localProperty.images && localProperty.images.length > 0) {
        return localProperty.images;
      }
    }
    
    // For static and database properties, use default images
    return [
      property.image,
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop",
    ];
  };

  const images = getPropertyImages();

  // Get agent data based on property owner
  const getAgentForProperty = (property: any) => {
    // Always use the property owner information if available
    if (propertyAgent) {
      return propertyAgent;
    }
    
    // Fallback for properties without owner info
    return {
      name: 'Propietario',
      phone: 'No disponible',
      email: 'contacto@propietario.com',
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      agency: 'Propietario particular',
      whatsapp: '+34600000000'
    };
  };

  const agent = getAgentForProperty(property);

  // Use the agent's WhatsApp number (which corresponds to their agency or owner)
  // Clean phone number for WhatsApp (remove spaces, dashes, etc.)
  const cleanPhoneNumber = (phone: string) => {
    let cleaned = phone.replace(/\D/g, ''); // Remove all non-digits
    
    // Add Spanish country code if not present
    if (cleaned.length === 9 && cleaned.startsWith('6') || cleaned.startsWith('7') || cleaned.startsWith('8') || cleaned.startsWith('9')) {
      cleaned = '34' + cleaned; // Add Spain country code
    }
    
    return cleaned;
  };
  
  const WHATSAPP_BUSINESS_NUMBER = agent.whatsapp ? cleanPhoneNumber(agent.whatsapp) : '34600000000';

  const getDescription = (property: any) => {
    const typeDescriptions = {
      apartment: t('property.apartment_description'),
      house: t('property.house_description'), 
      loft: t('property.loft_description'),
      studio: t('property.studio_description')
    };
    return typeDescriptions[property.type as keyof typeof typeDescriptions] || t('property.default_description');
  };

  const amenities = [
    { icon: Wifi, label: t('property.wifi') },
    { icon: Wind, label: t('property.air_conditioning') }, 
    { icon: Tv, label: t('property.tv') },
    { icon: Car, label: t('property.parking') }
  ];

  const formatPrice = (price: number, operation: string) => {
    const formattedPrice = new Intl.NumberFormat('es-ES').format(price);
    return operation === 'rent' ? `${formattedPrice}€${t('property.per_month')}` : `${formattedPrice}€`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleReservationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReservationData({
      ...reservationData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setReservationData({
        ...reservationData,
        signedContract: file
      });
    } else {
      alert('Por favor, sube un archivo PDF válido');
    }
  };

  const handleReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reservationData.signedContract) {
      alert('Por favor, adjunta el contrato firmado en PDF');
      return;
    }

    // Validate required fields
    if (!reservationData.fullName || !reservationData.email || !reservationData.phone || !reservationData.dni) {
      alert('Por favor, completa todos los campos obligatorios');
      return;
    }

    console.log("Reservation data:", reservationData);
    
    // Simulate payment gateway redirect
    // In a real implementation, you would send the data to your backend first
    alert('Datos de reserva validados. Redirigiendo a la pasarela de pago...');
    
    // Simulate redirect to payment gateway
    setTimeout(() => {
      window.open('https://checkout.stripe.com/demo', '_blank');
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Here you would typically send the form data to your backend
  };

  const handleGoBack = () => {
    navigate(-1); // Goes back to the previous page in history
  };

  const handleWhatsAppChat = () => {
    const defaultMessage = whatsappMessage || t('property.whatsapp_default_message', {
      title: property.title,
      reference: property.reference,
      location: property.location,
      price: formatPrice(property.price, property.operation)
    });
    const encodedMessage = encodeURIComponent(defaultMessage);
    const whatsappUrl = `https://wa.me/${WHATSAPP_BUSINESS_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  // Updated quick messages with consistent "Ref:" format
  const quickMessages = [
    t('property.quick_message_visit', { title: property.title, reference: property.reference, location: property.location }),
    t('property.quick_message_available', { reference: property.reference, price: formatPrice(property.price, property.operation) }),
    t('property.quick_message_schedule', { reference: property.reference, location: property.location }),
    t('property.quick_message_price_info', { price: formatPrice(property.price, property.operation), reference: property.reference })
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      
      <div className="container mx-auto px-6 py-6">
        {/* Back Button */}
        <button 
          onClick={handleGoBack}
          className="inline-flex items-center text-stone-600 hover:text-stone-700 mb-6 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back')}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="relative mb-6">
              <div className="aspect-video rounded-lg overflow-hidden">
                <img
                  src={images[currentImageIndex]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-2 mt-4">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-video rounded-lg overflow-hidden border-2 ${
                      currentImageIndex === index ? "border-stone-500" : "border-transparent"
                    }`}
                  >
                    <img
                      src={image}
                      alt={t('property.view_number', { number: index + 1 })}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Property Info */}
            <div className="bg-white rounded-lg p-6 mb-6 h-fit">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex gap-2 mb-2">
                    <Badge 
                      variant={property.operation === 'rent' ? 'default' : 'secondary'}
                      className={`${
                        property.operation === 'rent' 
                          ? 'bg-stone-500 hover:bg-stone-600' 
                          : 'bg-amber-500 hover:bg-amber-600'
                      } text-white`}
                    >
                      {property.operation === 'rent' ? t('search.operation_rent') : t('search.operation_sale')}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-mono">
                      {t('property.reference')}: {property.reference}
                    </Badge>
                  </div>
                  <h1 className="text-3xl font-bold text-stone-800 mb-2">
                    {property.title}
                  </h1>
                  <div className="flex items-center text-stone-600 mb-4">
                    <MapPin className="h-5 w-5 mr-2" />
                    {property.location}
                  </div>
                  <div className="text-3xl font-bold text-stone-600">
                    {formatPrice(property.price, property.operation)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-stone-300 text-stone-600 hover:bg-stone-50">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="border-stone-300 text-stone-600 hover:bg-stone-50">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Property Stats */}
              <div className="grid grid-cols-4 gap-4 py-6 border-y border-stone-200">
                <div className="text-center">
                  <Bed className="h-6 w-6 mx-auto text-stone-400 mb-2" />
                  <div className="font-semibold">{property.bedrooms}</div>
                  <div className="text-sm text-stone-600">{t('property.bedrooms')}</div>
                </div>
                <div className="text-center">
                  <Bath className="h-6 w-6 mx-auto text-stone-400 mb-2" />
                  <div className="font-semibold">{property.bathrooms}</div>
                  <div className="text-sm text-stone-600">{t('property.bathrooms')}</div>
                </div>
                <div className="text-center">
                  <Square className="h-6 w-6 mx-auto text-stone-400 mb-2" />
                  <div className="font-semibold">{property.area}m²</div>
                  <div className="text-sm text-stone-600">{t('property.area_label')}</div>
                </div>
                <div className="text-center">
                  <Car className="h-6 w-6 mx-auto text-stone-400 mb-2" />
                  <div className="font-semibold">1</div>
                  <div className="text-sm text-stone-600">{t('property.parking')}</div>
                </div>
              </div>

              {/* Description */}
              <div className="py-6">
                <h2 className="text-xl font-semibold mb-4 text-stone-800">{t('property.description')}</h2>
                <p className="text-stone-700 leading-relaxed">
                  {getDescription(property)}
                </p>
              </div>

              {/* OpenStreetMap Location Section */}
              <div className="py-6 border-t border-stone-200">
                <h2 className="text-xl font-semibold mb-4 text-stone-800 flex items-center">
                  <Map className="h-5 w-5 mr-2 text-stone-600" />
                  {t('property.location')}
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center text-stone-600 mb-4">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span className="text-lg">{property.location}</span>
                  </div>
                  
                  {/* OpenStreetMap Component */}
                  <MapComponent location={property.location} title={property.title} />
                  
                  {/* Location info */}
                  <div className="bg-stone-50 p-4 rounded-lg">
                    <h3 className="font-medium text-stone-800 mb-2">{t('property.area_info')}</h3>
                    <p className="text-stone-600 text-sm">
                      {t('property.area_description')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Features */}
              {property.features && property.features.length > 0 && (
                <div className="py-6 border-t border-stone-200">
                  <h2 className="text-xl font-semibold mb-4 text-stone-800">{t('property.features')}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {property.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-stone-500 rounded-full mr-3"></div>
                        <span className="text-stone-700">{feature}</span>
                      </div>
                    ))}
                    {/* Add more sample features to fill the space */}
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-stone-500 rounded-full mr-3"></div>
                      <span className="text-stone-700">{t('property.elevator')}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-stone-500 rounded-full mr-3"></div>
                      <span className="text-stone-700">{t('property.balcony')}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-stone-500 rounded-full mr-3"></div>
                      <span className="text-stone-700">{t('property.heating')}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-stone-500 rounded-full mr-3"></div>
                      <span className="text-stone-700">{t('property.terrace')}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-stone-500 rounded-full mr-3"></div>
                      <span className="text-stone-700">{t('property.built_in_wardrobes')}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-stone-500 rounded-full mr-3"></div>
                      <span className="text-stone-700">{t('property.equipped_kitchen')}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Amenities/Services */}
              <div className="py-6 border-t border-stone-200">
                <h2 className="text-xl font-semibold mb-6 text-stone-800">{t('property.services')}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {amenities.map((amenity, index) => (
                    <div key={index} className="text-center p-4 bg-stone-50 rounded-lg">
                      <amenity.icon className="h-8 w-8 mx-auto text-stone-600 mb-3" />
                      <span className="text-sm text-stone-700 font-medium">{amenity.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Information Section */}
              <div className="py-6 border-t border-stone-200">
                <h2 className="text-xl font-semibold mb-4 text-stone-800">{t('property.additional_info')}</h2>
                <div className="space-y-4">
                  <div className="bg-stone-50 p-4 rounded-lg">
                    <h3 className="font-medium text-stone-800 mb-2">{t('property.transport')}</h3>
                    <p className="text-stone-600 text-sm">
                      {t('property.transport_description')}
                    </p>
                  </div>
                  <div className="bg-stone-50 p-4 rounded-lg">
                    <h3 className="font-medium text-stone-800 mb-2">{t('property.neighborhood')}</h3>
                    <p className="text-stone-600 text-sm">
                      {t('property.neighborhood_description')}
                    </p>
                  </div>
                  <div className="bg-stone-50 p-4 rounded-lg">
                    <h3 className="font-medium text-stone-800 mb-2">{t('property.nearby_services')}</h3>
                    <p className="text-stone-600 text-sm">
                      {t('property.nearby_services_description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agent Card - Updated to show agency */}
            <Card className="border-stone-200">
              <CardHeader>
                <CardTitle className="text-stone-800">{t('property.real_estate_agent')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-4">
                  <img
                    src={agent.image}
                    alt={agent.name}
                    className="w-16 h-16 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="font-semibold text-lg text-stone-800">{agent.name}</h3>
                    <p className="text-stone-600">{t('property.senior_agent')}</p>
                    <p className="text-sm text-stone-500 font-medium">{agent.agency}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-3 text-stone-400" />
                    <span className="text-stone-700">{agent.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-3 text-stone-400" />
                    <span className="text-stone-700">{agent.email}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Button size="sm" className="bg-stone-600 hover:bg-stone-700">
                    <Phone className="h-4 w-4 mr-1" />
                    {t('property.call')}
                  </Button>
                  <Button variant="outline" size="sm" className="border-stone-300 text-stone-600 hover:bg-stone-50">
                    <Calendar className="h-4 w-4 mr-1" />
                    {t('property.appointment')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* WhatsApp Chat Card - moved before reservation card */}
            <Card className="border-stone-200">
              <CardHeader>
                <CardTitle className="text-stone-800 flex items-center">
                  <div className="relative mr-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516" fill="#25D366"/>
                    </svg>
                  </div>
                  {t('property.whatsapp_chat')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-stone-600 mb-4">
                  {t('property.whatsapp_description', { agency: agent.agency })}
                </p>
                
                {/* Quick message buttons */}
                <div className="space-y-2 mb-4">
                  <p className="text-sm font-medium text-stone-700">{t('property.quick_messages')}:</p>
                  {quickMessages.map((message, index) => (
                    <button
                      key={index}
                      onClick={() => setWhatsappMessage(message)}
                      className="w-full text-left p-2 text-sm bg-stone-50 hover:bg-stone-100 rounded-lg transition-colors"
                    >
                      {message}
                    </button>
                  ))}
                </div>

                {/* Custom message input */}
                <div className="space-y-3">
                  <Textarea
                    placeholder={t('property.custom_message_placeholder')}
                    value={whatsappMessage}
                    onChange={(e) => setWhatsappMessage(e.target.value)}
                    rows={3}
                    className="border-stone-300 focus:border-stone-500 text-sm resize-none"
                  />
                  <Button 
                    onClick={handleWhatsAppChat}
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {t('property.open_whatsapp')}
                  </Button>
                </div>

                <div className="mt-3 p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-700 text-center">
                    📱 {t('property.quick_response')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Property Reservation Card - moved after WhatsApp card */}
            <Card className="border-stone-200 bg-gradient-to-br from-amber-50 to-orange-50">
              <CardHeader>
                <CardTitle className="text-stone-800 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-amber-600" />
                  {t('property.reserve_property')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-stone-600 mb-4">
                  {t('property.reservation_description')}
                </p>
                
                <form onSubmit={handleReservationSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="fullName" className="text-sm font-medium text-stone-700">
                      {t('property.full_name')} *
                    </Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      placeholder={t('property.full_name_placeholder')}
                      value={reservationData.fullName}
                      onChange={handleReservationInputChange}
                      required
                      className="border-stone-300 focus:border-amber-500"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-stone-700">
                      {t('contact.email')} *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder={t('property.email_placeholder')}
                      value={reservationData.email}
                      onChange={handleReservationInputChange}
                      required
                      className="border-stone-300 focus:border-amber-500"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-stone-700">
                      {t('contact.phone')} *
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder={t('property.phone_placeholder')}
                      value={reservationData.phone}
                      onChange={handleReservationInputChange}
                      required
                      className="border-stone-300 focus:border-amber-500"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="dni" className="text-sm font-medium text-stone-700">
                      {t('property.dni_nie')} *
                    </Label>
                    <Input
                      id="dni"
                      name="dni"
                      placeholder={t('property.dni_placeholder')}
                      value={reservationData.dni}
                      onChange={handleReservationInputChange}
                      required
                      className="border-stone-300 focus:border-amber-500"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="contract" className="text-sm font-medium text-stone-700">
                      {t('property.signed_contract')} (PDF) *
                    </Label>
                    <div className="mt-2">
                      <input
                        id="contract"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('contract')?.click()}
                        className="w-full border-dashed border-2 border-stone-300 hover:border-amber-400 hover:bg-amber-50"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {reservationData.signedContract ? t('property.change_pdf') : t('property.upload_contract')}
                      </Button>
                      {reservationData.signedContract && (
                        <div className="mt-2 flex items-center text-sm text-green-600">
                          <FileText className="h-4 w-4 mr-1" />
                          {reservationData.signedContract.name}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    type="submit"
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {t('property.proceed_payment')}
                  </Button>
                </form>

                <div className="mt-4 p-3 bg-amber-100 rounded-lg">
                  <p className="text-xs text-amber-800 text-center">
                    🔒 {t('property.secure_payment')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card className="border-stone-200">
              <CardHeader>
                <CardTitle className="text-stone-800">{t('property.request_info')}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    name="name"
                    placeholder={t('property.full_name_placeholder')}
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="border-stone-300 focus:border-stone-500"
                  />
                  <Input
                    name="email"
                    type="email"
                    placeholder={t('contact.email')}
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="border-stone-300 focus:border-stone-500"
                  />
                  <Input
                    name="phone"
                    type="tel"
                    placeholder={t('contact.phone')}
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="border-stone-300 focus:border-stone-500"
                  />
                  <Textarea
                    name="message"
                    placeholder={t('contact.message')}
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="border-stone-300 focus:border-stone-500"
                  />
                  <Button type="submit" className="w-full bg-stone-600 hover:bg-stone-700">
                    {t('property.send_inquiry')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PropertyDetail;
