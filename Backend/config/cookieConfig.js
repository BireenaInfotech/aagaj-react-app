/**
 * 🍪 HTTP-Only Cookie Configuration
 * ✅ Secure token storage in cookies (not in response body)
 */

const isProd = process.env.NODE_ENV === 'production';

/**
 * ✅ Access Token Cookie Options (15 minutes)
 * - httpOnly: true     → JS can't access (XSS protection)
 * - secure: true       → HTTPS only in production (MITM protection)
 * - sameSite: 'Strict' → CSRF protection
 * - maxAge: 15 minutes → Auto-expires quickly
 * - path: '/'          → Available to all routes
 */
const accessTokenCookieOptions = {
  httpOnly: true,           // ✅ JS cannot access via document.cookie
  secure: isProd,           // ✅ HTTPS only in production
  sameSite: 'Strict',       // ✅ CSRF protected
  maxAge: 15 * 60 * 1000,   // 15 minutes in milliseconds
  path: '/',
  signed: false             // Express'll handle signing if needed
};

/**
 * ✅ Backward compatibility alias
 */
const authTokenCookieOptions = accessTokenCookieOptions;

/**
 * ✅ Refresh Token Cookie Options (7 days)
 * - Same security as access token but longer expiry
 * - Used to obtain new access tokens when they expire
 */
const refreshTokenCookieOptions = {
  httpOnly: true,                    // ✅ JS cannot access
  secure: isProd,                    // ✅ HTTPS only in production
  sameSite: 'Strict',                // ✅ CSRF protected
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days in milliseconds
  path: '/',
  signed: false
};

/**
 * ✅ Clear Cookie Options (for logout)
 * - maxAge: 0 deletes the cookie
 * - Must match the original cookie options (except maxAge)
 */
const clearCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'Strict',
  path: '/',
  maxAge: 0  // ✅ Deletes cookie
};

module.exports = {
  accessTokenCookieOptions,
  authTokenCookieOptions,  // ✅ Backward compatibility
  refreshTokenCookieOptions,
  clearCookieOptions,
};
