
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getUserId } from '@/utils/userIdentification';
import Cookies from 'js-cookie';

interface FavoritesContextType {
  favorites: number[];
  toggleFavorite: (propertyId: number) => void;
  isFavorite: (propertyId: number) => boolean;
  clearAllFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [cookiesAccepted, setCookiesAccepted] = useState(false);
  const { toast } = useToast();

  // Load favorites from cookies on mount and when cookie consent changes
  useEffect(() => {
    const loadFavorites = () => {
      // Check if cookies are accepted
      const cookieConsent = Cookies.get('cookie_consent');
      const accepted = cookieConsent === 'accepted';
      setCookiesAccepted(accepted);
      
      if (!accepted) {
        setFavorites([]); // Clear favorites if cookies not accepted
        return;
      }

      const userId = getUserId();
      const savedFavorites = Cookies.get(`favorites_${userId}`);
      
      if (savedFavorites) {
        try {
          const parsed = JSON.parse(savedFavorites);
          if (Array.isArray(parsed)) {
            setFavorites(parsed);
            console.log('Loaded favorites from cookies for user:', userId, parsed);
          }
        } catch (error) {
          console.error('Error parsing favorites from cookies:', error);
          Cookies.remove(`favorites_${userId}`);
        }
      }
    };

    // Load favorites initially
    loadFavorites();

    // Listen for cookies accepted event
    const handleCookiesAccepted = () => {
      console.log('Cookies accepted event received, loading favorites...');
      setTimeout(() => {
        loadFavorites();
      }, 100); // Small delay to ensure cookie is set
    };

    window.addEventListener('cookies-accepted', handleCookiesAccepted);

    return () => {
      window.removeEventListener('cookies-accepted', handleCookiesAccepted);
    };
  }, []);

  const toggleFavorite = (propertyId: number) => {
    // Check if cookies are accepted using state instead of reading cookie directly
    if (!cookiesAccepted) {
      toast({
        title: "Cookies requeridas",
        description: "Para usar favoritos necesitas aceptar las cookies. Revisa el banner en la parte inferior.",
        variant: "destructive"
      });
      return;
    }

    console.log('Toggling favorite for property:', propertyId);
    
    setFavorites(currentFavorites => {
      console.log('Current favorites before toggle:', currentFavorites);
      
      const isCurrentlyFavorite = currentFavorites.includes(propertyId);
      const newFavorites = isCurrentlyFavorite
        ? currentFavorites.filter(id => id !== propertyId)
        : [...currentFavorites, propertyId];
      
      console.log('New favorites after toggle:', newFavorites);
      
      // Save to cookies with user ID
      const userId = getUserId();
      Cookies.set(`favorites_${userId}`, JSON.stringify(newFavorites), { 
        expires: 365, 
        sameSite: 'strict' 
      });
      console.log('Saved to cookies for user:', userId, newFavorites);
      
      // Show toast notification
      toast({
        title: isCurrentlyFavorite ? "Eliminado de favoritos" : "Añadido a favoritos",
        description: isCurrentlyFavorite 
          ? "La propiedad se ha eliminado de tus favoritos" 
          : "La propiedad se ha añadido a tus favoritos",
      });
      
      return newFavorites;
    });
  };

  const clearAllFavorites = () => {
    console.log('Clearing all favorites');
    setFavorites([]);
    
    // Clear from cookies
    const userId = getUserId();
    Cookies.remove(`favorites_${userId}`);
    
    toast({
      title: "Favoritos eliminados",
      description: "Todos los favoritos han sido eliminados",
    });
  };

  const isFavorite = (propertyId: number) => {
    const result = favorites.includes(propertyId);
    console.log(`Checking if property ${propertyId} is favorite:`, result, 'Current favorites:', favorites);
    return result;
  };

  console.log('FavoritesProvider - current favorites:', favorites);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, clearAllFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
