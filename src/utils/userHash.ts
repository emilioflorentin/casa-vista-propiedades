// Utility functions for generating and managing user hashes
import { supabase } from '@/integrations/supabase/client';

// Generate a unique hash for a user based on their ID and email
export const generateUserHash = (userId: string, email: string): string => {
  const combinedString = `${userId}_${email}_${Date.now()}`;
  let hash = 0;
  
  for (let i = 0; i < combinedString.length; i++) {
    const char = combinedString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to positive hex string
  return Math.abs(hash).toString(36).toUpperCase();
};

// Get or create user hash
export const getUserHash = async (): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Check if hash exists in localStorage
    const storedHash = localStorage.getItem(`user_hash_${user.id}`);
    if (storedHash) {
      return storedHash;
    }

    // Generate new hash
    const newHash = generateUserHash(user.id, user.email || '');
    localStorage.setItem(`user_hash_${user.id}`, newHash);
    
    return newHash;
  } catch (error) {
    console.error('Error getting user hash:', error);
    return null;
  }
};

// Clear user hash (for logout)
export const clearUserHash = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      localStorage.removeItem(`user_hash_${user.id}`);
    }
  } catch (error) {
    console.error('Error clearing user hash:', error);
  }
};