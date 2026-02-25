// Backend/middleware/errorHandler.js
// Global error handling middleware

/**
 * Express error handler middleware
 * Must be the last middleware in the chain
 */
const errorHandler = (err, req, res, next) => {
    console.error("🔥 Error:", {
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method
    });

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: Object.values(err.errors).map(e => e.message)
        });
    }

    // Mongoose cast error
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format'
        });
    }

    // Duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            success: false,
            message: `${field} already exists`
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired'
        });
    }

    // Multer file upload errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: 'File too large'
        });
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
            success: false,
            message: 'Too many files'
        });
    }

    // Default error
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
};

module.exports = errorHandler;
