import React, { useState, useEffect } from 'react';
import './SchemeDescription.css';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useNavigate } from 'react-router-dom';

const SilayiyojnaDescription = () => {
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
      navigate('/silayi-register');
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
        <h2>महिला सिलाई प्रशिक्षण योजना</h2>
      </header>

      <div className="hero-image">
        <img src="/silai.png" alt="महिला सिलाई प्रशिक्षण क्लास" />
      </div>

      <div className="scheme-container">
        <div className="grid-section">
          <div className="scheme-card">
            <h3>परिचय</h3>
            <ul>
              <li>यह योजना सिलाई सीखने की इच्छुक लड़कियों और महिलाओं के लिए है।</li>
              <li>प्रशिक्षण आगाज फाउंडेशन द्वारा दिया जाएगा।</li>
              <li>प्रशिक्षण के बाद रोजगार का अवसर भी दिया जाएगा।</li>
            </ul>
          </div>

          <div className="scheme-card">
            <h3>योजना का उद्देश्य</h3>
            <ul>
              <li>महिलाओं और लड़कियों को सिलाई का प्रशिक्षण देना।</li>
              <li>प्रशिक्षण के बाद रोजगार के अवसर उपलब्ध कराना।</li>
              <li>महिलाओं को आत्मनिर्भर बनाना।</li>
              <li>समूह आधारित काम के माध्यम से नियमित आय सुनिश्चित करना।</li>
            </ul>
          </div>
        </div>

        <div className="grid-section">
          <div className="scheme-card">
            <h3>प्रशिक्षण योजना का क्रियान्वयन</h3>
            <ul>
              <li>30 महिलाओं / लड़कियों का एक समूह बनाया जाएगा।</li>
              <li>सभी प्रतिभागियों को ₹799 का पंजीकरण कराना होगा।</li>
              <li>प्रशिक्षण अवधि: 45 दिन।</li>
              <li>नियमित एवं व्यावहारिक सिलाई प्रशिक्षण।</li>
            </ul>
          </div>

          <div className="scheme-card">
            <h3>प्रशिक्षण के लाभ</h3>
            <ul>
              <li>45 दिन का सिलाई प्रशिक्षण।</li>
              <li>प्रशिक्षण पूर्ण होने पर सर्टिफिकेट।</li>
              <li>प्रशिक्षण प्राप्त महिलाओं को समूह में रोजगार।</li>
              <li>भविष्य में स्वरोजगार का अवसर।</li>
            </ul>
          </div>
        </div>

        <div className="highlight-section">
          <div className="highlight-box">
            <h3>आयु सीमा</h3>
            <p>न्यूनतम आयु: <strong>15 वर्ष</strong></p>
            <p>अधिकतम आयु: <strong>40 वर्ष</strong></p>
          </div>
          <div className="highlight-box">
            <h3>संपर्क करें</h3>
            <p>महिला उत्थान केंद्र</p>
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

export default SilayiyojnaDescription;
