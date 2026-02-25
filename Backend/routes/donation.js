// Backend/routes/donation.js
// 🔄 Donation Management Routes

const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');

require('dotenv').config();

// ✅ Import Auth Middleware
const { verifyAuth } = require('../middleware/auth');

/**
 * 1. 🟢 PUBLIC: Create Donation Order
 * Saves donation record when user initiates payment
 */
router.post('/', async (req, res) => {
    try {
        const {
            order_id,
            amount,
            donor_name,
            email,
            phone,
            address,
            city,
            state,
            pincode,
            pan,
            gateway,
            status,
        } = req.body;

        if (!order_id || !amount) {
            return res.status(400).json({ success: false, message: 'Order ID and amount required' });
        }

        const donation = new Donation({
            order_id,
            amount: parseFloat(amount),
            donor_name: donor_name || 'Anonymous',
            email: email || '',
            phone: phone || '',
            address: address || '',
            city: city || '',
            state: state || '',
            pincode: pincode || '',
            pan: pan || '',
            gateway: gateway || 'Getepay',
            status: status || 'Pending',
        });

        await donation.save();
        console.log('✅ Donation created:', order_id);

        return res.json({ success: true, data: donation });
    } catch (error) {
        console.error('❌ Create Donation Error:', error);
        return res.status(500).json({ success: false, message: 'Error creating donation' });
    }
});

/**
 * 2. 🔐 PROTECTED: Get Donation History (Authenticated users only)
 */
router.get('/history', verifyAuth, async (req, res) => {
    try {
        const donations = await Donation.find().sort({ createdAt: -1 });
        res.json({ success: true, data: donations });
    } catch (error) {
        console.error("Fetch Donations Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

/**
 * 3. 🔐 PROTECTED: Get Donation by ID (Authenticated users only)
 */
router.get('/:id', verifyAuth, async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id);
        if (!donation) {
            return res.status(404).json({ success: false, message: "Donation not found" });
        }
        res.json({ success: true, data: donation });
    } catch (error) {
        console.error("Fetch Donation Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

module.exports = router;
