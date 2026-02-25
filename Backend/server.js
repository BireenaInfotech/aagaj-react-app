
const path = require('path');
const mongoose=require("mongoose");
const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
require('dotenv').config({ path: path.join(__dirname, '.env') });


const { connectDB } = require('./config/database');

const { generalUpload, healthCardUpload, swarojgaarUpload, appointmentUpload } = require('./config/multer');

// ============================================
// 2. MIDDLEWARE IMPORTS
// ============================================
const corsMiddleware = require('./middleware/corsConfig');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const { validateFields, validateEmail, validatePhone, validateAadhar } = require('./middleware/validation');
const { verifyAuth, authorizeRoles } = require('./middleware/auth');

// ============================================
// 3. UTILITY IMPORTS
// ============================================
const { successResponse, errorResponse } = require('./utils/response');
const { generateApplicantId, generateHealthCardId } = require('./utils/generateId');
const { generateApplicationPDF } = require('./utils/pdfGenerator');
const asyncHandler = require('./utils/asyncHandler');
const validators = require('./utils/validators');
const { generateToken, generateAccessToken, generateRefreshToken } = require('./utils/jwt');
const { accessTokenCookieOptions, authTokenCookieOptions, refreshTokenCookieOptions, clearCookieOptions } = require('./config/cookieConfig');


const { Applicant, NormalApplicant } = require('./models/Applicant');
const Beneficiary = require('./models/MahilaSilayi');
const SwarojgaarGroup = require('./models/SwarojgaarGroup');
const HealthPartner = require('./models/HealthPartner');
const SwasthyaSurakshaProvider = require('./models/SwasthyaSurakshaProvider');
const Donation = require('./models/Donation');
const HealthCard = require('./models/HealthCard');
const Admin = require('./models/Admin');
const Appointment = require('./models/Appointment');


const app = express();


