import Cookies from 'js-cookie';

// Generate a unique identifier for each user/device
export const generateUserId = (): string => {
  return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
};

// Get or create a unique user ID
export const getUserId = (): string => {
  let userId = Cookies.get('user_id');
  
  if (!userId) {
    userId = generateUserId();
    // Set cookie to expire in 1 year
    Cookies.set('user_id', userId, { expires: 365, sameSite: 'strict' });
  }
  
  return userId;
};

// Clear user identification (for privacy/reset purposes)
export const clearUserId = (): void => {
  Cookies.remove('user_id');
};