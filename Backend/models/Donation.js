// Backend/models/Donation.js

// ============================================
// ✅ DONATION SCHEMA (Getepay integrated)
// ============================================
const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    payment_id: String,
    order_id: String,
    amount: Number, // Stored in Rupees
    donor_name: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    pan: String,
    
    // Payment Gateway Information
    gateway: { type: String, enum: ['Razorpay', 'Getepay', 'Other'], default: 'Getepay' },
    gatewayResponse: mongoose.Schema.Types.Mixed, // Store full gateway response
    
    // Status & Timestamps
    status: { type: String, enum: ['Success', 'Failed', 'Pending', 'Cancelled'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// ✅ Export
module.exports = mongoose.model('Donation', donationSchema);
