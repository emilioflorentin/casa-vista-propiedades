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
    'hero.title': 'Encuentra tu',
    'hero.title_highlight': 'Hogar Perfecto',
    'hero.subtitle': 'Miles de propiedades en alquiler y venta te esperan. Descubre tu próximo hogar con nosotros.',
    
    // Search form
    'search.location_placeholder': '¿Dónde buscas?',
    'search.property_type': 'Tipo de propiedad',
    'search.property_type_any': 'Cualquiera',
    'search.property_type_apartment': 'Apartamento',
    'search.property_type_house': 'Casa',
    'search.property_type_loft': 'Loft',
    'search.property_type_studio': 'Estudio',
    'search.operation': 'Alquiler o Venta',
    'search.operation_any': 'Cualquiera',
    'search.operation_rent': 'Alquiler',
    'search.operation_sale': 'Venta',
    'search.managed_by': 'Gestionada por',
    'search.managed_by_any': 'Cualquiera',
    'search.managed_by_nazari': 'Nazarí Homes',
    'search.managed_by_other': 'Otras Inmobiliarias',
    'search.search_btn': 'Buscar',
    'search.location': 'Ubicación',
    'search.type': 'Tipo de Propiedad',
    'search.type_all': 'Todos los tipos',
    'search.type_villa': 'Villa',
    'search.type_penthouse': 'Ático',
    'search.type_townhouse': 'Casa adosada',
    'search.price': 'Precio',
    'search.price_all': 'Cualquier precio',
    'search.bedrooms': 'Dormitorios',
    'search.bedrooms_all': 'Cualquier número',
    'search.clear_btn': 'Limpiar filtros',
    
    // Stats section
    'stats.properties': 'Propiedades Disponibles',
    'stats.clients': 'Clientes Satisfechos',
    'stats.success_rate': 'Tasa de Éxito',
    
    // Properties section
    'properties.search_results': 'Resultados de Búsqueda',
    'properties.featured': 'Propiedades Destacadas',
    'properties.search_results_desc': 'Encontradas {count} propiedades que coinciden con tu búsqueda',
    'properties.featured_desc': 'Descubre nuestra selección de las mejores propiedades disponibles',
    'properties.show_featured': 'Ver Propiedades Destacadas',
    'properties.no_results': 'No se encontraron propiedades que coincidan con tu búsqueda',
    'properties.view_all': 'Ver Todas las Propiedades',
    'properties.latest': 'Últimas Propiedades',
    'properties.no_results_desc': 'Intenta ajustar tus filtros de búsqueda para encontrar más opciones.',
    
    // Property card
    'property.bedrooms': 'dormitorios',
    'property.bathrooms': 'baños',
    'property.area': 'm²',
    'property.view_details': 'Ver detalles',
    
    // Services page
    'services.title': 'Nuestros',
    'services.title_highlight': 'Servicios',
    'services.subtitle': 'Ofrecemos una gama completa de servicios inmobiliarios para hacer que tu experiencia sea perfecta',
    'services.what_can_we_do': '¿Qué Podemos Hacer por Ti?',
    'services.what_can_we_do_desc': 'Desde la gestión completa hasta servicios específicos, adaptamos nuestros servicios a tus necesidades',
    'services.management.title': 'Gestión Inmobiliaria Integral',
    'services.management.description': 'Administramos tu propiedad de manera completa, desde el marketing hasta la entrega de llaves.',
    'services.management.feature1': 'Marketing profesional',
    'services.management.feature2': 'Selección de inquilinos',
    'services.management.feature3': 'Gestión de contratos',
    'services.management.feature4': 'Mantenimiento',
    'services.rental.title': 'Alquiler y Venta',
    'services.rental.description': 'Servicios especializados tanto para alquiler como venta de propiedades residenciales y comerciales.',
    'services.rental.feature1': 'Valoración gratuita',
    'services.rental.feature2': 'Fotografía profesional',
    'services.rental.feature3': 'Publicación en portales',
    'services.rental.feature4': 'Visitas guiadas',
    'services.legal.title': 'Asesoramiento Legal',
    'services.legal.description': 'Te acompañamos en todos los aspectos legales de tu transacción inmobiliaria.',
    'services.legal.feature1': 'Revisión de contratos',
    'services.legal.feature2': 'Gestión de documentos',
    'services.legal.feature3': 'Asesoría fiscal',
    'services.legal.feature4': 'Tramitación legal',
    'services.support.title': 'Atención 24/7',
    'services.support.description': 'Nuestro equipo está disponible para resolver cualquier incidencia en cualquier momento.',
    'services.support.feature1': 'Soporte continuo',
    'services.support.feature2': 'Emergencias',
    'services.support.feature3': 'Comunicación directa',
    'services.support.feature4': 'Respuesta inmediata',
    'services.tenants.title': 'Gestión de Inquilinos',
    'services.tenants.description': 'Nos encargamos de toda la relación con los inquilinos para que no tengas que preocuparte.',
    'services.tenants.feature1': 'Selección rigurosa',
    'services.tenants.feature2': 'Cobro de rentas',
    'services.tenants.feature3': 'Resolución de incidencias',
    'services.tenants.feature4': 'Comunicación directa',
    'services.maintenance.title': 'Mantenimiento y Reformas',
    'services.maintenance.description': 'Mantenemos tu propiedad en perfecto estado con nuestro equipo de profesionales.',
    'services.maintenance.feature1': 'Mantenimiento preventivo',
    'services.maintenance.feature2': 'Reparaciones urgentes',
    'services.maintenance.feature3': 'Reformas integrales',
    'services.maintenance.feature4': 'Control de calidad',
    'services.cta.title': '¿Listo para Empezar?',
    'services.cta.description': 'Contacta con nosotros y descubre cómo podemos ayudarte con tu propiedad',
    'services.cta.contact_now': 'Contactar Ahora',
    'services.cta.call_directly': 'Llamar Directamente',
    
    // About page
    'about.title': 'Quiénes',
    'about.title_highlight': 'Somos',
    'about.subtitle': 'Más de 15 años ayudando a encontrar el hogar perfecto en Granada y toda Andalucía',
    'about.our_story': 'Nuestra Historia',
    'about.story_p1': 'Nazarí Homes nació en 2009 con una visión clara: revolucionar el sector inmobiliario en Granada ofreciendo un servicio personalizado, transparente y de máxima calidad. Comenzamos como una pequeña empresa familiar y hemos crecido hasta convertirnos en una de las inmobiliarias de referencia en Andalucía.',
    'about.story_p2': 'Nuestro nombre rinde homenaje al Reino Nazarí de Granada, reflejando nuestro profundo amor por esta ciudad y nuestro compromiso con su patrimonio arquitectónico y cultural. Cada propiedad que gestionamos es tratada con el mismo cuidado y atención al detalle que caracterizaba a los maestros constructores nazaríes.',
    'about.stats.years': 'Años de Experiencia',
    'about.stats.properties': 'Propiedades Gestionadas',
    'about.stats.clients': 'Clientes Satisfechos',
    'about.stats.satisfaction': 'Tasa de Satisfacción',
    'about.our_values': 'Nuestros Valores',
    'about.values_desc': 'Los principios que guían cada una de nuestras acciones y decisiones',
    'about.commitment.title': 'Compromiso',
    'about.commitment.description': 'Nos comprometemos al 100% con cada cliente y cada propiedad que gestionamos.',
    'about.professionalism.title': 'Profesionalidad',
    'about.professionalism.description': 'Aplicamos los más altos estándares de calidad en todos nuestros servicios.',
    'about.trust.title': 'Confianza',
    'about.trust.description': 'Construimos relaciones duraderas basadas en la transparencia y honestidad.',
    'about.excellence.title': 'Excelencia',
    'about.excellence.description': 'Buscamos la excelencia en cada detalle para superar las expectativas.',
    'about.our_team': 'Nuestro Equipo',
    'about.team_desc': 'Profesionales apasionados por el sector inmobiliario',
    'about.sales_team.title': 'Equipo Comercial',
    'about.sales_team.description': 'Nuestros agentes comerciales tienen años de experiencia en el mercado local y conocen cada barrio de Granada como la palma de su mano.',
    'about.management_team.title': 'Equipo de Gestión',
    'about.management_team.description': 'Nuestro equipo de gestión se encarga de que todo funcione perfectamente, desde el mantenimiento hasta la atención al cliente.',
    'about.cta.title': '¿Quieres Conocernos Mejor?',
    'about.cta.description': 'Ven a visitarnos a nuestra oficina en Granada o contacta con nosotros',
    'about.cta.contact': 'Contactar',
    'about.cta.address': 'Calle Real de la Alhambra, 15 - Granada',
    
    // Footer
    'footer.company_description': 'Tu partner de confianza para encontrar la propiedad perfecta. Más de 10 años de experiencia en el sector inmobiliario.',
    'footer.quick_links': 'Enlaces Rápidos',
    'footer.services_section': 'Servicios',
    'footer.rental_properties': 'Alquiler de Propiedades',
    'footer.sale_properties': 'Venta de Propiedades',
    'footer.free_valuation': 'Tasación Gratuita',
    'footer.legal_advice': 'Asesoría Legal',
    'footer.contact_section': 'Contacto',
    'footer.address': 'Calle Gran Vía 123, Madrid',
    'footer.phone': '+34 91 123 45 67',
    'footer.email': 'nazarihomesgranada@gmail.com',
    'footer.copyright': '© 2025 Nazarí Homes. Todos los derechos reservados.',
    
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
    'hero.title': 'Find your',
    'hero.title_highlight': 'Perfect Home',
    'hero.subtitle': 'Thousands of rental and sale properties await you. Discover your next home with us.',
    
    // Search form
    'search.location_placeholder': 'Where are you looking?',
    'search.property_type': 'Property Type',
    'search.property_type_any': 'Any',
    'search.property_type_apartment': 'Apartment',
    'search.property_type_house': 'House',
    'search.property_type_loft': 'Loft',
    'search.property_type_studio': 'Studio',
    'search.operation': 'Rent or Sale',
    'search.operation_any': 'Any',
    'search.operation_rent': 'Rent',
    'search.operation_sale': 'Sale',
    'search.managed_by': 'Managed by',
    'search.managed_by_any': 'Any',
    'search.managed_by_nazari': 'Nazarí Homes',
    'search.managed_by_other': 'Other Agencies',
    'search.search_btn': 'Search',
    'search.location': 'Location',
    'search.type': 'Property Type',
    'search.type_all': 'All types',
    'search.type_villa': 'Villa',
    'search.type_penthouse': 'Penthouse',
    'search.type_townhouse': 'Townhouse',
    'search.price': 'Price',
    'search.price_all': 'Any price',
    'search.bedrooms': 'Bedrooms',
    'search.bedrooms_all': 'Any number',
    'search.clear_btn': 'Clear filters',
    
    // Stats section
    'stats.properties': 'Available Properties',
    'stats.clients': 'Satisfied Clients',
    'stats.success_rate': 'Success Rate',
    
    // Properties section
    'properties.search_results': 'Search Results',
    'properties.featured': 'Featured Properties',
    'properties.search_results_desc': 'Found {count} properties matching your search',
    'properties.featured_desc': 'Discover our selection of the best available properties',
    'properties.show_featured': 'View Featured Properties',
    'properties.no_results': 'No properties found matching your search',
    'properties.view_all': 'View All Properties',
    'properties.latest': 'Latest Properties',
    'properties.no_results_desc': 'Try adjusting your search filters to find more options.',
    
    // Property card
    'property.bedrooms': 'bedrooms',
    'property.bathrooms': 'bathrooms',
    'property.area': 'm²',
    'property.view_details': 'View details',
    
    // Services page
    'services.title': 'Our',
    'services.title_highlight': 'Services',
    'services.subtitle': 'We offer a complete range of real estate services to make your experience perfect',
    'services.what_can_we_do': 'What We Can Do for You?',
    'services.what_can_we_do_desc': 'From complete management to specific services, we adapt our services to your needs',
    'services.management.title': 'Comprehensive Property Management',
    'services.management.description': 'We manage your property completely, from marketing to key handover.',
    'services.management.feature1': 'Professional marketing',
    'services.management.feature2': 'Tenant selection',
    'services.management.feature3': 'Contract management',
    'services.management.feature4': 'Maintenance',
    'services.rental.title': 'Rental and Sales',
    'services.rental.description': 'Specialized services for both rental and sale of residential and commercial properties.',
    'services.rental.feature1': 'Free valuation',
    'services.rental.feature2': 'Professional photography',
    'services.rental.feature3': 'Portal publication',
    'services.rental.feature4': 'Guided tours',
    'services.legal.title': 'Legal Advisory',
    'services.legal.description': 'We accompany you in all legal aspects of your real estate transaction.',
    'services.legal.feature1': 'Contract review',
    'services.legal.feature2': 'Document management',
    'services.legal.feature3': 'Tax advisory',
    'services.legal.feature4': 'Legal processing',
    'services.support.title': '24/7 Support',
    'services.support.description': 'Our team is available to resolve any issue at any time.',
    'services.support.feature1': 'Continuous support',
    'services.support.feature2': 'Emergencies',
    'services.support.feature3': 'Direct communication',
    'services.support.feature4': 'Immediate response',
    'services.tenants.title': 'Tenant Management',
    'services.tenants.description': 'We take care of the entire relationship with tenants so you don\'t have to worry.',
    'services.tenants.feature1': 'Rigorous selection',
    'services.tenants.feature2': 'Rent collection',
    'services.tenants.feature3': 'Issue resolution',
    'services.tenants.feature4': 'Direct communication',
    'services.maintenance.title': 'Maintenance and Renovations',
    'services.maintenance.description': 'We keep your property in perfect condition with our team of professionals.',
    'services.maintenance.feature1': 'Preventive maintenance',
    'services.maintenance.feature2': 'Emergency repairs',
    'services.maintenance.feature3': 'Complete renovations',
    'services.maintenance.feature4': 'Quality control',
    'services.cta.title': 'Ready to Get Started?',
    'services.cta.description': 'Contact us and discover how we can help you with your property',
    'services.cta.contact_now': 'Contact Now',
    'services.cta.call_directly': 'Call Directly',
    
    // About page
    'about.title': 'About',
    'about.title_highlight': 'Us',
    'about.subtitle': 'Over 15 years helping to find the perfect home in Granada and all of Andalusia',
    'about.our_story': 'Our Story',
    'about.story_p1': 'Nazarí Homes was born in 2009 with a clear vision: to revolutionize the real estate sector in Granada by offering personalized, transparent and maximum quality service. We started as a small family business and have grown to become one of the reference real estate agencies in Andalusia.',
    'about.story_p2': 'Our name pays tribute to the Nasrid Kingdom of Granada, reflecting our deep love for this city and our commitment to its architectural and cultural heritage. Each property we manage is treated with the same care and attention to detail that characterized the Nasrid master builders.',
    'about.stats.years': 'Years of Experience',
    'about.stats.properties': 'Properties Managed',
    'about.stats.clients': 'Satisfied Clients',
    'about.stats.satisfaction': 'Satisfaction Rate',
    'about.our_values': 'Our Values',
    'about.values_desc': 'The principles that guide each of our actions and decisions',
    'about.commitment.title': 'Commitment',
    'about.commitment.description': 'We commit 100% to each client and each property we manage.',
    'about.professionalism.title': 'Professionalism',
    'about.professionalism.description': 'We apply the highest quality standards in all our services.',
    'about.trust.title': 'Trust',
    'about.trust.description': 'We build lasting relationships based on transparency and honesty.',
    'about.excellence.title': 'Excellence',
    'about.excellence.description': 'We seek excellence in every detail to exceed expectations.',
    'about.our_team': 'Our Team',
    'about.team_desc': 'Professionals passionate about real estate',
    'about.sales_team.title': 'Sales Team',
    'about.sales_team.description': 'Our sales agents have years of experience in the local market and know every neighborhood in Granada like the back of their hand.',
    'about.management_team.title': 'Management Team',
    'about.management_team.description': 'Our management team ensures everything runs perfectly, from maintenance to customer service.',
    'about.cta.title': 'Want to Know Us Better?',
    'about.cta.description': 'Come visit us at our office in Granada or contact us',
    'about.cta.contact': 'Contact',
    'about.cta.address': 'Calle Real de la Alhambra, 15 - Granada',
    
    // Footer
    'footer.company_description': 'Your trusted partner to find the perfect property. Over 10 years of experience in the real estate sector.',
    'footer.quick_links': 'Quick Links',
    'footer.services_section': 'Services',
    'footer.rental_properties': 'Property Rentals',
    'footer.sale_properties': 'Property Sales',
    'footer.free_valuation': 'Free Valuation',
    'footer.legal_advice': 'Legal Advisory',
    'footer.contact_section': 'Contact',
    'footer.address': 'Gran Vía Street 123, Madrid',
    'footer.phone': '+34 91 123 45 67',
    'footer.email': 'nazarihomesgranada@gmail.com',
    'footer.copyright': '© 2025 Nazarí Homes. All rights reserved.',
    
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
