
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

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

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('property-favorites');
    if (savedFavorites) {
      try {
        const parsed = JSON.parse(savedFavorites);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
          console.log('Loaded favorites from localStorage:', parsed);
        }
      } catch (error) {
        console.error('Error parsing favorites from localStorage:', error);
        localStorage.removeItem('property-favorites');
      }
    }
  }, []);

  const toggleFavorite = (propertyId: number) => {
    console.log('Toggling favorite for property:', propertyId);
    
    setFavorites(currentFavorites => {
      console.log('Current favorites before toggle:', currentFavorites);
      
      const isCurrentlyFavorite = currentFavorites.includes(propertyId);
      const newFavorites = isCurrentlyFavorite
        ? currentFavorites.filter(id => id !== propertyId)
        : [...currentFavorites, propertyId];
      
      console.log('New favorites after toggle:', newFavorites);
      
      // Save to localStorage immediately
      localStorage.setItem('property-favorites', JSON.stringify(newFavorites));
      console.log('Saved to localStorage:', newFavorites);
      
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
    localStorage.setItem('property-favorites', JSON.stringify([]));
    
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
