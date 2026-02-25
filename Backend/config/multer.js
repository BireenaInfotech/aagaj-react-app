// Backend/config/multer.js
// Multer upload configuration

const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * General file storage configuration
 */
const generalStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'file-' + uniqueSuffix + path.extname(file.originalname));
    }
});

/**
 * Health card photo storage
 */
const healthCardStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './uploads/healthcards';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, 'health-' + Date.now() + path.extname(file.originalname));
    }
});

/**
 * Swarojgaar group photos storage
 */
const swarojgaarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './uploads/swarojgaar';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, 'member-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});

/**
 * Memory storage for small files
 */
const memoryStorage = multer.memoryStorage();

/**
 * Create multer instances
 */
const generalUpload = multer({
    storage: generalStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        cb(null, true);
    }
});

const healthCardUpload = multer({
    storage: healthCardStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPG/PNG images are allowed'), false);
        }
    }
});

const swarojgaarUpload = multer({
    storage: swarojgaarStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPG/PNG images are allowed'), false);
        }
    }
});

const appointmentUpload = multer({
    storage: memoryStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = {
    generalUpload,
    healthCardUpload,
    swarojgaarUpload,
    appointmentUpload,
    memoryStorage
};