// Logging
console.log(`\n🚀 Starting AGAZ Foundation Backend`);
console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔧 Port: ${process.env.PORT || 5000}\n`);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Cookie Parser - JWT tokens ko cookies se read karte hain
app.use(cookieParser());

// CORS
app.use(corsMiddleware);

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, '../Frontend')));

app.use(requestLogger);


const authRoutes = require('./routes/AuthRoutes');

const adminRoutes = require('./routes/admin');
const applicationRoutes = require('./routes/application');
const appointmentRoutes = require('./routes/appointment');
const donationRoutes = require('./routes/donation');
const healthcardRoutes = require('./routes/healthcard');
const schemeRoutes = require('./routes/scheme');
const swarojgaarRoutes = require('./routes/swarojgaar');
const healthpartnerRoutes = require('./routes/healthpartner');
const swasthyasurakshaRoutes = require('./routes/swasthyasuraksha');


// ============================================
// 9. ROUTE MOUNTING
// ============================================

// ✅ AUTH ROUTES (Must be first in mounting order)
app.use('/auth', authRoutes);

// Other routes


app.use('/admin-register', adminRoutes);
app.use('/api/application', applicationRoutes);
app.use('/appointment', appointmentRoutes);
app.use('/donation', donationRoutes);
app.use('/api/healthcard', healthcardRoutes);
app.use('/schemes', schemeRoutes);
app.use('/swarojgaar', swarojgaarRoutes);
app.use('/swasthya-suraksha-provider', swasthyasurakshaRoutes);
app.use('/swasthya', swasthyasurakshaRoutes); // Shorter alias for appointment form
app.use('/swasthya', healthpartnerRoutes);
app.use('/swasthya-suraksha-provider', swasthyasurakshaRoutes);

// ✅ PAYMENT CALLBACK ENDPOINT
app.post('/pgresponse', asyncHandler(async (req, res) => {
    console.log('\n' + '='.repeat(80));
    console.log('🔔 PAYMENT CALLBACK RECEIVED');
    console.log('='.repeat(80));
    
    const paymentResponse = req.body.response || req.body.data || req.body.req;
    
    console.log('📥 Request Body Keys:', Object.keys(req.body));
    console.log('💳 Encrypted Response Length:', paymentResponse?.length || 0);

    if (!paymentResponse) {
        console.error('❌ ERROR: No encrypted response found in body');
        console.log('📄 Available fields:', Object.keys(req.body));
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/pgresponse?payment=failed`);
    }

    try {
        const crypto = require('crypto');
        
        const key = process.env.GETEPAY_KEY || 'JoYPd+qso9s7T+Ebj8pi4Wl8i+AHLv+5UNJxA3JkDgY=';
        const iv = process.env.GETEPAY_IV || 'hlnuyA9b4YxDq6oJSZFl8g==';
        
        let parsedResponse = null;
        let decryptSuccess = false;

        // Try to decrypt
        try {
            console.log('\n🔐 DECRYPTION PROCESS');
            console.log('-'.repeat(80));
            
            // MATCH FRONTEND EXACTLY
            const combined = key + iv;
            const combinedHash = crypto.createHash('sha256').update(combined).digest();
            const mKey = combinedHash.toString('base64');

            const combined_data = Buffer.from(paymentResponse, 'base64');
            console.log('✅ Base64 decoded successfully');
            console.log('📊 Total encrypted length:', combined_data.length, 'bytes');

            if (combined_data.length < 44) {
                throw new Error(`Invalid response format (too short: ${combined_data.length})`);
            }

            const salt = combined_data.slice(0, 16);
            const iv_bytes = combined_data.slice(16, 28);
            const ciphertext = combined_data.slice(28, -16);
            const tag = combined_data.slice(-16);

            console.log('📦 Extracted Parts:');
            console.log('   • Salt:', salt.toString('hex'));
            console.log('   • IV:', iv_bytes.toString('hex'));
            console.log('   • Ciphertext length:', ciphertext.length, 'bytes');
            console.log('   • Auth Tag:', tag.toString('hex'));

            // PBKDF2 with UTF-8 mKey
            const passwordBytes = Buffer.from(mKey, 'utf-8');
            const derivedKey = crypto.pbkdf2Sync(passwordBytes, salt, 65535, 32, 'sha512');

            const decipher = crypto.createDecipheriv('aes-256-gcm', derivedKey, iv_bytes);
            decipher.setAuthTag(tag);

            let decrypted = '';
            try {
                decrypted = decipher.update(ciphertext, undefined, 'utf8');
                decrypted += decipher.final('utf8');
            } catch (cipherErr) {
                console.error('❌ Cipher error during decryption:', cipherErr.message);
                throw cipherErr;
            }
            
            parsedResponse = JSON.parse(decrypted);
            decryptSuccess = true;

            console.log('✅ DECRYPTION SUCCESS!');
            console.log('-'.repeat(80));
        } catch (decryptErr) {
            console.error('❌ DECRYPTION FAILED:', decryptErr.message);
            
            parsedResponse = {
                paymentStatus: 'PENDING',
                merchantTransactionId: `PKT_${Date.now()}`,
                message: `Decryption error: ${decryptErr.message}`,
            };
        }

        // ====================================================================
        // 📋 DISPLAY FULL RESPONSE DATA
        // ====================================================================
        console.log('\n📋 DECRYPTED RESPONSE DATA');
        console.log('='.repeat(80));
        console.log(JSON.stringify(parsedResponse, null, 2));
        console.log('='.repeat(80));

        // ====================================================================
        // 🔍 EXTRACT IMPORTANT FIELDS (May differ from GetePay API)
        // ====================================================================
        console.log('\n🔍 FIELD EXTRACTION');
        console.log('-'.repeat(80));
        
        // Find transaction ID from various possible field names
        const txnId = 
            parsedResponse.merchantTransactionId ||
            parsedResponse.merchantOrderNo ||
            parsedResponse.orderId ||
            parsedResponse.order_id ||
            `PKT_${Date.now()}`;
        
        // Find payment status from various possible field names
        const paymentStatus = 
            parsedResponse.paymentStatus ||
            parsedResponse.txnStatus ||
            parsedResponse.status ||
            'UNKNOWN';
        
        // Find amount from various possible field names
        const amount = 
            parsedResponse.amount ||
            parsedResponse.txnAmount ||
            parsedResponse.transactionAmount ||
            'N/A';
        
        // Find GetePay transaction ID
        const getepayTxnId = 
            parsedResponse.getepayTxnId ||
            parsedResponse.txnId ||
            parsedResponse.transactionId ||
            'N/A';

        console.log('✅ Transaction ID:', txnId);
        console.log('✅ Payment Status:', paymentStatus);
        console.log('✅ Amount:', amount);
        console.log('✅ GetePay TXN ID:', getepayTxnId);
        console.log('-'.repeat(80));

        // ====================================================================
        // 💾 UPDATE DATABASE
        // ====================================================================
        console.log('\n💾 DATABASE UPDATE');
        console.log('-'.repeat(80));
        
        if (txnId && txnId !== `PKT_${Date.now()}`) {
            try {
                // Determine status
                const newStatus = 
                    paymentStatus === 'SUCCESS' || paymentStatus === 'success'
                        ? 'Success'
                        : (paymentStatus === 'FAILED' || paymentStatus === 'failed' ? 'Failed' : 'Pending');

                // Prepare update data
                const updateData = {
                    status: newStatus,
                    gatewayResponse: parsedResponse, // Store complete response
                    payment_id: getepayTxnId !== 'N/A' ? getepayTxnId : undefined, // Store GetePay TXN ID
                    updatedAt: new Date(),
                };

                console.log('🔍 Looking for donation with order_id:', txnId);
                console.log('📝 Updating with:', {
                    status: newStatus,
                    payment_id: updateData.payment_id,
                    gatewayResponse_keys: Object.keys(parsedResponse),
                });

                const updated = await Donation.findOneAndUpdate(
                    { order_id: txnId },
                    updateData,
                    { new: true }
                );

                if (updated) {
                    console.log('✅ DATABASE UPDATE SUCCESS!');
                    console.log('   • Order ID:', updated.order_id);
                    console.log('   • New Status:', updated.status);
                    console.log('   • Donor:', updated.donor_name);
                    console.log('   • Amount:', updated.amount);
                    console.log('   • Email:', updated.email);
                    console.log('   • Phone:', updated.phone);
                    console.log('   • Payment ID:', updated.payment_id);
                } else {
                    console.warn('⚠️ WARNING: Donation record NOT found for order_id:', txnId);
                    // Try to list similar donations
                    const searchResults = await Donation.find({ order_id: new RegExp(txnId.substring(0, 5)) }).select('order_id status').limit(3);
                    console.log('📋 Similar donations found:', searchResults.length);
                    if (searchResults.length > 0) {
                        console.log('   Possible matches:');
                        searchResults.forEach(d => console.log('   •', d.order_id, '→', d.status));
                    }
                }
            } catch (dbErr) {
                console.error('❌ DATABASE UPDATE FAILED:', dbErr.message);
                console.error('Stack:', dbErr.stack);
            }
        }

        console.log('-'.repeat(80));

        // ====================================================================
        // 🔄 REDIRECT TO RESPONSE PAGE
        // ====================================================================
        console.log('\n🔄 REDIRECTING TO FRONTEND');
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const responseJson = JSON.stringify(parsedResponse);
        const encodedResponse = encodeURIComponent(responseJson);
        
        const redirectUrl = `${frontendUrl}/pgresponse?payment=${paymentStatus.toLowerCase()}&response=${encodedResponse}`;
        console.log('📍 Redirect URL:', redirectUrl.substring(0, 100) + '...');
        console.log('='.repeat(80) + '\n');
        
        return res.redirect(redirectUrl);
        
    } catch (error) {
        console.error('❌ PGRESPONSE ERROR:', error.message);
        console.error('Stack:', error.stack);
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/pgresponse?payment=error`);
    }
}));

// ====================================================================
// ✅ SILAYI REGISTRATION PAYMENT CALLBACK ENDPOINT
// ====================================================================
app.post('/silayi-pgresponse', asyncHandler(async (req, res) => {
    console.log('\n' + '='.repeat(80));
    console.log('🧵 SILAYI PAYMENT CALLBACK RECEIVED');
    console.log('='.repeat(80));

    const paymentResponse = req.body.response || req.body.data || req.body.req;

    console.log('📥 Request Body Keys:', Object.keys(req.body));
    console.log('💳 Encrypted Response Length:', paymentResponse?.length || 0);

    if (!paymentResponse) {
        console.error('❌ ERROR: No encrypted response found in body');
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/pgresponse?payment=failed`);
    }

    try {
        const crypto = require('crypto');

        const key = process.env.GETEPAY_KEY || 'JoYPd+qso9s7T+Ebj8pi4Wl8i+AHLv+5UNJxA3JkDgY=';
        const iv = process.env.GETEPAY_IV || 'hlnuyA9b4YxDq6oJSZFl8g==';

        let parsedResponse = null;

        try {
            console.log('\n🔐 DECRYPTION PROCESS');
            console.log('-'.repeat(80));

            const combined = key + iv;
            const combinedHash = crypto.createHash('sha256').update(combined).digest();
            const mKey = combinedHash.toString('base64');

            const combined_data = Buffer.from(paymentResponse, 'base64');
            console.log('✅ Base64 decoded successfully');

            if (combined_data.length < 44) {
                throw new Error(`Invalid response format (too short: ${combined_data.length})`);
            }

            const salt = combined_data.slice(0, 16);
            const iv_bytes = combined_data.slice(16, 28);
            const ciphertext = combined_data.slice(28, -16);
            const tag = combined_data.slice(-16);

            const passwordBytes = Buffer.from(mKey, 'utf-8');
            const derivedKey = crypto.pbkdf2Sync(passwordBytes, salt, 65535, 32, 'sha512');

            const decipher = crypto.createDecipheriv('aes-256-gcm', derivedKey, iv_bytes);
            decipher.setAuthTag(tag);

            let decrypted = '';
            decrypted = decipher.update(ciphertext, undefined, 'utf8');
            decrypted += decipher.final('utf8');

            parsedResponse = JSON.parse(decrypted);
            console.log('✅ DECRYPTION SUCCESS!');
            console.log('-'.repeat(80));
        } catch (decryptErr) {
            console.error('❌ DECRYPTION FAILED:', decryptErr.message);

            parsedResponse = {
                paymentStatus: 'PENDING',
                merchantTransactionId: `SILAI_${Date.now()}`,
                message: `Decryption error: ${decryptErr.message}`,
            };
        }

        console.log('\n📋 DECRYPTED PAYMENT RESPONSE DATA');
        console.log('='.repeat(80));
        console.log(JSON.stringify(parsedResponse, null, 2));
        console.log('='.repeat(80));

        const txnId =
            parsedResponse.merchantTransactionId ||
            parsedResponse.merchantOrderNo ||
            parsedResponse.orderId ||
            `SILAI_${Date.now()}`;

        const paymentStatus =
            parsedResponse.paymentStatus ||
            parsedResponse.txnStatus ||
            parsedResponse.status ||
            'UNKNOWN';

        const amount =
            parsedResponse.amount ||
            parsedResponse.txnAmount ||
            parsedResponse.transactionAmount ||
            'N/A';

        const getepayTxnId =
            parsedResponse.getepayTxnId ||
            parsedResponse.txnId ||
            parsedResponse.transactionId ||
            'N/A';

        console.log('✅ Transaction ID:', txnId);
        console.log('✅ Payment Status:', paymentStatus);
        console.log('✅ Amount:', amount);
        console.log('✅ GetePay TXN ID:', getepayTxnId);

        const isSuccess = paymentStatus === 'SUCCESS' || paymentStatus === 'success';
        const newStatus = isSuccess ? 'Paid' : 'Pending';

        const updateData = {
            paymentStatus: newStatus,
            paymentId: getepayTxnId !== 'N/A' ? getepayTxnId : undefined,
            paymentGateway: 'Getepay',
            gatewayResponse: parsedResponse,
            registrationFee: amount !== 'N/A' ? Number(amount) : undefined,
            updatedAt: new Date(),
        };

        console.log('🔍 Looking for Silayi registration with orderId:', txnId);
        const updated = await Beneficiary.findOneAndUpdate(
            { paymentOrderId: txnId },
            updateData,
            { new: true }
        );

        if (updated) {
            console.log('✅ SILAYI UPDATE SUCCESS!');
            console.log('   • ID:', updated._id);
            console.log('   • Name:', updated.name);
            console.log('   • Status:', updated.paymentStatus);
        } else {
            console.warn('⚠️ No Silayi record found for orderId:', txnId);
        }

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const responseJson = JSON.stringify(parsedResponse);
        const encodedResponse = encodeURIComponent(responseJson);
        const redirectUrl = `${frontendUrl}/pgresponse?payment=${isSuccess ? 'success' : 'failed'}&response=${encodedResponse}`;

        return res.redirect(redirectUrl);
    } catch (error) {
        console.error('❌ SILAYI PGRESPONSE ERROR:', error.message);
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/pgresponse?payment=error`);
    }
}));

// ====================================================================
// ✅ SWAROJGAR REGISTRATION PAYMENT CALLBACK ENDPOINT
// ====================================================================
app.post('/swarojgaar-pgresponse', asyncHandler(async (req, res) => {
    console.log('\n' + '='.repeat(80));
    console.log('🧵 SWAROJGAR PAYMENT CALLBACK RECEIVED');
    console.log('='.repeat(80));

    const paymentResponse = req.body.response || req.body.data || req.body.req;

    console.log('📥 Request Body Keys:', Object.keys(req.body));
    console.log('💳 Encrypted Response Length:', paymentResponse?.length || 0);

    if (!paymentResponse) {
        console.error('❌ ERROR: No encrypted response found in body');
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/pgresponse?payment=failed`);
    }

    try {
        const crypto = require('crypto');

        const key = process.env.GETEPAY_KEY || 'JoYPd+qso9s7T+Ebj8pi4Wl8i+AHLv+5UNJxA3JkDgY=';
        const iv = process.env.GETEPAY_IV || 'hlnuyA9b4YxDq6oJSZFl8g==';

        let parsedResponse = null;

        try {
            console.log('\n🔐 DECRYPTION PROCESS');
            console.log('-'.repeat(80));

            const combined = key + iv;
            const combinedHash = crypto.createHash('sha256').update(combined).digest();
            const mKey = combinedHash.toString('base64');

            const combined_data = Buffer.from(paymentResponse, 'base64');
            console.log('✅ Base64 decoded successfully');

            if (combined_data.length < 44) {
                throw new Error(`Invalid response format (too short: ${combined_data.length})`);
            }

            const salt = combined_data.slice(0, 16);
            const iv_bytes = combined_data.slice(16, 28);
            const ciphertext = combined_data.slice(28, -16);
            const tag = combined_data.slice(-16);

            const passwordBytes = Buffer.from(mKey, 'utf-8');
            const derivedKey = crypto.pbkdf2Sync(passwordBytes, salt, 65535, 32, 'sha512');

            const decipher = crypto.createDecipheriv('aes-256-gcm', derivedKey, iv_bytes);
            decipher.setAuthTag(tag);

            let decrypted = '';
            decrypted = decipher.update(ciphertext, undefined, 'utf8');
            decrypted += decipher.final('utf8');

            parsedResponse = JSON.parse(decrypted);
            console.log('✅ DECRYPTION SUCCESS!');
            console.log('-'.repeat(80));
        } catch (decryptErr) {
            console.error('❌ DECRYPTION FAILED:', decryptErr.message);

            parsedResponse = {
                paymentStatus: 'PENDING',
                merchantTransactionId: `SWARO_${Date.now()}`,
                message: `Decryption error: ${decryptErr.message}`,
            };
        }

        console.log('\n📋 DECRYPTED PAYMENT RESPONSE DATA');
        console.log('='.repeat(80));
        console.log(JSON.stringify(parsedResponse, null, 2));
        console.log('='.repeat(80));

        const txnId =
            parsedResponse.merchantTransactionId ||
            parsedResponse.merchantOrderNo ||
            parsedResponse.orderId ||
            `SWARO_${Date.now()}`;

        const paymentStatus =
            parsedResponse.paymentStatus ||
            parsedResponse.txnStatus ||
            parsedResponse.status ||
            'UNKNOWN';

        const amount =
            parsedResponse.amount ||
            parsedResponse.txnAmount ||
            parsedResponse.transactionAmount ||
            'N/A';

        const getepayTxnId =
            parsedResponse.getepayTxnId ||
            parsedResponse.txnId ||
            parsedResponse.transactionId ||
            'N/A';

        console.log('✅ Transaction ID:', txnId);
        console.log('✅ Payment Status:', paymentStatus);
        console.log('✅ Amount:', amount);
        console.log('✅ GetePay TXN ID:', getepayTxnId);

        const isSuccess = paymentStatus === 'SUCCESS' || paymentStatus === 'success';
        const newStatus = isSuccess ? 'Paid' : 'Pending';

        const updateData = {
            paymentStatus: newStatus,
            paymentId: getepayTxnId !== 'N/A' ? getepayTxnId : undefined,
            paymentGateway: 'Getepay',
            gatewayResponse: parsedResponse,
            registrationFee: amount !== 'N/A' ? Number(amount) : undefined,
            updatedAt: new Date(),
        };

        console.log('🔍 Looking for Swarojgaar group with orderId:', txnId);
        const updated = await SwarojgaarGroup.findOneAndUpdate(
            { paymentOrderId: txnId },
            updateData,
            { new: true }
        );

        if (updated) {
            console.log('✅ SWAROJGAR UPDATE SUCCESS!');
            console.log('   • ID:', updated._id);
            console.log('   • Group:', updated.groupName);
            console.log('   • Status:', updated.paymentStatus);
        } else {
            console.warn('⚠️ No Swarojgaar record found for orderId:', txnId);
        }

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const responseJson = JSON.stringify(parsedResponse);
        const encodedResponse = encodeURIComponent(responseJson);
        const redirectUrl = `${frontendUrl}/pgresponse?payment=${isSuccess ? 'success' : 'failed'}&response=${encodedResponse}`;

        return res.redirect(redirectUrl);
    } catch (error) {
        console.error('❌ SWAROJGAR PGRESPONSE ERROR:', error.message);
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/pgresponse?payment=error`);
    }
}));

// ====================================================================
// ✅ JOB APPLICATION PAYMENT CALLBACK ENDPOINT
// ====================================================================
app.post('/application-pgresponse', asyncHandler(async (req, res) => {
    console.log('\n' + '='.repeat(80));
    console.log('🎓 JOB APPLICATION PAYMENT CALLBACK RECEIVED');
    console.log('='.repeat(80));
    
    const paymentResponse = req.body.response || req.body.data || req.body.req;
    
    console.log('📥 Request Body Keys:', Object.keys(req.body));
    console.log('💳 Encrypted Response Length:', paymentResponse?.length || 0);

    if (!paymentResponse) {
        console.error('❌ ERROR: No encrypted response found in body');
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/?payment=failed`);
    }

    try {
        const crypto = require('crypto');
        
        const key = process.env.GETEPAY_KEY || 'JoYPd+qso9s7T+Ebj8pi4Wl8i+AHLv+5UNJxA3JkDgY=';
        const iv = process.env.GETEPAY_IV || 'hlnuyA9b4YxDq6oJSZFl8g==';
        
        let parsedResponse = null;

        // Try to decrypt
        try {
            console.log('\n🔐 DECRYPTION PROCESS');
            console.log('-'.repeat(80));
            
            const combined = key + iv;
            const combinedHash = crypto.createHash('sha256').update(combined).digest();
            const mKey = combinedHash.toString('base64');

            const combined_data = Buffer.from(paymentResponse, 'base64');
            console.log('✅ Base64 decoded successfully');

            if (combined_data.length < 44) {
                throw new Error(`Invalid response format (too short: ${combined_data.length})`);
            }

            const salt = combined_data.slice(0, 16);
            const iv_bytes = combined_data.slice(16, 28);
            const ciphertext = combined_data.slice(28, -16);
            const tag = combined_data.slice(-16);

            console.log('📦 Encrypted data extracted successfully');

            const passwordBytes = Buffer.from(mKey, 'utf-8');
            const derivedKey = crypto.pbkdf2Sync(passwordBytes, salt, 65535, 32, 'sha512');

            const decipher = crypto.createDecipheriv('aes-256-gcm', derivedKey, iv_bytes);
            decipher.setAuthTag(tag);

            let decrypted = '';
            try {
                decrypted = decipher.update(ciphertext, undefined, 'utf8');
                decrypted += decipher.final('utf8');
            } catch (cipherErr) {
                console.error('❌ Cipher error during decryption:', cipherErr.message);
                throw cipherErr;
            }
            
            parsedResponse = JSON.parse(decrypted);
            console.log('✅ DECRYPTION SUCCESS!');
            console.log('-'.repeat(80));
        } catch (decryptErr) {
            console.error('❌ DECRYPTION FAILED:', decryptErr.message);
            
            parsedResponse = {
                paymentStatus: 'PENDING',
                merchantTransactionId: `APP_${Date.now()}`,
                message: `Decryption error: ${decryptErr.message}`,
            };
        }

        // ====================================================================
        // 📋 DISPLAY FULL RESPONSE DATA
        // ====================================================================
        console.log('\n📋 DECRYPTED PAYMENT RESPONSE DATA');
        console.log('='.repeat(80));
        console.log(JSON.stringify(parsedResponse, null, 2));
        console.log('='.repeat(80));

        // ====================================================================
        // 🔍 EXTRACT IMPORTANT FIELDS
        // ====================================================================
        console.log('\n🔍 FIELD EXTRACTION');
        console.log('-'.repeat(80));
        
        const txnId = 
            parsedResponse.merchantTransactionId ||
            parsedResponse.merchantOrderNo ||
            parsedResponse.orderId ||
            `APP_${Date.now()}`;
        
        const paymentStatus = 
            parsedResponse.paymentStatus ||
            parsedResponse.txnStatus ||
            'UNKNOWN';
        
        const amount = 
            parsedResponse.amount ||
            parsedResponse.txnAmount ||
            'N/A';
        
        const getepayTxnId = 
            parsedResponse.getepayTxnId ||
            parsedResponse.txnId ||
            'N/A';

        console.log('✅ Transaction ID:', txnId);
        console.log('✅ Payment Status:', paymentStatus);
        console.log('✅ Amount:', amount);
        console.log('✅ GetePay TXN ID:', getepayTxnId);
        console.log('-'.repeat(80));

        // ====================================================================
        // 💾 UPDATE APPLICATION DATABASE
        // ====================================================================
        console.log('\n💾 DATABASE UPDATE - JOB APPLICATION');
        console.log('-'.repeat(80));
        
        if (txnId) {
            try {
                // Parse order ID to extract applicant ID
                // Format: APP_<applicantId>_<timestamp>
                const orderIdParts = txnId.split('_');
                const applicantId = orderIdParts[1];

                // Determine status
                const newStatus = 
                    paymentStatus === 'SUCCESS' || paymentStatus === 'success'
                        ? 'Success'
                        : (paymentStatus === 'FAILED' || paymentStatus === 'failed' ? 'Failed' : 'Pending');

                // Prepare update data
                const updateData = {
                    paymentStatus: newStatus,
                    gatewayResponse: parsedResponse,
                    paymentId: getepayTxnId !== 'N/A' ? getepayTxnId : undefined,
                    getepayTransactionId: getepayTxnId !== 'N/A' ? getepayTxnId : undefined,
                    updatedAt: new Date(),
                };

                console.log('🔍 Looking for application with ID:', applicantId || txnId);
                console.log('📝 Updating with paymentStatus:', newStatus);

                // Try to find by uniqueId or _id
                let Updated = null;
                
                if (applicantId) {
                    // Try finding by uniqueId in Applicant (NGO Jobs)
                    Updated = await Applicant.findOneAndUpdate(
                        { uniqueId: applicantId },
                        updateData,
                        { new: true }
                    );
                    
                    // If not found in Applicant, try NormalApplicant (General Jobs)
                    if (!Updated) {
                        Updated = await NormalApplicant.findOneAndUpdate(
                            { uniqueId: applicantId },
                            updateData,
                            { new: true }
                        );
                    }
                }

                if (!Updated) {
                    // Try finding by _id if uniqueId didn't work
                    try {
                        Updated = await Applicant.findByIdAndUpdate(
                            applicantId,
                            updateData,
                            { new: true }
                        );
                    } catch (e) {
                        // If Applicant fails, try NormalApplicant
                        try {
                            Updated = await NormalApplicant.findByIdAndUpdate(
                                applicantId,
                                updateData,
                                { new: true }
                            );
                        } catch (e2) {
                            console.warn('⚠️ Could not find applicant with ID:', applicantId);
                        }
                    }
                }

                if (Updated) {
                    console.log('✅ APPLICATION UPDATE SUCCESS!');
                    console.log('   • ID:', Updated.uniqueId);
                    console.log('   • Name:', Updated.fullName);
                    console.log('   • Status:', Updated.paymentStatus);
                    console.log('   • Amount:', Updated.amount);
                    console.log('   • Job Role:', Updated.roleApplied);
                    console.log('   • Payment ID:', Updated.paymentId);
                } else {
                    console.warn('⚠️ WARNING: Application record NOT found for:', applicantId || txnId);
                }
            } catch (dbErr) {
                console.error('❌ DATABASE UPDATE FAILED:', dbErr.message);
                console.error('Stack:', dbErr.stack);
            }
        }

        console.log('-'.repeat(80));

        // ====================================================================
        // 🔄 REDIRECT TO RESPONSE PAGE
        // ====================================================================
        console.log('\n🔄 REDIRECTING TO FRONTEND');
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const responseJson = JSON.stringify(parsedResponse);
        const encodedResponse = encodeURIComponent(responseJson);
        
        const redirectUrl = `${frontendUrl}/?payment=${paymentStatus.toLowerCase()}&response=${encodedResponse}&type=application`;
        console.log('📍 Redirect URL:', redirectUrl.substring(0, 100) + '...');
        console.log('='.repeat(80) + '\n');
        
        return res.redirect(redirectUrl);
        
    } catch (error) {
        console.error('❌ APPLICATION PGRESPONSE ERROR:', error.message);
        console.error('Stack:', error.stack);
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/?payment=error&type=application`);
    }
}));

// ============================================
// 10. ADDITIONAL ROUTES (Legacy - can be refactored to controllers)
// ============================================

// 🔐 EMPLOYEE LOGIN - From Applicant/NormalApplicant collections
app.post('/employee/login', asyncHandler(async (req, res) => {
    try {
        const { emailOrPhone, password } = req.body;

        console.log('\n' + '='.repeat(80));
        console.log('🔍 EMPLOYEE LOGIN ATTEMPT');
        console.log('='.repeat(80));
        console.log('📧 Email/Phone:', emailOrPhone);
        console.log('🔑 Password received:', password ? '✅ Yes' : '❌ No');

        // Validate input
        if (!emailOrPhone || !password) {
            console.log('❌ Missing email/phone or password');
            console.log('='.repeat(80) + '\n');
            return res.status(400).json({ 
                success: false, 
                message: "Email/Phone and password are required" 
            });
        }

        // 1. Search in NGO Applicants first
        let user = await Applicant.findOne({ 
            $or: [
                { email: emailOrPhone },
                { mobile: emailOrPhone }
            ]
        });
        let collectionName = "Applicant (NGO)";

        // 2. If not found, search in Normal Applicants
        if (!user) {
            user = await NormalApplicant.findOne({ 
                $or: [
                    { email: emailOrPhone },
                    { mobile: emailOrPhone }
                ]
            });
            collectionName = "NormalApplicant (General)";
        }

        if (!user) {
            console.log('❌ User not found in either collection');
            console.log('='.repeat(80) + '\n');
            return res.status(401).json({ 
                success: false, 
                message: "Invalid email/phone or password" 
            });
        }

        console.log('✅ User found in:', collectionName);
        console.log('👤 User ID:', user._id);
        console.log('📛 Full Name:', user.fullName);
        console.log('📧 Email:', user.email);
        console.log('📱 Mobile:', user.mobile);

        // 3. Check if password is set
        if (!user.emp_password) {
            console.log('🔒 emp_password exists: ❌ No');
            console.log('❌ emp_password NOT SET - Admin must set password first');
            console.log('='.repeat(80) + '\n');
            return res.status(401).json({ 
                success: false, 
                message: "Password not set by admin. Please contact admin to set your password." 
            });
        }

        console.log('🔒 emp_password exists: ✅ Yes');
        console.log('🔒 emp_password length:', user.emp_password.length);

        // 4. Compare password with bcrypt
        let isPasswordValid = false;
        try {
            isPasswordValid = await bcrypt.compare(password, user.emp_password);
            console.log('🔑 bcrypt comparison result:', isPasswordValid ? '✅ MATCH' : '❌ NO MATCH');
        } catch (bcryptError) {
            console.log('⚠️ bcrypt comparison failed, trying plain text fallback');
            // Fallback to plain text comparison for backwards compatibility
            if (user.emp_password_plain) {
                isPasswordValid = password === user.emp_password_plain;
                console.log('🔑 Plain text comparison result:', isPasswordValid ? '✅ MATCH' : '❌ NO MATCH');
            }
        }

        if (!isPasswordValid) {
            console.log('❌ PASSWORD MISMATCH - LOGIN FAILED');
            console.log('='.repeat(80) + '\n');
            return res.status(401).json({ 
                success: false, 
                message: "Invalid email/phone or password" 
            });
        }

        console.log('✅ PASSWORD VALID - LOGIN SUCCESS');
            // ✅ Set auth token cookie for protected routes
            const accessToken = generateAccessToken(user._id.toString(), user.email, 'employee');
            res.cookie('authToken', accessToken, authTokenCookieOptions);

        // 5. Send Success Response
        const userResponse = {
            _id: user._id,
            uniqueId: user.uniqueId,
            fullName: user.fullName,
            email: user.email,
            mobile: user.mobile,
            emp_username: user.emp_username,
            job_category: collectionName.includes('NGO') ? 'NGO' : 'General',
            roleApplied: user.roleApplied
        };

        console.log('✅ Login successful, returning user data');
        console.log('='.repeat(80) + '\n');

        res.json({ 
            success: true, 
            message: "✅ Login successful", 
            user: userResponse,
            authToken: accessToken,
            session: {
                loginTime: new Date().toISOString(),
                userType: collectionName.includes('NGO') ? 'NGO Job Applicant' : 'Normal Job Applicant'
            }
        });

    } catch (error) {
        console.error('❌ Employee Login Error:', error);
        console.log('='.repeat(80) + '\n');
        res.status(500).json({ 
            success: false, 
            message: "Server error: " + error.message 
        });
    }
}));

// 🔐 EMPLOYEE LOGOUT - Clear auth cookie
app.post('/employee/logout', asyncHandler(async (req, res) => {
    try {
        res.clearCookie('authToken', clearCookieOptions);
        return res.json({
            success: true,
            message: '✅ Employee logged out successfully'
        });
    } catch (error) {
        console.error('❌ Employee Logout Error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Logout failed'
        });
    }
}));

// 🔑 ADMIN: Set/Create Password for Applicant
app.post('/admin/set-password', asyncHandler(async (req, res) => {
    try {
        const { emailOrPhone, password } = req.body;

        console.log('\n' + '='.repeat(80));
        console.log('🔑 ADMIN: SET PASSWORD FOR APPLICANT');
        console.log('='.repeat(80));
        console.log('📧 Email/Phone:', emailOrPhone);
        console.log('🔑 Password:', password ? '✅ Received' : '❌ Missing');

        if (!emailOrPhone || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Email/Phone and password required" 
            });
        }

        // Search in NGO Applicants first
        let user = await Applicant.findOne({ 
            $or: [
                { email: emailOrPhone },
                { mobile: emailOrPhone }
            ]
        });
        let collectionName = "Applicant (NGO)";

        // If not found, search in Normal Applicants
        if (!user) {
            user = await NormalApplicant.findOne({ 
                $or: [
                    { email: emailOrPhone },
                    { mobile: emailOrPhone }
                ]
            });
            collectionName = "NormalApplicant (General)";
        }

        if (!user) {
            console.log('❌ User not found');
            console.log('='.repeat(80) + '\n');
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        console.log('✅ User found in:', collectionName);
        console.log('👤 Name:', user.fullName);

        // Hash and update password
        const salt = await bcrypt.genSalt(10);
        user.emp_username = emailOrPhone;
        user.emp_password = await bcrypt.hash(password, salt);
        user.emp_password_plain = password; // Store plain for admin reference
        
        await user.save();

        console.log('✅ Password updated successfully');
        console.log('🔐 emp_password hash length:', user.emp_password.length);
        console.log('✍️ emp_password_plain stored:', user.emp_password_plain.substring(0, 3) + '***');
        console.log('='.repeat(80) + '\n');

        res.json({
            success: true,
            message: `✅ Password set for ${user.fullName}`,
            user: {
                fullName: user.fullName,
                email: user.email,
                mobile: user.mobile,
                collection: collectionName
            }
        });

    } catch (error) {
        console.error("❌ Set Password Error:", error);
        console.log('='.repeat(80) + '\n');
        res.status(500).json({ 
            success: false, 
            message: "Server error: " + error.message 
        });
    }
}));
;

// Get All Applicants (Admin)
app.get('/admin/get-all-applicants', asyncHandler(async (req, res) => {
    const ngoApplicants = await Applicant.find().sort({ date: -1 }).lean();
    const normalApplicants = await NormalApplicant.find().sort({ date: -1 }).lean();

    const ngoTagged = ngoApplicants.map(a => ({ ...a, job_category: 'NGO' }));
    const normalTagged = normalApplicants.map(a => ({ ...a, job_category: 'general' }));

    return successResponse(res, [...ngoTagged, ...normalTagged]);
}));

// Get All Beneficiaries (Admin)
app.get('/admin/get-all-beneficiaries', asyncHandler(async (req, res) => {
    const silai = await Beneficiary.find().sort({ createdAt: -1 }).lean();
    const swarojgaar = await SwarojgaarGroup.find().sort({ createdAt: -1 }).lean();
    const health = await SwasthyaSurakshaProvider.find().sort({ createdAt: -1 }).lean();

    const combined = [
        ...silai.map(s => ({ ...s, yojanaName: 'Mahila Silai Prasikshan Yojana' })),
        ...swarojgaar.map(s => ({ 
            ...s, 
            yojanaName: 'Mahila Swarojgaar Yojana',
            name: s.groupName || "Unknown Group",
            guardianName: "Group Entry",
            address: `${s.village || ''}, ${s.panchayat || ''}, ${s.district || ''}`,
            mobileNumber: "N/A",
            aadharNumber: "N/A"
        })),
        ...health.map(s => ({ 
            ...s, 
            yojanaName: 'Swasthya Suraksha Yojana',
            name: s.businessName || "Unknown",
            aadharNumber: "N/A",
            mobileNumber: s.whatsappNumber || "N/A"
        }))
    ];

    return successResponse(res, combined);
}));

// ✅ GENERATE CREDENTIALS FOR APPLICANT - Creates login username/password
app.post('/admin/generate-credentials/:applicantId', asyncHandler(async (req, res) => {
    const { applicantId } = req.params;
    
    try {
        console.log('🔐 Generating credentials for applicant:', applicantId);
        
        // Try to find applicant in both NGO and Normal collections
        let applicant = await Applicant.findById(applicantId);
        let isNGOApplicant = true;
        
        if (!applicant) {
            applicant = await NormalApplicant.findById(applicantId);
            isNGOApplicant = false;
        }
        
        if (!applicant) {
            return errorResponse(res, 'Applicant not found', 404);
        }
        
        // ✅ CHECK PAYMENT STATUS - Only allow credential generation if payment is successful
        if (applicant.paymentStatus !== 'Success') {
            console.warn('⚠️ Cannot generate credentials: Payment status is', applicant.paymentStatus);
            return errorResponse(res, `Cannot generate credentials. Payment status is "${applicant.paymentStatus}". Only successful payments can generate credentials.`, 403);
        }
        
        // Generate unique username
        const randomHex = crypto.randomBytes(4).toString('hex');
        const username = applicant.fullName.replace(/\s+/g, '_').toLowerCase() + '_' + randomHex;
        
        // Generate password (8 chars)
        const password = crypto.randomBytes(4).toString('hex');
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Update applicant with credentials
        applicant.emp_username = username;
        applicant.emp_password = hashedPassword;
        applicant.emp_password_plain = password; // Store plain password temporarily for display
        
        await applicant.save();
        
        const collectionName = isNGOApplicant ? 'NGO Applicants' : 'Normal Applicants';
        console.log(`✅ Credentials generated for ${applicant.fullName} in ${collectionName} collection`);
        
        return successResponse(res, {
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
        return errorResponse(res, 'Error generating credentials: ' + error.message, 500);
    }
}));

// ✅ SET PASSWORD FOR APPLICANT - Admin manually sets password
app.post('/admin/set-password/:applicantId', asyncHandler(async (req, res) => {
    const { applicantId } = req.params;
    const { password } = req.body;
    
    try {
        console.log('🔐 Setting password for applicant:', applicantId);
        
        // Validation
        if (!password) {
            return errorResponse(res, 'Password is required', 400);
        }
        
        if (password.length < 6) {
            return errorResponse(res, 'Password must be at least 6 characters', 400);
        }
        
        // Try to find applicant in both NGO and Normal collections
        let applicant = await Applicant.findById(applicantId);
        let isNGOApplicant = true;
        
        if (!applicant) {
            applicant = await NormalApplicant.findById(applicantId);
            isNGOApplicant = false;
        }
        
        if (!applicant) {
            return errorResponse(res, 'Applicant not found', 404);
        }
        
        // Generate unique username if not already exists
        let username = applicant.emp_username;
        if (!username) {
            const randomHex = crypto.randomBytes(4).toString('hex');
            username = applicant.fullName.replace(/\s+/g, '_').toLowerCase() + '_' + randomHex;
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Update applicant with credentials
        applicant.emp_username = username;
        applicant.emp_password = hashedPassword;
        applicant.emp_password_plain = password; // Store plain password temporarily for display
        
        await applicant.save();
        
        const collectionName = isNGOApplicant ? 'NGO Applicants' : 'Normal Applicants';
        console.log(`✅ Password set for ${applicant.fullName} in ${collectionName} collection`);
        
        res.json({
            success: true,
            message: 'Password set successfully!',
            credentials: {
                username: username,
                password: password
            }
        });
    } catch (error) {
        console.error('❌ Set Password Error:', error.message);
        return errorResponse(res, 'Error setting password: ' + error.message, 500);
    }
}));

// ✅ DELETE APPLICANT - Remove from collections
app.delete('/admin/delete-employee/:applicantId', asyncHandler(async (req, res) => {
    const { applicantId } = req.params;
    
    try {
        console.log('🗑️ Attempting to delete applicant:', applicantId);
        
        // Try to delete from NGO collection first
        let result = await Applicant.findByIdAndDelete(applicantId);
        
        if (!result) {
            // Try Normal applicants collection
            result = await NormalApplicant.findByIdAndDelete(applicantId);
        }
        
        if (!result) {
            return errorResponse(res, 'Applicant not found', 404);
        }
        
        console.log(`✅ Applicant deleted: ${result.fullName}`);
        
        return successResponse(res, {
            success: true,
            message: 'Applicant deleted successfully!'
        });
    } catch (error) {
        console.error('❌ Delete Applicant Error:', error.message);
        return errorResponse(res, 'Error deleting applicant: ' + error.message, 500);
    }
}));

// ============================================
// 11. ERROR HANDLING
// ============================================

// 404 Not Found
app.use((req, res) => {
    return errorResponse(res, 'Route not found', 404);
});

// Global error handler (must be last)
app.use(errorHandler);


process.on('SIGTERM', () => {
    console.log('📛 SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('⏹️ Server interrupted');
    process.exit(0);
});

// ============================================
// 12. START SERVER
// ============================================

// Initialize database connection and start server
const startServer = async () => {
    try {
        // Connect to database
        await connectDB();
        console.log('✅ Database connected successfully');

        // Start Express server
        const server = app.listen(process.env.PORT || 5000, process.env.HOST || 'localhost', () => {
            console.log(`\n🚀 Server running on http://${process.env.HOST || 'localhost'}:${process.env.PORT || 5000}`);
            console.log(`📝 Admin Register Route: POST http://${process.env.HOST || 'localhost'}:${process.env.PORT || 5000}/admin-register/register`);
            console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}\n`);
        });

        // Handle server errors
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ Port ${process.env.PORT || 5000} is already in use`);
            } else {
                console.error('❌ Server Error:', error);
            }
            process.exit(1);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

// Start the server only if this file is run directly (not imported)
if (require.main === module) {
    startServer();
}

module.exports = app;
