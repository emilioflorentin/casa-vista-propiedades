
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
    <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-2 border-amber-200 shadow-xl hover:scale-[1.03] hover:-translate-y-2 bg-gradient-to-b from-white to-amber-50">
      <div className="relative overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge 
            variant={property.operation === 'rent' ? 'default' : 'secondary'}
            className={`${
              property.operation === 'rent' 
                ? 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700' 
                : 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700'
            } text-white transition-all duration-300 hover:scale-105 animate-pulse font-semibold shadow-lg`}
          >
            {property.operation === 'rent' ? 'Alquiler' : 'Venta'}
          </Badge>
          <Badge variant="outline" className="bg-white/95 text-amber-800 border-amber-300 transition-all duration-300 hover:scale-105 font-medium shadow-md">
            {getTypeLabel(property.type)}
          </Badge>
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-3 right-3 bg-white/95 hover:bg-white p-2 h-auto transition-all duration-300 hover:scale-110 hover:text-red-500 shadow-lg"
        >
          <Heart className="h-4 w-4 text-amber-700 transition-colors duration-300" />
        </Button>

        <div className="absolute top-3 right-14 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <Star className="h-5 w-5 text-yellow-500 animate-pulse drop-shadow-lg" />
        </div>
      </div>

      <CardContent className="p-6 bg-gradient-to-b from-white to-amber-50">
        <div className="mb-4">
          <h3 className="font-bold text-xl text-amber-900 mb-2 line-clamp-1 group-hover:text-amber-700 transition-colors duration-300">
            {property.title}
          </h3>
          <div className="flex items-center text-amber-700 text-base group-hover:text-amber-800 transition-colors duration-300 font-medium">
            <MapPin className="h-5 w-5 mr-2 animate-pulse" />
            {property.location}
          </div>
        </div>

        <div className="flex items-center justify-between mb-5 text-base text-amber-800">
          <div className="flex items-center space-x-5">
            <div className="flex items-center transition-all duration-300 hover:text-amber-900 hover:scale-110 font-medium">
              <Bed className="h-5 w-5 mr-1" />
              <span>{property.bedrooms}</span>
            </div>
            <div className="flex items-center transition-all duration-300 hover:text-amber-900 hover:scale-110 font-medium">
              <Bath className="h-5 w-5 mr-1" />
              <span>{property.bathrooms}</span>
            </div>
            <div className="flex items-center transition-all duration-300 hover:text-amber-900 hover:scale-110 font-medium">
              <Square className="h-5 w-5 mr-1" />
              <span>{property.area}m²</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-amber-800 animate-pulse drop-shadow-sm">
            {formatPrice(property.price, property.operation)}
          </div>
          <Link to={`/property/${property.id}`}>
            <Button size="sm" className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white transition-all duration-300 hover:scale-105 hover:shadow-xl font-semibold shadow-lg">
              <Eye className="h-4 w-4 mr-2" />
              Ver Más
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
