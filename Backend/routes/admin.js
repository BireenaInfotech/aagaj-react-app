// Backend/routes/admin.js

const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const { Applicant, NormalApplicant } = require('../models/Applicant');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// ✅ Import Auth Middleware & JWT
const { verifyAuth, authorizeRoles } = require('../middleware/auth');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const { accessTokenCookieOptions, refreshTokenCookieOptions, clearCookieOptions } = require('../config/cookieConfig');

// 🟢 PUBLIC: Admin Registration Route
router.post('/register', async (req, res) => {
    try {
        const { fullName, email, phone, password } = req.body;
 
        // ✅ Validation
        if (!fullName || !email || !phone || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Full Name, Email, Phone, and Password are required" 
            });
        }

        // ✅ Phone number format check (10 digits)
        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).json({ 
                success: false, 
                message: "Phone number must be 10 digits" 
            });
        }

        // ✅ Check if email already exists
        const existingEmail = await Admin.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ 
                success: false, 
                message: "Email already registered!" 
            });
        }

        // ✅ Check if phone already exists
        const existingPhone = await Admin.findOne({ phone });
        if (existingPhone) {
            return res.status(400).json({ 
                success: false, 
                message: "Phone number already registered!" 
            });
        }

        // ✅ Create new admin (Password hashing handled in Schema pre-save hook)
        const newAdmin = new Admin({ fullName, email, phone, password });
        await newAdmin.save();

        res.json({ 
            success: true, 
            message: "✅ Admin Registered Successfully",
            admin: { fullName, email, phone }
        });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 🟢 PUBLIC: Admin Login Route (Email OR Phone number)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login Request Body:', req.body); // Debug: Check incoming data

        // ✅ Validation
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Email and Password are required" 
            });
        }

        // ✅ Search by email only
        console.log('🔍 Login attempt with email:', email);
        
        const admin = await Admin.findOne({
            email: email
        });

        if (!admin) {
            return res.status(401).json({ 
                success: false, 
                message: "❌ Invalid email or password" 
            });
        }

        // ✅ Password verification
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: "❌ Invalid email or password" 
            });
        }

        // ✅ Generate SHORT-LIVED Access Token (15 minutes)
        const accessToken = generateAccessToken(admin._id.toString(), admin.email, admin.role);

        // ✅ Generate LONG-LIVED Refresh Token (7 days)
        const refreshToken = generateRefreshToken(admin._id.toString(), admin.email);

        // ✅ Set Access Token in HTTPS-only Cookie (15 minutes)
        res.cookie('authToken', accessToken, accessTokenCookieOptions);

        // ✅ Set Refresh Token in HTTPS-only Cookie (7 days)
        res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

        // ✅ Return SUCCESS - NO JWT in response body (SECURITY BEST PRACTICE)
        res.json({ 
            success: true, 
            message: "✅ Login successful",
            user: {
                id: admin._id,
                fullName: admin.fullName, 
                email: admin.email,
                phone: admin.phone,
                role: admin.role
            }
            // ❌ NO authToken, NO refreshToken in response body
            // ✅ Tokens are set in secure cookies automatically
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 🔐 PROTECTED: Get Admin Profile (Authenticated admin only)
router.get('/profile', verifyAuth, authorizeRoles(['admin']), async (req, res) => {
    try {
        const admin = await Admin.findById(req.user.userId).select('-password');
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }
        res.json({ success: true, admin });
    } catch (error) {
        console.error("Profile Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 🟢 PUBLIC: Logout Route - Clear authentication cookies
router.post('/logout', (req, res) => {
    try {
        // ✅ Clear authToken cookie
        res.clearCookie('authToken', clearCookieOptions);

        // ✅ Clear refreshToken cookie
        res.clearCookie('refreshToken', clearCookieOptions);

        res.json({ 
            success: true, 
            message: "✅ Logout successful. Cookies cleared." 
        });
    } catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({ success: false, message: "Logout failed" });
    }
});

// 🟢 PUBLIC: Refresh Access Token - Get new access token using refresh token
router.post('/refresh', async (req, res) => {
    try {
        // ✅ Get refresh token from cookie
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ 
                success: false, 
                message: "❌ Refresh token not found. Please login again." 
            });
        }

        // ✅ Verify refresh token
        const { verifyRefreshToken } = require('../utils/jwt');
        const decoded = verifyRefreshToken(refreshToken);

        // ✅ Find admin user
        const admin = await Admin.findById(decoded.userId);
        if (!admin) {
            return res.status(404).json({ 
                success: false, 
                message: "❌ User not found" 
            });
        }

        // ✅ Generate new access token (15 minutes)
        const newAccessToken = generateAccessToken(admin._id.toString(), admin.email, admin.role);

        // ✅ Set new access token in cookie
        res.cookie('authToken', newAccessToken, accessTokenCookieOptions);

        res.json({ 
            success: true, 
            message: "✅ Access token refreshed",
            user: {
                id: admin._id,
                fullName: admin.fullName,
                email: admin.email,
                phone: admin.phone,
                role: admin.role
            }
        });
    } catch (error) {
        console.error("Refresh Token Error:", error);
        
        if (error.message.includes('expired')) {
            return res.status(401).json({ 
                success: false, 
                message: "Refresh token expired. Please login again." 
            });
        }
        
        res.status(401).json({ 
            success: false, 
            message: "❌ Invalid refresh token. Please login again." 
        });
    }
});

// ✅ GET ALL APPLICANTS (NGO + Normal) - For Admin Dashboard
router.get('/get-all-applicants', async (req, res) => {
  try {
    console.log('📨 Fetching all applicants for admin dashboard');
    
    // Prevent browser caching
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    // Fetch from both NGO and Normal collections
    const ngoApplicants = await Applicant.find().lean();
    const normalApplicants = await NormalApplicant.find().lean();
    
    // Merge and add collection info for filtering
    const allApplicants = [
      ...ngoApplicants.map(app => ({ ...app, collectionType: 'NGO' })),
      ...normalApplicants.map(app => ({ ...app, collectionType: 'Normal' }))
    ];
    
    console.log(`✅ Fetched ${ngoApplicants.length} NGO + ${normalApplicants.length} Normal applicants`);
    console.log('✅ Total merged applicants:', allApplicants.length);
    
    res.json(allApplicants);
  } catch (error) {
    console.error('❌ Fetch Applicants Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching applicants: ' + error.message 
    });
  }
});

