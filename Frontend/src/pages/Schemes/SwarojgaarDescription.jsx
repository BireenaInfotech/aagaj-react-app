import React, { useState, useEffect } from 'react';
import './SchemeDescription.css';
import Navbar from '../../components/Navbar';

import { useNavigate } from 'react-router-dom';

const SwarojgaarDescription = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status immediately and update frequently
  useEffect(() => {
    const checkLogin = () => {
      const userType = sessionStorage.getItem('userType');
      const loggedIn = userType === 'employee';
      setIsLoggedIn(loggedIn);
    };
    
    // Check immediately
    checkLogin();
    
    // Check every 100ms for state changes
    const interval = setInterval(checkLogin, 100);
    
    // Also check on window focus
    window.addEventListener('focus', checkLogin);
    window.addEventListener('visibilitychange', checkLogin);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkLogin);
      window.removeEventListener('visibilitychange', checkLogin);
    };
  }, []);

  const handleRegister = () => {
    if (isLoggedIn) {
      navigate('/swarojgaar-register');
    } else {
      navigate('/admin-login');
    }
  };

  return (
    <>
      <Navbar />
      <div className="scheme-page">
      <header className="scheme-header">
        {isLoggedIn && (
          <button onClick={handleRegister} className="register-btn-header">
            रजिस्टर करें
          </button>
        )}
        <h1>आगाज फाउंडेशन</h1>
        <h2>महिला स्वरोजगार योजना</h2>
      </header>

      <div className="hero-image">
        <img src="/swarojgaar.png" alt="महिला स्वरोजगार योजना केंद्र" />
      </div>

      <div className="scheme-container">
        <div className="grid-section">
          <div className="scheme-card">
            <h3>परिचय</h3>
            <ul>
              <li>यह योजना उन महिलाओं के लिए है जो पहले से सिलाई जानती हैं।</li>
              <li>महिलाओं का समूह बनाकर उन्हें रोजगार दिया जाएगा।</li>
              <li>नियमित काम और आय का अवसर।</li>
            </ul>
          </div>

          <div className="scheme-card">
            <h3>समूह निर्माण (Group Formation)</h3>
            <ul>
              <li>10 महिलाओं का एक समूह बनाया जाएगा।</li>
              <li>समूह बनने के बाद रोजगार को लेकर बैठक आयोजित होगी।</li>
              <li>सभी सदस्यों को सिलाई का काम आना आवश्यक है।</li>
            </ul>
          </div>
        </div>

        <div className="grid-section">
          <div className="scheme-card">
            <h3>योगदान एवं सामग्री</h3>
            <ul>
              <li>प्रत्येक महिला को समूह में ₹5000 जमा करने होंगे।</li>
              <li>कच्चा माल (कपड़ा, धागा आदि) संस्था द्वारा दिया जाएगा।</li>
              <li>अन्य आवश्यक सिलाई सामग्री भी संस्था देगी।</li>
            </ul>
          </div>

          <div className="scheme-card">
            <h3>मजदूरी एवं आय</h3>
            <ul>
              <li>सभी महिलाओं को 'प्रति पीस' (per piece) के हिसाब से मजदूरी मिलेगी।</li>
              <li>काम के अनुसार तुरंत भुगतान किया जाएगा।</li>
              <li>नियमित आय का सुनहरा अवसर।</li>
            </ul>
          </div>
        </div>

        <div className="grid-section">
          <div className="scheme-card">
            <h3>बैंक लोन सुविधा</h3>
            <ul>
              <li>समूह निर्माण के बाद पूंजी बढ़ाने के लिए लोन की सुविधा।</li>
              <li>बैंक से आसानी से लोन दिलाया जाएगा।</li>
              <li>आत्मनिर्भर बनने में पूर्ण सहयोग।</li>
            </ul>
          </div>

          <div className="scheme-card">
            <h3>आवश्यक दस्तावेज</h3>
            <ul>
              <li>आवेदक: आधार कार्ड, पैन कार्ड, बैंक पासबुक।</li>
              <li>अन्य: जाति प्रमाण पत्र, आवासीय प्रमाण पत्र, फोटो।</li>
              <li>गारंटर: गारंटर का आधार कार्ड और पैन कार्ड।</li>
            </ul>
          </div>
        </div>

        <div className="highlight-section">
          <div className="highlight-box">
            <h3>आयु सीमा</h3>
            <p>न्यूनतम आयु: <strong>18 वर्ष</strong></p>
            <p>अधिकतम आयु: <strong>40 वर्ष</strong></p>
          </div>
          <div className="highlight-box">
            <h3>संपर्क करें</h3>
            <p>ऋण विभाग (Loan Department)</p>
            <p>आगाज फाउंडेशन</p>
          </div>
        </div>
      </div>

      <footer className="scheme-footer">
        <p>&copy; 2026 आगाज फाउंडेशन - सभी अधिकार सुरक्षित</p>
      </footer>
      </div>
      
    </>
  );
};

export default SwarojgaarDescription;
