import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Heart, Share2, MapPin, Bed, Bath, Square, Car, Wifi, Tv, Wind, Phone, Mail, Calendar, Send, Upload, FileText, CreditCard, Map, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MapComponent from "@/components/MapComponent";
import EnergyCertificate from "@/components/EnergyCertificate";
import MortgageSimulator from "@/components/MortgageSimulator";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocalProperties, updateLocalProperty } from "@/utils/localProperties";
import { supabase } from "@/integrations/supabase/client";
import { getUserHash } from "@/utils/userHash";

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
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
            user_id: dbProperty.user_id,
            energyConsumptionRating: (dbProperty as any).energy_consumption_rating,
            energyConsumptionValue: (dbProperty as any).energy_consumption_value,
            energyEmissionsRating: (dbProperty as any).energy_emissions_rating,
            energyEmissionsValue: (dbProperty as any).energy_emissions_value
          };

          // Get the property owner's profile directly from profiles table
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', dbProperty.user_id)
              .maybeSingle();

            if (!profileError && profile) {
              const contactPhone = (dbProperty as any).contact_phone || profile.phone;
              agentInfo = {
                name: profile.full_name || 'Propietario',
                phone: contactPhone || 'No disponible',
                email: profile.email || 'contacto@propietario.com',
                image: profile.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
                agency: profile.company_name || 'Propietario particular',
                whatsapp: contactPhone || '+34600000000'
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
            managedBy: 'local' as const,
            energyConsumptionRating: localProperty.energyConsumptionRating,
            energyConsumptionValue: localProperty.energyConsumptionValue,
            energyEmissionsRating: localProperty.energyEmissionsRating,
            energyEmissionsValue: localProperty.energyEmissionsValue
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
    
    // For database properties, use only saved URLs (comma-separated or single URL)
    if (property.image) {
      const parsedImages = property.image
        .split(',')
        .map((url: string) => url.trim())
        .filter(Boolean);

      if (parsedImages.length > 0) {
        return parsedImages;
      }
    }
    
    // Final fallback when no image exists
    return ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop"];
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
    // Use the property's own description if available
    if (property.description && property.description.trim()) {
      return property.description;
    }
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
    
    // Debug: Log the phone number and URL being generated
    console.log('🔍 WhatsApp Debug:', {
      originalPhone: agent.whatsapp,
      cleanedNumber: WHATSAPP_BUSINESS_NUMBER,
      message: defaultMessage
    });
    
    // Try multiple WhatsApp URLs for better compatibility
    const whatsappUrls = [
      `whatsapp://send?phone=${WHATSAPP_BUSINESS_NUMBER}&text=${encodedMessage}`, // Native app
      `https://wa.me/${WHATSAPP_BUSINESS_NUMBER}?text=${encodedMessage}`, // wa.me
      `https://api.whatsapp.com/send?phone=${WHATSAPP_BUSINESS_NUMBER}&text=${encodedMessage}` // API
    ];
    
    // Try to open WhatsApp with fallbacks
    let opened = false;
    for (const url of whatsappUrls) {
      try {
        console.log('🔍 Trying WhatsApp URL:', url);
        window.open(url, '_blank');
        opened = true;
        break;
      } catch (error) {
        console.warn('Failed to open WhatsApp URL:', url, error);
      }
    }
    
    if (!opened) {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${WHATSAPP_BUSINESS_NUMBER}: ${defaultMessage}`).then(() => {
        alert('No se pudo abrir WhatsApp. El número y mensaje han sido copiados al portapapeles.');
      });
    }
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
              <div className="aspect-video rounded-lg overflow-hidden cursor-pointer" onClick={() => setLightboxOpen(true)}>
                <img
                  src={images[currentImageIndex]}
                  alt={property.title}
                  className="w-full h-full object-contain bg-stone-100 transition-transform duration-300 hover:scale-105"
                  loading="eager"
                  decoding="async"
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
                      className="w-full h-full object-contain bg-stone-100"
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Lightbox Modal */}
            {lightboxOpen && (
              <div 
                className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
                onClick={() => setLightboxOpen(false)}
              >
                <button
                  className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
                  onClick={() => setLightboxOpen(false)}
                >
                  <X className="h-8 w-8" />
                </button>
                
                {images.length > 1 && (
                  <>
                    <button
                      className="absolute left-4 text-white/80 hover:text-white z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
                      }}
                    >
                      <ChevronLeft className="h-10 w-10" />
                    </button>
                    <button
                      className="absolute right-4 text-white/80 hover:text-white z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex((prev) => (prev + 1) % images.length);
                      }}
                    >
                      <ChevronRight className="h-10 w-10" />
                    </button>
                  </>
                )}

                <img
                  src={images[currentImageIndex]}
                  alt={property.title}
                  className="max-w-[90vw] max-h-[90vh] object-contain"
                  onClick={(e) => e.stopPropagation()}
                />

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        currentImageIndex === index ? "bg-white" : "bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

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
                {property.features?.some((f: string) => f.toLowerCase().includes('parking') || f.toLowerCase().includes('garaje') || f.toLowerCase().includes('aparcamiento')) && (
                <div className="text-center">
                  <Car className="h-6 w-6 mx-auto text-stone-400 mb-2" />
                  <div className="font-semibold">Sí</div>
                  <div className="text-sm text-stone-600">{t('property.parking')}</div>
                </div>
                )}
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

              {/* Energy Certificate */}
              <EnergyCertificate 
                consumptionRating={property.energyConsumptionRating || "D"}
                emissionsRating={property.energyEmissionsRating || "E"}
                consumptionValue={property.energyConsumptionValue || 156}
                emissionsValue={property.energyEmissionsValue || 32}
              />

              {/* Mortgage Simulator - Only for sale properties */}
              {property.operation === 'sale' && (
                <MortgageSimulator 
                  propertyPrice={property.price}
                  propertyLocation={property.location}
                />
              )}

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
                  <Button 
                    size="sm" 
                    className="bg-stone-600 hover:bg-stone-700"
                    onClick={() => {
                      const phoneNumber = agent.phone?.replace(/\s/g, '') || '';
                      if (phoneNumber && phoneNumber !== 'No disponible') {
                        window.location.href = `tel:${phoneNumber}`;
                      }
                    }}
                  >
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

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PropertyDetail;
