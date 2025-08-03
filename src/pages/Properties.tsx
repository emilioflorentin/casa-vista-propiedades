import { useState, useEffect } from "react";
import { Search, Filter, Grid3X3, List, MapPin, Bed, Bath, Square, Heart, Eye, Heater, Waves, Car, Zap, Home, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Link } from "react-router-dom";
import { allProperties } from "@/data/properties";
import { useFavorites } from "@/hooks/useFavorites";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { getLocalProperties, LocalProperty } from "@/utils/localProperties";

interface DBProperty {
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
  user_id: string;
  created_at: string;
}

interface Profile {
  id: string;
  full_name?: string;
  phone?: string;
  user_type?: string;
  company_name?: string;
}

const Properties = () => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [operation, setOperation] = useState("all");
  const [managedBy, setManagedBy] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [minBedrooms, setMinBedrooms] = useState("all");
  const [minBathrooms, setMinBathrooms] = useState("all");
  const [dbProperties, setDbProperties] = useState<DBProperty[]>([]);
  const [localProperties, setLocalProperties] = useState<LocalProperty[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  
  // Filtros de características
  const [hasHeating, setHasHeating] = useState(false);
  const [hasPool, setHasPool] = useState(false);
  const [hasGarage, setHasGarage] = useState(false);
  const [hasAirConditioning, setHasAirConditioning] = useState(false);
  const [hasElevator, setHasElevator] = useState(false);
  const [hasTerrace, setHasTerrace] = useState(false);
  const [hasGarden, setHasGarden] = useState(false);

  // Load database properties, local properties and profiles
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (propertiesError) throw propertiesError;
        setDbProperties(propertiesData || []);

        // Load local properties
        const localProps = getLocalProperties();
        setLocalProperties(localProps);

        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, phone, user_type, company_name');
        
        if (profilesError) throw profilesError;
        const profilesMap = (profilesData || []).reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as Record<string, Profile>);
        setProfiles(profilesMap);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Convert DB properties to match static property format
  const convertedDbProperties = dbProperties.map(prop => ({
    id: parseInt(prop.id.slice(-8), 16), // Convert UUID to number for compatibility
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
    managedBy: (profiles[prop.user_id]?.user_type === 'empresa' ? 'other' : 'nazari') as "other" | "nazari",
    userProfile: profiles[prop.user_id]
  }));

  // Convert local properties to match static property format
  const convertedLocalProperties = localProperties.map(prop => ({
    id: parseInt(prop.id), // Convert string ID to number for compatibility
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
    images: prop.images, // Include all images for detail view
    features: prop.features || [],
    description: prop.description,
    managedBy: 'other' as const, // Local properties are managed by users
    userHash: prop.userHash,
    isLocal: true // Flag to identify local properties
  }));

  // Combine static, database and local properties
  const allCombinedProperties = [...allProperties, ...convertedDbProperties, ...convertedLocalProperties];

  const filteredProperties = allCombinedProperties.filter((property) => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = propertyType === "all" || property.type === propertyType;
    const matchesOperation = operation === "all" || property.operation === operation;
    const matchesManagement = managedBy === "all" || property.managedBy === managedBy;
    const matchesPrice = property.price >= priceRange[0] && property.price <= priceRange[1];
    const matchesBedrooms = minBedrooms === "all" || property.bedrooms >= parseInt(minBedrooms);
    const matchesBathrooms = minBathrooms === "all" || property.bathrooms >= parseInt(minBathrooms);
    
    const matchesHeating = !hasHeating || property.features?.some(feature => 
      feature.toLowerCase().includes('calefacción')
    );
    const matchesPool = !hasPool || property.features?.some(feature => 
      feature.toLowerCase().includes('piscina')
    );
    const matchesGarage = !hasGarage || property.features?.some(feature => 
      feature.toLowerCase().includes('garaje')
    );
    const matchesAirConditioning = !hasAirConditioning || property.features?.some(feature => 
      feature.toLowerCase().includes('aire acondicionado')
    );
    const matchesElevator = !hasElevator || property.features?.some(feature => 
      feature.toLowerCase().includes('ascensor')
    );
    const matchesTerrace = !hasTerrace || property.features?.some(feature => 
      feature.toLowerCase().includes('terraza') || feature.toLowerCase().includes('balcón')
    );
    const matchesGarden = !hasGarden || property.features?.some(feature => 
      feature.toLowerCase().includes('jardín')
    );
    
    return matchesSearch && matchesType && matchesOperation && matchesManagement && 
           matchesPrice && matchesBedrooms && matchesBathrooms && matchesHeating && 
           matchesPool && matchesGarage && matchesAirConditioning && matchesElevator && 
           matchesTerrace && matchesGarden;
  });

  const handleFavoriteClick = (e: React.MouseEvent, propertyId: number) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(propertyId);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      
      {/* Search Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-stone-400" />
              <Input
                placeholder={t('properties.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 border-stone-300 focus:border-stone-500"
              />
            </div>
            
            <div className="flex gap-3">
              <Select value={operation} onValueChange={setOperation}>
                <SelectTrigger className="h-12 w-40 border-stone-300">
                  <SelectValue placeholder={t('search.operation')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('properties.operation_all')}</SelectItem>
                  <SelectItem value="rent">{t('properties.operation_rent')}</SelectItem>
                  <SelectItem value="sale">{t('properties.operation_sale')}</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="h-12 w-40 border-stone-300">
                  <SelectValue placeholder={t('search.property_type')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('properties.type_all')}</SelectItem>
                  <SelectItem value="apartment">{t('properties.type_apartment')}</SelectItem>
                  <SelectItem value="house">{t('properties.type_house')}</SelectItem>
                  <SelectItem value="loft">{t('properties.type_loft')}</SelectItem>
                  <SelectItem value="studio">{t('properties.type_studio')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={managedBy} onValueChange={setManagedBy}>
                <SelectTrigger className="h-12 w-40 border-stone-300">
                  <SelectValue placeholder={t('search.managed_by')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('properties.managed_all')}</SelectItem>
                  <SelectItem value="nazari">{t('properties.managed_nazari')}</SelectItem>
                  <SelectItem value="other">{t('properties.managed_other')}</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="h-12 border-stone-300 text-stone-600 hover:bg-stone-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                {t('properties.filters')}
              </Button>
            </div>
          </div>
          
          {showFilters && (
            <div className="mt-6 p-6 bg-stone-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    {t('properties.price_range')}
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={1000000}
                    min={0}
                    step={10000}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-sm text-stone-500 mt-1">
                    <span>{priceRange[0].toLocaleString()}€</span>
                    <span>{priceRange[1].toLocaleString()}€</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    {t('properties.min_bedrooms')}
                  </label>
                  <Select value={minBedrooms} onValueChange={setMinBedrooms}>
                    <SelectTrigger className="border-stone-300">
                      <SelectValue placeholder={t('properties.any')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('properties.any')}</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    {t('properties.min_bathrooms')}
                  </label>
                  <Select value={minBathrooms} onValueChange={setMinBathrooms}>
                    <SelectTrigger className="border-stone-300">
                      <SelectValue placeholder={t('properties.any')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('properties.any')}</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-stone-700 mb-4">
                  {t('properties.features')}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="heating" 
                      checked={hasHeating}
                      onCheckedChange={(checked) => setHasHeating(checked === true)}
                    />
                    <Label htmlFor="heating" className="flex items-center text-sm text-stone-600">
                      <Heater className="h-4 w-4 mr-1" />
                      {t('properties.heating')}
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="pool" 
                      checked={hasPool}
                      onCheckedChange={(checked) => setHasPool(checked === true)}
                    />
                    <Label htmlFor="pool" className="flex items-center text-sm text-stone-600">
                      <Waves className="h-4 w-4 mr-1" />
                      {t('properties.pool')}
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="garage" 
                      checked={hasGarage}
                      onCheckedChange={(checked) => setHasGarage(checked === true)}
                    />
                    <Label htmlFor="garage" className="flex items-center text-sm text-stone-600">
                      <Car className="h-4 w-4 mr-1" />
                      {t('properties.garage')}
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="airConditioning" 
                      checked={hasAirConditioning}
                      onCheckedChange={(checked) => setHasAirConditioning(checked === true)}
                    />
                    <Label htmlFor="airConditioning" className="flex items-center text-sm text-stone-600">
                      <Zap className="h-4 w-4 mr-1" />
                      {t('properties.air_conditioning')}
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="elevator" 
                      checked={hasElevator}
                      onCheckedChange={(checked) => setHasElevator(checked === true)}
                    />
                    <Label htmlFor="elevator" className="flex items-center text-sm text-stone-600">
                      <Square className="h-4 w-4 mr-1" />
                      {t('properties.elevator')}
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="terrace" 
                      checked={hasTerrace}
                      onCheckedChange={(checked) => setHasTerrace(checked === true)}
                    />
                    <Label htmlFor="terrace" className="flex items-center text-sm text-stone-600">
                      <Home className="h-4 w-4 mr-1" />
                      {t('properties.terrace')}
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="garden" 
                      checked={hasGarden}
                      onCheckedChange={(checked) => setHasGarden(checked === true)}
                    />
                    <Label htmlFor="garden" className="flex items-center text-sm text-stone-600">
                      <Square className="h-4 w-4 mr-1" />
                      {t('properties.garden')}
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="container mx-auto px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">
              {filteredProperties.length} {t('properties.page_title')}
            </h1>
            <p className="text-stone-600 mt-1">
              {t('properties.results_subtitle')}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-stone-600 hover:bg-stone-700" : "border-stone-300 text-stone-600 hover:bg-stone-50"}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-stone-600 hover:bg-stone-700" : "border-stone-300 text-stone-600 hover:bg-stone-50"}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Properties Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow border-stone-200">
                <CardContent className="p-0">
                  <div className="flex">
                    <div className="w-64 h-48 flex-shrink-0">
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start mb-3">
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
                              {property.operation === 'rent' ? t('properties.operation_rent') : t('properties.operation_sale')}
                            </Badge>
                          </div>
                          <h3 className="text-xl font-semibold text-stone-800 mb-1">
                            {property.title}
                          </h3>
                          <div className="flex items-center text-stone-500 mb-4">
                            <MapPin className="h-4 w-4 mr-1" />
                            {property.location}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`transition-all duration-200 ${
                            isFavorite(property.id)
                              ? 'text-red-600 hover:bg-red-50' 
                              : 'text-stone-600 hover:bg-stone-50'
                          }`}
                          onClick={(e) => handleFavoriteClick(e, property.id)}
                        >
                          <Heart 
                            className={`h-4 w-4 transition-all duration-200 ${
                              isFavorite(property.id) ? 'fill-current' : ''
                            }`} 
                          />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-6 text-stone-600 mb-4">
                        <div className="flex items-center">
                          <Bed className="h-4 w-4 mr-1" />
                          <span>{property.bedrooms} {t('properties.bedrooms_unit')}</span>
                        </div>
                        <div className="flex items-center">
                          <Bath className="h-4 w-4 mr-1" />
                          <span>{property.bathrooms} {t('properties.bathrooms_unit')}</span>
                        </div>
                        <div className="flex items-center">
                          <Square className="h-4 w-4 mr-1" />
                          <span>{property.area}{t('properties.area_unit')}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-2xl font-bold text-stone-600">
                          {new Intl.NumberFormat('es-ES').format(property.price)}€
                          {property.operation === 'rent' && t('properties.per_month')}
                        </div>
                        <Link to={`/property/${property.id}`}>
                          <Button className="bg-stone-600 hover:bg-stone-700">
                            <Eye className="h-4 w-4 mr-2" />
                            {t('properties.view_details')}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Search className="h-16 w-16 text-stone-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-stone-800 mb-2">
                {t('properties.no_results_title')}
              </h3>
              <p className="text-stone-600">
                {t('properties.no_results_desc')}
              </p>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Properties;
