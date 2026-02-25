const express = require('express');
const bcryptjs = require('bcryptjs');
const { generateToken, verifyToken } = require('../utils/jwt');
const { authTokenCookieOptions, clearCookieOptions } = require('../config/cookieConfig');
const { verifyAuth } = require('../middleware/auth');
const router = express.Router();

// Example: Ye real database models se replace karna hoga
// const User = require('../models/User');
// const Admin = require('../models/Admin');

/**
 * ✅ LOGIN - Email/Username + Password
 * POST /auth/login
 * 
 * Request Body:
 * {
 *   "email": "user@example.com",
 *   "password": "password123",
 *   "role": "admin" or "employee" (optional, to specify role)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "✅ Login successful",
 *   "user": { id, email, name, role },
 *   "authToken": "jwt-token"
 * }
 */
router.post('/login', async (req, res) => {
  try {
    const { emailOrPhone, password, role } = req.body;

    // ✅ Validation
    if (!emailOrPhone || !password) {
      return res.status(400).json({
        success: false,
        message: '❌ Email/Phone and password are required',
      });
    }

    // TODO: Replace with actual database query
    // const user = await User.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] });
    
    // Temporary mock validation (remove in production)
    const mockUsers = {
      'admin@aagaj.com': {
        id: 'admin-001',
        email: 'admin@aagaj.com',
        phone: '9876543210',
        password: '$2a$10$YR3d.K.4DXhM5uEy2JnLz.5uCTa0vCKaXYN0HQCKk..OMVb2xJwJu', // hash of "admin123"
        name: 'Admin User',
        role: 'admin',
      },
      '9876543210': {
        id: 'admin-001',
        email: 'admin@aagaj.com',
        phone: '9876543210',
        password: '$2a$10$YR3d.K.4DXhM5uEy2JnLz.5uCTa0vCKaXYN0HQCKk..OMVb2xJwJu', // hash of "admin123"
        name: 'Admin User',
        role: 'admin',
      },
      'employee@aagaj.com': {
        id: 'emp-001',
        email: 'employee@aagaj.com',
        phone: '9876543211',
        password: '$2a$10$YR3d.K.4DXhM5uEy2JnLz.5uCTa0vCKaXYN0HQCKk..OMVb2xJwJu', // hash of "admin123"
        name: 'Employee User',
        role: 'employee',
      },
      '9876543211': {
        id: 'emp-001',
        email: 'employee@aagaj.com',
        phone: '9876543211',
        password: '$2a$10$YR3d.K.4DXhM5uEy2JnLz.5uCTa0vCKaXYN0HQCKk..OMVb2xJwJu', // hash of "admin123"
        name: 'Employee User',
        role: 'employee',
      },
    };

    const user = mockUsers[emailOrPhone];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '❌ Invalid email/phone or password',
      });
    }

    // ✅ Password verification
    const isPasswordCorrect = await bcryptjs.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: '❌ Invalid email/phone or password',
      });
    }

    // ✅ JWT Token Generate Karo
    const authToken = generateToken(user.id, user.email, user.role);

    // ✅ Cookie mein token rakhru (HTTPS-only)
    res.cookie('authToken', authToken, authTokenCookieOptions);

    // ✅ Response bhejo with session info
    return res.status(200).json({
      success: true,
      message: '✅ Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      authToken, // Frontend ke liye bhi token return kar dete hain (optional)
      // ✅ Session/Cookie Info for display
      session: {
        tokenType: 'JWT',
        expiresIn: '7 days',
        secure: true,
        httpOnly: true,
        sameSite: 'Strict',
        loginTime: new Date().toISOString(),
        message: '✅ Session cookie set in browser (HTTPS-only, secure)'
      }
    });
  } catch (error) {
    console.error('🔴 Login error:', error);
    return res.status(500).json({
      success: false,
      message: '❌ Server error during login',
      error: error.message,
    });
  }
});

/**
 * ✅ LOGOUT - Clear Cookie
 * POST /auth/logout
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "✅ Logged out successfully"
 * }
 */
router.post('/logout', (req, res) => {
  try {
    // ✅ Cookie clear karo
    res.clearCookie('authToken', clearCookieOptions);

    return res.status(200).json({
      success: true,
      message: '✅ Logged out successfully',
    });
  } catch (error) {
    console.error('🔴 Logout error:', error);
    return res.status(500).json({
      success: false,
      message: '❌ Error during logout',
    });
  }
});

/**
 * ✅ VERIFY AUTH - Check if token valid hai
 * GET /auth/verify
 * Protected Route (verifyAuth middleware required)
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "✅ Token is valid",
 *   "user": { userId, email, role }
 * }
 */
router.get('/verify', verifyAuth, (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: '✅ Token is valid',
      user: {
        userId: req.user.userId,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '❌ Token is invalid',
    });
  }
});

/**
 * ✅ GET CURRENT USER - Logged-in user ki information
 * GET /auth/me
 * Protected Route (verifyAuth middleware required)
 * 
 * Response:
 * {
 *   "success": true,
 *   "user": { userId, email, role }
 * }
 */
router.get('/me', verifyAuth, (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '❌ Not authenticated',
    });
  }
});

module.exports = router;
