// Backend/routes/healthcard.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;
const HealthCard = require('../models/HealthCard');

// ✅ Import Auth Middleware
const { verifyAuth, optionalAuth } = require('../middleware/auth');

// 🔧 Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer Setup for Photo Upload (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1 * 1024 * 1024 }, // 1MB limit
    fileFilter: (req, file, cb) => {
        // Allow only image files
        const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// 🟢 PUBLIC: Upload Image to Cloudinary
router.post('/upload', upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: 'No file provided' 
            });
        }

        // Upload to Cloudinary using memory buffer
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { 
                    folder: 'healthcards',
                    resource_type: 'auto',
                    public_id: `healthcard-${Date.now()}`
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(req.file.buffer);
        });

        res.json({ 
            success: true, 
            data: {
                secure_url: result.secure_url,
                public_id: result.public_id,
                url: result.secure_url
            }
        });

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Upload failed" 
        });
    }
});

// 🟢 PUBLIC: Register Health Card with PENDING Status (on payment button click)
router.post('/register-pending', async (req, res) => {
    try {
        const {
            fullName,
            mobile,
            aadhar,
            age,
            gender,
            bloodGroup,
            village,
            panchayat,
            block,
            district,
            state,
            pincode,
            photoData,
            orderId,
            amount
        } = req.body;

        console.log('');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('📝 CREATING PENDING HEALTH CARD RECORD');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('📋 Registering:', fullName);
        console.log('📞 Mobile:', mobile);
        console.log('🆔 Aadhar:', aadhar);
        console.log('💳 Order ID:', orderId);
        console.log('💰 Amount: ₹' + amount);
        console.log('⏳ Status: PENDING');
        console.log('');

        // Check for duplicates
        const existingUser = await HealthCard.findOne({ $or: [{ mobile }, { aadhar }] });
        if (existingUser) {
            console.log('❌ Duplicate found');
            return res.status(400).json({ 
                success: false, 
                message: "This mobile or aadhar already exists" 
            });
        }

        // Generate unique Health ID
        let healthId;
        let isUnique = false;
        let attempts = 0;
        
        while (!isUnique && attempts < 10) {
            const randomNum = Math.floor(100000 + Math.random() * 900000);
            healthId = `MC-${randomNum}`;
            
            const existingId = await HealthCard.findOne({ healthId });
            if (!existingId) {
                isUnique = true;
            }
            attempts++;
        }

        if (!isUnique) {
            return res.status(500).json({ 
                success: false, 
                message: "Failed to generate unique health ID" 
            });
        }

        console.log('✅ Generated Health ID:', healthId);

        // Calculate 6-month expiry
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 6);

        // Create PENDING record
        const newCard = new HealthCard({
            healthId,
            fullName: fullName.toUpperCase(),
            mobile,
            aadhar,
            age: parseInt(age),
            gender,
            bloodGroup,
            address: {
                village: village || '',
                panchayat: panchayat || '',
                block: block || '',
                district: district || '',
                state: state || '',
                pincode: pincode || ''
            },
            photoPath: photoData || '',
            paymentId: '', // Will be filled after payment succeeds
            orderId,
            amount: parseFloat(amount),
            paymentStatus: 'Pending', // PENDING until payment succeeds
            expiryDate,
            paymentGateway: 'Getepay'
        });

        const savedCard = await newCard.save();

        console.log('✅ Pending Record Created');
        console.log('📊 Record ID:', savedCard._id);
        console.log('⏳ Waiting for payment confirmation...');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('');

        res.json({ 
            success: true, 
            data: {
                _id: savedCard._id,
                healthId: savedCard.healthId,
                status: 'Pending'
            },
            message: 'Health card registration pending. Complete payment to activate.'
        });

    } catch (error) {
        console.error("❌ Register Pending Error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Registration failed" 
        });
    }
});

