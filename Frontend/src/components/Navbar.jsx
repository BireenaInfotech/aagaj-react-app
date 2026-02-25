import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './navbar.css';

const Navbar = ({ userName = 'Guest' }) => {
  const [adminName, setAdminName] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isEmployeeLoggedIn, setIsEmployeeLoggedIn] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check user session data
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    const userType = sessionStorage.getItem('userType');
    const adminEmail = sessionStorage.getItem('adminEmail');
    const adminNameStored = sessionStorage.getItem('adminName');
    
    // Admin Login Detection
    if (loggedInUser === 'Admin' && userType === 'admin' && adminEmail) {
      setIsAdminLoggedIn(true);
      setIsEmployeeLoggedIn(false);
      // Use stored admin name, or extract from email, or use Admin
      const displayName = adminNameStored 
        ? adminNameStored 
        : (adminEmail.split('@')[0] || 'Admin');
      setAdminName(displayName.charAt(0).toUpperCase() + displayName.slice(1));
      setUserDisplayName('');
    } 
    // Employee Login Detection
    else if (loggedInUser && userType === 'employee') {
      setIsEmployeeLoggedIn(true);
      setIsAdminLoggedIn(false);
      setAdminName('');
      const displayName = loggedInUser;
      setUserDisplayName(displayName.charAt(0).toUpperCase() + displayName.slice(1));
    } 
    // No login
    else {
      setIsAdminLoggedIn(false);
      setIsEmployeeLoggedIn(false);
      setAdminName('');
      setUserDisplayName('');
    }

    // Update navbar active states based on current route
    const path = window.location.pathname;
    const page = path.split("/").pop();

    // Highlight Active Menu Item based on Page Name
    if (page === "home.html" || page === "" || page === "/" || page === "home" || page === "Home") {
      const el = document.getElementById('nav-home');
      if (el) el.classList.add('active');
    } else if (page === "about.html" || page === "about") {
      const el = document.getElementById('nav-about');
      if (el) el.classList.add('active');
    } else if (page === "gallery.html" || page === "gallery") {
      const el = document.getElementById('nav-gallery');
      if (el) el.classList.add('active');
    } else if (page === "appointment.html" || page === "appointment") {
      const el = document.getElementById('nav-partners');
      if (el) el.classList.add('active');
    } else if (page === "employee-login.html" || page === "employee-login") {
      const el = document.getElementById('nav-services');
      if (el) el.classList.add('active');
    }

    // Careers Section Active Logic
    if (page === "NGO-jobs.html" || page === "NGO-jobs") {
      const el = document.getElementById('nav-careers');
      if (el) el.classList.add('active');
      const ngoLink = document.getElementById('link-ngo-jobs');
      if (ngoLink) ngoLink.classList.add('active');
    } else if (page === "Normal.html" || page === "Normal") {
      const el = document.getElementById('nav-careers');
      if (el) el.classList.add('active');
      const genLink = document.getElementById('link-general-jobs');
      if (genLink) genLink.classList.add('active');
    }
  }, [userName, isAdminLoggedIn, isEmployeeLoggedIn]);

  // Handle admin button click
  const handleAdminBtnClick = (e) => {
    e.preventDefault();
    if (isAdminLoggedIn) {
      navigate('/admin-dashboard');
    } else {
      navigate('/admin-login');
    }
  };

  // Handle logout
  const handleLogout = (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to logout?')) {
      // Clear all session data for both admin and employee
      sessionStorage.removeItem('loggedInUser');
      sessionStorage.removeItem('adminEmail');
      sessionStorage.removeItem('adminName');
      sessionStorage.removeItem('adminData');
      sessionStorage.removeItem('loggedInUserEmail');
      sessionStorage.removeItem('userData');
      sessionStorage.removeItem('userType');
      sessionStorage.removeItem('loginTime');
      
      // Update state
      setIsAdminLoggedIn(false);
      setIsEmployeeLoggedIn(false);
      setAdminName('');
      setUserDisplayName('');
      
      // Redirect to home
      navigate('/');
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light sticky-top" style={{ backgroundColor: '#FFC0CB' }}>
      <div className="container">
        <a className="navbar-brand" href="/">
          <img src="/logo.jpeg" alt="Aagaj Foundation Logo" />
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <a className="nav-link" id="nav-home" href="/">
                <strong>Home</strong>
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link" id="nav-about" href="/about">
                <strong>About</strong>
              </a>
            </li>

            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                id="nav-services"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <strong>Services</strong>
              </a>
              <ul className="dropdown-menu border-0 shadow" id="services-list">
                <li>
                  <Link className="dropdown-item" to="/silayiyojna-description">
                    <i className="fa-solid fa-seedling me-2"></i>
                    Silayiyojina
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/swarojgaar-description">
                    <i className="fa-solid fa-briefcase-open me-2"></i>
                    Swarojgaar
                  </Link>
                </li>
                {isEmployeeLoggedIn && (
                  <li>
                    <Link className="dropdown-item" to="/swasthya-suraksha-register">
                      <i className="fa-solid fa-heart-pulse me-2"></i>
                      Swasthya Suraksha
                    </Link>
                  </li>
                )}
              </ul>
            </li>

            <li className="nav-item">
              <a className="nav-link" id="nav-gallery" href="/gallery">
                <strong>Gallery</strong>
              </a>
            </li>

            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                id="nav-careers"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
              >
                <strong>Careers</strong>
              </a>
              <ul className="dropdown-menu border-0 shadow">
                <li>
                  <Link className="dropdown-item" id="link-ngo-jobs" to="/ngo-jobs">
                    NGO Jobs
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" id="link-general-jobs" to="/general-jobs">
                    General Jobs
                  </Link>
                </li>
              </ul>
            </li>

            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                id="nav-medical"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
              >
                <strong>Medical Facility</strong>
              </a>
              <ul className="dropdown-menu border-0 shadow">
                <li>
                  <Link className="dropdown-item" to="/healthcard">
                    <strong>Health Card</strong>
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/appointment">
                    <strong>Appointment</strong>
                  </Link>
                </li>
              </ul>
            </li>

            <li className="nav-item ms-2">
              <a className="nav-link donate-btn" href="/donate">
                <i className="fa-solid fa-hand-holding-heart me-2"></i>
                <strong>Donate Us</strong>
              </a>
            </li>

            {isAdminLoggedIn ? (
              <li className="nav-item dropdown ms-2">
                <button 
                  className="nav-link dropdown-toggle admin-btn"
                  id="admin-dropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{
                    backgroundColor: 'var(--primary-red)',
                    borderColor: 'var(--primary-red)',
                    color: 'white',
                    border: '1px solid var(--primary-red)',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <i className="fa-solid fa-gauge me-2"></i>
                  {adminName}
                  <i className="fa-solid fa-chevron-down ms-2"></i>
                </button>
                <ul className="dropdown-menu dropdown-menu-end border-0 shadow">
                  <li>
                    <button 
                      className="dropdown-item" 
                      onClick={() => navigate('/admin-dashboard')}
                    >
                      <i className="fa-solid fa-gauge me-2"></i>
                      Dashboard
                    </button>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button 
                      className="dropdown-item text-danger" 
                      onClick={handleLogout}
                    >
                      <i className="fa-solid fa-sign-out-alt me-2"></i>
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : isEmployeeLoggedIn ? (
              <li className="nav-item dropdown ms-2">
                <button 
                  className="nav-link dropdown-toggle employee-btn"
                  id="employee-dropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{
                    backgroundColor: '#28a745',
                    borderColor: '#28a745',
                    color: 'white',
                    border: '1px solid #28a745',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <i className="fa-solid fa-briefcase me-2"></i>
                  {userDisplayName}
                  <i className="fa-solid fa-chevron-down ms-2"></i>
                </button>
                <ul className="dropdown-menu dropdown-menu-end border-0 shadow">
                  <li>
                    <button 
                      className="dropdown-item" 
                      onClick={() => navigate('/')}
                    >
                      <i className="fa-solid fa-home me-2"></i>
                      Home
                    </button>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button 
                      className="dropdown-item text-danger" 
                      onClick={handleLogout}
                    >
                      <i className="fa-solid fa-sign-out-alt me-2"></i>
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <li className="nav-item ms-2">
                <button 
                  onClick={handleAdminBtnClick} 
                  className="admin-btn"
                  style={{
                    backgroundColor: 'transparent',
                    borderColor: 'currentColor',
                    color: 'inherit',
                    cursor: 'pointer',
                    border: '1px solid',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px'
                  }}
                >
                  <i className="fa-regular fa-circle-user me-2"></i> Admin
                  <i className="fa-solid fa-arrow-right admin-arrow ms-2"></i>
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
