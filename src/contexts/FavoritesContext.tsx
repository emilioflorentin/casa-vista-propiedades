
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
  const { toast } = useToast();

  // Load favorites from cookies on mount
  useEffect(() => {
    const cookieConsent = Cookies.get('cookie_consent');
    if (cookieConsent === 'accepted') {
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
    }
  }, []);

  // Listen for cookie acceptance
  useEffect(() => {
    const handleCookiesAccepted = () => {
      console.log('FAVORITES: Cookies accepted event received');
      console.log('FAVORITES: Current cookie_consent value:', Cookies.get('cookie_consent'));
      // Reload favorites when cookies are accepted
      const userId = getUserId();
      console.log('FAVORITES: User ID:', userId);
      const savedFavorites = Cookies.get(`favorites_${userId}`);
      console.log('FAVORITES: Saved favorites cookie:', savedFavorites);
      
      if (savedFavorites) {
        try {
          const parsed = JSON.parse(savedFavorites);
          if (Array.isArray(parsed)) {
            setFavorites(parsed);
            console.log('Reloaded favorites after cookie acceptance:', parsed);
          }
        } catch (error) {
          console.error('Error parsing favorites from cookies:', error);
        }
      }
    };

    window.addEventListener('cookies-accepted', handleCookiesAccepted);
    return () => window.removeEventListener('cookies-accepted', handleCookiesAccepted);
  }, []);

  const toggleFavorite = (propertyId: number) => {
    // Force refresh cookie consent status
    const cookieConsent = Cookies.get('cookie_consent');
    console.log('Current cookie consent when toggling favorite:', cookieConsent);
    
    if (cookieConsent !== 'accepted') {
      console.log('Cookies not accepted, showing toast');
      toast({
        title: "Cookies requeridas",
        description: "Para usar favoritos necesitas aceptar las cookies. Revisa el banner en la parte inferior.",
        variant: "destructive"
      });
      return;
    }
    
    console.log('Cookies accepted, proceeding with favorite toggle');

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