// 🟢 PUBLIC: Update Payment Response (when payment succeeds)
router.post('/update-payment-response', async (req, res) => {
    try {
        const {
            healthCardId,
            txnStatus,
            getepayTxnId,
            amount
        } = req.body;

        console.log('');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('✅ UPDATING HEALTH CARD WITH PAYMENT SUCCESS');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('🎯 Health Card ID:', healthCardId);
        console.log('💳 Txn Status:', txnStatus);
        console.log('🔑 Getepay Txn ID:', getepayTxnId);
        console.log('💰 Amount: ₹' + amount);
        console.log('');

        // Find and update the pending record
        const updatedCard = await HealthCard.findByIdAndUpdate(
            healthCardId,
            {
                paymentStatus: 'Paid',
                paymentId: getepayTxnId
            },
            { new: true }
        );

        if (!updatedCard) {
            console.log('❌ Health Card not found:', healthCardId);
            return res.status(404).json({ 
                success: false, 
                message: "Health card not found" 
            });
        }

        console.log('✅ Payment Status Updated to PAID');
        console.log('🎯 Health ID:', updatedCard.healthId);
        console.log('📊 Record ID:', updatedCard._id);
        console.log('═══════════════════════════════════════════════════════════');
        console.log('✨ HEALTH CARD ACTIVATION COMPLETE ✨');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('');

        res.json({ 
            success: true, 
            data: updatedCard,
            message: 'Health card activated successfully'
        });

    } catch (error) {
        console.error("❌ Update Payment Error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Update failed" 
        });
    }
});

// 🟢 PUBLIC: Handle Getepay Payment Response Redirect (from payment gateway)
router.post('/payment-response', async (req, res) => {
    try {
        const crypto = require('crypto');
        const paymentResponse = req.body.response || req.body.data || req.body.req;

        console.log('');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('🔔 HEALTH CARD - GETEPAY PAYMENT RESPONSE RECEIVED');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('📥 Request Body Keys:', Object.keys(req.body));
        console.log('💳 Encrypted Response Length:', paymentResponse?.length || 0);
        console.log('');

        if (!paymentResponse) {
            console.error('❌ ERROR: No encrypted response found in body');
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/healthcard?payment=failed`);
        }

        let parsedResponse = null;
        let decryptSuccess = false;

        try {
            console.log('🔐 DECRYPTION PROCESS');
            console.log('-'.repeat(80));

            const key = process.env.GETEPAY_KEY || 'JoYPd+qso9s7T+Ebj8pi4Wl8i+AHLv+5UNJxA3JkDgY=';
            const iv = process.env.GETEPAY_IV || 'hlnuyA9b4YxDq6oJSZFl8g==';

            // MATCH FRONTEND ENCRYPTION EXACTLY
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
                message: `Decryption error: ${decryptErr.message}`,
            };
        }

        console.log('');
        console.log('📋 DECRYPTED PAYMENT RESPONSE DATA');
        console.log('='.repeat(80));
        console.log(JSON.stringify(parsedResponse, null, 2));
        console.log('='.repeat(80));
        console.log('');

        // Extract transaction details
        const txnStatus = parsedResponse.paymentStatus || parsedResponse.txnStatus || 'UNKNOWN';
        const getepayTxnId = parsedResponse.getepayTxnId || parsedResponse.txnId || 'N/A';
        const merchantOrderNo = parsedResponse.merchantOrderNo || parsedResponse.orderId || 'N/A';
        const amount = parsedResponse.amount || parsedResponse.txnAmount || 'N/A';

        console.log('✅ Transaction Details:');
        console.log('  ✓ Status:', txnStatus);
        console.log('  ✓ Transaction ID:', getepayTxnId);
        console.log('  ✓ Order No:', merchantOrderNo);
        console.log('  ✓ Amount:', amount);
        console.log('');

        // Find health card by orderId and update it
        if (decryptSuccess && txnStatus === 'SUCCESS') {
            try {
                console.log('🔍 Finding health card record by order...');
                const healthCard = await HealthCard.findOne({ orderId: merchantOrderNo });

                if (!healthCard) {
                    console.error('❌ Health card not found for order:', merchantOrderNo);
                    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/healthcard?payment=failed`);
                }

                console.log('✅ Found health card:', healthCard.healthId);

                // Update to PAID status with complete payment response
                healthCard.paymentStatus = 'Paid';
                healthCard.paymentId = getepayTxnId;
                healthCard.paymentResponse = parsedResponse; // Store complete Getepay response
                healthCard.updatedAt = new Date();
                await healthCard.save();

                console.log('');
                console.log('═══════════════════════════════════════════════════════════');
                console.log('✨ HEALTH CARD ACTIVATED SUCCESSFULLY! ✨');
                console.log('═══════════════════════════════════════════════════════════');
                console.log('🎯 Health Card ID:', healthCard.healthId);
                console.log('📊 Database ID:', healthCard._id);
                console.log('✓ Status: Paid');
                console.log('✓ Getepay Txn ID:', getepayTxnId);
                console.log('');
                console.log('📦 COMPLETE PAYMENT RESPONSE STORED:');
                console.log('-'.repeat(80));
                console.log(JSON.stringify(parsedResponse, null, 2));
                console.log('-'.repeat(80));
                console.log('═══════════════════════════════════════════════════════════');
                console.log('');

                // Redirect back to frontend success page with health card ID
                const successUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/healthcard?payment=response&healthCardId=${healthCard._id}`;
                res.redirect(successUrl);

            } catch (updateError) {
                console.error('❌ Error updating health card:', updateError.message);
                res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/healthcard?payment=failed`);
            }
        } else {
            console.error('❌ Payment failed or decryption unsuccessful');
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/healthcard?payment=failed`);
        }

    } catch (error) {
        console.error('❌ Payment Response Handler Error:', error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/healthcard?payment=failed&error=handler_error`);
    }
});

