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
      cancel: 'Cancelar'
    },
    location: {
      search_text: 'Buscar por ubicación',
      search_location: 'Ubicación',
      search_by_location: 'Buscar por ubicación',
      search_address: 'Dirección',
      address_placeholder: 'Ingresa una dirección',
      search_radius: 'Radio de búsqueda',
      radius_500m: '500 metros',
      radius_1km: '1 kilómetro',
      radius_2km: '2 kilómetros',
      radius_5km: '5 kilómetros',
      radius_10km: '10 kilómetros',
      radius_10km_plus: 'Más de 10 km',
      my_location: 'Mi ubicación',
      apply_location: 'Aplicar ubicación',
      location_placeholder: 'Buscar ubicación...'
    },
    hero: {
      title: 'Encuentra tu hogar ideal',
      subtitle: 'Descubre las mejores propiedades',
      searchPlaceholder: '¿Qué estás buscando?',
    },
    services: {
      title: 'Nuestros servicios',
      title_highlight: 'profesionales',
      subtitle: 'Ofrecemos una amplia gama de servicios para ayudarte a encontrar la propiedad perfecta',
      description: 'Ofrecemos una amplia gama de servicios para ayudarte a encontrar la propiedad perfecta.',
      propertyManagement: 'Gestión de propiedades',
      investmentAdvisory: 'Asesoramiento de inversión',
      legalAssistance: 'Asistencia legal',
      relocationServices: 'Servicios de reubicación',
      what_can_we_do: '¿Qué podemos hacer por ti?',
      what_can_we_do_desc: 'Ofrecemos servicios integrales de gestión y alquiler de propiedades',
      management: {
        title: 'Gestión integral de propiedades',
        description: 'Nos encargamos de todos los aspectos de tu propiedad',
        feature1: 'Gestión completa de inquilinos',
        feature2: 'Mantenimiento y reparaciones',
        feature3: 'Cobro de rentas',
        feature4: 'Informes mensuales detallados'
      },
      rental: {
        title: 'Servicios de alquiler',
        description: 'Te ayudamos a encontrar inquilinos de calidad',
        feature1: 'Análisis de mercado',
        feature2: 'Marketing profesional',
        feature3: 'Verificación de inquilinos',
        feature4: 'Contratos legales'
      },
      legal: {
        title: 'Asesoría legal',
        description: 'Asesoramiento jurídico especializado',
        feature1: 'Contratos de alquiler',
        feature2: 'Desahucios si es necesario',
        feature3: 'Asesoría fiscal',
        feature4: 'Resolución de conflictos'
      },
      support: {
        title: 'Soporte 24/7',
        description: 'Atención al cliente cuando lo necesites',
        feature1: 'Atención telefónica',
        feature2: 'Emergencias',
        feature3: 'Portal online',
        feature4: 'App móvil'
      },
      tenants: {
        title: 'Servicios para inquilinos',
        description: 'Facilitamos la búsqueda de tu hogar ideal',
        feature1: 'Búsqueda personalizada',
        feature2: 'Visitas organizadas',
        feature3: 'Asesoramiento',
        feature4: 'Soporte post-mudanza'
      },
      maintenance: {
        title: 'Mantenimiento',
        description: 'Cuidamos tu propiedad como si fuera nuestra',
        feature1: 'Mantenimiento preventivo',
        feature2: 'Reparaciones urgentes',
        feature3: 'Red de profesionales',
        feature4: 'Presupuestos transparentes'
      },
      cta: {
        title: '¿Listo para empezar?',
        description: 'Contáctanos hoy y descubre cómo podemos ayudarte',
        contact_now: 'Contactar ahora',
        call_directly: 'Llamar directamente'
      }
    },
    about: {
      title: 'Sobre Nazarí Homes',
      title_highlight: 'Tu socio inmobiliario',
      subtitle: 'Conoce nuestra historia, valores y el equipo que hace posible tus sueños inmobiliarios',
      our_story: 'Nuestra historia',
      story_p1: 'Fundada en 2009, Nazarí Homes nació con la visión de revolucionar el mercado inmobiliario en la Costa Tropical. Con más de 15 años de experiencia, nos hemos convertido en la inmobiliaria de referencia en la zona.',
      story_p2: 'Nuestro compromiso con la excelencia y la satisfacción del cliente nos ha permitido ayudar a más de 5,000 familias a encontrar su hogar ideal, manteniendo una tasa de satisfacción del 98%.',
      our_values: 'Nuestros valores',
      values_desc: 'Los principios que guían nuestro trabajo diario',
      commitment: {
        title: 'Compromiso',
        description: 'Nos comprometemos al 100% con cada cliente y cada propiedad'
      },
      professionalism: {
        title: 'Profesionalismo',
        description: 'Trabajamos con los más altos estándares de calidad y ética'
      },
      trust: {
        title: 'Confianza',
        description: 'Construimos relaciones duraderas basadas en la transparencia'
      },
      excellence: {
        title: 'Excelencia',
        description: 'Buscamos la perfección en cada detalle de nuestro servicio'
      },
      our_team: 'Nuestro equipo',
      team_desc: 'Profesionales especializados al servicio de tus necesidades inmobiliarias',
      sales_team: {
        title: 'Equipo de ventas',
        description: 'Expertos en el mercado local con amplia experiencia en ventas y alquileres'
      },
      management_team: {
        title: 'Equipo de gestión',
        description: 'Especialistas en administración de propiedades y atención al cliente'
      },
      cta: {
        title: '¿Quieres conocernos?',
        description: 'Visítanos en nuestra oficina o contáctanos para una consulta gratuita',
        contact: 'Contactar',
        address: 'Calle Real 123, Granada'
      },
      stats: {
        years: 'Años de experiencia',
        properties: 'Propiedades vendidas',
        clients: 'Clientes satisfechos',
        satisfaction: 'Satisfacción del cliente'
      }
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
      company_description: 'Especialistas en propiedades de lujo en la Costa Tropical. Tu hogar ideal te espera.',
      quick_links: 'Enlaces rápidos',
      services_section: 'Servicios',
      contact_section: 'Contacto',
      rental_properties: 'Alquiler de propiedades',
      sale_properties: 'Venta de propiedades',
      free_valuation: 'Valoración gratuita',
      legal_advice: 'Asesoramiento legal',
      address: 'Calle Real 123, Granada, España',
      phone: '+34 958 123 456',
      email: 'info@nazarihomes.com'
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
      search_results_desc: 'Se encontraron {count} propiedades que coinciden con tus criterios',
      operation_rent: 'Alquiler',
      operation_sale: 'Venta'
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
      cancel: 'Cancel'
    },
    location: {
      search_text: 'Search by location',
      search_location: 'Location',
      search_by_location: 'Search by location',
      search_address: 'Address',
      address_placeholder: 'Enter an address',
      search_radius: 'Search radius',
      radius_500m: '500 meters',
      radius_1km: '1 kilometer',
      radius_2km: '2 kilometers',
      radius_5km: '5 kilometers',
      radius_10km: '10 kilometers',
      radius_10km_plus: 'More than 10 km',
      my_location: 'My location',
      apply_location: 'Apply location',
      location_placeholder: 'Search location...'
    },
    hero: {
      title: 'Find your ideal home',
      title_highlight: 'on the Tropical Coast',
      subtitle: 'Discover the best properties on the Tropical Coast',
      searchPlaceholder: 'What are you looking for?',
    },
    services: {
      title: 'Our services',
      title_highlight: 'professional',
      subtitle: 'We offer a wide range of services to help you find the perfect property',
      description: 'We offer a wide range of services to help you find the perfect property.',
      propertyManagement: 'Property Management',
      investmentAdvisory: 'Investment Advisory',
      legalAssistance: 'Legal Assistance',
      relocationServices: 'Relocation Services',
      what_can_we_do: 'What can we do for you?',
      what_can_we_do_desc: 'We offer comprehensive property management and rental services',
      management: {
        title: 'Comprehensive property management',
        description: 'We take care of all aspects of your property',
        feature1: 'Complete tenant management',
        feature2: 'Maintenance and repairs',
        feature3: 'Rent collection',
        feature4: 'Detailed monthly reports'
      },
      rental: {
        title: 'Rental services',
        description: 'We help you find quality tenants',
        feature1: 'Market analysis',
        feature2: 'Professional marketing',
        feature3: 'Tenant verification',
        feature4: 'Legal contracts'
      },
      legal: {
        title: 'Legal advisory',
        description: 'Specialized legal advice',
        feature1: 'Rental contracts',
        feature2: 'Evictions if necessary',
        feature3: 'Tax advice',
        feature4: 'Conflict resolution'
      },
      support: {
        title: '24/7 Support',
        description: 'Customer service when you need it',
        feature1: 'Phone support',
        feature2: 'Emergencies',
        feature3: 'Online portal',
        feature4: 'Mobile app'
      },
      tenants: {
        title: 'Tenant services',
        description: 'We facilitate finding your ideal home',
        feature1: 'Personalized search',
        feature2: 'Organized visits',
        feature3: 'Advice',
        feature4: 'Post-move support'
      },
      maintenance: {
        title: 'Maintenance',
        description: 'We care for your property as if it were ours',
        feature1: 'Preventive maintenance',
        feature2: 'Emergency repairs',
        feature3: 'Professional network',
        feature4: 'Transparent budgets'
      },
      cta: {
        title: 'Ready to start?',
        description: 'Contact us today and discover how we can help you',
        contact_now: 'Contact now',
        call_directly: 'Call directly'
      }
    },
    about: {
      title: 'About Nazarí Homes',
      title_highlight: 'Your real estate partner',
      subtitle: 'Learn about our history, values, and the team that makes your real estate dreams possible',
      our_story: 'Our story',
      story_p1: 'Founded in 2009, Nazarí Homes was born with the vision of revolutionizing the real estate market on the Tropical Coast. With over 15 years of experience, we have become the leading real estate agency in the area.',
      story_p2: 'Our commitment to excellence and customer satisfaction has allowed us to help more than 5,000 families find their ideal home, maintaining a 98% satisfaction rate.',
      our_values: 'Our values',
      values_desc: 'The principles that guide our daily work',
      commitment: {
        title: 'Commitment',
        description: 'We commit 100% to each client and each property'
      },
      professionalism: {
        title: 'Professionalism',
        description: 'We work with the highest standards of quality and ethics'
      },
      trust: {
        title: 'Trust',
        description: 'We build lasting relationships based on transparency'
      },
      excellence: {
        title: 'Excellence',
        description: 'We seek perfection in every detail of our service'
      },
      our_team: 'Our team',
      team_desc: 'Specialized professionals at the service of your real estate needs',
      sales_team: {
        title: 'Sales team',
        description: 'Local market experts with extensive experience in sales and rentals'
      },
      management_team: {
        title: 'Management team',
        description: 'Specialists in property administration and customer service'
      },
      cta: {
        title: 'Want to meet us?',
        description: 'Visit us at our office or contact us for a free consultation',
        contact: 'Contact',
        address: 'Real Street 123, Granada'
      },
      stats: {
        years: 'Years of experience',
        properties: 'Properties sold',
        clients: 'Satisfied clients',
        satisfaction: 'Customer satisfaction'
      }
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
      company_description: 'Luxury property specialists on the Tropical Coast. Your ideal home awaits.',
      quick_links: 'Quick links',
      services_section: 'Services',
      contact_section: 'Contact',
      rental_properties: 'Rental properties',
      sale_properties: 'Sale properties',
      free_valuation: 'Free valuation',
      legal_advice: 'Legal advice',
      address: 'Real Street 123, Granada, Spain',
      phone: '+34 958 123 456',
      email: 'info@nazarihomes.com'
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
      search_results_desc: 'Found {count} properties matching your criteria',
      operation_rent: 'Rent',
      operation_sale: 'Sale'
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
