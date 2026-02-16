import { useFavorites } from "@/hooks/useFavorites";
import { allProperties } from "@/data/properties";
import PropertyCard from "@/components/PropertyCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getLocalProperties } from "@/utils/localProperties";

const Favorites = () => {
  const { favorites, clearAllFavorites } = useFavorites();
  const { t } = useLanguage();
  const [supabaseProperties, setSupabaseProperties] = useState<any[]>([]);

  useEffect(() => {
    const loadSupabaseProperties = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*');
      
      if (error) {
        console.error('Error loading properties from Supabase:', error);
        return;
      }
      
      if (data) {
        // IMPORTANT: Keep ID compatible with the rest of the app (Properties page converts UUID -> number)
        setSupabaseProperties(
          data.map((p) => ({
            id: parseInt(String(p.id).slice(-8), 16),
            originalId: p.id,
            reference: p.reference,
            title: p.title,
            type: p.type,
            price: Number(p.price),
            currency: p.currency,
            operation: p.operation,
            location: p.location,
            bedrooms: p.bedrooms,
            bathrooms: p.bathrooms,
            area: Number(p.area),
            image:
              p.image ||
              "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3",
            features: p.features || [],
            description: p.description,
            isRented: p.is_rented,
            energyCertificate: p.energy_consumption_rating
              ? {
                  consumption: {
                    rating: p.energy_consumption_rating,
                    value: p.energy_consumption_value,
                  },
                  emissions: {
                    rating: p.energy_emissions_rating,
                    value: p.energy_emissions_value,
                  },
                }
              : undefined,
          }))
        );
      }
    };
    
    loadSupabaseProperties();
  }, []);

  // Load local properties
  const localProperties = getLocalProperties().map(p => ({
    id: p.id,
    originalId: p.id,
    reference: p.reference,
    title: p.title,
    type: p.type as any,
    price: p.price,
    currency: p.currency,
    operation: p.operation as any,
    location: p.location,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    area: p.area,
    image: p.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3",
    features: p.features || [],
    description: p.description,
  }));

  // Combine all properties (static + supabase + local) and filter favorites
  const allCombinedProperties = [...allProperties, ...supabaseProperties, ...localProperties];
  const favoriteProperties = allCombinedProperties.filter(property => 
    favorites.some(fav => String(fav) === String(property.id))
  );

  const getFavoritesCountText = () => {
    if (favoriteProperties.length === 0) {
      return t('favorites.no_favorites');
    } else if (favoriteProperties.length === 1) {
      return t('favorites.count_single');
    } else {
      return t('favorites.count_multiple').replace('{count}', favoriteProperties.length.toString());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Heart className="h-8 w-8 text-red-500 fill-current" />
              <h1 className="text-3xl font-bold text-gray-800">
                {t('favorites.title')}
              </h1>
            </div>
            {favoriteProperties.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('favorites.clear_all')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('favorites.confirm_clear_title')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('favorites.confirm_clear_desc')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('favorites.cancel')}</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={clearAllFavorites}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {t('favorites.delete_all')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          <p className="text-gray-600">
            {getFavoritesCountText()}
          </p>
        </div>

        {favoriteProperties.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-500 mb-2">
              {t('favorites.empty_title')}
            </h3>
            <p className="text-gray-400">
              {t('favorites.empty_desc')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Favorites;
