// Backend/middleware/requestLogger.js
// Request logging middleware

/**
 * Log incoming requests
 */
const requestLogger = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const logColor = req.method === 'GET' ? '🔵' : 
                        req.method === 'POST' ? '🟢' : 
                        req.method === 'PUT' ? '🟡' : 
                        req.method === 'DELETE' ? '🔴' : '⚪';
        
        console.log(`${logColor} ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });

    next();
};

module.exports = requestLogger;
