// Backend/routes/healthpartner.js

const express = require('express');
const router = express.Router();
const HealthPartner = require('../models/HealthPartner');

// ✅ Import Auth Middleware
const { verifyAuth, optionalAuth } = require('../middleware/auth');

// 🔐 PROTECTED: POST: Register a new partner
router.post('/register', verifyAuth, async (req, res) => {
    try {
        const {
            type, // Maps to category
            biz,  // Maps to businessName
            details,
            extraInfo, // Maps to specificDetails
            license,
            addr,
            addrExtra,
            city,
            state,
            pin,
            owner,
            phone,
            services,
            registeredBy
        } = req.body;

        // Check if license already exists
        const existingPartner = await HealthPartner.findOne({ licenseNumber: license });
        if (existingPartner) {
            return res.status(400).json({ success: false, message: "Partner with this License Number already exists." });
        }

        // ✅ Generate Unique ID (Format: 100026 -> Counter + YearSuffix)
        const date = new Date();
        const yearSuffix = date.getFullYear().toString().slice(-2); // e.g., "26" for 2026
        
        // इस साल के आखिरी रजिस्टर्ड पार्टनर को ढूंढें
        const lastPartner = await HealthPartner.findOne({ 
            uniqueId: { $regex: `${yearSuffix}$` } // जो इस साल के सफिक्स के साथ खत्म हो
        }).sort({ _id: -1 }); // Sort by _id to get the absolute last one

        let counter = 1000; // डिफ़ॉल्ट शुरुआत
        if (lastPartner && lastPartner.uniqueId) {
            // पुरानी आईडी से काउंटर निकालें (e.g., "100026" -> "1000")
            const lastCounterStr = lastPartner.uniqueId.slice(0, -2);
            const lastCounter = parseInt(lastCounterStr);
            if (!isNaN(lastCounter)) {
                counter = lastCounter + 1;
            }
        }
        const newUniqueId = `${counter}${yearSuffix}`;

        // ✅ Map extraInfo to specific schema fields based on Category
        let specificData = {};
        if (type === 'Lab') {
            specificData.nablStatus = extraInfo;
        } else if (type === 'Pharmacy') {
            specificData.drugLicenseExpiry = extraInfo;
        } else if (type === 'Hospital') {
            specificData.numberOfBeds = extraInfo;
        }

        const newPartner = new HealthPartner({
            uniqueId: newUniqueId, // ✅ Save Generated ID
            category: type,
            businessName: biz,
            experience: details,
            ...specificData, // ✅ Spread the specific field here
            licenseNumber: license,
            address: {
                fullAddress: addr,
                landmark: addrExtra,
                city: city,
                state: state,
                pincode: pin
            },
            contact: {
                ownerName: owner,
                whatsappNumber: phone
            },
            services: Array.isArray(services) ? services : [], // Ensure array
            registeredBy: registeredBy || 'Admin/Self' // ✅ Save Registered By
        });

        await newPartner.save();

        res.status(201).json({ success: true, message: "Registration Successful!", data: newPartner });

    } catch (error) {
        console.error("Error saving partner:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
});

// 🟢 PUBLIC: GET: Get all partners (Optional, Admin use ke liye)
router.get('/all', optionalAuth, async (req, res) => {
    try {
        const partners = await HealthPartner.find().sort({ registrationDate: -1 });
        res.json({ success: true, data: partners });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching data" });
    }
});

// 🟢 PUBLIC: Route: Get All Partners (For Appointment Network)
router.get('/partners', optionalAuth, async (req, res) => {
    try {
        const partners = await HealthPartner.find().sort({ registrationDate: -1 });
        res.json({ success: true, data: partners });
    } catch (error) {
        console.error("Fetch Partners Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

module.exports = router;
