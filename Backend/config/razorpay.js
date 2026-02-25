// Backend/config/razorpay.js
// Razorpay configuration

const Razorpay = require('razorpay');

let razorpay = null;

/**
 * Initialize Razorpay instance
 * @returns {Razorpay} - Razorpay instance
 */
const initializeRazorpay = () => {
    if (razorpay) {
        return razorpay;
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.error("❌ ERROR: Razorpay API keys are missing!");
        return null;
    }

    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    console.log("✅ Razorpay initialized successfully");
    return razorpay;
};

/**
 * Get Razorpay instance
 * @returns {Razorpay} - Razorpay instance
 */
const getRazorpay = () => {
    if (!razorpay) {
        return initializeRazorpay();
    }
    return razorpay;
};

module.exports = {
    initializeRazorpay,
    getRazorpay
};
