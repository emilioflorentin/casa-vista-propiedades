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
      cancel: 'Cancelar',
      back: 'Volver'
    },
    hero: {
      title: 'Encuentra tu hogar ideal',
      title_highlight: 'en la Costa Tropical',
      subtitle: 'Descubre las mejores propiedades en la Costa Tropical',
      searchPlaceholder: '¿Qué estás buscando?',
    },
    search: {
      location_placeholder: 'Buscar por ubicación...',
      property_type: 'Tipo de propiedad',
      property_type_any: 'Cualquier tipo',
      property_type_apartment: 'Apartamento',
      property_type_house: 'Casa',
      property_type_loft: 'Loft',
      property_type_studio: 'Estudio',
      operation: 'Operación',
      operation_any: 'Cualquiera',
      operation_rent: 'Alquiler',
      operation_sale: 'Venta',
      managed_by: 'Gestionado por',
      managed_by_any: 'Cualquiera',
      managed_by_nazari: 'Nazarí Homes',
      managed_by_other: 'Otros',
      search_btn: 'Buscar'
    },
    location: {
      search_text: 'Buscar ubicación',
      search_location: 'Buscar por ubicación',
      search_by_location: 'Buscar por ubicación',
      search_address: 'Dirección',
      address_placeholder: 'Introduce una dirección...',
      search_radius: 'Radio de búsqueda',
      radius_500m: '500 metros',
      radius_1km: '1 kilómetro',
      radius_2km: '2 kilómetros',
      radius_5km: '5 kilómetros',
      radius_10km: '10 kilómetros',
      radius_10km_plus: '10+ kilómetros',
      my_location: 'Mi ubicación',
      apply_location: 'Aplicar ubicación'
    },
    stats: {
      properties: 'Propiedades disponibles',
      clients: 'Clientes satisfechos',
      success_rate: 'Tasa de éxito'
    },
    properties: {
      page_title: 'propiedades encontradas',
      search_placeholder: 'Buscar por título o ubicación...',
      results_subtitle: 'Encuentra la propiedad perfecta para ti',
      filters: 'Filtros',
      price_range: 'Rango de precio',
      min_bedrooms: 'Habitaciones mín.',
      min_bathrooms: 'Baños mín.',
      features: 'Características',
      heating: 'Calefacción',
      pool: 'Piscina',
      garage: 'Garaje',
      air_conditioning: 'Aire acondicionado',
      elevator: 'Ascensor',
      terrace: 'Terraza',
      garden: 'Jardín',
      any: 'Cualquiera',
      operation_all: 'Todas',
      type_all: 'Todos los tipos',
      managed_all: 'Todos',
      featured: 'Propiedades destacadas',
      featured_desc: 'Descubre nuestras mejores propiedades seleccionadas especialmente para ti',
      search_results: 'Resultados de búsqueda',
      search_results_desc: 'Se encontraron {count} propiedades que coinciden con tu búsqueda',
      show_featured: 'Ver propiedades destacadas',
      no_results: 'No se encontraron propiedades con los criterios seleccionados',
      view_all: 'Ver todas las propiedades',
      type_apartment: 'Apartamento',
      type_house: 'Casa',
      type_loft: 'Loft',
      type_studio: 'Estudio',
      managed_nazari: 'Gestionado por Nazarí',
      managed_other: 'Gestionado por terceros',
      area_unit: 'm²',
      more: 'más',
      per_month: '/mes',
      operation_rent: 'Alquiler',
      operation_sale: 'Venta',
      view_details: 'Ver detalles'
    },
    about: {
      title: 'Acerca de',
      title_highlight: 'Nazarí Homes',
      subtitle: 'Conoce más sobre nuestra empresa y nuestro compromiso contigo',
      our_story: 'Nuestra historia',
      story_p1: 'Nazarí Homes nació en 2009 con la visión de revolucionar el mercado inmobiliario en la Costa Tropical de Granada. Desde nuestros humildes comienzos, hemos crecido hasta convertirnos en una de las agencias inmobiliarias más respetadas y confiables de la región.',
      story_p2: 'Nuestra pasión por las propiedades excepcionales y nuestro compromiso con el servicio al cliente nos han permitido ayudar a miles de familias a encontrar su hogar ideal. Cada propiedad que gestionamos es tratada con el mismo cuidado y atención que si fuera nuestra propia casa.',
      our_values: 'Nuestros valores',
      values_desc: 'Los principios que nos guían en cada transacción y relación',
      commitment: {
        title: 'Compromiso',
        description: 'Nos comprometemos completamente con cada cliente, ofreciendo un servicio personalizado y dedicado.'
      },
      professionalism: {
        title: 'Profesionalismo',
        description: 'Mantenemos los más altos estándares profesionales en todas nuestras operaciones y relaciones.'
      },
      trust: {
        title: 'Confianza',
        description: 'Construimos relaciones duraderas basadas en la transparencia y la honestidad absoluta.'
      },
      excellence: {
        title: 'Excelencia',
        description: 'Buscamos la perfección en cada detalle, desde la presentación hasta el cierre de la venta.'
      },
      stats: {
        years: 'Años de experiencia',
        properties: 'Propiedades gestionadas',
        clients: 'Clientes satisfechos',
        satisfaction: 'Satisfacción del cliente'
      },
      our_team: 'Nuestro equipo',
      team_desc: 'Profesionales experimentados dedicados a hacer realidad tus sueños inmobiliarios',
      sales_team: {
        title: 'Equipo de ventas',
        description: 'Especialistas en ventas con años de experiencia en el mercado local, listos para encontrar la propiedad perfecta para ti.'
      },
      management_team: {
        title: 'Equipo de gestión',
        description: 'Expertos en gestión de propiedades que se encargan de mantener tus inversiones en perfectas condiciones.'
      },
      cta: {
        title: '¿Listo para encontrar tu hogar ideal?',
        description: 'Ponte en contacto con nosotros y descubre cómo podemos ayudarte',
        contact: 'Contáctanos',
        address: 'Calle Real 123, Motril, Granada'
      }
    },
    services: {
      title: 'Nuestros servicios',
      title_highlight: 'profesionales',
      subtitle: 'Ofrecemos servicios integrales para todas tus necesidades inmobiliarias',
      description: 'Ofrecemos una amplia gama de servicios para ayudarte a encontrar la propiedad perfecta.',
      propertyManagement: 'Gestión de propiedades',
      investmentAdvisory: 'Asesoramiento de inversión',
      legalAssistance: 'Asistencia legal',
      relocationServices: 'Servicios de reubicación',
      what_can_we_do: '¿Qué podemos hacer por ti?',
      what_can_we_do_desc: 'Descubre nuestros servicios especializados diseñados para cubrir todas tus necesidades',
      management: {
        title: 'Gestión integral de propiedades',
        description: 'Gestión completa de tu propiedad desde el primer día',
        feature1: 'Mantenimiento preventivo y correctivo',
        feature2: 'Gestión de inquilinos y contratos',
        feature3: 'Reportes mensuales detallados',
        feature4: 'Atención 24/7 para emergencias'
      },
      rental: {
        title: 'Alquiler de propiedades',
        description: 'Encuentra el inquilino perfecto para tu propiedad',
        feature1: 'Evaluación de solvencia de inquilinos',
        feature2: 'Marketing profesional de la propiedad',
        feature3: 'Gestión de visitas y negociación',
        feature4: 'Contratos legales y seguros'
      },
      legal: {
        title: 'Asesoramiento legal',
        description: 'Servicios legales especializados en inmobiliario',
        feature1: 'Revisión de contratos de compraventa',
        feature2: 'Gestión de hipotecas y financiación',
        feature3: 'Asesoramiento fiscal inmobiliario',
        feature4: 'Resolución de conflictos'
      },
      support: {
        title: 'Soporte 24/7',
        description: 'Estamos aquí cuando nos necesites',
        feature1: 'Atención telefónica permanente',
        feature2: 'Servicio de emergencias',
        feature3: 'Mantenimiento urgente',
        feature4: 'Consultas online'
      },
      tenants: {
        title: 'Servicios para inquilinos',
        description: 'Facilitamos tu experiencia como inquilino',
        feature1: 'Búsqueda personalizada de propiedades',
        feature2: 'Gestión de depósitos y garantías',
        feature3: 'Mantenimiento incluido',
        feature4: 'Comunicación directa con propietarios'
      },
      maintenance: {
        title: 'Mantenimiento especializado',
        description: 'Mantenemos tu propiedad en perfectas condiciones',
        feature1: 'Inspecciones regulares programadas',
        feature2: 'Reparaciones rápidas y eficientes',
        feature3: 'Red de profesionales cualificados',
        feature4: 'Presupuestos transparentes'
      },
      cta: {
        title: '¿Necesitas alguno de nuestros servicios?',
        description: 'Contacta con nosotros para una consulta personalizada y gratuita',
        contact_now: 'Contactar ahora',
        call_directly: 'Llamar directamente'
      }
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
      subtitle: 'Ponte en contacto con nosotros para cualquier consulta',
      description: 'Ponte en contacto con nosotros para cualquier consulta o para agendar una visita.',
      operation_area: 'Área de operación',
      operation_zone: 'Zona de operación',
      granada_province: 'Provincia de Granada',
      no_physical_office: 'No disponemos de oficina física, trabajamos visitando las propiedades',
      whatsapp_text: 'Contáctanos por WhatsApp',
      whatsapp_message: 'Hola, me gustaría obtener más información sobre sus servicios inmobiliarios.',
      form_title: 'Formulario de contacto',
      form_subtitle: 'Déjanos tu consulta y te responderemos lo antes posible',
      property_address: 'Dirección del inmueble',
      name: 'Nombre',
      surname: 'Apellidos',
      email: 'Correo electrónico',
      phone: 'Teléfono',
      message: 'Mensaje',
      privacy_text: 'Acepto el tratamiento de mis datos conforme a la',
      privacy_policy: 'política de privacidad',
      privacy_error: 'Debes aceptar la política de privacidad para continuar',
      form_sent: 'Formulario enviado',
      form_sent_desc: 'Tu mensaje ha sido enviado correctamente. Te responderemos en breve.',
      send_button: 'Enviar mensaje',
      send: 'Enviar mensaje',
      address: 'Dirección',
      emailAddress: 'Correo electrónico',
    },
    footer: {
      company_description: 'Nazarí Homes, tu agencia inmobiliaria de confianza en la Costa Tropical. Especialistas en venta y alquiler de propiedades excepcionales.',
      quick_links: 'Enlaces rápidos',
      services_section: 'Servicios',
      contact_section: 'Contacto',
      rental_properties: 'Propiedades en alquiler',
      sale_properties: 'Propiedades en venta',
      free_valuation: 'Valoración gratuita',
      legal_advice: 'Asesoramiento legal',
      address: 'Calle Real 123, Motril, Granada',
      phone: '+34 958 123 456',
      email: 'info@nazarihomes.com',
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
    // Property detail page translations
    property: {
      not_found: 'Propiedad no encontrada',
      back_to_properties: 'Volver a propiedades',
      apartment_description: 'Hermoso y moderno apartamento con todas las comodidades que necesitas para una vida cómoda.',
      house_description: 'Casa espaciosa con jardín, perfecta para familias que buscan comodidad y tranquilidad.',
      loft_description: 'Loft moderno con diseño industrial, ideal para quienes buscan un estilo de vida contemporáneo.',
      studio_description: 'Estudio acogedor y funcional, perfecto para jóvenes profesionales o estudiantes.',
      default_description: 'Excelente propiedad con grandes características y ubicación privilegiada.',
      wifi: 'WiFi',
      air_conditioning: 'Aire acondicionado',
      tv: 'TV',
      parking: 'Parking',
      per_month: '/mes',
      view_number: 'Vista {{number}}',
      reference: 'Ref',
      bedrooms: 'Habitaciones',
      bathrooms: 'Baños',
      area_label: 'Área',
      description: 'Descripción',
      location: 'Ubicación',
      area_info: 'Información del área',
      area_description: 'Excelente zona con todos los servicios cerca, bien comunicada por transporte público.',
      features: 'Características',
      elevator: 'Ascensor',
      balcony: 'Balcón',
      heating: 'Calefacción',
      terrace: 'Terraza',
      built_in_wardrobes: 'Armarios empotrados',
      equipped_kitchen: 'Cocina equipada',
      services: 'Servicios y comodidades',
      whatsapp_default_message: '¡Hola! Estoy interesado/a en la propiedad {{title}} (Ref: {{reference}}) ubicada en {{location}} por {{price}}. ¿Podrían proporcionarme más información?',
      quick_message_visit: '¡Hola! Estoy interesado/a en visitar la propiedad {{title}} (Ref: {{reference}}) en {{location}}.',
      quick_message_available: '¡Hola! ¿La propiedad Ref: {{reference}} sigue disponible por {{price}}?',
      quick_message_schedule: '¡Hola! Me gustaría agendar una visita para la propiedad Ref: {{reference}} en {{location}}.',
      quick_message_price_info: '¡Hola! ¿Podrían proporcionar más información sobre el precio {{price}} de la propiedad Ref: {{reference}}?',
      contact_agent: 'Contactar agente',
      call_agent: 'Llamar',
      schedule_visit: 'Agendar visita',
      whatsapp_chat: 'Chat WhatsApp',
      quick_messages: 'Mensajes rápidos',
      send_custom_message: 'Enviar mensaje personalizado',
      type_message: 'Escribe tu mensaje...',
      send_message: 'Enviar mensaje',
      property_reservation: 'Reserva de propiedad',
      full_name: 'Nombre completo',
      email: 'Correo electrónico',
      phone: 'Teléfono',
      dni: 'DNI/NIE',
      signed_contract: 'Contrato firmado (PDF)',
      upload_contract: 'Subir contrato',
      reserve_property: 'Reservar propiedad',
      contact_form: 'Formulario de contacto',
      your_name: 'Tu nombre',
      your_email: 'Tu email',
      your_phone: 'Tu teléfono',
      your_message: 'Tu mensaje',
      send_inquiry: 'Enviar consulta',
      agent_contact: 'Contacto del agente'
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
      cancel: 'Cancel',
      back: 'Back'
    },
    hero: {
      title: 'Find your ideal home',
      title_highlight: 'on the Tropical Coast',
      subtitle: 'Discover the best properties on the Tropical Coast',
      searchPlaceholder: 'What are you looking for?',
    },
    search: {
      location_placeholder: 'Search by location...',
      property_type: 'Property type',
      property_type_any: 'Any type',
      property_type_apartment: 'Apartment',
      property_type_house: 'House',
      property_type_loft: 'Loft',
      property_type_studio: 'Studio',
      operation: 'Operation',
      operation_any: 'Any',
      operation_rent: 'Rent',
      operation_sale: 'Sale',
      managed_by: 'Managed by',
      managed_by_any: 'Any',
      managed_by_nazari: 'Nazarí Homes',
      managed_by_other: 'Others',
      search_btn: 'Search'
    },
    location: {
      search_text: 'Search location',
      search_location: 'Search by location',
      search_by_location: 'Search by location',
      search_address: 'Address',
      address_placeholder: 'Enter an address...',
      search_radius: 'Search radius',
      radius_500m: '500 meters',
      radius_1km: '1 kilometer',
      radius_2km: '2 kilometers',
      radius_5km: '5 kilometers',
      radius_10km: '10 kilometers',
      radius_10km_plus: '10+ kilometers',
      my_location: 'My location',
      apply_location: 'Apply location'
    },
    stats: {
      properties: 'Available properties',
      clients: 'Satisfied clients',
      success_rate: 'Success rate'
    },
    properties: {
      page_title: 'properties found',
      search_placeholder: 'Search by title or location...',
      results_subtitle: 'Find the perfect property for you',
      filters: 'Filters',
      price_range: 'Price range',
      min_bedrooms: 'Min. bedrooms',
      min_bathrooms: 'Min. bathrooms',
      features: 'Features',
      heating: 'Heating',
      pool: 'Pool',
      garage: 'Garage',
      air_conditioning: 'Air conditioning',
      elevator: 'Elevator',
      terrace: 'Terrace',
      garden: 'Garden',
      any: 'Any',
      operation_all: 'All',
      type_all: 'All types',
      managed_all: 'All',
      featured: 'Featured properties',
      featured_desc: 'Discover our best properties specially selected for you',
      search_results: 'Search results',
      search_results_desc: 'Found {count} properties matching your search',
      show_featured: 'Show featured properties',
      no_results: 'No properties found with the selected criteria',
      view_all: 'View all properties',
      type_apartment: 'Apartment',
      type_house: 'House',
      type_loft: 'Loft',
      type_studio: 'Studio',
      managed_nazari: 'Managed by Nazarí',
      managed_other: 'Managed by third parties',
      area_unit: 'm²',
      more: 'more',
      per_month: '/month',
      operation_rent: 'Rent',
      operation_sale: 'Sale',
      view_details: 'View details'
    },
    about: {
      title: 'About',
      title_highlight: 'Nazarí Homes',
      subtitle: 'Learn more about our company and our commitment to you',
      our_story: 'Our story',
      story_p1: 'Nazarí Homes was born in 2009 with the vision of revolutionizing the real estate market on the Tropical Coast of Granada. From our humble beginnings, we have grown to become one of the most respected and trusted real estate agencies in the region.',
      story_p2: 'Our passion for exceptional properties and our commitment to customer service have allowed us to help thousands of families find their ideal home. Every property we manage is treated with the same care and attention as if it were our own home.',
      our_values: 'Our values',
      values_desc: 'The principles that guide us in every transaction and relationship',
      commitment: {
        title: 'Commitment',
        description: 'We are fully committed to each client, offering personalized and dedicated service.'
      },
      professionalism: {
        title: 'Professionalism',
        description: 'We maintain the highest professional standards in all our operations and relationships.'
      },
      trust: {
        title: 'Trust',
        description: 'We build lasting relationships based on transparency and absolute honesty.'
      },
      excellence: {
        title: 'Excellence',
        description: 'We seek perfection in every detail, from presentation to closing the sale.'
      },
      stats: {
        years: 'Years of experience',
        properties: 'Managed properties',
        clients: 'Satisfied clients',
        satisfaction: 'Customer satisfaction'
      },
      our_team: 'Our team',
      team_desc: 'Experienced professionals dedicated to making your real estate dreams come true',
      sales_team: {
        title: 'Sales team',
        description: 'Sales specialists with years of experience in the local market, ready to find the perfect property for you.'
      },
      management_team: {
        title: 'Management team',
        description: 'Property management experts who take care of keeping your investments in perfect condition.'
      },
      cta: {
        title: 'Ready to find your ideal home?',
        description: 'Contact us and discover how we can help you',
        contact: 'Contact us',
        address: 'Calle Real 123, Motril, Granada'
      }
    },
    services: {
      title: 'Our services',
      title_highlight: 'professional',
      subtitle: 'We offer comprehensive services for all your real estate needs',
      description: 'We offer a wide range of services to help you find the perfect property.',
      propertyManagement: 'Property Management',
      investmentAdvisory: 'Investment Advisory',
      legalAssistance: 'Legal Assistance',
      relocationServices: 'Relocation Services',
      what_can_we_do: 'What can we do for you?',
      what_can_we_do_desc: 'Discover our specialized services designed to cover all your needs',
      management: {
        title: 'Comprehensive property management',
        description: 'Complete management of your property from day one',
        feature1: 'Preventive and corrective maintenance',
        feature2: 'Tenant and contract management',
        feature3: 'Detailed monthly reports',
        feature4: '24/7 emergency assistance'
      },
      rental: {
        title: 'Property rental',
        description: 'Find the perfect tenant for your property',
        feature1: 'Tenant solvency assessment',
        feature2: 'Professional property marketing',
        feature3: 'Visit management and negotiation',
        feature4: 'Legal contracts and insurance'
      },
      legal: {
        title: 'Legal advice',
        description: 'Specialized legal services in real estate',
        feature1: 'Purchase agreement review',
        feature2: 'Mortgage and financing management',
        feature3: 'Real estate tax advice',
        feature4: 'Conflict resolution'
      },
      support: {
        title: '24/7 Support',
        description: 'We are here when you need us',
        feature1: 'Permanent phone assistance',
        feature2: 'Emergency service',
        feature3: 'Urgent maintenance',
        feature4: 'Online consultations'
      },
      tenants: {
        title: 'Tenant services',
        description: 'We facilitate your experience as a tenant',
        feature1: 'Personalized property search',
        feature2: 'Deposit and guarantee management',
        feature3: 'Maintenance included',
        feature4: 'Direct communication with owners'
      },
      maintenance: {
        title: 'Specialized maintenance',
        description: 'We keep your property in perfect condition',
        feature1: 'Scheduled regular inspections',
        feature2: 'Fast and efficient repairs',
        feature3: 'Network of qualified professionals',
        feature4: 'Transparent budgets'
      },
      cta: {
        title: 'Need any of our services?',
        description: 'Contact us for a personalized and free consultation',
        contact_now: 'Contact now',
        call_directly: 'Call directly'
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
      subtitle: 'Get in touch with us for any questions',
      description: 'Get in touch with us for any questions or to schedule a visit.',
      operation_area: 'Operation area',
      operation_zone: 'Operation zone',
      granada_province: 'Granada Province',
      no_physical_office: 'We do not have a physical office, we work by visiting properties',
      whatsapp_text: 'Contact us via WhatsApp',
      whatsapp_message: 'Hello, I would like to get more information about your real estate services.',
      form_title: 'Contact form',
      form_subtitle: 'Leave us your inquiry and we will respond as soon as possible',
      property_address: 'Property address',
      name: 'Name',
      surname: 'Surname',
      email: 'Email',
      phone: 'Phone',
      message: 'Message',
      privacy_text: 'I accept the processing of my data according to the',
      privacy_policy: 'privacy policy',
      privacy_error: 'You must accept the privacy policy to continue',
      form_sent: 'Form sent',
      form_sent_desc: 'Your message has been sent successfully. We will respond shortly.',
      send_button: 'Send message',
      send: 'Send message',
      address: 'Address',
      emailAddress: 'Email Address',
    },
    footer: {
      company_description: 'Nazarí Homes, your trusted real estate agency on the Tropical Coast. Specialists in sale and rental of exceptional properties.',
      quick_links: 'Quick links',
      services_section: 'Services',
      contact_section: 'Contact',
      rental_properties: 'Rental properties',
      sale_properties: 'Properties for sale',
      free_valuation: 'Free valuation',
      legal_advice: 'Legal advice',
      address: 'Calle Real 123, Motril, Granada',
      phone: '+34 958 123 456',
      email: 'info@nazarihomes.com',
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
    // Property detail page translations
    property: {
      not_found: 'Property not found',
      back_to_properties: 'Back to Properties',
      apartment_description: 'Beautiful and modern apartment with all the amenities you need for comfortable living.',
      house_description: 'Spacious house with garden, perfect for families looking for comfort and tranquility.',
      loft_description: 'Modern loft with industrial design, ideal for those seeking a contemporary lifestyle.',
      studio_description: 'Cozy and functional studio, perfect for young professionals or students.',
      default_description: 'Excellent property with great features and privileged location.',
      wifi: 'WiFi',
      air_conditioning: 'Air conditioning',
      tv: 'TV',
      parking: 'Parking',
      per_month: '/month',
      view_number: 'View {{number}}',
      reference: 'Ref',
      bedrooms: 'Bedrooms',
      bathrooms: 'Bathrooms',
      area_label: 'Area',
      description: 'Description',
      location: 'Location',
      area_info: 'Area Information',
      area_description: 'Excellent area with all services nearby, well connected by public transport.',
      features: 'Features',
      elevator: 'Elevator',
      balcony: 'Balcony',
      heating: 'Heating',
      terrace: 'Terrace',
      built_in_wardrobes: 'Built-in wardrobes',
      equipped_kitchen: 'Equipped kitchen',
      services: 'Services & Amenities',
      whatsapp_default_message: 'Hello! I\'m interested in the property {{title}} (Ref: {{reference}}) located in {{location}} for {{price}}. Could you provide me with more information?',
      quick_message_visit: 'Hello! I\'m interested in visiting the property {{title}} (Ref: {{reference}}) in {{location}}.',
      quick_message_available: 'Hello! Is the property Ref: {{reference}} still available for {{price}}?',
      quick_message_schedule: 'Hello! I would like to schedule a visit for the property Ref: {{reference}} in {{location}}.',
      quick_message_price_info: 'Hello! Could you provide more information about the price {{price}} for property Ref: {{reference}}?',
      contact_agent: 'Contact Agent',
      call_agent: 'Call',
      schedule_visit: 'Schedule Visit',
      whatsapp_chat: 'WhatsApp Chat',
      quick_messages: 'Quick Messages',
      send_custom_message: 'Send Custom Message',
      type_message: 'Type your message...',
      send_message: 'Send Message',
      property_reservation: 'Property Reservation',
      full_name: 'Full Name',
      email: 'Email',
      phone: 'Phone',
      dni: 'DNI/NIE',
      signed_contract: 'Signed Contract (PDF)',
      upload_contract: 'Upload Contract',
      reserve_property: 'Reserve Property',
      contact_form: 'Contact Form',
      your_name: 'Your Name',
      your_email: 'Your Email',
      your_phone: 'Your Phone',
      your_message: 'Your Message',
      send_inquiry: 'Send Inquiry',
      agent_contact: 'Agent Contact'
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