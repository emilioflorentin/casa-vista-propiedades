import { generateUniqueReference, getAllReferences } from '../utils/referenceGenerator';

// Base properties without references
const baseProperties = [
  {
    id: 1,
    title: "Apartamento Moderno en el Centro",
    type: "apartment",
    price: 1200,
    currency: "€",
    operation: "rent" as const,
    location: "Madrid Centro",
    bedrooms: 2,
    bathrooms: 2,
    area: 85,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=300&fit=crop",
    features: ["Calefacción Central", "Aire Acondicionado", "Ascensor", "Balcón"]
  },
  {
    id: 2,
    title: "Casa Familiar con Jardín",
    type: "house",
    price: 450000,
    currency: "€",
    operation: "sale" as const,
    location: "Las Rozas, Madrid",
    bedrooms: 4,
    bathrooms: 3,
    area: 180,
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=500&h=300&fit=crop",
    features: ["Calefacción de Gas", "Jardín Privado", "Garaje", "Piscina", "Barbacoa"]
  },
  {
    id: 3,
    title: "Loft Industrial Reformado",
    type: "loft",
    price: 1800,
    currency: "€",
    operation: "rent" as const,
    location: "Malasaña, Madrid",
    bedrooms: 1,
    bathrooms: 1,
    area: 75,
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=500&h=300&fit=crop",
    features: ["Calefacción Eléctrica", "Techos Altos", "Suelo Radiante", "Terraza"]
  },
  {
    id: 4,
    title: "Ático con Terraza Panorámica",
    type: "apartment",
    price: 650000,
    currency: "€",
    operation: "sale" as const,
    location: "Salamanca, Madrid",
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=300&fit=crop",
    features: ["Calefacción Central", "Aire Acondicionado", "Terraza", "Ascensor", "Portero"]
  },
  {
    id: 5,
    title: "Estudio Luminoso Céntrico",
    type: "studio",
    price: 800,
    currency: "€",
    operation: "rent" as const,
    location: "Chueca, Madrid",
    bedrooms: 1,
    bathrooms: 1,
    area: 45,
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=500&h=300&fit=crop",
    features: ["Calefacción Eléctrica", "Amueblado", "Internet Incluido"]
  },
  {
    id: 6,
    title: "Chalet Independiente",
    type: "house",
    price: 850000,
    currency: "€",
    operation: "sale" as const,
    location: "Pozuelo de Alarcón",
    bedrooms: 5,
    bathrooms: 4,
    area: 250,
    image: "https://images.unsplash.com/photo-1448630360428-65456885c650?w=500&h=300&fit=crop",
    features: ["Calefacción de Gas", "Piscina", "Jardín Privado", "Garaje Doble", "Barbacoa", "Alarma"]
  },
  {
    id: 7,
    title: "Dúplex con Piscina Comunitaria",
    type: "apartment",
    price: 2200,
    currency: "€",
    operation: "rent" as const,
    location: "Chamberí, Madrid",
    bedrooms: 3,
    bathrooms: 2,
    area: 110,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&h=300&fit=crop",
    features: ["Calefacción Central", "Piscina Comunitaria", "Gimnasio", "Portero", "Ascensor"]
  },
  {
    id: 8,
    title: "Casa Adosada Reformada",
    type: "house",
    price: 320000,
    currency: "€",
    operation: "sale" as const,
    location: "Getafe, Madrid",
    bedrooms: 3,
    bathrooms: 2,
    area: 140,
    image: "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=500&h=300&fit=crop",
    features: ["Calefacción Individual", "Patio", "Garaje", "Trastero"]
  },
  {
    id: 9,
    title: "Loft Artístico en Barrio Cultural",
    type: "loft",
    price: 1500,
    currency: "€",
    operation: "rent" as const,
    location: "Lavapiés, Madrid",
    bedrooms: 2,
    bathrooms: 1,
    area: 90,
    image: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=500&h=300&fit=crop",
    features: ["Calefacción Eléctrica", "Techos Altos", "Terraza", "Amueblado"]
  },
  {
    id: 10,
    title: "Apartamento con Balcón",
    type: "apartment",
    price: 380000,
    currency: "€",
    operation: "sale" as const,
    location: "Retiro, Madrid",
    bedrooms: 2,
    bathrooms: 1,
    area: 70,
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&h=300&fit=crop",
    features: ["Calefacción Central", "Balcón", "Ascensor", "Orientación Sur"]
  },
  // Nuevas propiedades en Barcelona
  {
    id: 11,
    title: "Piso Modernista en El Eixample",
    type: "apartment",
    price: 2500,
    currency: "€",
    operation: "rent" as const,
    location: "Eixample, Barcelona",
    bedrooms: 4,
    bathrooms: 2,
    area: 140,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&h=300&fit=crop",
    features: ["Calefacción Central", "Aire Acondicionado", "Balcón", "Techos Altos", "Ascensor"]
  },
  {
    id: 12,
    title: "Casa con Vistas al Mar",
    type: "house",
    price: 780000,
    currency: "€",
    operation: "sale" as const,
    location: "Sitges, Barcelona",
    bedrooms: 3,
    bathrooms: 2,
    area: 160,
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&h=300&fit=crop",
    features: ["Calefacción de Gas", "Terraza", "Jardín Privado", "Piscina", "Garaje", "Vistas al Mar"]
  },
  {
    id: 13,
    title: "Estudio en el Barrio Gótico",
    type: "studio",
    price: 1200,
    currency: "€",
    operation: "rent" as const,
    location: "Ciutat Vella, Barcelona",
    bedrooms: 1,
    bathrooms: 1,
    area: 35,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=300&fit=crop",
    features: ["Calefacción Eléctrica", "Amueblado", "Internet Incluido", "Aire Acondicionado"]
  },
  // Propiedades en Valencia
  {
    id: 14,
    title: "Apartamento Cerca de la Playa",
    type: "apartment",
    price: 950,
    currency: "€",
    operation: "rent" as const,
    location: "Malvarosa, Valencia",
    bedrooms: 2,
    bathrooms: 1,
    area: 80,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=300&fit=crop",
    features: ["Calefacción Central", "Aire Acondicionado", "Terraza", "Cerca de la Playa"]
  },
  {
    id: 15,
    title: "Villa con Piscina Privada",
    type: "house",
    price: 520000,
    currency: "€",
    operation: "sale" as const,
    location: "Sagunto, Valencia",
    bedrooms: 4,
    bathrooms: 3,
    area: 200,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500&h=300&fit=crop",
    features: ["Calefacción de Gas", "Piscina", "Jardín Privado", "Garaje Doble", "Barbacoa", "Trastero"]
  },
  {
    id: 16,
    title: "Loft en el Centro Histórico",
    type: "loft",
    price: 1300,
    currency: "€",
    operation: "rent" as const,
    location: "Ciutat Vella, Valencia",
    bedrooms: 1,
    bathrooms: 1,
    area: 65,
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=500&h=300&fit=crop",
    features: ["Calefacción Eléctrica", "Techos Altos", "Amueblado", "Aire Acondicionado"]
  },
  // Propiedades en Sevilla
  {
    id: 17,
    title: "Cortijo Andaluz Restaurado",
    type: "house",
    price: 420000,
    currency: "€",
    operation: "sale" as const,
    location: "Carmona, Sevilla",
    bedrooms: 5,
    bathrooms: 3,
    area: 220,
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=500&h=300&fit=crop",
    features: ["Calefacción de Gas", "Piscina", "Jardín Privado", "Patio Andaluz", "Chimenea", "Bodega"]
  },
  {
    id: 18,
    title: "Apartamento en Triana",
    type: "apartment",
    price: 850,
    currency: "€",
    operation: "rent" as const,
    location: "Triana, Sevilla",
    bedrooms: 2,
    bathrooms: 1,
    area: 75,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=300&fit=crop",
    features: ["Calefacción Central", "Aire Acondicionado", "Balcón", "Ascensor"]
  },
  // Propiedades en Bilbao
  {
    id: 19,
    title: "Piso con Vistas a la Ría",
    type: "apartment",
    price: 1400,
    currency: "€",
    operation: "rent" as const,
    location: "Abando, Bilbao",
    bedrooms: 3,
    bathrooms: 2,
    area: 100,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&h=300&fit=crop",
    features: ["Calefacción Central", "Aire Acondicionado", "Balcón", "Vistas a la Ría", "Ascensor", "Garaje"]
  },
  {
    id: 20,
    title: "Casa Tradicional Vasca",
    type: "house",
    price: 380000,
    currency: "€",
    operation: "sale" as const,
    location: "Getxo, Bilbao",
    bedrooms: 4,
    bathrooms: 2,
    area: 150,
    image: "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=500&h=300&fit=crop",
    features: ["Calefacción de Gas", "Jardín Privado", "Garaje", "Trastero", "Chimenea"]
  },
  // Propiedades en Málaga
  {
    id: 21,
    title: "Apartamento con Terraza al Mar",
    type: "apartment",
    price: 1800,
    currency: "€",
    operation: "rent" as const,
    location: "Marbella, Málaga",
    bedrooms: 2,
    bathrooms: 2,
    area: 85,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=300&fit=crop",
    features: ["Calefacción Central", "Aire Acondicionado", "Terraza", "Piscina Comunitaria", "Cerca de la Playa"]
  },
  {
    id: 22,
    title: "Villa de Lujo en Primera Línea",
    type: "house",
    price: 1200000,
    currency: "€",
    operation: "sale" as const,
    location: "Estepona, Málaga",
    bedrooms: 6,
    bathrooms: 4,
    area: 300,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500&h=300&fit=crop",
    features: ["Calefacción Central", "Aire Acondicionado", "Piscina", "Jardín Privado", "Garaje Triple", "Vistas al Mar", "Jacuzzi"]
  },
  // Propiedades en Zaragoza
  {
    id: 23,
    title: "Piso Reformado en el Centro",
    type: "apartment",
    price: 180000,
    currency: "€",
    operation: "sale" as const,
    location: "Centro, Zaragoza",
    bedrooms: 3,
    bathrooms: 1,
    area: 90,
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&h=300&fit=crop",
    features: ["Calefacción Individual", "Aire Acondicionado", "Balcón", "Ascensor", "Reformado"]
  },
  {
    id: 24,
    title: "Casa Unifamiliar con Jardín",
    type: "house",
    price: 1100,
    currency: "€",
    operation: "rent" as const,
    location: "Casablanca, Zaragoza",
    bedrooms: 4,
    bathrooms: 2,
    area: 170,
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=500&h=300&fit=crop",
    features: ["Calefacción de Gas", "Jardín Privado", "Garaje", "Trastero", "Barbacoa"]
  },
  // Propiedades en Alicante
  {
    id: 25,
    title: "Apartamento Turístico Renovado",
    type: "apartment",
    price: 1050,
    currency: "€",
    operation: "rent" as const,
    location: "Playa San Juan, Alicante",
    bedrooms: 1,
    bathrooms: 1,
    area: 55,
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=500&h=300&fit=crop",
    features: ["Calefacción Eléctrica", "Aire Acondicionado", "Terraza", "Amueblado", "Wifi"]
  },
  {
    id: 26,
    title: "Chalet con Piscina y Vistas",
    type: "house",
    price: 390000,
    currency: "€",
    operation: "sale" as const,
    location: "Benidorm, Alicante",
    bedrooms: 3,
    bathrooms: 2,
    area: 130,
    image: "https://images.unsplash.com/photo-1448630360428-65456885c650?w=500&h=300&fit=crop",
    features: ["Calefacción Central", "Piscina", "Jardín Privado", "Garaje", "Terraza", "Vistas al Mar"]
  },
  // Propiedades económicas
  {
    id: 27,
    title: "Estudio Económico",
    type: "studio",
    price: 450,
    currency: "€",
    operation: "rent" as const,
    location: "Fuenlabrada, Madrid",
    bedrooms: 1,
    bathrooms: 1,
    area: 30,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=300&fit=crop",
    features: ["Calefacción Eléctrica", "Amueblado"]
  },
  {
    id: 28,
    title: "Piso de Inversión",
    type: "apartment",
    price: 95000,
    currency: "€",
    operation: "sale" as const,
    location: "Móstoles, Madrid",
    bedrooms: 2,
    bathrooms: 1,
    area: 60,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=300&fit=crop",
    features: ["Calefacción Individual", "Ascensor", "Para Reformar"]
  },
  // Propiedades de lujo
  {
    id: 29,
    title: "Ático de Lujo con Spa Privado",
    type: "apartment",
    price: 4500,
    currency: "€",
    operation: "rent" as const,
    location: "La Moraleja, Madrid",
    bedrooms: 4,
    bathrooms: 3,
    area: 200,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&h=300&fit=crop",
    features: ["Calefacción Central", "Aire Acondicionado", "Terraza", "Jacuzzi", "Sauna", "Gimnasio Privado", "Portero 24h"]
  },
  {
    id: 30,
    title: "Mansión Histórica Restaurada",
    type: "house",
    price: 2800000,
    currency: "€",
    operation: "sale" as const,
    location: "Pedralbes, Barcelona",
    bedrooms: 8,
    bathrooms: 6,
    area: 500,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500&h=300&fit=crop",
    features: ["Calefacción Central", "Aire Acondicionado", "Piscina", "Jardín Privado", "Garaje Triple", "Bodega", "Biblioteca", "Sala de Cine"]
  }
];

// Generate unique references for all properties
const generatePropertiesWithReferences = () => {
  const existingReferences: string[] = [];
  
  return baseProperties.map(property => {
    const reference = generateUniqueReference(existingReferences);
    existingReferences.push(reference);
    
    return {
      ...property,
      reference
    };
  });
};

// Export properties with generated unique references
export const allProperties = generatePropertiesWithReferences();

// The first 4 properties are featured
export const featuredProperties = allProperties.slice(0, 4);

// Function to add a new property with unique reference
export const addNewProperty = (propertyData: Omit<typeof allProperties[0], 'reference'>) => {
  const existingReferences = getAllReferences(allProperties);
  const newReference = generateUniqueReference(existingReferences);
  
  return {
    ...propertyData,
    reference: newReference
  };
};
