
import { generateUniqueReference, getAllReferences } from '@/utils/referenceGenerator';

export interface Property {
  id: number;
  reference: string;
  title: string;
  type: "apartment" | "house" | "loft" | "studio";
  price: number;
  currency: string;
  operation: "rent" | "sale";
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  features?: string[];
  description?: string;
  managedBy: "nazari" | "other"; // New field for management
}

// Sample properties data with management information
const baseProperties: Omit<Property, 'reference'>[] = [
  {
    id: 1,
    title: "Moderno Apartamento en Centro",
    type: "apartment",
    price: 1200,
    currency: "EUR",
    operation: "rent",
    location: "Madrid Centro",
    bedrooms: 2,
    bathrooms: 1,
    area: 75,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3",
    features: ["Aire acondicionado", "Calefacción", "Ascensor", "Terraza"],
    description: "Hermoso apartamento completamente renovado en el corazón de Madrid.",
    managedBy: "nazari"
  },
  {
    id: 2,
    title: "Casa Familiar con Jardín",
    type: "house",
    price: 450000,
    currency: "EUR",
    operation: "sale",
    location: "Las Rozas, Madrid",
    bedrooms: 4,
    bathrooms: 3,
    area: 180,
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3",
    features: ["Jardín", "Garaje", "Piscina", "Calefacción"],
    description: "Espaciosa casa familiar con todas las comodidades.",
    managedBy: "other"
  },
  {
    id: 3,
    title: "Loft Industrial Reformado",
    type: "loft",
    price: 1800,
    currency: "EUR",
    operation: "rent",
    location: "Malasaña, Madrid",
    bedrooms: 1,
    bathrooms: 2,
    area: 95,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3",
    features: ["Aire acondicionado", "Terraza", "Ascensor"],
    description: "Único loft con diseño industrial en zona premium.",
    managedBy: "nazari"
  },
  {
    id: 4,
    title: "Estudio Céntrico",
    type: "studio",
    price: 800,
    currency: "EUR",
    operation: "rent",
    location: "Sol, Madrid",
    bedrooms: 1,
    bathrooms: 1,
    area: 40,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3",
    features: ["Aire acondicionado", "Calefacción"],
    description: "Perfecto estudio en ubicación privilegiada.",
    managedBy: "other"
  },
  {
    id: 5,
    title: "Apartamento de Lujo",
    type: "apartment",
    price: 2500,
    currency: "EUR",
    operation: "rent",
    location: "Salamanca, Madrid",
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3",
    features: ["Aire acondicionado", "Calefacción", "Ascensor", "Terraza", "Garaje"],
    description: "Elegante apartamento en el exclusivo barrio de Salamanca.",
    managedBy: "nazari"
  },
  {
    id: 6,
    title: "Chalet Independiente",
    type: "house",
    price: 750000,
    currency: "EUR",
    operation: "sale",
    location: "Pozuelo de Alarcón",
    bedrooms: 5,
    bathrooms: 4,
    area: 250,
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3",
    features: ["Jardín", "Garaje", "Piscina", "Calefacción", "Aire acondicionado"],
    description: "Impresionante chalet con todas las comodidades.",
    managedBy: "other"
  },
  // Nuevas propiedades en Granada y pueblos de Granada
  {
    id: 7,
    title: "Piso en el Centro de Granada",
    type: "apartment",
    price: 900,
    currency: "EUR",
    operation: "rent",
    location: "Granada",
    bedrooms: 2,
    bathrooms: 1,
    area: 80,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3",
    features: ["Aire acondicionado", "Calefacción", "Balcón"],
    description: "Apartamento céntrico con vistas a la Alhambra.",
    managedBy: "nazari"
  },
  {
    id: 8,
    title: "Casa con Vista al Mar",
    type: "house",
    price: 320000,
    currency: "EUR",
    operation: "sale",
    location: "Almuñécar, Granada",
    bedrooms: 3,
    bathrooms: 2,
    area: 140,
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3",
    features: ["Jardín", "Terraza", "Vista al mar", "Garaje"],
    description: "Hermosa casa costera con vistas espectaculares.",
    managedBy: "nazari"
  },
  {
    id: 9,
    title: "Apartamento Playa",
    type: "apartment",
    price: 1100,
    currency: "EUR",
    operation: "rent",
    location: "Motril, Granada",
    bedrooms: 2,
    bathrooms: 1,
    area: 70,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3",
    features: ["Aire acondicionado", "Terraza", "Cerca de la playa"],
    description: "Apartamento a solo 100m de la playa.",
    managedBy: "other"
  },
  {
    id: 10,
    title: "Casa Rural Tradicional",
    type: "house",
    price: 280000,
    currency: "EUR",
    operation: "sale",
    location: "Guadix, Granada",
    bedrooms: 4,
    bathrooms: 2,
    area: 160,
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3",
    features: ["Jardín", "Chimenea", "Bodega", "Patio"],
    description: "Auténtica casa andaluza con encanto tradicional.",
    managedBy: "other"
  }
];

// Generate references for all properties
const existingReferences: string[] = [];
export const allProperties: Property[] = baseProperties.map(property => {
  const reference = generateUniqueReference(existingReferences);
  existingReferences.push(reference);
  return {
    ...property,
    reference
  };
});

export const featuredProperties = allProperties.slice(0, 4);
