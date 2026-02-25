// Backend/constants/index.js
// Application constants

const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
};

const MESSAGES = {
    SUCCESS: 'Operation successful',
    ERROR: 'An error occurred',
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_EXISTS: 'Email already registered',
    USER_NOT_FOUND: 'User not found',
    UNAUTHORIZED: 'Unauthorized access',
    VALIDATION_ERROR: 'Validation error',
    SERVER_ERROR: 'Internal server error',
    FILE_UPLOAD_ERROR: 'File upload failed',
    INVALID_FILE_TYPE: 'Invalid file type',
    FILE_TOO_LARGE: 'File size too large'
};

const USER_ROLES = {
    ADMIN: 'Admin',
    EMPLOYEE: 'Employee',
    USER: 'User'
};

const PAYMENT_STATUS = {
    PENDING: 'Pending',
    COMPLETED: 'Completed',
    FAILED: 'Failed',
    CANCELLED: 'Cancelled'
};

const APPOINTMENT_STATUS = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    CANCELLED: 'Cancelled',
    COMPLETED: 'Completed'
};

const SCHEMES = {
    SILAI: 'Mahila Silai Prasikshan Yojana',
    SWAROJGAAR: 'Mahila Swarojgaar Yojana',
    SWASTHYA: 'Swasthya Suraksha Yojana'
};

const HEALTH_PARTNER_TYPES = {
    HOSPITAL: 'Hospital',
    LAB: 'Lab',
    PHARMACY: 'Pharmacy'
};

const REGISTRATION_FEES = {
    SILAI: 799,
    SWAROJGAAR: 100,
    HEALTHCARD: 201
};

const FILE_UPLOAD_LIMITS = {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    PHOTO_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf']
};

const API_ROUTES = {
    EMPLOYEE: '/admin',
    ADMIN_AUTH: '/admin-register',
    APPLICATION: '/application',
    APPOINTMENT: '/appointment',
    DONATION: '/donation',
    HEALTHCARD: '/api/healthcard',
    SCHEMES: '/schemes',
    SWAROJGAAR: '/swarojgaar',
    HEALTHPARTNER: '/swasthya'
};

const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
};

module.exports = {
    HTTP_STATUS,
    MESSAGES,
    USER_ROLES,
    PAYMENT_STATUS,
    APPOINTMENT_STATUS,
    SCHEMES,
    HEALTH_PARTNER_TYPES,
    REGISTRATION_FEES,
    FILE_UPLOAD_LIMITS,
    API_ROUTES,
    PAGINATION
};
