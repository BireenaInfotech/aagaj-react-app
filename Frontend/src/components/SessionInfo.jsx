import React from 'react';
import './SessionInfo.css';

/**
 * ✅ SessionInfo Component
 * Displays session/cookie information after successful login
 * 
 * Props:
 * - session: Session object from login response
 * - user: User object from login response
 * - onDismiss: Callback function when user closes the info
 */
const SessionInfo = ({ session, user, onDismiss }) => {
  if (!session || !user) return null;

  return (
    <div className="session-info-container">
      <div className="session-info-card">
        {/* Header */}
        <div className="session-header">
          <div className="session-icon">🔐</div>
          <h2>Session Created Successfully</h2>
          <button className="session-close" onClick={onDismiss}>
            ✕
          </button>
        </div>

        {/* User Info */}
        <div className="session-section">
          <h3>👤 User Information</h3>
          <div className="session-info-item">
            <span className="info-label">Name:</span>
            <span className="info-value">{user.fullName || user.name}</span>
          </div>
          <div className="session-info-item">
            <span className="info-label">Email:</span>
            <span className="info-value">{user.email}</span>
          </div>
          <div className="session-info-item">
            <span className="info-label">Phone:</span>
            <span className="info-value">{user.phone || 'N/A'}</span>
          </div>
          <div className="session-info-item">
            <span className="info-label">Role:</span>
            <span className="info-value badge">{user.role || user.role}</span>
          </div>
        </div>

        {/* Session Details */}
        <div className="session-section">
          <h3>🔒 Session Details</h3>
          <div className="session-info-item">
            <span className="info-label">Token Type:</span>
            <span className="info-value">{session.tokenType}</span>
          </div>
          <div className="session-info-item">
            <span className="info-label">Expires In:</span>
            <span className="info-value">{session.expiresIn}</span>
          </div>
          <div className="session-info-item">
            <span className="info-label">Secure:</span>
            <span className="info-value badge-success">
              ✓ {session.secure ? 'HTTPS Only' : 'HTTP'}
            </span>
          </div>
          <div className="session-info-item">
            <span className="info-label">HttpOnly:</span>
            <span className="info-value badge-success">
              ✓ Enabled (XSS Protected)
            </span>
          </div>
          <div className="session-info-item">
            <span className="info-label">SameSite:</span>
            <span className="info-value badge-success">
              {session.sameSite} (CSRF Protected)
            </span>
          </div>
          <div className="session-info-item">
            <span className="info-label">Login Time:</span>
            <span className="info-value">
              {new Date(session.loginTime).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Cookie Info */}
        <div className="session-section">
          <h3>🍪 Cookie Information</h3>
          <div className="cookie-info">
            <p className="cookie-name">
              <strong>Cookie Name:</strong> authToken
            </p>
            <p className="cookie-value">
              <strong>Contains:</strong> JWT Token (automatically sent with each request)
            </p>
            <p className="cookie-security">
              <strong>🔒 Security:</strong> {session.message}
            </p>
          </div>
        </div>

        {/* Security Features */}
        <div className="session-section">
          <h3>✨ Security Features</h3>
          <ul className="security-features">
            <li>✓ JWT Token-based authentication</li>
            <li>✓ HTTPS-only cookie transmission</li>
            <li>✓ HttpOnly flag prevents JavaScript access</li>
            <li>✓ SameSite=Strict prevents CSRF attacks</li>
            <li>✓ 7-day session expiration for security</li>
            <li>✓ Automatic token rotation on refresh</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="session-footer">
          <p className="footer-message">
            Your session is now active. Cookies are securely managed by the browser.
          </p>
          <button className="btn-dismiss" onClick={onDismiss}>
            Got it, Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionInfo;
