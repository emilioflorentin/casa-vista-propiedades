

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MapPin, Bed, Bath, Square, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useFavorites } from "@/hooks/useFavorites";
import { useLanguage } from "@/contexts/LanguageContext";

interface Property {
  id: number;
  originalId?: string;
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
  const { t } = useLanguage();
  
  const formatPrice = (price: number, operation: string) => {
    const formattedPrice = new Intl.NumberFormat('es-ES').format(price);
    return operation === 'rent' ? `${formattedPrice}€${t('properties.per_month')}` : `${formattedPrice}€`;
  };

  const getTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      apartment: t('properties.type_apartment'),
      house: t('properties.type_house'),
      loft: t('properties.type_loft'),
      studio: t('properties.type_studio')
    };
    return types[type] || type;
  };

  const getManagementLabel = (managedBy: string) => {
    return managedBy === 'nazari' ? t('properties.managed_nazari') : t('properties.managed_other');
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(property.id, { entityType: "property", entityId: property.originalId || property.id });
  };

  const isPropertyFavorite = isFavorite(property.id);

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border border-border shadow-sm h-[500px] flex flex-col">
      <div className="relative overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
          decoding="async"
          style={{ imageRendering: 'auto' }}
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <div className="flex gap-2">
            <Badge 
              variant={property.operation === 'rent' ? 'default' : 'secondary'}
              className={`${
                property.operation === 'rent' 
                  ? 'bg-primary hover:bg-primary/90' 
                  : 'bg-amber-500 hover:bg-amber-600'
              } text-white`}
            >
              {property.operation === 'rent' ? t('properties.operation_rent') : t('properties.operation_sale')}
            </Badge>
            <Badge variant="outline" className="bg-white/90 text-foreground border-border">
              {getTypeLabel(property.type)}
            </Badge>
          </div>
          <Badge variant="outline" className="bg-secondary text-primary border-primary/20 text-xs font-mono">
            Ref: {property.reference}
          </Badge>
          <Badge 
            variant="outline" 
            className={`text-xs ${
              property.managedBy === 'nazari' 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-muted text-foreground border-border'
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
              : 'bg-white/90 hover:bg-white text-muted-foreground'
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
          <Link to={`/property/${property.originalId || property.id}`}>
            <h3 className="font-semibold text-lg text-foreground mb-1 line-clamp-1 hover:text-primary transition-colors cursor-pointer">
              {property.title}
            </h3>
          </Link>
          <div className="flex items-center text-muted-foreground text-sm">
            <MapPin className="h-4 w-4 mr-1" />
            {property.location}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Bed className="h-4 w-4 mr-1" />
            <span className="mr-3">{property.bedrooms}</span>
            <Bath className="h-4 w-4 mr-1" />
            <span className="mr-3">{property.bathrooms}</span>
            <Square className="h-4 w-4 mr-1" />
            <span>{property.area}{t('properties.area_unit')}</span>
          </div>
        </div>

        {property.features && property.features.length > 0 && (
          <div className="mb-4 flex-1">
            <div className="flex flex-wrap gap-1">
              {property.features.slice(0, 3).map((feature, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-secondary text-secondary-foreground border-border">
                  {feature}
                </Badge>
              ))}
              {property.features.length > 3 && (
                <Badge variant="outline" className="text-xs bg-secondary text-secondary-foreground border-border">
                  +{property.features.length - 3} {t('properties.more')}
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-auto">
          <div className="text-xl font-bold text-foreground">
            {formatPrice(property.price, property.operation)}
          </div>
          <Link to={`/property/${property.originalId || property.id}`}>
            <Button size="sm">
              <Eye className="h-4 w-4 mr-1" />
              {t('properties.view_details')}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
