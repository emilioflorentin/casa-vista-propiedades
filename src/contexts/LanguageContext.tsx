
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  es: {
    // Header
    'nav.home': 'Inicio',
    'nav.properties': 'Propiedades',
    'nav.services': 'Nuestros Servicios',
    'nav.about': 'Quiénes Somos',
    'nav.contact': 'Contacto',
    'nav.favorites': 'Favoritos',
    'nav.account': 'Mi Cuenta',
    'nav.contact_btn': 'Contactar',
    
    // Home page
    'hero.title': 'Encuentra tu hogar ideal en la Costa del Sol',
    'hero.subtitle': 'Descubre las mejores propiedades con vistas al mar, ubicaciones privilegiadas y todo lo que necesitas para vivir la vida mediterránea que siempre has soñado.',
    'hero.cta': 'Ver Propiedades',
    
    // Property search
    'search.location': 'Ubicación',
    'search.location_placeholder': 'Buscar por ciudad o zona...',
    'search.type': 'Tipo de Propiedad',
    'search.type_all': 'Todos los tipos',
    'search.type_apartment': 'Apartamento',
    'search.type_villa': 'Villa',
    'search.type_penthouse': 'Ático',
    'search.type_townhouse': 'Casa adosada',
    'search.price': 'Precio',
    'search.price_all': 'Cualquier precio',
    'search.bedrooms': 'Dormitorios',
    'search.bedrooms_all': 'Cualquier número',
    'search.search_btn': 'Buscar',
    'search.clear_btn': 'Limpiar filtros',
    
    // Properties
    'properties.featured': 'Propiedades Destacadas',
    'properties.latest': 'Últimas Propiedades',
    'properties.no_results': 'No se encontraron propiedades',
    'properties.no_results_desc': 'Intenta ajustar tus filtros de búsqueda para encontrar más opciones.',
    
    // Property card
    'property.bedrooms': 'dormitorios',
    'property.bathrooms': 'baños',
    'property.area': 'm²',
    'property.view_details': 'Ver detalles',
    
    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.back': 'Volver',
    'common.next': 'Siguiente',
    'common.previous': 'Anterior',
  },
  en: {
    // Header
    'nav.home': 'Home',
    'nav.properties': 'Properties',
    'nav.services': 'Our Services',
    'nav.about': 'About Us',
    'nav.contact': 'Contact',
    'nav.favorites': 'Favorites',
    'nav.account': 'My Account',
    'nav.contact_btn': 'Contact',
    
    // Home page
    'hero.title': 'Find your ideal home on the Costa del Sol',
    'hero.subtitle': 'Discover the best properties with sea views, privileged locations and everything you need to live the Mediterranean life you have always dreamed of.',
    'hero.cta': 'View Properties',
    
    // Property search
    'search.location': 'Location',
    'search.location_placeholder': 'Search by city or area...',
    'search.type': 'Property Type',
    'search.type_all': 'All types',
    'search.type_apartment': 'Apartment',
    'search.type_villa': 'Villa',
    'search.type_penthouse': 'Penthouse',
    'search.type_townhouse': 'Townhouse',
    'search.price': 'Price',
    'search.price_all': 'Any price',
    'search.bedrooms': 'Bedrooms',
    'search.bedrooms_all': 'Any number',
    'search.search_btn': 'Search',
    'search.clear_btn': 'Clear filters',
    
    // Properties
    'properties.featured': 'Featured Properties',
    'properties.latest': 'Latest Properties',
    'properties.no_results': 'No properties found',
    'properties.no_results_desc': 'Try adjusting your search filters to find more options.',
    
    // Property card
    'property.bedrooms': 'bedrooms',
    'property.bathrooms': 'bathrooms',
    'property.area': 'm²',
    'property.view_details': 'View details',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('es');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