router.post('/check-exists', async (req, res) => {
    try {
        const { mobile, aadhar } = req.body;
        
        console.log('🔍 Checking if user exists...');
        console.log('  ✓ Mobile:', mobile);
        console.log('  ✓ Aadhar:', aadhar);
        
        // Build query dynamically to handle single field checks
        let queryArr = [];
        if (mobile) queryArr.push({ mobile });
        if (aadhar) queryArr.push({ aadhar });

        if (queryArr.length === 0) return res.json({ exists: false });

        const existingUser = await HealthCard.findOne({ $or: queryArr });

        if (existingUser) {
            console.log('✅ User found - Duplicate!');
            return res.json({ 
                exists: true, 
                message: "This contact number or aadhar number is already exist" 
            });
        }

        console.log('✅ No duplicate found - User can proceed');

        res.json({ exists: false });
    } catch (error) {
        console.error("Check Exists Error:", error);
        res.status(500).json({ exists: false, message: "Server Error" });
    }
});

// 🟢 PUBLIC: Create Order for Getepay Payment
router.post('/create-order', async (req, res) => {
    try {
        const { amount, fullName, mobile, aadhar } = req.body;

        console.log('');
        console.log('💰 Creating Payment Order...');
        console.log('  ✓ Name:', fullName);
        console.log('  ✓ Mobile:', mobile);
        console.log('  ✓ Amount: ₹' + amount);

        if (!amount || !fullName || !mobile || !aadhar) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Generate unique Order ID
        const orderId = `HC-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        
        console.log('✅ Order Created:', orderId);

        res.json({ 
            success: true, 
            orderId,
            amount,
            message: 'Order created successfully'
        });

    } catch (error) {
        console.error("❌ Create Order Error:", error);
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
});

// 🔐 NEW: API to Verify Getepay Payment & Save Data
router.post('/payment-response', upload.single('photo'), async (req, res) => {
    try {
        const {
            orderId,
            txnStatus,
            getepayTxnId,
            amount,
            fullName,
            mobile,
            aadhar,
            age,
            gender,
            bloodGroup,
            village,
            panchayat,
            block,
            district,
            state,
            pincode,
            photoData
        } = req.body;

        console.log('');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('📱 HEALTH CARD PAYMENT RESPONSE RECEIVED');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('🔹 Order ID:', orderId);
        console.log('🔹 Transaction Status:', txnStatus);
        console.log('🔹 Getepay Txn ID:', getepayTxnId);
        console.log('🔹 Amount:', amount);
        console.log('');
        console.log('📋 PATIENT DETAILS:');
        console.log('  ✓ Name:', fullName);
        console.log('  ✓ Mobile:', mobile);
        console.log('  ✓ Aadhar:', aadhar);
        console.log('  ✓ Age:', age);
        console.log('  ✓ Gender:', gender);
        console.log('  ✓ Blood Group:', bloodGroup);
        console.log('');
        console.log('📍 ADDRESS:');
        console.log('  ✓ Village:', village);
        console.log('  ✓ Panchayat:', panchayat);
        console.log('  ✓ Block:', block);
        console.log('  ✓ District:', district);
        console.log('  ✓ State:', state);
        console.log('  ✓ Pincode:', pincode);
        console.log('');
        console.log('🖼️  PHOTO:', photoData ? (photoData.startsWith('http') ? 'Cloudinary URL (✓)' : 'Base64 Data (✓)') : 'No Photo');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('');

        // 1. Verify Payment Status
        if (txnStatus !== 'Success' && txnStatus !== 'success') {
            console.log('❌ Payment Status Failed:', txnStatus);
            return res.status(400).json({ 
                success: false, 
                message: "Payment verification failed" 
            });
        }

        console.log('✅ Payment Status Verified: SUCCESS');

        // 2. Double Check for Duplicates (Safety Net)
        console.log('🔍 Checking for duplicate records...');
        const existingUser = await HealthCard.findOne({ $or: [{ mobile }, { aadhar }] });
        if (existingUser) {
            console.log('❌ Duplicate Found - Existing Health ID:', existingUser.healthId);
            return res.status(400).json({ 
                success: false, 
                message: "Data already exists for this Mobile or Aadhar." 
            });
        }
        console.log('✅ No duplicates found - Proceeding...');

        // 3. Generate Unique Health ID (e.g., MC-123456)
        console.log('🔧 Generating unique Health Card ID...');
        let healthId;
        let isUnique = false;
        let attempts = 0;
        
        while (!isUnique && attempts < 10) {
            const randomNum = Math.floor(100000 + Math.random() * 900000);
            healthId = `MC-${randomNum}`;
            
            const existingId = await HealthCard.findOne({ healthId });
            if (!existingId) {
                isUnique = true;
            }
            attempts++;
        }

        if (!isUnique) {
            console.log('❌ Failed to generate unique Health ID');
            return res.status(500).json({ 
                success: false, 
                message: "Failed to generate unique health ID" 
            });
        }

        console.log('✅ Generated Health ID:', healthId);

        // 4. Calculate Expiry Date (6 Months from now)
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 6);
        console.log('✅ Card Validity:', new Date().toLocaleDateString(), 'to', expiryDate.toLocaleDateString());

        // 5. Process photo (Cloudinary URL or file)
        let photoPath = '';
        if (photoData && photoData.startsWith('http')) {
            photoPath = photoData;
            console.log('✅ Using Cloudinary URL for photo');
        } else if (req.file) {
            photoPath = `/uploads/healthcards/${req.file.filename}`;
            console.log('✅ Using server file upload for photo');
        } else {
            console.log('⚠️  No photo attached');
        }

        // 6. Save to DB
        console.log('💾 Saving to MongoDB...');
        const newCard = new HealthCard({
            healthId,
            fullName: fullName.toUpperCase(),
            mobile,
            aadhar,
            age: parseInt(age),
            gender,
            bloodGroup,
            address: {
                village: village || '',
                panchayat: panchayat || '',
                block: block || '',
                district: district || '',
                state: state || '',
                pincode: pincode || ''
            },
            photoPath,
            paymentId: getepayTxnId,
            orderId,
            amount: parseFloat(amount),
            paymentStatus: 'Paid',
            expiryDate,
            paymentGateway: 'Getepay'
        });

        const savedCard = await newCard.save();

        console.log('✅ Health Card Saved Successfully!');
        console.log('📊 Database ID:', savedCard._id);
        console.log('');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('✨ HEALTH CARD GENERATED SUCCESSFULLY ✨');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('');

        res.json({ 
            success: true, 
            data: savedCard,
            message: 'Health card created successfully'
        });

    } catch (error) {
        console.error("❌ Error saving health card:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server Error: " + error.message 
        });
    }
});

// 🟢 PUBLIC: Get Health Card by Aadhar Number
router.get('/aadhar/:aadhar', async (req, res) => {
    try {
        const { aadhar } = req.params;

        console.log('');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('📄 FETCHING HEALTH CARD BY AADHAR');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('🆔 Aadhar:', aadhar);
        console.log('');

        const healthCard = await HealthCard.findOne({ aadhar });

        if (!healthCard) {
            console.error('❌ Health card not found for aadhar:', aadhar);
            return res.status(404).json({ 
                success: false, 
                message: "No health card found for this Aadhar number" 
            });
        }

        console.log('✅ Health Card Found:');
        console.log('  ✓ Health ID:', healthCard.healthId);
        console.log('  ✓ Name:', healthCard.fullName);
        console.log('  ✓ Mobile:', healthCard.mobile);
        console.log('  ✓ Status:', healthCard.paymentStatus);
        console.log('═══════════════════════════════════════════════════════════');
        console.log('');

        res.json({ 
            success: true, 
            data: healthCard
        });

    } catch (error) {
        console.error("❌ Get Card by Aadhar Error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Failed to fetch card" 
        });
    }
});

// 🟢 PUBLIC: Get Health Card by Health ID
router.get('/health-id/:healthId', async (req, res) => {
    try {
        const { healthId } = req.params;

        console.log('');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('📄 FETCHING HEALTH CARD BY HEALTH ID');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('🔑 Health ID:', healthId);
        console.log('');

        const healthCard = await HealthCard.findOne({ healthId });

        if (!healthCard) {
            console.error('❌ Health card not found for health ID:', healthId);
            return res.status(404).json({ 
                success: false, 
                message: "No health card found for this Health ID" 
            });
        }

        console.log('✅ Health Card Found:');
        console.log('  ✓ Health ID:', healthCard.healthId);
        console.log('  ✓ Name:', healthCard.fullName);
        console.log('  ✓ Mobile:', healthCard.mobile);
        console.log('  ✓ Aadhar:', healthCard.aadhar);
        console.log('  ✓ Status:', healthCard.paymentStatus);
        console.log('═══════════════════════════════════════════════════════════');
        console.log('');

        res.json({ 
            success: true, 
            data: healthCard
        });

    } catch (error) {
        console.error("❌ Get Card by Health ID Error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Failed to fetch card" 
        });
    }
});

// 🟢 PUBLIC: Get Health Card by ID
router.get('/:id', async (req, res) => {
    try {
        const card = await HealthCard.findById(req.params.id);
        if (!card) {
            return res.status(404).json({ success: false, message: "Card not found" });
        }
        res.json({ success: true, data: card });
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 🟢 PUBLIC: Get All Health Cards (with search/pagination)
router.get('/', async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        let query = {};
        if (search) {
            query = {
                $or: [
                    { fullName: { $regex: search, $options: 'i' } },
                    { mobile: { $regex: search, $options: 'i' } },
                    { healthId: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const total = await HealthCard.countDocuments(query);
        const cards = await HealthCard.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: cards,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 🟢 PUBLIC: Get Health Card by ID (for success page display)
router.get('/get-by-id/:id', async (req, res) => {
    try {
        const { id } = req.params;

        console.log('');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('📄 FETCHING HEALTH CARD DETAILS');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('🔍 Health Card ID:', id);
        console.log('');

        // Try to search by healthId first, then by MongoDB _id
        let healthCard = await HealthCard.findOne({ healthId: id });

        if (!healthCard) {
            // If not found by healthId, try by MongoDB ObjectId
            try {
                healthCard = await HealthCard.findById(id);
            } catch (err) {
                // ObjectId parsing failed, continue
            }
        }

        if (!healthCard) {
            console.error('❌ Health card not found');
            return res.status(404).json({ 
                success: false, 
                message: "Health card not found" 
            });
        }

        console.log('✅ Health Card Found:');
        console.log('  ✓ Health ID:', healthCard.healthId);
        console.log('  ✓ Name:', healthCard.fullName);
        console.log('  ✓ Status:', healthCard.paymentStatus);
        console.log('═══════════════════════════════════════════════════════════');
        console.log('');

        res.json({ 
            success: true, 
            data: healthCard
        });

    } catch (error) {
        console.error("❌ Get Card Error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Failed to fetch card" 
        });
    }
});

module.exports = router;
