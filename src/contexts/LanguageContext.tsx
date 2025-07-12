
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
    
    // Contact page
    'contact.title': 'Contacto',
    'contact.subtitle': 'Estamos aquí para ayudarte con todas tus necesidades inmobiliarias',
    'contact.operation_area': 'Nuestra zona de operación en Granada',
    'contact.whatsapp_text': '¡Escríbenos por WhatsApp!',
    'contact.operation_zone': 'Zona de actuación:',
    'contact.granada_province': 'Granada y provincia',
    'contact.no_physical_office': '*Trabajamos por toda Granada sin oficina física',
    'contact.form_title': 'Deja tus datos y te llamamos',
    'contact.form_subtitle': '¡Obtenga tu valoración gratuita sin compromiso!',
    'contact.property_address': 'Dirección del inmueble',
    'contact.name': 'Nombre',
    'contact.surname': 'Apellidos',
    'contact.email': 'Correo electrónico',
    'contact.phone': 'Teléfono',
    'contact.message': 'Mensaje (opcional)',
    'contact.privacy_text': 'He leído y acepto la',
    'contact.privacy_policy': 'Política de privacidad',
    'contact.privacy_error': 'Debes aceptar la política de privacidad para enviar el formulario.',
    'contact.send_button': 'Enviar',
    'contact.form_sent': 'Formulario enviado',
    'contact.form_sent_desc': 'Te contactaremos pronto. ¡Gracias por tu interés!',
    'contact.whatsapp_message': 'Hola, me gustaría información sobre sus servicios inmobiliarios.',
    
    // Favorites page
    'favorites.title': 'Mis Favoritos',
    'favorites.clear_all': 'Eliminar todos',
    'favorites.confirm_clear_title': '¿Eliminar todos los favoritos?',
    'favorites.confirm_clear_desc': 'Esta acción eliminará todas las propiedades de tu lista de favoritos. Esta acción no se puede deshacer.',
    'favorites.cancel': 'Cancelar',
    'favorites.delete_all': 'Eliminar todos',
    'favorites.no_favorites': 'No tienes propiedades guardadas como favoritas aún.',
    'favorites.count_single': 'Has guardado 1 propiedad como favorita.',
    'favorites.count_multiple': 'Has guardado {count} propiedades como favoritas.',
    'favorites.empty_title': 'No hay favoritos guardados',
    'favorites.empty_desc': 'Empieza a explorar propiedades y marca las que te gusten como favoritas.',
    
    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.back': 'Volver',
    'common.next': 'Siguiente',
    'common.previous': 'Anterior',
    'common.language': 'Idioma:',
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
    
    // Contact page
    'contact.title': 'Contact',
    'contact.subtitle': 'We are here to help you with all your real estate needs',
    'contact.operation_area': 'Our operation area in Granada',
    'contact.whatsapp_text': 'Write to us on WhatsApp!',
    'contact.operation_zone': 'Operation area:',
    'contact.granada_province': 'Granada and province',
    'contact.no_physical_office': '*We work throughout Granada without a physical office',
    'contact.form_title': 'Leave your details and we will call you',
    'contact.form_subtitle': 'Get your free valuation without commitment!',
    'contact.property_address': 'Property address',
    'contact.name': 'Name',
    'contact.surname': 'Surname',
    'contact.email': 'Email',
    'contact.phone': 'Phone',
    'contact.message': 'Message (optional)',
    'contact.privacy_text': 'I have read and accept the',
    'contact.privacy_policy': 'Privacy Policy',
    'contact.privacy_error': 'You must accept the privacy policy to send the form.',
    'contact.send_button': 'Send',
    'contact.form_sent': 'Form sent',
    'contact.form_sent_desc': 'We will contact you soon. Thank you for your interest!',
    'contact.whatsapp_message': 'Hello, I would like information about your real estate services.',
    
    // Favorites page
    'favorites.title': 'My Favorites',
    'favorites.clear_all': 'Clear all',
    'favorites.confirm_clear_title': 'Clear all favorites?',
    'favorites.confirm_clear_desc': 'This action will remove all properties from your favorites list. This action cannot be undone.',
    'favorites.cancel': 'Cancel',
    'favorites.delete_all': 'Delete all',
    'favorites.no_favorites': 'You have no properties saved as favorites yet.',
    'favorites.count_single': 'You have saved 1 property as favorite.',
    'favorites.count_multiple': 'You have saved {count} properties as favorites.',
    'favorites.empty_title': 'No saved favorites',
    'favorites.empty_desc': 'Start exploring properties and mark the ones you like as favorites.',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.language': 'Language:',
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
