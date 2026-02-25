import React, { useState } from "react";
import "./contact.css";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setFormData({ name: "", email: "", subject: "", message: "" });
    alert("Thank you! We will get back to you soon.");
  };

  return (
    <>
      {/* Social Sidebar */}
      <div className="ct-social-sidebar">
        <a href="https://www.facebook.com/aagajfoundation.org" className="ct-ss-facebook" title="Facebook">
          <i className="fa-brands fa-facebook-f"></i>
        </a>
        <a href="https://www.instagram.com/aagajfoundation/" className="ct-ss-instagram" title="Instagram">
          <i className="fa-brands fa-instagram"></i>
        </a>
        <a href="#" className="ct-ss-twitter" title="Twitter">
          <i className="fa-brands fa-twitter"></i>
        </a>
        <a href="https://www.linkedin.com/company/aagaj-foundation/" className="ct-ss-linkedin" title="LinkedIn">
          <i className="fa-brands fa-linkedin-in"></i>
        </a>
        <a href="#" className="ct-ss-youtube" title="YouTube">
          <i className="fa-brands fa-youtube"></i>
        </a>
      </div>

      <Navbar />

      {/* Page Header */}
      <header className="ct-hero">
        <div className="ct-hero-inner">
          <h1 className="ct-hero-title">Contact Us</h1>
          <div className="ct-breadcrumb">
            <a href="/" className="ct-breadcrumb-link">Home</a>
            <span className="ct-breadcrumb-sep">
              <i className="fa-solid fa-angle-right"></i>
            </span>
            <span className="ct-breadcrumb-active">Contact</span>
          </div>
        </div>
      </header>

      {/* Main Section */}
      <section className="ct-section">
        <div className="ct-container">

          {/* Info Cards Row */}
          <div className="ct-info-grid">
            <div className="ct-info-card">
              <div className="ct-info-icon">
                <i className="fa-solid fa-building"></i>
              </div>
              <h4 className="ct-info-heading">Head Office</h4>
              <p className="ct-info-text">
                Surbhi Vihar Bhupatipur<br />
                Near Krishi Anusandhan Kendra<br />
                Patna, Bihar - 800020
              </p>
            </div>

            <div className="ct-info-card">
              <div className="ct-info-icon">
                <i className="fa-solid fa-map-location-dot"></i>
              </div>
              <h4 className="ct-info-heading">District Office</h4>
              <p className="ct-info-text">
                Akhtiyarpur Rewa Road<br />
                Near HP Gas Agency<br />
                Muzaffarpur, Bihar
              </p>
            </div>
          </div>

          {/* Form + Quick Contact Row */}
          <div className="ct-form-row">

            {/* Contact Form */}
            <div className="ct-form-box">
              <h3 className="ct-form-title">Get In Touch</h3>
              <form onSubmit={handleSubmit} className="ct-form">
                <div className="ct-input-row">
                  <div className="ct-input-group">
                    <input
                      type="text"
                      className="ct-input"
                      placeholder="Your Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="ct-input-group">
                    <input
                      type="email"
                      className="ct-input"
                      placeholder="Your Email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="ct-input-group">
                  <input
                    type="text"
                    className="ct-input"
                    placeholder="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="ct-input-group">
                  <textarea
                    className="ct-input ct-textarea"
                    rows="5"
                    placeholder="Your Message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="ct-btn-submit">
                  <i className="fa-solid fa-paper-plane"></i> Send Message
                </button>
              </form>
            </div>

            {/* Quick Contact */}
            <div className="ct-quick-contact">
              <h4 className="ct-quick-title">Quick Contact</h4>

              <div className="ct-quick-item">
                <div className="ct-quick-icon">
                  <i className="fa-solid fa-phone"></i>
                </div>
                <div className="ct-quick-text">
                  <span className="ct-quick-label">Phone Numbers</span>
                  <span className="ct-quick-value">6124065270</span>
                  <span className="ct-quick-value">9431430464</span>
                </div>
              </div>

              <div className="ct-quick-item">
                <div className="ct-quick-icon">
                  <i className="fa-solid fa-envelope"></i>
                </div>
                <div className="ct-quick-text">
                  <span className="ct-quick-label">Email Address</span>
                  <span className="ct-quick-value">Aagajfoundationpaliganj@gmail.com</span>
                </div>
              </div>

              <div className="ct-quick-item">
                <div className="ct-quick-icon">
                  <i className="fa-solid fa-clock"></i>
                </div>
                <div className="ct-quick-text">
                  <span className="ct-quick-label">Working Hours</span>
                  <span className="ct-quick-value">Mon - Sat: 9:00 AM - 6:00 PM</span>
                </div>
              </div>

              <div className="ct-quick-item">
                <div className="ct-quick-icon">
                  <i className="fa-solid fa-location-dot"></i>
                </div>
                <div className="ct-quick-text">
                  <span className="ct-quick-label">Head Office</span>
                  <span className="ct-quick-value">Surbhi Vihar Bhupatipur, Near Krishi Anusandhan Kendra, Patna - 800020</span>
                </div>
              </div>

              <div className="ct-quick-socials">
                <a href="https://www.facebook.com/aagajfoundation.org" className="ct-qs-facebook" aria-label="Facebook">
                  <i className="fa-brands fa-facebook-f"></i>
                </a>
                <a href="https://www.instagram.com/aagajfoundation/" className="ct-qs-instagram" aria-label="Instagram">
                  <i className="fa-brands fa-instagram"></i>
                </a>
                <a href="https://www.linkedin.com/company/aagaj-foundation/" className="ct-qs-linkedin" aria-label="LinkedIn">
                  <i className="fa-brands fa-linkedin-in"></i>
                </a>
                <a href="#" className="ct-qs-youtube" aria-label="YouTube">
                  <i className="fa-brands fa-youtube"></i>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Contact;
