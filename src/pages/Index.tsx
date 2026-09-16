import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Home, Key, Zap, Shield, MessageCircle, Camera, ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import Reveal from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { getLocalProperties } from "@/utils/localProperties";
import { calculateDistance, getCoordinatesFromLocation } from "@/utils/distanceCalculator";
import { useLanguage } from "@/contexts/LanguageContext";
import Autoplay from "embla-carousel-autoplay";

const Index = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchOperation, setSearchOperation] = useState<'sale' | 'rent'>('sale');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    lat: number;
    lng: number;
    radius: number;
  } | null>(null);
  const [propertyType, setPropertyType] = useState("");
  const [operation, setOperation] = useState("");
  const [managedBy, setManagedBy] = useState("");
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [showingSearchResults, setShowingSearchResults] = useState(false);
  const [allUserProperties, setAllUserProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleSearchWithLocation = (location?: { address: string; lat: number; lng: number; radius: number }) => {
    const searchLocation = location || selectedLocation;

    console.log("Search params:", {
      location: searchLocation,
      propertyType,
      operation,
      managedBy,
    });

    // Filter properties based on search criteria
    let results = [...allUserProperties];

    // Filter by property type if selected
    if (propertyType && propertyType !== "any") {
      results = results.filter((property) => property.type === propertyType);
    }

    // Filter by operation if selected
    if (operation && operation !== "any") {
      results = results.filter((property) => property.operation === operation);
    }

    // Filter by management if selected
    if (managedBy && managedBy !== "any") {
      results = results.filter((property) => property.managedBy === managedBy);
    }

    // Filter by location and radius if provided
    if (searchLocation) {
      const searchTerm = searchLocation.address.toLowerCase();
      console.log("Filtering by location and radius:", searchTerm, searchLocation.radius);

      results = results.filter((property) => {
        const propertyLocation = property.location.toLowerCase();

        // Get coordinates for the property location
        const propertyCoords = getCoordinatesFromLocation(property.location);

        if (propertyCoords && searchLocation.lat && searchLocation.lng) {
          // Calculate distance between search location and property location
          const distance = calculateDistance(
            searchLocation.lat,
            searchLocation.lng,
            propertyCoords.lat,
            propertyCoords.lng,
          );

          console.log(
            `Property ${property.title} at ${property.location}: distance ${Math.round(distance)}m, radius ${searchLocation.radius}m`,
          );

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
    console.log("Filtered results:", results.length, "properties found");
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
          .from("properties")
          .select("*")
          .or("is_rented.is.null,is_rented.eq.false") // Only show available properties
          .order("created_at", { ascending: false });

        // Load profiles to determine managedBy
        const userIds = [...new Set((dbProperties || []).map(p => p.user_id))];
        const profiles: Record<string, { email?: string | null }> = {};
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, email")
            .in("id", userIds);
          (profilesData || []).forEach(p => { profiles[p.id] = p; });
        }

        // Load local properties (only available ones)
        const localProperties = getLocalProperties().filter((prop) => !prop.is_rented);

        // Convert and combine properties
        const convertedDbProperties = (dbProperties || []).map((prop) => ({
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
          image: prop.image ? prop.image.split(',')[0].trim() : "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3",
          features: prop.features || [],
          description: prop.description,
          managedBy: (profiles[prop.user_id]?.email?.endsWith('@nazarihomes.com') ? 'nazari' : 'other') as "nazari" | "other",
          user_id: prop.user_id,
        }));

        const convertedLocalProperties = localProperties.map((prop) => ({
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
          managedBy: "other" as const,
          userHash: prop.userHash,
        }));

        const combinedProperties = [...convertedDbProperties, ...convertedLocalProperties];
        setAllUserProperties(combinedProperties);
        setFilteredProperties(combinedProperties.slice(0, 8)); // Show first 8 as featured
      } catch (error) {
        console.error("Error loading properties:", error);
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
    <div className="min-h-screen bg-secondary">
      <Header />
      <main>
      {/* Hero Section */}
      <section className="relative bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="relative container mx-auto px-6 py-10 text-center md:py-24">
          <Reveal variant="fade">
            <h1 className="text-3xl md:text-6xl font-bold mb-4 md:mb-6 leading-tight">
              {t("hero.title")}
              <span className="block text-primary-foreground">{t("hero.title_highlight")}</span>
            </h1>
          </Reveal>
          <Reveal delay={150}>
            <p className="text-base md:text-2xl mb-6 md:mb-12 text-primary-foreground/90 max-w-3xl mx-auto">{t("hero.subtitle")}</p>
          </Reveal>

          {/* Search Bar */}
          <Reveal delay={280} variant="scale" className="max-w-4xl mx-auto">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const params = new URLSearchParams({ operation: searchOperation });
                if (searchQuery.trim()) params.set('q', searchQuery.trim());
                navigate(`/properties?${params.toString()}`);
              }}
            >
              <div className="flex gap-1 px-2">
                {([['sale', 'Comprar'], ['rent', 'Alquilar']] as const).map(([value, label]) => (
                  <Button
                    key={value}
                    type="button"
                    variant={searchOperation === value ? 'secondary' : 'ghost'}
                    onClick={() => setSearchOperation(value)}
                    className={searchOperation === value ? 'rounded-b-none' : 'rounded-b-none text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground'}
                  >
                    {label}
                  </Button>
                ))}
                <Button asChild type="button" variant="ghost" className="rounded-b-none text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                  <Link to="/roomie-finder">Compartir</Link>
                </Button>
              </div>
              <div className="flex flex-col gap-2 bg-card p-2 shadow-xl md:flex-row md:gap-3 md:p-3">
                <div className="relative flex-1">
                  <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <button
                    type="button"
                    onClick={() => setLocationOpen(true)}
                    className={`h-12 w-full rounded-md bg-secondary pl-12 pr-4 text-left text-base outline-none ring-primary focus:ring-2 md:h-14 ${searchQuery ? 'text-foreground' : 'text-muted-foreground'}`}
                  >
                    {searchQuery || 'Ciudad, barrio o referencia'}
                  </button>
                </div>
                <Button type="submit" size="lg" className="h-12 px-9 text-base md:h-14">
                  <Search className="h-5 w-5" />
                  Buscar viviendas
                </Button>
              </div>
            </form>
          </Reveal>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 md:py-16 bg-card">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-8 text-center">
            <Reveal className="p-4 md:p-6">
              <div className="bg-secondary w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 md:w-16 md:h-16 md:mb-4">
                <Home className="h-6 w-6 text-primary md:h-8 md:w-8" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2 md:text-3xl">
                {allUserProperties.length.toLocaleString("es-ES")}+
              </h3>
              <p className="text-muted-foreground">{t("stats.properties")}</p>
            </Reveal>
            <Reveal delay={120} className="p-4 md:p-6">
              <div className="bg-secondary w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 md:w-16 md:h-16 md:mb-4">
                <Key className="h-6 w-6 text-primary md:h-8 md:w-8" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2 md:text-3xl">190+</h3>
              <p className="text-muted-foreground">{t("stats.clients")}</p>
            </Reveal>
            <Reveal delay={240} className="p-4 md:p-6">
              <div className="bg-secondary w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 md:w-16 md:h-16 md:mb-4">
                <Zap className="h-6 w-6 text-primary md:h-8 md:w-8" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2 md:text-3xl">98%</h3>
              <p className="text-muted-foreground">{t("stats.success_rate")}</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section className="py-10 md:py-20 bg-muted/40">
        <div className="container mx-auto px-6">
          <Reveal className="text-center mb-8 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-3 md:mb-4">
              {showingSearchResults ? t("properties.search_results") : t("properties.featured")}
            </h2>
            <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {showingSearchResults
                ? t("properties.search_results_desc").replace("{count}", filteredProperties.length.toString())
                : t("properties.featured_desc")}
            </p>
            {showingSearchResults && (
              <Button
                onClick={resetSearch}
                variant="outline"
                className="mt-4 hover:bg-secondary border-border text-foreground"
              >
                {t("properties.show_featured")}
              </Button>
            )}
          </Reveal>

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
                      <CarouselItem
                        key={property.id}
                        className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 transform transition-all duration-500 hover:scale-105"
                      >
                        <PropertyCard property={property} />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="hidden md:flex transition-all duration-300 hover:scale-110 hover:bg-accent/20 shadow-lg" />
                  <CarouselNext className="hidden md:flex transition-all duration-300 hover:scale-110 hover:bg-accent/20 shadow-lg" />
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
              <p className="text-xl text-muted-foreground mb-4">{t("properties.no_results")}</p>
              <Button onClick={resetSearch} className="bg-primary hover:bg-primary text-primary-foreground">
                {t("properties.view_all")}
              </Button>
            </div>
          )}

          {!showingSearchResults && (
            <Reveal className="text-center mt-12">
              <Link to="/properties">
                <Button size="lg" variant="outline" className="hover:bg-secondary border-border text-foreground">
                  {t("properties.view_all")}
                </Button>
              </Link>
            </Reveal>
          )}
        </div>
      </section>

      {/* Tenant Section */}
      <section className="py-10 md:py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6">
          <Reveal className="max-w-4xl mx-auto text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">{t("tenant_section.title")}</h2>
            <p className="text-base md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">{t("tenant_section.subtitle")}</p>
          </Reveal>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-8 max-w-4xl mx-auto mb-8 md:mb-12">
            <Reveal className="text-center p-4 md:p-6">
              <div className="w-12 h-12 bg-card/10 rounded-full flex items-center justify-center mx-auto mb-3 md:w-16 md:h-16 md:mb-4">
                <Shield className="h-6 w-6 text-primary-foreground/80 md:h-8 md:w-8" />
              </div>
              <h3 className="text-base font-semibold mb-1 md:text-lg md:mb-2">{t("tenant_section.step1_title")}</h3>
              <p className="text-primary-foreground/70 text-sm">{t("tenant_section.step1_desc")}</p>
            </Reveal>
            <Reveal delay={120} className="text-center p-4 md:p-6">
              <div className="w-12 h-12 bg-card/10 rounded-full flex items-center justify-center mx-auto mb-3 md:w-16 md:h-16 md:mb-4">
                <Camera className="h-6 w-6 text-primary-foreground/80 md:h-8 md:w-8" />
              </div>
              <h3 className="text-base font-semibold mb-1 md:text-lg md:mb-2">{t("tenant_section.step2_title")}</h3>
              <p className="text-primary-foreground/70 text-sm">{t("tenant_section.step2_desc")}</p>
            </Reveal>
            <Reveal delay={240} className="text-center p-4 md:p-6">
              <div className="w-12 h-12 bg-card/10 rounded-full flex items-center justify-center mx-auto mb-3 md:w-16 md:h-16 md:mb-4">
                <MessageCircle className="h-6 w-6 text-primary-foreground/80 md:h-8 md:w-8" />
              </div>
              <h3 className="text-base font-semibold mb-1 md:text-lg md:mb-2">{t("tenant_section.step3_title")}</h3>
              <p className="text-primary-foreground/70 text-sm">{t("tenant_section.step3_desc")}</p>
            </Reveal>
          </div>

          <Reveal delay={120} className="text-center">
            <Link to="/tenant-incidents">
              <Button size="lg" className="bg-card text-foreground hover:bg-accent/20 font-semibold">
                {t("tenant_section.cta")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </Reveal>
        </div>
      </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
