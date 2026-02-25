import { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminLogin.css';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    const userType = sessionStorage.getItem('userType');
    if (loggedInUser && userType === 'employee') {
      navigate('/employee-dashboard');
    }
  }, [navigate]);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [employeeLoginForm, setEmployeeLoginForm] = useState({ emailOrPhone: '', password: '' });

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const validateRegistration = (form) => {
    if (!form.fullName.trim()) { alert('Full name is required'); return false; }
    if (!validateEmail(form.email)) { alert('Please enter valid email address'); return false; }
    if (form.phone && !/^\d{10}$/.test(form.phone)) { alert('Phone number must be 10 digits'); return false; }
    if (form.password.length < 6) { alert('Password must be at least 6 characters'); return false; }
    return true;
  };

  const validateLogin = (form) => {
    if (!validateEmail(form.email)) { alert('Please enter valid email address'); return false; }
    if (!form.password) { alert('Password is required'); return false; }
    return true;
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEmployeeLoginChange = (e) => {
    const { name, value } = e.target;
    setEmployeeLoginForm(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLogin(loginForm)) return;
    setLoading(true);
    try {
      const response = await axios.post(
        `${apiUrl}/admin-register/login`,
        { email: loginForm.email.trim(), password: loginForm.password },
        { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
      );
      if (response.data.success) {
        sessionStorage.setItem('loggedInUser', 'Admin');
        sessionStorage.setItem('userType', 'admin');
        sessionStorage.setItem('adminEmail', response.data.user.email);
        sessionStorage.setItem('adminName', response.data.user.fullName || response.data.user.email?.split('@')[0] || 'Admin');
        sessionStorage.setItem('adminData', JSON.stringify(response.data.user));
        sessionStorage.setItem('loginTime', new Date().toISOString());
        setLoginForm({ email: '', password: '' });
        navigate('/admin-dashboard');
      } else {
        alert('Invalid email or password');
      }
    } catch (error) {
      const msg = error.response?.status === 401 ? 'Invalid email or password'
        : error.response?.status === 500 ? 'Server error. Please try again later.'
        : 'Network error. Please check your connection.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeLogin = async (e) => {
    e.preventDefault();
    if (!employeeLoginForm.emailOrPhone) { alert('Email or Phone is required'); return; }
    if (!employeeLoginForm.password) { alert('Password is required'); return; }
    setLoading(true);
    try {
      const response = await axios.post(
        `${apiUrl}/employee/login`,
        { emailOrPhone: employeeLoginForm.emailOrPhone.trim(), password: employeeLoginForm.password },
        { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
      );
      if (response.data.success) {
        const employeeName = response.data.user.fullName || response.data.user.emp_username || 'Employee';
        sessionStorage.setItem('loggedInUser', employeeName);
        sessionStorage.setItem('userType', 'employee');
        sessionStorage.setItem('loggedInUserEmail', response.data.user.email || response.data.user.emp_username);
        sessionStorage.setItem('userData', JSON.stringify(response.data.user));
        if (response.data.authToken) sessionStorage.setItem('authToken', response.data.authToken);
        sessionStorage.setItem('loginTime', new Date().toISOString());
        setEmployeeLoginForm({ emailOrPhone: '', password: '' });
        navigate('/');
      } else {
        alert('Invalid email/phone or password');
      }
    } catch (error) {
      const msg = error.response?.status === 401 ? 'Invalid email/phone or password'
        : error.response?.status === 500 ? 'Server error. Please try again later.'
        : 'Network error. Please check your connection.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateRegistration(signupForm)) return;
    setLoading(true);
    try {
      const response = await axios.post(
        `${apiUrl}/admin-register/register`,
        { fullName: signupForm.fullName.trim(), email: signupForm.email.trim(), phone: signupForm.phone.trim(), password: signupForm.password },
        { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
      );
      if (response.data.success) {
        alert('Admin Registered Successfully! Now Login.');
        const registeredEmail = signupForm.email;
        setSignupForm({ fullName: '', email: '', phone: '', password: '' });
        setActiveTab('login');
        setLoginForm(prev => ({ ...prev, email: registeredEmail }));
      } else {
        const msg = response.data.message?.includes('already')
          ? 'Email already registered. Please login instead.'
          : 'Registration failed. Please try again.';
        alert(msg);
      }
    } catch (error) {
      const msg = error.response?.status === 400 ? 'Email already registered or invalid input'
        : error.response?.status === 500 ? 'Server error. Please try again later.'
        : 'Network error. Please check your connection.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="al-page">
        <div className="al-card">

          {/* Header */}
          <div className="al-header">
            <div className="al-header-inner">
              <h5 className="al-header-title">
                <i className="fas fa-shield-alt"></i> Admin Access
              </h5>
              <button className="al-close-btn" onClick={() => navigate('/')} title="Back to Home">
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="al-body">

            {/* Tabs */}
            <div className="al-tabs">
              <button className={`al-tab ${activeTab === 'login' ? 'active' : ''}`} onClick={() => setActiveTab('login')}>
                <i className="fa-solid fa-shield-alt"></i> Admin Login
              </button>
              <button className={`al-tab ${activeTab === 'signup' ? 'active' : ''}`} onClick={() => setActiveTab('signup')}>
                <i className="fa-solid fa-user-plus"></i> Sign Up
              </button>
              <button className={`al-tab ${activeTab === 'employee' ? 'active' : ''}`} onClick={() => setActiveTab('employee')}>
                <i className="fa-solid fa-briefcase"></i> Employee
              </button>
            </div>

            {/* Admin Login */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="al-form">
                <div className="al-form-group">
                  <label className="al-label">Email</label>
                  <div className="al-input-wrap">
                    <span className="al-input-icon"><i className="fas fa-user"></i></span>
                    <input type="email" name="email" className="al-input" placeholder="admin@example.com"
                      value={loginForm.email} onChange={handleLoginChange} required />
                  </div>
                </div>
                <div className="al-form-group">
                  <label className="al-label">Password</label>
                  <div className="al-input-wrap">
                    <span className="al-input-icon"><i className="fas fa-lock"></i></span>
                    <input type="password" name="password" className="al-input" placeholder=""
                      value={loginForm.password} onChange={handleLoginChange} required />
                  </div>
                </div>
                <button type="submit" className="al-btn al-btn-red" disabled={loading}>
                  {loading ? 'LOGGING IN...' : 'LOG IN'}
                </button>
              </form>
            )}

            {/* Admin Sign Up */}
            {activeTab === 'signup' && (
              <form onSubmit={handleRegister} className="al-form">
                <div className="al-form-group">
                  <label className="al-label">Full Name</label>
                  <div className="al-input-wrap">
                    <span className="al-input-icon"><i className="fas fa-user"></i></span>
                    <input type="text" name="fullName" className="al-input" placeholder="Enter your full name"
                      value={signupForm.fullName} onChange={handleSignupChange} required />
                  </div>
                </div>
                <div className="al-form-group">
                  <label className="al-label">Email Address</label>
                  <div className="al-input-wrap">
                    <span className="al-input-icon"><i className="fas fa-envelope"></i></span>
                    <input type="email" name="email" className="al-input" placeholder="admin@example.com"
                      value={signupForm.email} onChange={handleSignupChange} required />
                  </div>
                </div>
                <div className="al-form-group">
                  <label className="al-label">Phone Number</label>
                  <div className="al-input-wrap">
                    <span className="al-input-icon"><i className="fas fa-phone"></i></span>
                    <input type="tel" name="phone" className="al-input" placeholder="10-digit phone number"
                      value={signupForm.phone} onChange={handleSignupChange} pattern="\d{10}" maxLength="10" required />
                  </div>
                </div>
                <div className="al-form-group">
                  <label className="al-label">Create Password</label>
                  <div className="al-input-wrap">
                    <span className="al-input-icon"><i className="fas fa-lock"></i></span>
                    <input type="password" name="password" className="al-input" placeholder=""
                      value={signupForm.password} onChange={handleSignupChange} required />
                  </div>
                </div>
                <button type="submit" className="al-btn al-btn-yellow" disabled={loading}>
                  {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                </button>
              </form>
            )}

            {/* Employee Login */}
            {activeTab === 'employee' && (
              <form onSubmit={handleEmployeeLogin} className="al-form">
                <div className="al-form-group">
                  <label className="al-label">Email or Phone</label>
                  <div className="al-input-wrap">
                    <span className="al-input-icon"><i className="fas fa-envelope"></i></span>
                    <input type="text" name="emailOrPhone" className="al-input" placeholder="Email or 10-digit phone"
                      value={employeeLoginForm.emailOrPhone} onChange={handleEmployeeLoginChange} required />
                  </div>
                </div>
                <div className="al-form-group">
                  <label className="al-label">Password</label>
                  <div className="al-input-wrap">
                    <span className="al-input-icon"><i className="fas fa-lock"></i></span>
                    <input type="password" name="password" className="al-input" placeholder=""
                      value={employeeLoginForm.password} onChange={handleEmployeeLoginChange} required />
                  </div>
                </div>
                <button type="submit" className="al-btn al-btn-red" disabled={loading}>
                  {loading ? 'LOGGING IN...' : 'EMPLOYEE LOGIN'}
                </button>
              </form>
            )}

          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
