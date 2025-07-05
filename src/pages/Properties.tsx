
import { useState } from "react";
import { Search, Filter, Grid3X3, List, MapPin, Bed, Bath, Square, Heart, Eye, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Link } from "react-router-dom";

const allProperties = [
  {
    id: 1,
    title: "Apartamento Moderno en el Centro",
    type: "apartment",
    price: 1200,
    currency: "€",
    operation: "rent" as const,
    location: "Madrid Centro",
    bedrooms: 2,
    bathrooms: 2,
    area: 85,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=300&fit=crop",
  },
  {
    id: 2,
    title: "Casa Familiar con Jardín",
    type: "house",
    price: 450000,
    currency: "€",
    operation: "sale" as const,
    location: "Las Rozas, Madrid",
    bedrooms: 4,
    bathrooms: 3,
    area: 180,
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=500&h=300&fit=crop",
  },
  {
    id: 3,
    title: "Loft Industrial Reformado",
    type: "loft",
    price: 1800,
    currency: "€",
    operation: "rent" as const,
    location: "Malasaña, Madrid",
    bedrooms: 1,
    bathrooms: 1,
    area: 75,
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=500&h=300&fit=crop",
  },
  {
    id: 4,
    title: "Ático con Terraza Panorámica",
    type: "apartment",
    price: 650000,
    currency: "€",
    operation: "sale" as const,
    location: "Salamanca, Madrid",
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=300&fit=crop",
  },
  {
    id: 5,
    title: "Estudio Luminoso Céntrico",
    type: "studio",
    price: 800,
    currency: "€",
    operation: "rent" as const,
    location: "Chueca, Madrid",
    bedrooms: 1,
    bathrooms: 1,
    area: 45,
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=500&h=300&fit=crop",
  },
  {
    id: 6,
    title: "Chalet Independiente",
    type: "house",
    price: 850000,
    currency: "€",
    operation: "sale" as const,
    location: "Pozuelo de Alarcón",
    bedrooms: 5,
    bathrooms: 4,
    area: 250,
    image: "https://images.unsplash.com/photo-1448630360428-65456885c650?w=500&h=300&fit=crop",
  },
];

const Properties = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [operation, setOperation] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const filteredProperties = allProperties.filter((property) => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !propertyType || property.type === propertyType;
    const matchesOperation = !operation || property.operation === operation;
    const matchesPrice = property.price >= priceRange[0] && property.price <= priceRange[1];
    
    return matchesSearch && matchesType && matchesOperation && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-stone-100 to-stone-200 py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center mb-4 animate-bounce">
            <Sparkles className="h-8 w-8 text-stone-600 mr-2" />
            <h1 className="text-4xl font-bold text-stone-800">Encuentra tu Hogar Ideal</h1>
            <Sparkles className="h-8 w-8 text-stone-600 ml-2 animate-pulse" />
          </div>
          <p className="text-xl text-stone-600 animate-fade-in">
            Descubre las mejores propiedades en las mejores ubicaciones
          </p>
          <div className="mt-6 flex justify-center">
            <img 
              src="/lovable-uploads/40868b12-4e35-4795-9055-e41aed888525.png" 
              alt="España - Europa" 
              className="h-16 w-auto animate-pulse"
            />
          </div>
        </div>
      </div>
      
      {/* Search Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row gap-4 animate-fade-in">
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400 transition-colors duration-300 group-focus-within:text-stone-600" />
              <Input
                placeholder="Buscar por ubicación, tipo de propiedad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 transition-all duration-300 focus:ring-2 focus:ring-stone-300 hover:shadow-md"
              />
            </div>
            
            <div className="flex gap-3">
              <Select value={operation} onValueChange={setOperation}>
                <SelectTrigger className="h-12 w-40 transition-all duration-300 hover:shadow-md">
                  <SelectValue placeholder="Operación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="rent">Alquiler</SelectItem>
                  <SelectItem value="sale">Venta</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="h-12 w-40 transition-all duration-300 hover:shadow-md">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="apartment">Apartamento</SelectItem>
                  <SelectItem value="house">Casa</SelectItem>
                  <SelectItem value="loft">Loft</SelectItem>
                  <SelectItem value="studio">Estudio</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="h-12 transition-all duration-300 hover:shadow-md hover:scale-105"
              >
                <Filter className="h-4 w-4 mr-2 transition-transform duration-300" />
                Filtros
              </Button>
            </div>
          </div>
          
          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 p-6 bg-gradient-to-r from-stone-50 to-stone-100 rounded-lg animate-fade-in shadow-inner">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rango de Precio (€)
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={1000000}
                    min={0}
                    step={10000}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>{priceRange[0].toLocaleString()}€</span>
                    <span>{priceRange[1].toLocaleString()}€</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="container mx-auto px-6 py-6">
        <div className="flex justify-between items-center mb-6 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 animate-slide-in-left">
              {filteredProperties.length} Propiedades Encontradas
            </h1>
            <p className="text-gray-600 mt-1 animate-slide-in-left">
              Resultados de tu búsqueda
            </p>
          </div>
          
          <div className="flex items-center gap-2 animate-slide-in-right">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="transition-all duration-300 hover:scale-105"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="transition-all duration-300 hover:scale-105"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Properties Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProperties.map((property, index) => (
              <div key={property.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProperties.map((property, index) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-0">
                  <div className="flex">
                    <div className="w-64 h-48 flex-shrink-0 overflow-hidden">
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
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
                                  ? 'bg-stone-600 hover:bg-stone-700' 
                                  : 'bg-stone-500 hover:bg-stone-600'
                              } text-white transition-all duration-300 hover:scale-105`}
                            >
                              {property.operation === 'rent' ? 'Alquiler' : 'Venta'}
                            </Badge>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-1 hover:text-stone-600 transition-colors duration-300">
                            {property.title}
                          </h3>
                          <div className="flex items-center text-gray-500 mb-4">
                            <MapPin className="h-4 w-4 mr-1 animate-pulse" />
                            {property.location}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="transition-all duration-300 hover:scale-110 hover:text-red-500">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-6 text-gray-600 mb-4">
                        <div className="flex items-center transition-all duration-300 hover:text-stone-700">
                          <Bed className="h-4 w-4 mr-1" />
                          <span>{property.bedrooms} hab.</span>
                        </div>
                        <div className="flex items-center transition-all duration-300 hover:text-stone-700">
                          <Bath className="h-4 w-4 mr-1" />
                          <span>{property.bathrooms} baños</span>
                        </div>
                        <div className="flex items-center transition-all duration-300 hover:text-stone-700">
                          <Square className="h-4 w-4 mr-1" />
                          <span>{property.area}m²</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-2xl font-bold text-stone-600 animate-pulse">
                          {new Intl.NumberFormat('es-ES').format(property.price)}€
                          {property.operation === 'rent' && '/mes'}
                        </div>
                        <Link to={`/property/${property.id}`}>
                          <Button className="bg-stone-600 hover:bg-stone-700 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalles
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
          <div className="text-center py-12 animate-fade-in">
            <div className="max-w-md mx-auto">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-bounce" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No se encontraron propiedades
              </h3>
              <p className="text-gray-600">
                Prueba ajustando los filtros de búsqueda para encontrar más resultados.
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
