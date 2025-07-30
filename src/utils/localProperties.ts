// Utility functions for managing properties in localStorage
export interface LocalProperty {
  id: string;
  userHash: string;
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
  image?: string;
  features?: string[];
  description?: string;
  created_at: string;
}

const PROPERTIES_KEY = 'local_properties';

// Get all local properties
export const getLocalProperties = (): LocalProperty[] => {
  try {
    const stored = localStorage.getItem(PROPERTIES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading local properties:', error);
    return [];
  }
};

// Save a new property
export const saveLocalProperty = (property: Omit<LocalProperty, 'id' | 'created_at'>): LocalProperty => {
  const properties = getLocalProperties();
  
  const newProperty: LocalProperty = {
    ...property,
    id: Date.now().toString(),
    created_at: new Date().toISOString()
  };
  
  properties.push(newProperty);
  localStorage.setItem(PROPERTIES_KEY, JSON.stringify(properties));
  
  return newProperty;
};

// Update an existing property
export const updateLocalProperty = (id: string, updates: Partial<LocalProperty>): boolean => {
  const properties = getLocalProperties();
  const index = properties.findIndex(p => p.id === id);
  
  if (index === -1) return false;
  
  properties[index] = { ...properties[index], ...updates };
  localStorage.setItem(PROPERTIES_KEY, JSON.stringify(properties));
  
  return true;
};

// Delete a property
export const deleteLocalProperty = (id: string): boolean => {
  const properties = getLocalProperties();
  const filtered = properties.filter(p => p.id !== id);
  
  if (filtered.length === properties.length) return false;
  
  localStorage.setItem(PROPERTIES_KEY, JSON.stringify(filtered));
  return true;
};

// Get properties by user hash
export const getUserProperties = (userHash: string): LocalProperty[] => {
  const properties = getLocalProperties();
  return properties.filter(p => p.userHash === userHash);
};

// Generate unique reference number
export const generatePropertyReference = (): string => {
  const properties = getLocalProperties();
  const existingRefs = properties.map(p => p.reference);
  
  let newReference: string;
  do {
    const randomPart = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
    newReference = `901${randomPart}`;
  } while (existingRefs.includes(newReference));
  
  return newReference;
};