const { verifyToken } = require('../utils/jwt');

/**
 * ✅ AUTHENTICATION MIDDLEWARE
 * JWT token ko verify karte hain aur request mein user data attach karte hain
 */
const verifyAuth = (req, res, next) => {
  try {
    // Cookie se token nikale
    let token = req.cookies.authToken;

    // Fallback: Authorization header (Bearer token)
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      token = authHeader.startsWith('Bearer ')
        ? authHeader.substring(7)
        : authHeader;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '❌ No authentication token found. Please login first.',
      });
    }

    // Token ko verify karo
    const decoded = verifyToken(token);
    
    // Request object mein user data attach karo
    req.user = decoded;
    next();
  } catch (error) {
    console.error('🔴 Auth verification error:', error.message);
    return res.status(403).json({
      success: false,
      message: `❌ ${error.message}`,
    });
  }
};

/**
 * ✅ AUTHORIZATION MIDDLEWARE
 * User ke role check karte hain
 * @param {string[]} allowedRoles - Allowed roles array (e.g., ['admin', 'employee'])
 */
const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '❌ User not authenticated',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `❌ Access denied. Required roles: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
};

/**
 * ✅ OPTIONAL AUTH MIDDLEWARE
 * Token ho to verify karo, nahi to aage badho
 * (Publicly accessible routes ke liye jaha optional login chahiye)
 */
const optionalAuth = (req, res, next) => {
  try {
    const token = req.cookies.authToken;

    if (token) {
      const decoded = verifyToken(token);
      req.user = decoded;
      req.isAuthenticated = true;
    } else {
      req.isAuthenticated = false;
    }

    next();
  } catch (error) {
    // Token invalid hai par continue karo (optional auth)
    req.isAuthenticated = false;
    next();
  }
};

module.exports = {
  verifyAuth,
  authorizeRoles,
  optionalAuth,
};
