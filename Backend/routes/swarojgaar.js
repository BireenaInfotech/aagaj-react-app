// Backend/routes/swarojgaar.js

const express = require('express');
const router = express.Router();
const SwarojgaarGroup = require('../models/SwarojgaarGroup');
const { Applicant, NormalApplicant } = require('../models/Applicant');
const multer = require('multer');
const { uploadBufferToCloudinary } = require('../config/cloudinary');

// ✅ Import Auth Middleware
const { verifyAuth, authorizeRoles } = require('../middleware/auth');

// --- Multer: memory storage (buffer → Cloudinary) ---
const upload = multer({ storage: multer.memoryStorage() });

// --- Validation helpers ---
const MOBILE_RE = /^[6-9]\d{9}$/;
const AADHAR_RE = /^\d{12}$/;

// ==========================================
//              API ROUTES
// ==========================================

// 1. 🔐 PROTECTED: Initiate Swarojgaar Group (Pending until payment)
// upload.any() का उपयोग कर रहे हैं ताकि dynamic field names (members[0][photo]) को हैंडल कर सकें
router.post('/initiate', verifyAuth, authorizeRoles(['employee', 'admin']), upload.any(), async (req, res) => {
    try {
        // 1. Extract flat fields from req.body (Frontend sends them separately)
        const { 
            village, panchayat, anumandal, district, groupName, registeredBy,
            paymentStatus, registrationFee, paymentOrderId, registeredByName
        } = req.body;

        // 2. Construct Location Object manually
        const location = {
            village: village || "",
            panchayat: panchayat || "",
            subDivision: anumandal || "", // Map anumandal to subDivision
            district: district || ""
        };

        if (!groupName) {
            return res.status(400).json({ success: false, message: "Group Name is required." });
        }

        if (!village || !district) {
            return res.status(422).json({ success: false, message: 'Validation failed', errors: {
                village: !village ? 'गाँव आवश्यक है' : '',
                district: !district ? 'जिला आवश्यक है' : ''
            }});
        }

        if (!registrationFee || Number(registrationFee) <= 0) {
            return res.status(400).json({ success: false, message: 'Payment amount is required.' });
        }

        // 3. Process Members
        // Parse members JSON string from frontend
        let membersData = [];
        try {
            membersData = req.body.members ? JSON.parse(req.body.members) : [];
        } catch (e) {
            console.error("JSON Parse Error:", e);
            return res.status(400).json({ success: false, message: "Invalid members data format" });
        }

        const processedMembers = await Promise.all(membersData.map(async (m) => {
            const detailsParts = m.details ? m.details.split('|').map(s => s.trim()) : [];
            const aadhar  = detailsParts[0] || '';
            const mobile  = detailsParts[2] || '';

            // Validate member fields if they have data
            if (aadhar && !AADHAR_RE.test(aadhar)) {
                throw Object.assign(new Error(`सदस्य ${m.index + 1}: आधार 12 अंकों का होना चाहिए`), { statusCode: 422 });
            }
            if (mobile && !MOBILE_RE.test(mobile)) {
                throw Object.assign(new Error(`सदस्य ${m.index + 1}: मोबाइल 10 अंकों का हो (6-9 से शुरू)` ), { statusCode: 422 });
            }

            // Upload photo to Cloudinary
            const photoFile = req.files.find(f => f.fieldname === `member_photo_${m.index}`);
            let photoUrl = '';
            if (photoFile) {
                try {
                    const pid = `swaro_member_${m.index}_${Date.now()}`;
                    photoUrl = await uploadBufferToCloudinary(photoFile.buffer, 'agaz/swarojgaar', pid);
                    console.log(`☁️  Member ${m.index} photo uploaded:`, photoUrl);
                } catch (upErr) {
                    console.error('Cloudinary upload error:', upErr.message);
                }
            }

            return {
                fullName: m.name || '',
                address: m.address || '',
                aadharCard: aadhar,
                panCard: detailsParts[1] || '',
                mobileNumber: mobile,
                photoUrl
            };
        }));

        const filteredMembers = processedMembers.filter(m => m.fullName.trim() !== '');

        const orderId = paymentOrderId || `SWARO_${Date.now()}`;

        // 3. डेटाबेस में सेव करें
        const newGroup = new SwarojgaarGroup({
            location,
            groupName,
            members: filteredMembers,
            termsAccepted: true,
            registeredBy: req.user?.userId || req.user?.email || registeredBy || 'Admin/Self',
            registeredByName: registeredByName || req.user?.email || 'Employee',
            
            // ✅ Payment Info Save
            paymentStatus: paymentStatus || 'Pending',
            paymentId: '',
            paymentOrderId: orderId,
            registrationFee: registrationFee ? parseInt(registrationFee, 10) : 100 // Default Fee
        });

        await newGroup.save();

        res.json({
            success: true,
            message: "Swarojgaar Group initiated. Awaiting payment.",
            orderId,
            data: newGroup
        });

    } catch (error) {
        console.error("Swarojgaar Registration Error:", error);
        if (error.statusCode === 422) {
            return res.status(422).json({ success: false, message: error.message });
        }
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Group Name already exists!" });
        }
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
});

// 2. Get All Groups (GET) - Admin Dashboard के लिए
router.get('/all-groups', verifyAuth, authorizeRoles(['employee', 'admin']), async (req, res) => {
    try {
        const groups = await SwarojgaarGroup.find().sort({ createdAt: -1 }).lean();

        const idRegex = /^[0-9a-fA-F]{24}$/;
        const registeredIds = Array.from(
            new Set(
                groups
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

        const data = groups.map(group => ({
            ...group,
            registeredByName: group.registeredByName || nameMap[group.registeredBy] || group.registeredBy
        }));

        res.json({ success: true, count: data.length, data });
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ success: false, message: "Error fetching groups" });
    }
});

module.exports = router;
