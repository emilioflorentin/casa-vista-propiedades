
// Utility function to generate unique property reference numbers
export const generateUniqueReference = (existingReferences: string[]): string => {
  let newReference: string;
  
  do {
    // Generate a 10-digit random number starting with 901
    const randomPart = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
    newReference = `901${randomPart}`;
  } while (existingReferences.includes(newReference));
  
  return newReference;
};

// Function to get all existing references from properties
export const getAllReferences = (properties: any[]): string[] => {
  return properties.map(property => property.reference);
};

// Function to validate if a reference is unique
export const isReferenceUnique = (reference: string, existingReferences: string[]): boolean => {
  return !existingReferences.includes(reference);
};
