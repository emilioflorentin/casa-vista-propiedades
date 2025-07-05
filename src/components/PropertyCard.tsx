
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MapPin, Bed, Bath, Square, Eye, Star } from "lucide-react";
import { Link } from "react-router-dom";

interface Property {
  id: number;
  title: string;
  type: string;
  price: number;
  currency: string;
  operation: "rent" | "sale";
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
}

interface PropertyCardProps {
  property: Property;
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const formatPrice = (price: number, operation: string) => {
    const formattedPrice = new Intl.NumberFormat('es-ES').format(price);
    return operation === 'rent' ? `${formattedPrice}€/mes` : `${formattedPrice}€`;
  };

  const getTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      apartment: 'Apartamento',
      house: 'Casa',
      loft: 'Loft',
      studio: 'Estudio'
    };
    return types[type] || type;
  };

  return (
    <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 shadow-lg hover:scale-[1.02] hover:-translate-y-1">
      <div className="relative overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge 
            variant={property.operation === 'rent' ? 'default' : 'secondary'}
            className={`${
              property.operation === 'rent' 
                ? 'bg-stone-600 hover:bg-stone-700' 
                : 'bg-stone-500 hover:bg-stone-600'
            } text-white transition-all duration-300 hover:scale-105 animate-pulse`}
          >
            {property.operation === 'rent' ? 'Alquiler' : 'Venta'}
          </Badge>
          <Badge variant="outline" className="bg-white/90 text-stone-700 border-stone-300 transition-all duration-300 hover:scale-105">
            {getTypeLabel(property.type)}
          </Badge>
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2 h-auto transition-all duration-300 hover:scale-110 hover:text-red-500"
        >
          <Heart className="h-4 w-4 text-stone-600 transition-colors duration-300" />
        </Button>

        <div className="absolute top-3 right-14 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <Star className="h-5 w-5 text-yellow-400 animate-pulse" />
        </div>
      </div>

      <CardContent className="p-5 bg-gradient-to-b from-white to-stone-50">
        <div className="mb-3">
          <h3 className="font-semibold text-lg text-stone-800 mb-1 line-clamp-1 group-hover:text-stone-600 transition-colors duration-300">
            {property.title}
          </h3>
          <div className="flex items-center text-stone-500 text-sm group-hover:text-stone-600 transition-colors duration-300">
            <MapPin className="h-4 w-4 mr-1 animate-pulse" />
            {property.location}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 text-sm text-stone-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center transition-all duration-300 hover:text-stone-800 hover:scale-110">
              <Bed className="h-4 w-4 mr-1" />
              <span>{property.bedrooms}</span>
            </div>
            <div className="flex items-center transition-all duration-300 hover:text-stone-800 hover:scale-110">
              <Bath className="h-4 w-4 mr-1" />
              <span>{property.bathrooms}</span>
            </div>
            <div className="flex items-center transition-all duration-300 hover:text-stone-800 hover:scale-110">
              <Square className="h-4 w-4 mr-1" />
              <span>{property.area}m²</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-stone-700 animate-pulse">
            {formatPrice(property.price, property.operation)}
          </div>
          <Link to={`/property/${property.id}`}>
            <Button size="sm" className="bg-stone-600 hover:bg-stone-700 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <Eye className="h-4 w-4 mr-1" />
              Ver Más
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
