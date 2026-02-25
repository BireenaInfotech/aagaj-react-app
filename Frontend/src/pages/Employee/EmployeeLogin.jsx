import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './EmployeeLogin.css';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SessionInfo from '../../components/SessionInfo';

export default function EmployeeLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showSession, setShowSession] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [userData, setUserData] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    // Check if already logged in
    const userName = sessionStorage.getItem('loggedInUser');
    if (userName) {
      navigate('/');
    }
  }, []);

  // Validate email or phone format
  const validateEmailOrPhone = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;
    return emailRegex.test(value) || phoneRegex.test(value);
  };

  // Validate login inputs
  const validateLogin = (email, password) => {
    if (!validateEmailOrPhone(email)) {
      alert('❌ Please enter valid email or phone number');
      return false;
    }
    if (!password) {
      alert('❌ Password is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs before making request
    if (!validateLogin(emailInput, passwordInput)) {
      return;
    }
    
    setLoading(true);

    try {
      const response = await axios.post(
        `${apiUrl}/employee/login`,
        {
          emailOrPhone: emailInput.trim(),
          password: passwordInput
        },
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (response.data.success) {
        // Save employee data
        sessionStorage.setItem('loggedInUser', response.data.user.fullName || response.data.user.emp_username);
        sessionStorage.setItem('loggedInUserEmail', response.data.user.email || response.data.user.emp_username);
        sessionStorage.setItem('userData', JSON.stringify(response.data.user));
        if (response.data.authToken) {
          sessionStorage.setItem('authToken', response.data.authToken);
        }
        sessionStorage.setItem('loginTime', new Date().toISOString());
        
        // Clear sensitive form data
        setEmailInput('');
        setPasswordInput('');
        
        // Display session info
        setUserData(response.data.user);
        setSessionData(response.data.session);
        setShowSession(true);
      } else {
        // Generic error message for security (don't expose backend details)
        alert('❌ Invalid email/phone or password');
      }
    } catch (error) {
      console.error('Login Error:', error);
      // Show generic error message (don't expose backend details)
      const errorMsg = error.response?.status === 401 
        ? 'Invalid email/phone or password'
        : error.response?.status === 500
        ? 'Server error. Please try again later.'
        : 'Network error. Please check your connection.';
      alert('❌ ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle session info dismiss and navigate to home
  const handleSessionDismiss = () => {
    setShowSession(false);
    setTimeout(() => {
      navigate('/');
    }, 300);
  };

  // Handle logout - Clear all session data
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      // Clear auth cookie
      fetch(`${apiUrl}/employee/logout`, {
        method: 'POST',
        credentials: 'include'
      }).catch((error) => {
        console.warn('Employee logout request failed:', error.message);
      });

      // Clear sessionStorage
      sessionStorage.removeItem('loggedInUser');
      sessionStorage.removeItem('loggedInUserEmail');
      sessionStorage.removeItem('userData');
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('loginTime');
      
      // Clear form data
      setEmailInput('');
      setPasswordInput('');
      setRememberMe(false);
      setShowSession(false);
      
      alert('✅ Logged out successfully');
    }
  };

  return (
    <>
      <Navbar />
      
      {/* SessionInfo Modal */}
      {showSession && sessionData && userData && (
        <SessionInfo 
          session={sessionData} 
          user={userData} 
          onDismiss={handleSessionDismiss}
        />
      )}
      
    <div className="employee-login-page">
      <section className="login-container">
        <div className="container">
          <div className="row login-card">
            
            {/* Image Section */}
            <div className="col-md-5 p-0 login-image">
              <div className="login-image-text">
                <h2 className="fw-bold mb-3">Welcome Back!</h2>
                <p>Aagaj Foundation employees are the backbone of our mission. Please login to access your dashboard.</p>
                <hr style={{ 
                  opacity: 1, 
                  borderColor: '#fdd831', 
                  width: '50px', 
                  borderWidth: '3px'
                }} />
              </div>
            </div>

            {/* Form Section */}
            <div className="col-md-7 login-form-section">
              <div className="text-center mb-4">
                <img 
                  src="/logo.jpeg" 
                  alt="Logo" 
                  style={{ height: '60px', marginBottom: '20px' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <h3 className="fw-bold" style={{ color: '#333333' }}>Employee Login</h3>
                <p className="text-muted small">Enter your credentials to access the internal portal</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-bold small text-muted">Employee ID / Email / Phone</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="fas fa-id-card text-danger"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-0"
                      placeholder="E.g. EMP1234 or name@aagaj.com or 9876543210"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold small text-muted">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="fas fa-lock text-danger"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control border-start-0 ps-0"
                      placeholder="Enter your password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label className="form-check-label small" htmlFor="rememberMe">
                      Remember me
                    </label>
                  </div>
                  <a href="#" className="small text-danger fw-bold text-decoration-none">
                    Forgot Password?
                  </a>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-login w-100"
                  disabled={loading}
                >
                  {loading ? 'LOGGING IN...' : 'SECURE LOGIN'}
                </button>

                <div className="text-center mt-4">
                  <p className="small text-muted">
                    Having trouble logging in?{' '}
                    <a href="/contact" className="text-dark fw-bold">
                      Contact IT Support
                    </a>
                  </p>
                </div>
              </form>
            </div>

          </div>
        </div>
      </section>
    </div>
    <Footer />
    </>
  );
}

