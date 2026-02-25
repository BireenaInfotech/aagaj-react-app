// Backend/middleware/validation.js
// Request validation middleware

/**
 * Validate required fields in request body
 * @param {Array} requiredFields - Array of field names that must be present
 */
const validateFields = (requiredFields) => {
    return (req, res, next) => {
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        next();
    };
};

/**
 * Validate email format
 */
const validateEmail = (req, res, next) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (req.body.email && !emailRegex.test(req.body.email)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid email format'
        });
    }

    next();
};

/**
 * Validate phone number format (Indian)
 */
const validatePhone = (req, res, next) => {
    const phoneRegex = /^[6-9]\d{9}$/;

    if (req.body.mobile && !phoneRegex.test(req.body.mobile.replace(/\D/g, ''))) {
        return res.status(400).json({
            success: false,
            message: 'Invalid phone number format'
        });
    }

    next();
};

/**
 * Validate Aadhar number (12 digits)
 */
const validateAadhar = (req, res, next) => {
    const aadharRegex = /^\d{12}$/;

    if (req.body.aadharNumber && !aadharRegex.test(req.body.aadharNumber)) {
        return res.status(400).json({
            success: false,
            message: 'Aadhar number must be 12 digits'
        });
    }

    next();
};

/**
 * Validate payment request for /api/payments/create
 */
const validatePaymentRequest = (req, res, next) => {
    const { type, amount } = req.body;

    // Check required fields
    if (!type || !amount) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields: type, amount'
        });
    }

    // Validate type
    const validTypes = ['DONATION', 'APPLICATION', 'REGISTRATION', 'OTHER'];
    if (!validTypes.includes(type)) {
        return res.status(400).json({
            success: false,
            message: `Invalid payment type. Must be one of: ${validTypes.join(', ')}`
        });
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Amount must be a positive number'
        });
    }

    if (amount > 1000000) {
        return res.status(400).json({
            success: false,
            message: 'Amount exceeds maximum limit (₹10,00,000)'
        });
    }

    next();
};

module.exports = {
    validateFields,
    validateEmail,
    validatePhone,
    validateAadhar,
    validatePaymentRequest
};
