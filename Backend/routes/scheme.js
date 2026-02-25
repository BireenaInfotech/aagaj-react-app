// Backend/routes/scheme.js

const express = require('express');
const router = express.Router();
const Beneficiary = require('../models/MahilaSilayi');
const { Applicant, NormalApplicant } = require('../models/Applicant');
const multer = require('multer');
const { uploadBufferToCloudinary } = require('../config/cloudinary');

// ✅ Import Auth Middleware
const { verifyAuth, authorizeRoles } = require('../middleware/auth');

// --- Multer Setup: memory storage (buffer sent to Cloudinary) ---
const upload = multer({ storage: multer.memoryStorage() });

// --- Validation helpers ---
const NAME_RE   = /^[^\d\n\r<>]{2,}$/;   // min 2 chars, no digits/HTML
const MOBILE_RE = /^[6-9]\d{9}$/;
const AADHAR_RE = /^\d{12}$/;
const EMAIL_RE  = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const UNIQUE_FIELDS = ['aadharNumber', 'mobileNumber', 'email'];

const getNextSilayiSerialNumber = async () => {
    const yearShort = new Date().getFullYear().toString().slice(-2);
    const regex = new RegExp(`^${yearShort}`);

    const latest = await Beneficiary.findOne({ serialNumber: { $regex: regex } })
        .sort({ serialNumber: -1 })
        .select('serialNumber')
        .lean();

    let nextCount = 1;
    if (latest?.serialNumber && latest.serialNumber.length >= 7) {
        const suffix = latest.serialNumber.slice(2);
        const parsed = parseInt(suffix, 10);
        if (!Number.isNaN(parsed)) {
            nextCount = parsed + 1;
        }
    }

    const serialNumber = `${yearShort}${String(nextCount).padStart(5, '0')}`;
    return serialNumber;
};

// ==========================================
//              API ROUTES
// ==========================================

