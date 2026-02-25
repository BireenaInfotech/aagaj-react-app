// Backend/utils/validators.js
// Data validation utilities

/**
 * Validate email format
 */
const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

/**
 * Validate Indian phone number
 */
const isValidPhone = (phone) => {
    const regex = /^[6-9]\d{9}$/;
    return regex.test(phone.replace(/\D/g, ''));
};

/**
 * Validate Aadhar number (12 digits)
 */
const isValidAadhar = (aadhar) => {
    const regex = /^\d{12}$/;
    return regex.test(aadhar);
};

/**
 * Validate PAN format
 */
const isValidPAN = (pan) => {
    const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return regex.test(pan);
};

/**
 * Validate password strength
 * Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
 */
const isStrongPassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
};

/**
 * Validate URL
 */
const isValidURL = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

/**
 * Validate age (18-100)
 */
const isValidAge = (age) => {
    const ageNum = parseInt(age);
    return ageNum >= 18 && ageNum <= 100;
};

/**
 * Validate pincode (6 digits for India)
 */
const isValidPincode = (pincode) => {
    const regex = /^\d{6}$/;
    return regex.test(pincode);
};

/**
 * Validate MongoDB ObjectId
 */
const isValidMongoId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};

module.exports = {
    isValidEmail,
    isValidPhone,
    isValidAadhar,
    isValidPAN,
    isStrongPassword,
    isValidURL,
    isValidAge,
    isValidPincode,
    isValidMongoId
};
