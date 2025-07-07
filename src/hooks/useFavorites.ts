
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<number[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const savedFavorites = localStorage.getItem('property-favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Error parsing favorites from localStorage:', error);
        localStorage.removeItem('property-favorites');
      }
    }
  }, []);

  const toggleFavorite = (propertyId: number) => {
    setFavorites(prev => {
      const isCurrentlyFavorite = prev.includes(propertyId);
      const newFavorites = isCurrentlyFavorite
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId];
      
      // Save to localStorage immediately
      localStorage.setItem('property-favorites', JSON.stringify(newFavorites));
      
      // Show toast after state update to avoid render phase update
      setTimeout(() => {
        toast({
          title: isCurrentlyFavorite ? "Eliminado de favoritos" : "Añadido a favoritos",
          description: isCurrentlyFavorite 
            ? "La propiedad se ha eliminado de tus favoritos" 
            : "La propiedad se ha añadido a tus favoritos",
        });
      }, 0);
      
      return newFavorites;
    });
  };

  const isFavorite = (propertyId: number) => favorites.includes(propertyId);

  return {
    favorites,
    toggleFavorite,
    isFavorite
  };
};