// ✅ Get next serial number for Silayi registration
router.get('/silayi/next-serial', verifyAuth, authorizeRoles(['employee', 'admin']), async (req, res) => {
    try {
        const serialNumber = await getNextSilayiSerialNumber();
        return res.json({ success: true, serialNumber });
    } catch (error) {
        console.error('Next Serial Error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// 0. ✅ Check unique fields (Email / Mobile / Aadhar)
router.get('/check-unique', async (req, res) => {
    try {
        const { field, value } = req.query;

        if (!field || !value) {
            return res.status(400).json({ success: false, message: 'Field and value are required' });
        }

        if (!UNIQUE_FIELDS.includes(field)) {
            return res.status(400).json({ success: false, message: 'Invalid field' });
        }

        const query = { [field]: field === 'email' ? value.toLowerCase() : value };
        const existing = await Beneficiary.findOne(query).lean();

        return res.json({ success: true, field, exists: !!existing });
    } catch (error) {
        console.error('Unique Check Error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// 1. 🔐 PROTECTED: Initiate Silayi Registration (Creates Pending record before payment)
router.post('/silayi/initiate', verifyAuth, authorizeRoles(['employee', 'admin']), upload.single('photo'), async (req, res) => {
    try {
        const {
            yojanaName, serialNumber, name, guardianName, address, mobileNumber,
            gender, email, aadharNumber, age, caste, trainingName,
            existingSkills, trainingDuration, trainingDate,
            registrationFee, paymentOrderId, registeredByName
        } = req.body;

        // --- Field Validation ---
        const validationErrors = {};
        if (!name || !NAME_RE.test(name.trim()))          validationErrors.name         = 'नाम केवल अक्षरों में होना चाहिए';
        if (!mobileNumber || !MOBILE_RE.test(mobileNumber)) validationErrors.mobileNumber = 'मोबाइल नंबर 10 अंक का होना चाहिए (6-9 से शुरू)';
        if (!aadharNumber || !AADHAR_RE.test(aadharNumber)) validationErrors.aadharNumber = 'आधार नंबर 12 अंकों का होना चाहिए';
        if (!address || address.trim().length < 5)         validationErrors.address      = 'पता आवश्यक है';
        if (!gender)                                        validationErrors.gender       = 'लिंग चुनें';
        if (email && !EMAIL_RE.test(email))                validationErrors.email        = 'Email सही नहीं है';
        if (age && (isNaN(age) || age < 15 || age > 60))  validationErrors.age          = 'उम्र 15-60 के बीच होनी चाहिए';

        if (Object.keys(validationErrors).length > 0) {
            return res.status(422).json({ success: false, message: 'Validation failed', errors: validationErrors });
        }

        const duplicateChecks = [
            { field: 'aadharNumber', value: aadharNumber },
            { field: 'mobileNumber', value: mobileNumber }
        ];

        if (email) {
            duplicateChecks.push({ field: 'email', value: email.toLowerCase() });
        }

        for (const check of duplicateChecks) {
            const existing = await Beneficiary.findOne({ [check.field]: check.value });
            if (existing) {
                return res.status(409).json({
                    success: false,
                    message: `This ${check.field} is already registered!`,
                    field: check.field
                });
            }
        }

        const orderId = paymentOrderId || `SILAI_${Date.now()}`;
        const serverSerialNumber = await getNextSilayiSerialNumber();

        // --- Cloudinary Photo Upload ---
        let photoUrl = '';
        if (req.file) {
            try {
                const publicId = `silayi_${serverSerialNumber}_${Date.now()}`;
                photoUrl = await uploadBufferToCloudinary(req.file.buffer, 'agaz/silayi', publicId);
                console.log('☁️  Silayi photo uploaded to Cloudinary:', photoUrl);
            } catch (uploadError) {
                console.error('Cloudinary upload failed:', uploadError.message);
            }
        }

        const newBeneficiary = new Beneficiary({
            yojanaName,
            serialNumber: serverSerialNumber,
            name,
            guardianName,
            address,
            mobileNumber,
            gender,
            email: email ? email.toLowerCase() : undefined,
            aadharNumber,
            age,
            caste,
            trainingName,
            existingSkills,
            trainingDuration,
            trainingDate: trainingDate || new Date().toLocaleDateString('en-IN'),
            photoUrl,
            paymentStatus: 'Pending',
            registrationFee: registrationFee || 799,
            paymentOrderId: orderId,
            registeredBy: req.user?.userId || req.user?.email || 'Employee',
            registeredByName: registeredByName || req.user?.email || 'Employee'
        });

        await newBeneficiary.save();

        return res.json({
            success: true,
            message: 'Registration initiated. Awaiting payment.',
            orderId,
            data: newBeneficiary
        });
    } catch (error) {
        console.error('Silayi Initiate Error:', error);
        return res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
    }
});

// 2. 🔐 PROTECTED: Register New Beneficiary (Silai / Swarojgaar / Swasthya)
router.post('/register', verifyAuth, authorizeRoles(['employee', 'admin']), upload.single('photo'), async (req, res) => {
    try {
        const {
            yojanaName, serialNumber, name, guardianName, address, mobileNumber,
            gender, email, aadharNumber, age, caste, trainingName,
            existingSkills, trainingDuration, trainingDate, 
            paymentStatus, registrationFee, registeredBy, 
            paymentId // ✅ Receive Payment ID from frontend
        } = req.body;

        // 1. Basic Validation
        if (!name || !mobileNumber || !aadharNumber) {
            return res.status(400).json({ success: false, message: "Required fields (Name, Mobile, Aadhar) are missing." });
        }

        const duplicateChecks = [
            { field: 'aadharNumber', value: aadharNumber },
            { field: 'mobileNumber', value: mobileNumber }
        ];

        if (email) {
            duplicateChecks.push({ field: 'email', value: email.toLowerCase() });
        }

        for (const check of duplicateChecks) {
            const existing = await Beneficiary.findOne({ [check.field]: check.value });
            if (existing) {
                return res.status(409).json({
                    success: false,
                    message: `This ${check.field} is already registered!`,
                    field: check.field
                });
            }
        }

        if (!paymentId && paymentStatus !== 'Paid') {
            return res.status(400).json({
                success: false,
                message: 'Payment required before registration.'
            });
        }

        // 3. Create New Entry
        let regPhotoUrl = '';
        if (req.file) {
            try {
                const pid = `silayi_reg_${Date.now()}`;
                regPhotoUrl = await uploadBufferToCloudinary(req.file.buffer, 'agaz/silayi', pid);
            } catch (e) { console.error('Cloudinary upload error (register):', e.message); }
        }
        const newBeneficiary = new Beneficiary({
            yojanaName,
            serialNumber,
            name,
            guardianName,
            address,
            mobileNumber,
            gender,
            email,
            aadharNumber,
            age,
            caste,
            trainingName,
            existingSkills,
            trainingDuration,
            trainingDate: trainingDate || new Date().toLocaleDateString('en-IN'),
            photoUrl: regPhotoUrl,
            
            // ✅ Payment Logic Update: If paymentId exists, mark as Paid
            paymentStatus: paymentId ? 'Paid' : (paymentStatus || 'Pending'),
            registrationFee: registrationFee || 799,
            registeredBy: req.user?.userId || req.user?.email || registeredBy || 'Admin/Self'
        });

        await newBeneficiary.save();

        res.json({
            success: true,
            message: "Registration & Payment Successful!",
            data: newBeneficiary
        });

    } catch (error) {
        console.error("Scheme Registration Error:", error);
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
});

// 2. Get All Beneficiaries (For Admin Dashboard)
router.get('/all-beneficiaries', async (req, res) => {
    try {
        const { yojana } = req.query;
        let query = {};
        if (yojana) {
            query.yojanaName = yojana;
        }
        const list = await Beneficiary.find(query).sort({ createdAt: -1 }).lean();

        const idRegex = /^[0-9a-fA-F]{24}$/;
        const registeredIds = Array.from(
            new Set(
                list
                    .map(item => item.registeredBy)
                    .filter(value => typeof value === 'string' && idRegex.test(value))
            )
        );

        let nameMap = {};
        if (registeredIds.length > 0) {
            const applicants = await Applicant.find({ _id: { $in: registeredIds } })
                .select('fullName email emp_username')
                .lean();
            const normalApplicants = await NormalApplicant.find({ _id: { $in: registeredIds } })
                .select('fullName email emp_username')
                .lean();

            const combined = [...applicants, ...normalApplicants];
            nameMap = combined.reduce((acc, item) => {
                acc[item._id.toString()] = item.fullName || item.emp_username || item.email || 'Employee';
                return acc;
            }, {});
        }

        const data = list.map(item => ({
            ...item,
            registeredByName: item.registeredByName || nameMap[item.registeredBy] || item.registeredBy
        }));

        res.json({ success: true, count: data.length, data });
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ success: false, message: "Error fetching data" });
    }
});

module.exports = router;
