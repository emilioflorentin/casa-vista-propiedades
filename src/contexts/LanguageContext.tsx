import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'es';

interface Translation {
  [key: string]: string | Translation;
}

interface Translations {
  [key: string]: Translation;
}

interface LanguageContextProps {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const translations: Translations = {
  es: {
    nav: {
      home: 'Inicio',
      properties: 'Propiedades',
      services: 'Servicios',
      about: 'Nosotros',
      contact: 'Contacto',
      favorites: 'Favoritos',
      account: 'Cuenta'
    },
    common: {
      language: 'Idioma',
      search: 'Buscar',
      address: 'Dirección',
      all: 'Todos',
      bedrooms: 'Habitaciones',
      bathrooms: 'Baños',
      area: 'Área',
      price: 'Precio',
      applyFilters: 'Aplicar filtros',
      resetFilters: 'Restablecer filtros',
      loadMore: 'Cargar más',
      noPropertiesFound: 'No se encontraron propiedades con los criterios de búsqueda actuales.',
      details: 'Detalles',
      description: 'Descripción',
      amenities: 'Comodidades',
      location: 'Ubicación',
      contactUs: 'Contáctanos',
      disclaimer: 'Descargo de responsabilidad',
      disclaimerText: 'La información sobre la propiedad se proporciona únicamente como guía y no constituye una oferta contractual. Todas las representaciones, incluidas las dimensiones, los detalles del plano y la disponibilidad, están sujetas a cambios y deben verificarse de forma independiente.',
      share: 'Compartir',
      addToFavorites: 'Añadir a favoritos',
      removeFromFavorites: 'Eliminar de favoritos',
      relatedProperties: 'Propiedades relacionadas',
      map: 'Mapa',
      streetView: 'Vista de calle',
      virtualTour: 'Tour virtual',
      scheduleVisit: 'Agendar visita',
      mortgageCalculator: 'Calculadora de hipoteca',
    },
    hero: {
      title: 'Encuentra tu hogar ideal',
      title_highlight: 'en la Costa Tropical',
      subtitle: 'Descubre las mejores propiedades en la Costa Tropical',
      searchPlaceholder: '¿Qué estás buscando?',
    },
    services: {
      title: 'Nuestros servicios',
      description: 'Ofrecemos una amplia gama de servicios para ayudarte a encontrar la propiedad perfecta.',
      propertyManagement: 'Gestión de propiedades',
      investmentAdvisory: 'Asesoramiento de inversión',
      legalAssistance: 'Asistencia legal',
      relocationServices: 'Servicios de reubicación',
    },
    features: {
      title: 'Características destacadas',
      modernDesign: 'Diseño moderno',
      primeLocation: 'Ubicación privilegiada',
      stunningViews: 'Vistas impresionantes',
      privatePool: 'Piscina privada',
      spaciousLayout: 'Distribución espaciosa',
      highQualityFinishes: 'Acabados de alta calidad',
    },
    testimonials: {
      title: 'Testimonios',
      johnDoe: 'Excelente servicio y atención personalizada. ¡Encontraron la casa de mis sueños!',
      janeSmith: 'Profesionales y muy atentos a nuestras necesidades. ¡Recomendables al 100%!',
    },
    contact: {
      title: 'Contáctanos',
      description: 'Ponte en contacto con nosotros para cualquier consulta o para agendar una visita.',
      name: 'Nombre',
      email: 'Correo electrónico',
      message: 'Mensaje',
      send: 'Enviar mensaje',
      address: 'Dirección',
      phone: 'Teléfono',
      emailAddress: 'Correo electrónico',
    },
    footer: {
      aboutUs: 'Acerca de nosotros',
      contactUs: 'Contáctanos',
      privacyPolicy: 'Política de privacidad',
      termsOfService: 'Términos de servicio',
      copyright: 'Derechos de autor © 2024 Nazarí Homes. Todos los derechos reservados.',
    },
    account: {
      login: 'Iniciar Sesión',
      register: 'Crear Cuenta',
      loginDescription: 'Accede a tu cuenta para continuar',
      registerDescription: 'Crea tu cuenta para comenzar',
      continueWithGoogle: 'Continuar con Google',
      registerWithGoogle: 'Registrarse con Google',
      or: 'o',
      fullName: 'Nombre completo',
      enterName: 'Ingresa tu nombre',
      email: 'Correo electrónico',
      enterEmail: 'Ingresa tu email',
      password: 'Contraseña',
      enterPassword: 'Ingresa tu contraseña',
      confirmPassword: 'Confirmar contraseña',
      confirmPasswordPlaceholder: 'Confirma tu contraseña',
      forgotPassword: '¿Olvidaste tu contraseña?',
      loginButton: 'Iniciar Sesión',
      registerButton: 'Crear Cuenta',
      noAccount: '¿No tienes cuenta?',
      hasAccount: '¿Ya tienes cuenta?',
      createAccount: 'Crear cuenta',
      loginHere: 'Inicia sesión aquí'
    },
    properties: {
      type_all: 'Todos',
      type_apartment: 'Apartamento',
      type_house: 'Casa',
      type_loft: 'Loft',
      type_studio: 'Estudio',
      managed_all: 'Todos',
      managed_nazari: 'Gestionado por Nazarí',
      managed_other: 'Otros',
      area_unit: ' m²',
      more: 'más',
      per_month: '/mes',
      view_details: 'Ver detalles',
      featured: 'Propiedades destacadas',
      featured_desc: 'Descubre nuestra selección de propiedades más exclusivas',
      search_results: 'Resultados de búsqueda',
      search_results_desc: 'Se encontraron {count} propiedades que coinciden con tus criterios'
    },
    search: {
      property_type: 'Tipo de propiedad',
      managed_by: 'Gestionado por',
      operation: 'Operación',
      operation_any: 'Cualquiera',
      operation_rent: 'Alquiler',
      operation_sale: 'Venta',
      search_btn: 'Buscar'
    },
    stats: {
      properties: 'Propiedades',
      clients: 'Clientes satisfechos',
      success_rate: 'Tasa de éxito'
    },
    about: {
      stats: {
        years: 'Años de experiencia',
        properties: 'Propiedades vendidas',
        clients: 'Clientes satisfechos',
        satisfaction: 'Satisfacción del cliente'
      }
    }
  },
  en: {
    nav: {
      home: 'Home',
      properties: 'Properties',
      services: 'Services',
      about: 'About',
      contact: 'Contact',
      favorites: 'Favorites',
      account: 'Account'
    },
    common: {
      language: 'Language',
      search: 'Search',
      address: 'Address',
      all: 'All',
      bedrooms: 'Bedrooms',
      bathrooms: 'Bathrooms',
      area: 'Area',
      price: 'Price',
      applyFilters: 'Apply filters',
      resetFilters: 'Reset filters',
      loadMore: 'Load more',
      noPropertiesFound: 'No properties found with the current search criteria.',
      details: 'Details',
      description: 'Description',
      amenities: 'Amenities',
      location: 'Location',
      contactUs: 'Contact us',
      disclaimer: 'Disclaimer',
      disclaimerText: 'Property information is provided as a guide only and does not constitute a contractual offer. All representations including dimensions, floor plan details and availability are subject to change and should be independently verified.',
      share: 'Share',
      addToFavorites: 'Add to favorites',
      removeFromFavorites: 'Remove from favorites',
      relatedProperties: 'Related properties',
      map: 'Map',
      streetView: 'Street View',
      virtualTour: 'Virtual Tour',
      scheduleVisit: 'Schedule Visit',
      mortgageCalculator: 'Mortgage Calculator',
    },
    hero: {
      title: 'Find your ideal home',
      title_highlight: 'on the Tropical Coast',
      subtitle: 'Discover the best properties on the Tropical Coast',
      searchPlaceholder: 'What are you looking for?',
    },
    services: {
      title: 'Our services',
      description: 'We offer a wide range of services to help you find the perfect property.',
      propertyManagement: 'Property Management',
      investmentAdvisory: 'Investment Advisory',
      legalAssistance: 'Legal Assistance',
      relocationServices: 'Relocation Services',
    },
    features: {
      title: 'Featured characteristics',
      modernDesign: 'Modern design',
      primeLocation: 'Prime location',
      stunningViews: 'Stunning views',
      privatePool: 'Private pool',
      spaciousLayout: 'Spacious layout',
      highQualityFinishes: 'High quality finishes',
    },
    testimonials: {
      title: 'Testimonials',
      johnDoe: 'Excellent service and personalized attention. They found the house of my dreams!',
      janeSmith: 'Professional and very attentive to our needs. 100% recommended!',
    },
    contact: {
      title: 'Contact us',
      description: 'Get in touch with us for any questions or to schedule a visit.',
      name: 'Name',
      email: 'Email',
      message: 'Message',
      send: 'Send message',
      address: 'Address',
      phone: 'Phone',
      emailAddress: 'Email Address',
    },
    footer: {
      aboutUs: 'About us',
      contactUs: 'Contact us',
      privacyPolicy: 'Privacy policy',
      termsOfService: 'Terms of service',
      copyright: 'Copyright © 2024 Nazarí Homes. All rights reserved.',
    },
    account: {
      login: 'Sign In',
      register: 'Create Account',
      loginDescription: 'Access your account to continue',
      registerDescription: 'Create your account to get started',
      continueWithGoogle: 'Continue with Google',
      registerWithGoogle: 'Sign up with Google',
      or: 'or',
      fullName: 'Full name',
      enterName: 'Enter your name',
      email: 'Email',
      enterEmail: 'Enter your email',
      password: 'Password',
      enterPassword: 'Enter your password',
      confirmPassword: 'Confirm password',
      confirmPasswordPlaceholder: 'Confirm your password',
      forgotPassword: 'Forgot your password?',
      loginButton: 'Sign In',
      registerButton: 'Create Account',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      createAccount: 'Create account',
      loginHere: 'Sign in here'
    },
    properties: {
      type_all: 'All',
      type_apartment: 'Apartment',
      type_house: 'House',
      type_loft: 'Loft',
      type_studio: 'Studio',
      managed_all: 'All',
      managed_nazari: 'Managed by Nazarí',
      managed_other: 'Others',
      area_unit: ' m²',
      more: 'more',
      per_month: '/month',
      view_details: 'View details',
      featured: 'Featured properties',
      featured_desc: 'Discover our selection of most exclusive properties',
      search_results: 'Search results',
      search_results_desc: 'Found {count} properties matching your criteria'
    },
    search: {
      property_type: 'Property type',
      managed_by: 'Managed by',
      operation: 'Operation',
      operation_any: 'Any',
      operation_rent: 'Rent',
      operation_sale: 'Sale',
      search_btn: 'Search'
    },
    stats: {
      properties: 'Properties',
      clients: 'Satisfied clients',
      success_rate: 'Success rate'
    },
    about: {
      stats: {
        years: 'Years of experience',
        properties: 'Properties sold',
        clients: 'Satisfied clients',
        satisfaction: 'Customer satisfaction'
      }
    }
  }
};

const LanguageContext = createContext<LanguageContextProps>({
  language: 'es',
  setLanguage: () => {},
  t: (key: string) => key,
});

interface LanguageProviderProps {
  children: ReactNode;
}

const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('es');

  const t = (key: string, params: Record<string, string | number> = {}): string => {
    const keys = key.split('.');
    let value: string | Translation | undefined = translations[language];

    for (const k of keys) {
      if (typeof value === 'object' && value !== null && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key "${key}" not found in ${language}`);
        return key;
      }
    }

    if (typeof value === 'string') {
      let translatedText = value;
      for (const paramKey in params) {
        translatedText = translatedText.replace(`{{${paramKey}}}`, String(params[paramKey]));
      }
      return translatedText;
    } else {
      console.warn(`Translation key "${key}" does not resolve to a string in ${language}`);
      return key;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

const useLanguage = () => {
  return useContext(LanguageContext);
};

export { LanguageProvider, useLanguage };
