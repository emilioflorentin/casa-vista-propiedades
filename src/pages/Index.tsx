
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Home, Key, Zap, Shield, MessageCircle, Camera, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import LocationSearch from "@/components/LocationSearch";
import { supabase } from "@/integrations/supabase/client";
import { getLocalProperties } from "@/utils/localProperties";
import { calculateDistance, getCoordinatesFromLocation } from "@/utils/distanceCalculator";
import { useLanguage } from "@/contexts/LanguageContext";
import Autoplay from "embla-carousel-autoplay";

const Index = () => {
  const { t } = useLanguage();
  const [selectedLocation, setSelectedLocation] = useState<{ address: string; lat: number; lng: number; radius: number } | null>(null);
  const [propertyType, setPropertyType] = useState("");
  const [operation, setOperation] = useState("");
  const [managedBy, setManagedBy] = useState("");
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [showingSearchResults, setShowingSearchResults] = useState(false);
  const [allUserProperties, setAllUserProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLocationSelect = (location: { address: string; lat: number; lng: number; radius: number }) => {
    setSelectedLocation(location);
    console.log('Selected location:', location);
    
    // Automatically trigger search when location is selected
    handleSearchWithLocation(location);
  };

  const handleSearchWithLocation = (location?: { address: string; lat: number; lng: number; radius: number }) => {
    const searchLocation = location || selectedLocation;
    
    console.log('Search params:', {
      location: searchLocation,
      propertyType,
      operation,
      managedBy
    });

    // Filter properties based on search criteria
    let results = [...allUserProperties];

    // Filter by property type if selected
    if (propertyType && propertyType !== "any") {
      results = results.filter(property => property.type === propertyType);
    }

    // Filter by operation if selected
    if (operation && operation !== "any") {
      results = results.filter(property => property.operation === operation);
    }

    // Filter by management if selected
    if (managedBy && managedBy !== "any") {
      results = results.filter(property => property.managedBy === managedBy);
    }

    // Filter by location and radius if provided
    if (searchLocation) {
      const searchTerm = searchLocation.address.toLowerCase();
      console.log('Filtering by location and radius:', searchTerm, searchLocation.radius);
      
      results = results.filter(property => {
        const propertyLocation = property.location.toLowerCase();
        
        // Get coordinates for the property location
        const propertyCoords = getCoordinatesFromLocation(property.location);
        
        if (propertyCoords && searchLocation.lat && searchLocation.lng) {
          // Calculate distance between search location and property location
          const distance = calculateDistance(
            searchLocation.lat,
            searchLocation.lng,
            propertyCoords.lat,
            propertyCoords.lng
          );
          
          console.log(`Property ${property.title} at ${property.location}: distance ${Math.round(distance)}m, radius ${searchLocation.radius}m`);
          
          // ONLY include properties within the specified radius
          return distance <= searchLocation.radius;
        }
        
        // If coordinates are not available, exclude the property from radius search
        console.log(`No coordinates found for ${property.location}, excluding from radius search`);
        return false;
      });
    }

    setFilteredProperties(results);
    setShowingSearchResults(true);
    console.log('Filtered results:', results.length, 'properties found');
  };

  // The main search button now does the same as the location search
  const handleSearch = () => {
    // If there's a selected location, use it directly
    if (selectedLocation) {
      handleSearchWithLocation();
    }
    // If no location is selected but there might be text in the input, 
    // let the LocationSearch component handle it through its own search
  };

  const resetSearch = () => {
    setFilteredProperties(allUserProperties.slice(0, 8)); // Show first 8 properties as featured
    setShowingSearchResults(false);
    setSelectedLocation(null);
    setPropertyType("");
    setOperation("");
    setManagedBy("");
  };

  // Load user properties on component mount
  useEffect(() => {
    const loadUserProperties = async () => {
      try {
        // Load database properties (only available ones)
        const { data: dbProperties, error } = await supabase
          .from('properties')
          .select('*')
          .or('is_rented.is.null,is_rented.eq.false') // Only show available properties
          .order('created_at', { ascending: false });

        // Load local properties (only available ones)
        const localProperties = getLocalProperties().filter(prop => !prop.is_rented);

        // Convert and combine properties
        const convertedDbProperties = (dbProperties || []).map(prop => ({
          id: parseInt(prop.id.slice(-8), 16),
          originalId: prop.id,
          reference: prop.reference,
          title: prop.title,
          type: prop.type,
          price: prop.price,
          currency: prop.currency,
          operation: prop.operation,
          location: prop.location,
          bedrooms: prop.bedrooms,
          bathrooms: prop.bathrooms,
          area: prop.area,
          image: prop.image || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3",
          features: prop.features || [],
          description: prop.description,
          managedBy: 'other' as const,
          user_id: prop.user_id
        }));

        const convertedLocalProperties = localProperties.map(prop => ({
          id: parseInt(prop.id),
          originalId: prop.id,
          reference: prop.reference,
          title: prop.title,
          type: prop.type,
          price: prop.price,
          currency: prop.currency,
          operation: prop.operation,
          location: prop.location,
          bedrooms: prop.bedrooms,
          bathrooms: prop.bathrooms,
          area: prop.area,
          image: prop.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3",
          features: prop.features || [],
          description: prop.description,
          managedBy: 'other' as const,
          userHash: prop.userHash
        }));

        const combinedProperties = [...convertedDbProperties, ...convertedLocalProperties];
        setAllUserProperties(combinedProperties);
        setFilteredProperties(combinedProperties.slice(0, 8)); // Show first 8 as featured
      } catch (error) {
        console.error('Error loading properties:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProperties();
  }, []);

  // Auto-search when filters change and there's a selected location
  useEffect(() => {
    if (selectedLocation) {
      handleSearchWithLocation();
    }
  }, [propertyType, operation, managedBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-stone-300 via-stone-400 to-stone-500 text-white">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="relative container mx-auto px-6 py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            {t('hero.title')}
            <span className="block text-stone-100">{t('hero.title_highlight')}</span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-stone-50 max-w-3xl mx-auto">
            {t('hero.subtitle')}
          </p>
          
          {/* Search Bar */}
          <div className="bg-white rounded-2xl p-6 max-w-5xl mx-auto shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <LocationSearch
                onLocationSelect={handleLocationSelect}
                placeholder={t('search.location_placeholder')}
              />
              
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="h-12 border-0 text-stone-700">
                  <SelectValue placeholder={t('search.property_type')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">{t('search.property_type_any')}</SelectItem>
                  <SelectItem value="apartment">{t('search.property_type_apartment')}</SelectItem>
                  <SelectItem value="house">{t('search.property_type_house')}</SelectItem>
                  <SelectItem value="loft">{t('search.property_type_loft')}</SelectItem>
                  <SelectItem value="studio">{t('search.property_type_studio')}</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={operation} onValueChange={setOperation}>
                <SelectTrigger className="h-12 border-0 text-stone-700">
                  <SelectValue placeholder={t('search.operation')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">{t('search.operation_any')}</SelectItem>
                  <SelectItem value="rent">{t('search.operation_rent')}</SelectItem>
                  <SelectItem value="sale">{t('search.operation_sale')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={managedBy} onValueChange={setManagedBy}>
                <SelectTrigger className="h-12 border-0 text-stone-700">
                  <SelectValue placeholder={t('search.managed_by')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">{t('search.managed_by_any')}</SelectItem>
                  <SelectItem value="nazari">{t('search.managed_by_nazari')}</SelectItem>
                  <SelectItem value="other">{t('search.managed_by_other')}</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                size="lg" 
                className="h-12 bg-stone-600 hover:bg-stone-700 text-white font-semibold"
                onClick={handleSearch}
              >
                <Search className="mr-2 h-5 w-5" />
                {t('search.search_btn')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="bg-stone-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="h-8 w-8 text-stone-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">{allUserProperties.length.toLocaleString('es-ES')}+</h3>
              <p className="text-gray-600">{t('stats.properties')}</p>
            </div>
            <div className="p-6">
              <div className="bg-stone-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="h-8 w-8 text-stone-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">5,000+</h3>
              <p className="text-gray-600">{t('stats.clients')}</p>
            </div>
            <div className="p-6">
              <div className="bg-stone-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-stone-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">98%</h3>
              <p className="text-gray-600">{t('stats.success_rate')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section className="py-20 bg-stone-25">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              {showingSearchResults ? t('properties.search_results') : t('properties.featured')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {showingSearchResults 
                ? t('properties.search_results_desc').replace('{count}', filteredProperties.length.toString())
                : t('properties.featured_desc')
              }
            </p>
            {showingSearchResults && (
              <Button 
                onClick={resetSearch}
                variant="outline" 
                className="mt-4 hover:bg-stone-50 border-stone-300 text-stone-700"
              >
                {t('properties.show_featured')}
              </Button>
            )}
          </div>
          
          {filteredProperties.length > 0 ? (
            <>
              {!showingSearchResults ? (
                /* Carousel for featured properties */
                <Carousel
                  plugins={[
                    Autoplay({
                      delay: 3000,
                      stopOnInteraction: false,
                      stopOnMouseEnter: true,
                    }),
                  ]}
                  opts={{
                    align: "start",
                    loop: true,
                    duration: 25,
                    dragFree: true,
                    containScroll: "trimSnaps",
                    slidesToScroll: 1,
                  }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-2 md:-ml-4 transition-transform duration-700 ease-in-out">
                    {filteredProperties.map((property) => (
                      <CarouselItem key={property.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 transform transition-all duration-500 hover:scale-105">
                        <PropertyCard property={property} />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="hidden md:flex transition-all duration-300 hover:scale-110 hover:bg-stone-100 shadow-lg" />
                  <CarouselNext className="hidden md:flex transition-all duration-300 hover:scale-110 hover:bg-stone-100 shadow-lg" />
                </Carousel>
              ) : (
                /* Grid layout for search results */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {filteredProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600 mb-4">
                {t('properties.no_results')}
              </p>
              <Button 
                onClick={resetSearch}
                className="bg-stone-600 hover:bg-stone-700 text-white"
              >
                {t('properties.view_all')}
              </Button>
            </div>
          )}
          
          {!showingSearchResults && (
            <div className="text-center mt-12">
              <Link to="/properties">
                <Button size="lg" variant="outline" className="hover:bg-stone-50 border-stone-300 text-stone-700">
                  {t('properties.view_all')}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Tenant Section */}
      <section className="py-20 bg-gradient-to-br from-stone-600 to-stone-800 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              {t('tenant_section.title')}
            </h2>
            <p className="text-xl text-stone-200 max-w-2xl mx-auto">
              {t('tenant_section.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-stone-200" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('tenant_section.step1_title')}</h3>
              <p className="text-stone-300 text-sm">{t('tenant_section.step1_desc')}</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="h-8 w-8 text-stone-200" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('tenant_section.step2_title')}</h3>
              <p className="text-stone-300 text-sm">{t('tenant_section.step2_desc')}</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-stone-200" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('tenant_section.step3_title')}</h3>
              <p className="text-stone-300 text-sm">{t('tenant_section.step3_desc')}</p>
            </div>
          </div>

          <div className="text-center">
            <Link to="/tenant-incidents">
              <Button size="lg" className="bg-white text-stone-800 hover:bg-stone-100 font-semibold">
                {t('tenant_section.cta')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
