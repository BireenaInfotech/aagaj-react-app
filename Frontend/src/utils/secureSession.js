/**
 * 🔐 Secure Session Management Utility
 * Centralized security practices for handling user sessions and sensitive data
 */

/**
 * Store user session data securely
 * @param {Object} userData - User object from login response
 * @param {Object} sessionData - Session metadata from login response
 * @param {string} userType - Type of user ('admin' or 'employee')
 */
export const storeSessionSecurely = (userData, sessionData, userType = 'admin') => {
  try {
    // Use sessionStorage (cleared on browser close) instead of localStorage
    sessionStorage.setItem('loggedInUser', userType);
    sessionStorage.setItem(`${userType}Email`, userData.email);
    sessionStorage.setItem(
      `${userType}Data`,
      JSON.stringify({
        id: userData.id,
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        role: userData.role
      })
    );
    sessionStorage.setItem('loginTime', new Date().toISOString());
    
    // Log session creation for audit
    console.log(`[SECURITY] Session created for ${userType} at ${new Date().toISOString()}`);
    
    return true;
  } catch (error) {
    console.error('[SECURITY] Failed to store session:', error);
    return false;
  }
};

/**
 * Retrieve user session data
 * @param {string} userType - Type of user ('admin' or 'employee')
 * @returns {Object|null} User data or null if not found
 */
export const getSessionData = (userType = 'admin') => {
  try {
    const data = sessionStorage.getItem(`${userType}Data`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('[SECURITY] Failed to retrieve session:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @param {string} userType - Type of user ('admin' or 'employee')
 * @returns {boolean} True if authenticated, false otherwise
 */
export const isAuthenticated = (userType = 'admin') => {
  return !!sessionStorage.getItem('loggedInUser') && !!getSessionData(userType);
};

/**
 * Clear all session data securely (on logout)
 * @param {string|string[]} userTypes - User type(s) to clear ('admin', 'employee', or both)
 */
export const clearSessionSecurely = (userTypes = 'admin') => {
  try {
    const types = Array.isArray(userTypes) ? userTypes : [userTypes];
    
    // Clear user-specific data
    types.forEach(type => {
      sessionStorage.removeItem('loggedInUser');
      sessionStorage.removeItem(`${type}Email`);
      sessionStorage.removeItem(`${type}Data`);
    });
    
    // Clear general session data
    sessionStorage.removeItem('loginTime');
    
    // Log session termination for audit
    console.log(`[SECURITY] Session cleared at ${new Date().toISOString()}`);
    
    return true;
  } catch (error) {
    console.error('[SECURITY] Failed to clear session:', error);
    return false;
  }
};

/**
 * Validate email or phone number format
 * @param {string} value - Email or phone to validate
 * @returns {boolean} True if valid email or 10-digit phone
 */
export const validateEmailOrPhone = (value) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{10}$/;
  return emailRegex.test(value) || phoneRegex.test(value);
};

/**
 * Sanitize error messages to not expose backend implementation details
 * @param {Object} error - Error object from axios
 * @returns {string} User-friendly error message
 */
export const getSafeErrorMessage = (error) => {
  if (error.response?.status === 401 || error.response?.status === 403) {
    return 'Invalid email/phone or password';
  }
  if (error.response?.status === 400) {
    return 'Invalid input. Please check your entries.';
  }
  if (error.response?.status === 500) {
    return 'Server error. Please try again later.';
  }
  if (error.code === 'ERR_NETWORK') {
    return 'Network error. Please check your connection.';
  }
  if (error.code === 'ECONNABORTED') {
    return 'Request timeout. Please try again.';
  }
  return 'An error occurred. Please try again.';
};

/**
 * Check session expiry (7 days)
 * @returns {boolean} True if session is still valid
 */
export const isSessionValid = () => {
  const loginTime = sessionStorage.getItem('loginTime');
  if (!loginTime) return false;
  
  const loginDate = new Date(loginTime);
  const now = new Date();
  const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
  
  return (now - loginDate) < sevenDaysInMs;
};

/**
 * Get session expiry time
 * @returns {Date|null} Expiry date or null
 */
export const getSessionExpiry = () => {
  const loginTime = sessionStorage.getItem('loginTime');
  if (!loginTime) return null;
  
  const loginDate = new Date(loginTime);
  const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
  return new Date(loginDate.getTime() + sevenDaysInMs);
};

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export default {
  storeSessionSecurely,
  getSessionData,
  isAuthenticated,
  clearSessionSecurely,
  validateEmailOrPhone,
  getSafeErrorMessage,
  isSessionValid,
  getSessionExpiry,
  formatDate
};
