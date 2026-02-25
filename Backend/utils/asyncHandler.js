// Backend/utils/asyncHandler.js
// Wrapper for async route handlers to catch errors

/**
 * Wrap async functions to automatically catch errors
 * Usage: router.get('/route', asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = asyncHandler;
