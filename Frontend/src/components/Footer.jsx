import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');

  return (
    <>
      <footer className="ft-footer">
        <div className="ft-container">

          {/* Newsletter */}
          <div className="ft-newsletter">
            <h3 className="ft-newsletter-title">Get Our Newsletter</h3>
            <div className="ft-newsletter-form">
              <i className="fa-regular fa-envelope ft-newsletter-icon"></i>
              <input
                type="email"
                className="ft-newsletter-input"
                placeholder="Enter your email address here"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button className="ft-newsletter-btn">Submit Now</button>
            </div>
          </div>

          {/* Footer Columns */}
          <div className="ft-row">

            {/* Col 1 - Logo & Brand */}
            <div className="ft-col">
              <img src="/logo.jpg" alt="Aagaj Foundation Logo" className="ft-logo" />
              <h5 className="ft-brand-name">Aagaj Foundation</h5>
              <p className="ft-brand-text">
                Aagaj Foundation Empowering communities through sustainable agriculture, health, livelihood, and education initiatives.
              </p>
            </div>

            {/* Col 2 - Quick Links */}
            <div className="ft-col">
              <h4 className="ft-col-heading">Quick Links</h4>
              <ul className="ft-link-list">
                <li><i className="fa-solid fa-arrow-right ft-arrow"></i><Link to="/about">About Us</Link></li>
                <li><i className="fa-solid fa-arrow-right ft-arrow"></i><Link to="/gallery">Gallery</Link></li>
                <li><i className="fa-solid fa-arrow-right ft-arrow"></i><a href="#">Our Programmes</a></li>
                <li><i className="fa-solid fa-arrow-right ft-arrow"></i><Link to="/contact">Contact Us</Link></li>
              </ul>
            </div>

            {/* Col 3 - Contact Info */}
            <div className="ft-col">
              <h4 className="ft-col-heading">Contact Info</h4>
              <ul className="ft-link-list">
                <li>
                  <i className="fa-solid fa-arrow-right ft-arrow"></i>
                  <span>Email: Aagajfoundationpaliganj@gmail.com</span>
                </li>
                <li>
                  <i className="fa-solid fa-arrow-right ft-arrow"></i>
                  <span>Phone: 6124065270, 9431430464</span>
                </li>
                <li>
                  <i className="fa-solid fa-arrow-right ft-arrow"></i>
                  <span>Map: Surbhi Vihar Bhupatipur Near Krishi Anusandhan Kendra Patna 800020</span>
                </li>
              </ul>
            </div>

            {/* Col 4 - Learn More */}
            <div className="ft-col">
              <h4 className="ft-col-heading ft-col-heading-underline">Learn More</h4>
              <ul className="ft-learn-list">
                <li><a href="#">Why Aagaj Foundation?</a></li>
                <li><a href="#">What We Do</a></li>
                <li><a href="#">Where We Work</a></li>
                <li><a href="#">Frequently Asked Questions</a></li>
                <li><a href="#">Charity Ratings</a></li>
              </ul>
              <div className="ft-socials">
                <a href="https://www.instagram.com/aagajfoundation/" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
                <a href="https://www.facebook.com/aagajfoundation.org" aria-label="Facebook"><i className="fa-brands fa-facebook-f"></i></a>
                <a href="#" aria-label="YouTube"><i className="fa-brands fa-youtube"></i></a>
                <a href="https://www.linkedin.com/company/aagaj-foundation/" aria-label="LinkedIn"><i className="fa-brands fa-linkedin-in"></i></a>
              </div>
            </div>

          </div>
        </div>
      </footer>

      {/* Copyright Bar */}
      <div className="ft-copyright">
        <div className="ft-copyright-inner">
          <div>
            &copy; 2026 <span>Aagaj Foundation</span>. All Rights Reserved<br />
            &copy; 2026 <span>Designed &amp; Developed By Bireenainfo Technologies Pvt. Ltd.</span> All Rights Reserved.
          </div>
          <div className="ft-legal-links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <span>|</span>
            <a href="#">Cookies Notice</a>
            <span>|</span>
            <Link to="/terms-and-conditions">Terms &amp; Conditions</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;
