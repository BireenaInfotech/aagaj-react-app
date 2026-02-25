// Backend/utils/generateId.js
// ID generation utilities

/**
 * Generate Employee ID (EMP0001, EMP0002, etc.)
 * @param {Number} nextNumber - Next number for ID
 * @returns {String} - Generated employee ID
 */
const generateEmployeeId = (nextNumber = 1) => {
    return 'EMP' + nextNumber.toString().padStart(4, '0');
};

/**
 * Generate Unique ID for Applicants
 * @returns {String} - Generated unique ID
 */
const generateApplicantId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `APP${timestamp}${random}`;
};

/**
 * Generate Health Card ID (MC-XXXXXX)
 * @returns {String} - Generated health card ID
 */
const generateHealthCardId = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `MC-${randomNum}`;
};

/**
 * Generate Swarojgaar/Scheme Registration ID
 * @param {String} prefix - ID prefix
 * @param {Number} number - Sequence number
 * @returns {String} - Generated ID
 */
const generateRegistrationId = (prefix = 'REG', number = 1) => {
    return `${prefix}${number.toString().padStart(6, '0')}`;
};

/**
 * Generate Health Partner ID (Format: 100026 -> Counter + YearSuffix)
 * @param {Number} counter - Counter value
 * @param {Number} year - Year (optional, defaults to current year last 2 digits)
 * @returns {String} - Generated health partner ID
 */
const generateHealthPartnerId = (counter = 1000, year = null) => {
    const yearSuffix = year || new Date().getFullYear().toString().slice(-2);
    return `${counter}${yearSuffix}`;
};

/**
 * Generate Transaction Reference ID
 * @returns {String} - Generated transaction ID
 */
const generateTransactionId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `TXN${timestamp}${random}`;
};

/**
 * Generate OTP (6 digits)
 * @returns {Number} - Generated OTP
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000);
};

/**
 * Generate UUID v4
 * @returns {String} - Generated UUID
 */
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

module.exports = {
    generateEmployeeId,
    generateApplicantId,
    generateHealthCardId,
    generateRegistrationId,
    generateHealthPartnerId,
    generateTransactionId,
    generateOTP,
    generateUUID
};
