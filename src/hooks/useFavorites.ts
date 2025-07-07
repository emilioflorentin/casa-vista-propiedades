
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<number[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const savedFavorites = localStorage.getItem('property-favorites');
    if (savedFavorites) {
      try {
        const parsed = JSON.parse(savedFavorites);
        setFavorites(parsed);
        console.log('Loaded favorites from localStorage:', parsed);
      } catch (error) {
        console.error('Error parsing favorites from localStorage:', error);
        localStorage.removeItem('property-favorites');
      }
    }
  }, []);

  // Save to localStorage whenever favorites change
  useEffect(() => {
    if (favorites.length >= 0) { // Changed condition to handle empty arrays too
      try {
        localStorage.setItem('property-favorites', JSON.stringify(favorites));
        console.log('Saved favorites to localStorage:', favorites);
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  }, [favorites]);

  const toggleFavorite = useCallback((propertyId: number) => {
    console.log('Toggling favorite for property:', propertyId);
    
    setFavorites(currentFavorites => {
      console.log('Current favorites before toggle:', currentFavorites);
      
      const isCurrentlyFavorite = currentFavorites.includes(propertyId);
      const newFavorites = isCurrentlyFavorite
        ? currentFavorites.filter(id => id !== propertyId)
        : [...currentFavorites, propertyId];
      
      console.log('New favorites after toggle:', newFavorites);
      
      // Show toast notification
      toast({
        title: isCurrentlyFavorite ? "Eliminado de favoritos" : "Añadido a favoritos",
        description: isCurrentlyFavorite 
          ? "La propiedad se ha eliminado de tus favoritos" 
          : "La propiedad se ha añadido a tus favoritos",
      });
      
      return newFavorites;
    });
  }, [toast]);

  const isFavorite = useCallback((propertyId: number) => {
    const result = favorites.includes(propertyId);
    console.log(`Checking if property ${propertyId} is favorite:`, result, 'Current favorites:', favorites);
    return result;
  }, [favorites]);

  console.log('useFavorites hook - current favorites:', favorites);

  return {
    favorites,
    toggleFavorite,
    isFavorite
  };
};
