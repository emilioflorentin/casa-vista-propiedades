
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
      
      return newFavorites;
    });
  }, []);

  // Separate effect to handle localStorage and toast when favorites change
  useEffect(() => {
    if (favorites.length > 0) {
      try {
        localStorage.setItem('property-favorites', JSON.stringify(favorites));
        console.log('Saved to localStorage:', favorites);
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  }, [favorites]);

  const isFavorite = useCallback((propertyId: number) => {
    return favorites.includes(propertyId);
  }, [favorites]);

  return {
    favorites,
    toggleFavorite,
    isFavorite
  };
};
