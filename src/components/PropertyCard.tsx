
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MapPin, Bed, Bath, Square, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useFavorites } from "@/hooks/useFavorites";

interface Property {
  id: number;
  reference: string;
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
  features?: string[];
  managedBy: "nazari" | "other";
}

interface PropertyCardProps {
  property: Property;
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  
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

  const getManagementLabel = (managedBy: string) => {
    return managedBy === 'nazari' ? 'Nazarí Homes' : 'Otra Inmobiliaria';
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(property.id);
  };

  const isPropertyFavorite = isFavorite(property.id);

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg h-[500px] flex flex-col">
      <div className="relative overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <div className="flex gap-2">
            <Badge 
              variant={property.operation === 'rent' ? 'default' : 'secondary'}
              className={`${
                property.operation === 'rent' 
                  ? 'bg-stone-500 hover:bg-stone-600' 
                  : 'bg-amber-500 hover:bg-amber-600'
              } text-white`}
            >
              {property.operation === 'rent' ? 'Alquiler' : 'Venta'}
            </Badge>
            <Badge variant="outline" className="bg-white/90 text-gray-700 border-gray-300">
              {getTypeLabel(property.type)}
            </Badge>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-mono">
            Ref: {property.reference}
          </Badge>
          <Badge 
            variant="outline" 
            className={`text-xs ${
              property.managedBy === 'nazari' 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-gray-50 text-gray-700 border-gray-200'
            }`}
          >
            {getManagementLabel(property.managedBy)}
          </Badge>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className={`absolute top-3 right-3 p-2 h-auto transition-all duration-200 ${
            isPropertyFavorite 
              ? 'bg-red-50 hover:bg-red-100 text-red-600' 
              : 'bg-white/90 hover:bg-white text-gray-600'
          }`}
          onClick={handleFavoriteClick}
        >
          <Heart 
            className={`h-4 w-4 transition-all duration-200 ${
              isPropertyFavorite ? 'fill-current' : ''
            }`} 
          />
        </Button>
      </div>

      <CardContent className="p-5 flex flex-col flex-1">
        <div className="mb-3">
          <h3 className="font-semibold text-lg text-gray-800 mb-1 line-clamp-1">
            {property.title}
          </h3>
          <div className="flex items-center text-gray-500 text-sm">
            <MapPin className="h-4 w-4 mr-1" />
            {property.location}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Bed className="h-4 w-4 mr-1" />
            <span className="mr-3">{property.bedrooms}</span>
            <Bath className="h-4 w-4 mr-1" />
            <span className="mr-3">{property.bathrooms}</span>
            <Square className="h-4 w-4 mr-1" />
            <span>{property.area}m²</span>
          </div>
        </div>

        {property.features && property.features.length > 0 && (
          <div className="mb-4 flex-1">
            <div className="flex flex-wrap gap-1">
              {property.features.slice(0, 3).map((feature, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-stone-50 text-stone-600 border-stone-200">
                  {feature}
                </Badge>
              ))}
              {property.features.length > 3 && (
                <Badge variant="outline" className="text-xs bg-stone-50 text-stone-600 border-stone-200">
                  +{property.features.length - 3} más
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-auto">
          <div className="text-xl font-bold text-gray-700">
            {formatPrice(property.price, property.operation)}
          </div>
          <Link to={`/property/${property.id}`}>
            <Button size="sm" className="bg-stone-600 hover:bg-stone-700 text-white">
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
