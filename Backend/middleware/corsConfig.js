// Backend/middleware/corsConfig.js
// CORS configuration middleware

const cors = require('cors');

/**
 * CORS configuration
 * Fixed for credentials: true (withCredentials in frontend)
 */
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:5173',    // Vite dev server
            'http://localhost:3000',    // React dev server
            'http://localhost:3001',    // Alternative React
            'http://127.0.0.1:5173',    // Vite dev server (127.0.0.1)
            'http://127.0.0.1:3000',    // React dev server (127.0.0.1)
            process.env.FRONTEND_URL    // Production frontend URL from .env
        ].filter(Boolean);
        
        // Allow requests with no origin (development mode) or in allowedOrigins
        if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            console.warn(`❌ CORS blocked request from: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    maxAge: 86400
};

const corsMiddleware = cors(corsOptions);

module.exports = corsMiddleware;
