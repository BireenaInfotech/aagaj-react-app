const jwt = require('jsonwebtoken');

/**
 * ✅ Generate SHORT-LIVED Access Token (15 minutes)
 * @param {string} userId - User ka unique ID
 * @param {string} email - User ka email
 * @param {string} role - User ka role (admin, employee, etc.)
 * @returns {string} JWT access token
 */
const generateAccessToken = (userId, email, role = 'user') => {
  try {
    const token = jwt.sign(
      {
        userId,
        email,
        role,
        type: 'access',
        iat: Math.floor(Date.now() / 1000),
      },
      process.env.JWT_SECRET || 'your-secret-key-change-in-env',
      { expiresIn: '15m' } // ✅ Short-lived: 15 minutes
    );
    return token;
  } catch (error) {
    console.error('❌ Access token generation error:', error);
    throw error;
  }
};

/**
 * ✅ Generate LONG-LIVED Refresh Token (7 days)
 * @param {string} userId - User ka unique ID
 * @param {string} email - User ka email
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (userId, email) => {
  try {
    const token = jwt.sign(
      {
        userId,
        email,
        type: 'refresh',
        iat: Math.floor(Date.now() / 1000),
      },
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-env',
      { expiresIn: '7d' } // ✅ Long-lived: 7 days
    );
    return token;
  } catch (error) {
    console.error('❌ Refresh token generation error:', error);
    throw error;
  }
};

/**
 * ✅ Backward compatibility - generateToken (15 minute access token)
 * @param {string} userId - User ka unique ID
 * @param {string} email - User ka email
 * @param {string} role - User ka role
 * @returns {string} JWT token
 */
const generateToken = (userId, email, role = 'user') => {
  return generateAccessToken(userId, email, role);
};

/**
 * ✅ JWT Token Verify Karna
 * @param {string} token - JWT token verify karna hai
 * @returns {object} Decoded token data
 * @throws {error} Token invalid/expired ho to error throw kare
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-env'
    );
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
};

/**
 * ✅ Verify Refresh Token
 * @param {string} token - Refresh token verify karna hai
 * @returns {object} Decoded refresh token data
 * @throws {error} Token invalid/expired ho to error
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-env'
    );
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    }
    throw error;
  }
};

module.exports = {
  generateToken,
  generateAccessToken,
  verifyToken,
  generateRefreshToken,
  verifyRefreshToken,
};
