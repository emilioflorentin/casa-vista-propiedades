
import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Home, Key, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import LocationSearch from "@/components/LocationSearch";
import { featuredProperties, allProperties } from "@/data/properties";

const Index = () => {
  const [selectedLocation, setSelectedLocation] = useState<{ address: string; lat: number; lng: number; radius: number } | null>(null);
  const [propertyType, setPropertyType] = useState("");
  const [operation, setOperation] = useState("");
  const [filteredProperties, setFilteredProperties] = useState(featuredProperties);
  const [showingSearchResults, setShowingSearchResults] = useState(false);

  const handleLocationSelect = (location: { address: string; lat: number; lng: number; radius: number }) => {
    setSelectedLocation(location);
    console.log('Selected location:', location);
  };

  const handleSearch = () => {
    console.log('Search params:', {
      location: selectedLocation,
      propertyType,
      operation
    });

    // Filter properties based on search criteria
    let results = [...allProperties];

    // Filter by property type if selected
    if (propertyType && propertyType !== "any") {
      results = results.filter(property => property.type === propertyType);
    }

    // Filter by operation if selected
    if (operation && operation !== "any") {
      results = results.filter(property => property.operation === operation);
    }

    // Filter by location if provided
    if (selectedLocation) {
      // Simple text-based location filtering for now
      const searchTerm = selectedLocation.address.toLowerCase();
      results = results.filter(property => 
        property.location.toLowerCase().includes(searchTerm) ||
        property.location.toLowerCase().includes('madrid') // Include Madrid properties for general searches
      );
    }

    setFilteredProperties(results);
    setShowingSearchResults(true);
    console.log('Filtered results:', results);
  };

  const resetSearch = () => {
    setFilteredProperties(featuredProperties);
    setShowingSearchResults(false);
    setSelectedLocation(null);
    setPropertyType("");
    setOperation("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-stone-300 via-stone-400 to-stone-500 text-white">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="relative container mx-auto px-6 py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Encuentra tu
            <span className="block text-stone-100">Hogar Perfecto</span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-stone-50 max-w-3xl mx-auto">
            Miles de propiedades en alquiler y venta te esperan. Descubre tu próximo hogar con nosotros.
          </p>
          
          {/* Search Bar */}
          <div className="bg-white rounded-2xl p-6 max-w-4xl mx-auto shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <LocationSearch
                onLocationSelect={handleLocationSelect}
                placeholder="¿Dónde buscas?"
              />
              
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="h-12 border-0 text-stone-700">
                  <SelectValue placeholder="Tipo de propiedad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Cualquiera</SelectItem>
                  <SelectItem value="apartment">Apartamento</SelectItem>
                  <SelectItem value="house">Casa</SelectItem>
                  <SelectItem value="loft">Loft</SelectItem>
                  <SelectItem value="studio">Estudio</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={operation} onValueChange={setOperation}>
                <SelectTrigger className="h-12 border-0 text-stone-700">
                  <SelectValue placeholder="Alquiler o Venta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Cualquiera</SelectItem>
                  <SelectItem value="rent">Alquiler</SelectItem>
                  <SelectItem value="sale">Venta</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                size="lg" 
                className="h-12 bg-stone-600 hover:bg-stone-700 text-white font-semibold"
                onClick={handleSearch}
              >
                <Search className="mr-2 h-5 w-5" />
                Buscar
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
              <h3 className="text-3xl font-bold text-gray-800 mb-2">15,000+</h3>
              <p className="text-gray-600">Propiedades Disponibles</p>
            </div>
            <div className="p-6">
              <div className="bg-stone-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="h-8 w-8 text-stone-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">5,000+</h3>
              <p className="text-gray-600">Clientes Satisfechos</p>
            </div>
            <div className="p-6">
              <div className="bg-stone-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-stone-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">98%</h3>
              <p className="text-gray-600">Tasa de Éxito</p>
            </div>
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section className="py-20 bg-stone-25">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              {showingSearchResults ? 'Resultados de Búsqueda' : 'Propiedades Destacadas'}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {showingSearchResults 
                ? `Encontradas ${filteredProperties.length} propiedades que coinciden con tu búsqueda`
                : 'Descubre nuestra selección de las mejores propiedades disponibles'
              }
            </p>
            {showingSearchResults && (
              <Button 
                onClick={resetSearch}
                variant="outline" 
                className="mt-4 hover:bg-stone-50 border-stone-300 text-stone-700"
              >
                Ver Propiedades Destacadas
              </Button>
            )}
          </div>
          
          {filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600 mb-4">
                No se encontraron propiedades que coincidan con tu búsqueda
              </p>
              <Button 
                onClick={resetSearch}
                className="bg-stone-600 hover:bg-stone-700 text-white"
              >
                Ver Todas las Propiedades
              </Button>
            </div>
          )}
          
          {!showingSearchResults && (
            <div className="text-center mt-12">
              <Link to="/properties">
                <Button size="lg" variant="outline" className="hover:bg-stone-50 border-stone-300 text-stone-700">
                  Ver Todas las Propiedades
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
