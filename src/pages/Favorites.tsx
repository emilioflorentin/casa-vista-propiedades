
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

const Favorites = () => {
  const { favorites, clearAllFavorites } = useFavorites();
  
  const favoriteProperties = allProperties.filter(property => 
    favorites.includes(property.id)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Heart className="h-8 w-8 text-red-500 fill-current" />
              <h1 className="text-3xl font-bold text-gray-800">
                Mis Favoritos
              </h1>
            </div>
            {favoriteProperties.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar todos
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar todos los favoritos?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción eliminará todas las propiedades de tu lista de favoritos. 
                      Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={clearAllFavorites}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Eliminar todos
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          <p className="text-gray-600">
            {favoriteProperties.length === 0 
              ? "No tienes propiedades guardadas como favoritas aún."
              : `Has guardado ${favoriteProperties.length} propiedad${favoriteProperties.length === 1 ? '' : 'es'} como favorita${favoriteProperties.length === 1 ? '' : 's'}.`
            }
          </p>
        </div>

        {favoriteProperties.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-500 mb-2">
              No hay favoritos guardados
            </h3>
            <p className="text-gray-400">
              Empieza a explorar propiedades y marca las que te gusten como favoritas.
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
