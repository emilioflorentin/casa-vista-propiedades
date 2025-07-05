
import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Home, Key, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";

const featuredProperties = [
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
];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [operation, setOperation] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-600 via-red-600 to-amber-600 text-white">
        <div className="absolute inset-0 bg-black opacity-15"></div>
        <div className="relative container mx-auto px-6 py-28 text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight drop-shadow-lg">
            Encuentra tu
            <span className="block text-yellow-200 animate-pulse">Hogar Perfecto</span>
          </h1>
          <p className="text-2xl md:text-3xl mb-14 text-orange-100 max-w-4xl mx-auto drop-shadow-md">
            Miles de propiedades en alquiler y venta te esperan. Descubre tu próximo hogar con nosotros.
          </p>
          
          {/* España-UE Logo más grande */}
          <div className="mb-12 flex justify-center animate-bounce">
            <img 
              src="/lovable-uploads/40868b12-4e35-4795-9055-e41aed888525.png" 
              alt="España - Europa" 
              className="h-24 w-auto drop-shadow-2xl"
            />
          </div>
          
          {/* Search Bar */}
          <div className="bg-white rounded-3xl p-8 max-w-5xl mx-auto shadow-2xl border-4 border-orange-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="relative">
                <MapPin className="absolute left-4 top-4 h-6 w-6 text-orange-500" />
                <Input
                  placeholder="¿Dónde buscas?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 border-2 border-orange-200 text-orange-800 font-medium text-lg focus:border-orange-400"
                />
              </div>
              
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="h-14 border-2 border-orange-200 text-orange-800 font-medium text-lg focus:border-orange-400">
                  <SelectValue placeholder="Tipo de propiedad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartamento</SelectItem>
                  <SelectItem value="house">Casa</SelectItem>
                  <SelectItem value="loft">Loft</SelectItem>
                  <SelectItem value="studio">Estudio</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={operation} onValueChange={setOperation}>
                <SelectTrigger className="h-14 border-2 border-orange-200 text-orange-800 font-medium text-lg focus:border-orange-400">
                  <SelectValue placeholder="Alquiler o Venta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rent">Alquiler</SelectItem>
                  <SelectItem value="sale">Venta</SelectItem>
                </SelectContent>
              </Select>
              
              <Button size="lg" className="h-14 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <Search className="mr-3 h-6 w-6" />
                Buscar
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-white to-orange-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div className="p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-orange-100">
              <div className="bg-gradient-to-br from-orange-400 to-red-400 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Home className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-4xl font-bold text-orange-700 mb-3">15,000+</h3>
              <p className="text-orange-600 text-lg font-medium">Propiedades Disponibles</p>
            </div>
            <div className="p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-orange-100">
              <div className="bg-gradient-to-br from-red-400 to-amber-400 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Key className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-4xl font-bold text-red-700 mb-3">5,000+</h3>
              <p className="text-red-600 text-lg font-medium">Clientes Satisfechos</p>
            </div>
            <div className="p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-orange-100">
              <div className="bg-gradient-to-br from-amber-400 to-orange-400 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Zap className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-4xl font-bold text-amber-700 mb-3">98%</h3>
              <p className="text-amber-600 text-lg font-medium">Tasa de Éxito</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-24 bg-gradient-to-b from-orange-50 to-red-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-orange-800 mb-6 drop-shadow-sm">Propiedades Destacadas</h2>
            <p className="text-2xl text-orange-700 max-w-3xl mx-auto font-medium">
              Descubre nuestra selección de las mejores propiedades disponibles
            </p>
            <div className="mt-8 flex justify-center">
              <img 
                src="/lovable-uploads/40868b12-4e35-4795-9055-e41aed888525.png" 
                alt="España - Europa" 
                className="h-20 w-auto animate-pulse drop-shadow-lg"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
          
          <div className="text-center mt-16">
            <Link to="/properties">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-lg px-10 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                Ver Todas las Propiedades
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
