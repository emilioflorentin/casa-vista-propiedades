
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

  const toggleFavorite = useCallback((propertyId: number) => {
    console.log('Toggling favorite for property:', propertyId);
    
    setFavorites(prevFavorites => {
      const isCurrentlyFavorite = prevFavorites.includes(propertyId);
      const newFavorites = isCurrentlyFavorite
        ? prevFavorites.filter(id => id !== propertyId)
        : [...prevFavorites, propertyId];
      
      console.log('Previous favorites:', prevFavorites);
      console.log('New favorites:', newFavorites);
      
      // Save to localStorage immediately
      try {
        localStorage.setItem('property-favorites', JSON.stringify(newFavorites));
        console.log('Saved to localStorage immediately:', newFavorites);
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
      
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
    return favorites.includes(propertyId);
  }, [favorites]);

  return {
    favorites,
    toggleFavorite,
    isFavorite
  };
};