// ✅ GENERATE CREDENTIALS FOR APPLICANT - Creates login username/password
router.post('/generate-credentials/:applicantId', async (req, res) => {
  try {
    const { applicantId } = req.params;
    
    // Try to find in both collections
    let applicant = await Applicant.findById(applicantId);
    let collection = 'Applicant';
    
    if (!applicant) {
      applicant = await NormalApplicant.findById(applicantId);
      collection = 'NormalApplicant';
    }
    
    if (!applicant) {
      return res.status(404).json({ 
        success: false, 
        message: 'Applicant not found' 
      });
    }
    
    // Generate username and password
    const username = applicant.fullName.replace(/\s+/g, '_').toLowerCase() + '_' + crypto.randomBytes(2).toString('hex');
    const password = crypto.randomBytes(4).toString('hex').toUpperCase() + crypto.randomBytes(2).toString('hex');
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update applicant with credentials
    applicant.emp_username = username;
    applicant.emp_password = hashedPassword;
    applicant.emp_password_plain = password; // Store plain password temporarily for display
    
    await applicant.save();
    
    console.log(`✅ Credentials generated for ${applicant.fullName} in ${collection} collection`);
    
    res.json({
      success: true,
      message: 'Credentials generated successfully!',
      credentials: {
        fullName: applicant.fullName,
        username: username,
        password: password,
        email: applicant.email,
        mobile: applicant.mobile
      }
    });
  } catch (error) {
    console.error('❌ Generate Credentials Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Error generating credentials: ' + error.message 
    });
  }
});

// ✅ DELETE APPLICANT - Remove from collections
router.delete('/delete-employee/:applicantId', async (req, res) => {
  try {
    const { applicantId } = req.params;
    
    // Try to delete from both collections
    let result = await Applicant.findByIdAndDelete(applicantId);
    
    if (!result) {
      result = await NormalApplicant.findByIdAndDelete(applicantId);
    }
    
    if (!result) {
      return res.status(404).json({ 
        success: false, 
        message: 'Applicant not found' 
      });
    }
    
    console.log(`✅ Applicant deleted: ${result.fullName}`);
    
    res.json({
      success: true,
      message: 'Applicant deleted successfully!'
    });
  } catch (error) {
    console.error('❌ Delete Applicant Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting applicant: ' + error.message 
    });
  }
});

module.exports = router;
