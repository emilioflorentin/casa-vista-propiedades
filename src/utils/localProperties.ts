// Utility functions for managing properties in localStorage
export interface LocalProperty {
  id: string;
  userHash: string;
  userId?: string; // Add userId for direct profile lookup
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
  images?: string[];
  features?: string[];
  description?: string;
  is_rented?: boolean; // Add rented status field
  created_at: string;
  // Energy certificate fields
  energyConsumptionRating?: string;
  energyConsumptionValue?: number;
  energyEmissionsRating?: string;
  energyEmissionsValue?: number;
  // Contact phone for the property
  contactPhone?: string;
}

// Function to compress and resize images
const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

// Function to convert files to compressed base64 for localStorage storage
export const fileToBase64 = (file: File): Promise<string> => {
  // Check if it's an image file
  if (file.type.startsWith('image/')) {
    return compressImage(file);
  }
  
  // For non-image files, use regular base64 conversion
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Function to convert multiple files to base64
export const filesToBase64 = async (files: File[]): Promise<string[]> => {
  const promises = files.map(file => fileToBase64(file));
  return Promise.all(promises);
};

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

// Save a new property with images as base64
export const saveLocalProperty = async (
  property: Omit<LocalProperty, 'id' | 'created_at'>, 
  imageFiles?: File[]
): Promise<LocalProperty> => {
  const properties = getLocalProperties();
  
  let images: string[] = [];
  if (imageFiles && imageFiles.length > 0) {
    try {
      images = await filesToBase64(imageFiles);
    } catch (error) {
      console.error('Error processing images:', error);
      // Continue without images if there's an error
      images = [];
    }
  }
  
  const newProperty: LocalProperty = {
    ...property,
    images: images.length > 0 ? images : property.images,
    id: Date.now().toString(),
    is_rented: false, // Initialize as not rented
    created_at: new Date().toISOString()
  };
  
  try {
    properties.push(newProperty);
    localStorage.setItem(PROPERTIES_KEY, JSON.stringify(properties));
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new Error('No hay suficiente espacio en el navegador para guardar las imágenes. Intenta con imágenes más pequeñas o menos imágenes.');
    }
    throw error;
  }
  
  return newProperty;
};

// Update an existing property with optional image files
export const updateLocalProperty = async (
  id: string, 
  updates: Partial<LocalProperty>, 
  imageFiles?: File[]
): Promise<boolean> => {
  const properties = getLocalProperties();
  const index = properties.findIndex(p => p.id === id);
  
  if (index === -1) return false;
  
  let finalUpdates = { ...updates };
  if (imageFiles && imageFiles.length > 0) {
    const images = await filesToBase64(imageFiles);
    finalUpdates.images = images;
  }
  
  properties[index] = { ...properties[index], ...finalUpdates };
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

// Clear all local properties
export const clearAllLocalProperties = (): boolean => {
  try {
    localStorage.removeItem(PROPERTIES_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing local properties:', error);
    return false;
  }
};