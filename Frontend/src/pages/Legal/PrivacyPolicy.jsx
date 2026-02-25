import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import './legal.css';

const sections = [
  { id: 'introduction', num: '1', title: 'Introduction' },
  { id: 'info-collected', num: '2', title: 'Information We Collect' },
  { id: 'purpose', num: '3', title: 'Purpose of Collection' },
  { id: 'payment-security', num: '4', title: 'Payment Security' },
  { id: 'sharing', num: '5', title: 'Sharing of Information' },
  { id: 'data-protection', num: '6', title: 'Data Protection' },
  { id: 'cookies', num: '7', title: 'Cookies' },
  { id: 'retention', num: '8', title: 'Data Retention' },
  { id: 'your-rights', num: '9', title: 'Your Rights' },
  { id: 'changes', num: '10', title: 'Changes to This Policy' },
];

const PrivacyPolicy = () => {
  return (
    <>
      {/* Social Sidebar */}
      <div className="social-sidebar">
        <a href="https://www.facebook.com/aagajfoundation.org" className="facebook" title="Facebook">
          <i className="fa-brands fa-facebook-f"></i>
        </a>
        <a href="https://www.instagram.com/aagajfoundation/" className="instagram" title="Instagram">
          <i className="fa-brands fa-instagram"></i>
        </a>
        <a href="#" className="twitter" title="Twitter">
          <i className="fa-brands fa-twitter"></i>
        </a>
        <a href="https://www.linkedin.com/company/aagaj-foundation/" className="linkedin" title="LinkedIn">
          <i className="fa-brands fa-linkedin-in"></i>
        </a>
      </div>

      <Navbar />

      {/* Hero Banner */}
      <div className="legal-hero">
        <span className="legal-hero-badge">
          <i className="fa-solid fa-shield-halved me-2"></i>Legal Document
        </span>
        <h1>Privacy Policy</h1>
        <p>How Aagaz Foundation collects, uses, and protects your information</p>
        <div className="legal-hero-meta">
          <span><i className="fa-regular fa-calendar"></i> Effective Date: January 1, 2025</span>
          <span><i className="fa-regular fa-clock"></i> Last Updated: February 2026</span>
        </div>
      </div>

      {/* Main Layout */}
      <div className="legal-wrapper">

        {/* Sidebar TOC */}
        <aside className="legal-sidebar">
          <div className="legal-toc">
            <p className="legal-toc-title">
              <i className="fa-solid fa-list me-2"></i>Table of Contents
            </p>
            <ul>
              {sections.map(s => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>{s.num}. {s.title}</a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Content */}
        <main className="legal-content">

          {/* Section 1 */}
          <div className="legal-section" id="introduction">
            <div className="legal-section-header">
              <span className="legal-section-num">1</span>
              <h2>Introduction</h2>
            </div>
            <p>
              <strong>Aagaz Foundation</strong> ("Foundation", "we", "our", "us") is committed to protecting the
              privacy and personal information of donors, volunteers, beneficiaries, and website visitors.
            </p>
            <p>
              This Privacy Policy describes how we collect, use, disclose, and safeguard your information when
              you visit our website and make donations.
            </p>
            <div className="legal-info-box">
              <p>
                <i className="fa-solid fa-circle-info me-2" style={{color:'#c0392b'}}></i>
                By accessing our website, you <span className="legal-highlight">consent</span> to the
                practices described in this Policy.
              </p>
            </div>
          </div>

          {/* Section 2 */}
          <div className="legal-section" id="info-collected">
            <div className="legal-section-header">
              <span className="legal-section-num">2</span>
              <h2>Information We Collect</h2>
            </div>
            <h3>2.1 Personal Information</h3>
            <p>We may collect the following information when you donate, register, or contact us:</p>
            <ul>
              {[
                'Full Name',
                'Email Address',
                'Phone Number',
                'Residential Address',
                'PAN Number (for tax exemption receipts, if applicable)',
                'Donation amount and transaction details',
              ].map((item, i) => (
                <li key={i}>
                  <i className="fa-solid fa-circle legal-li-icon"></i> {item}
                </li>
              ))}
            </ul>

            <h3>2.2 Technical Information</h3>
            <p>When you access our website, we may automatically collect:</p>
            <ul>
              {[
                'IP address',
                'Browser type and version',
                'Device information',
                'Cookies and usage data',
              ].map((item, i) => (
                <li key={i}>
                  <i className="fa-solid fa-circle legal-li-icon"></i> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3 */}
          <div className="legal-section" id="purpose">
            <div className="legal-section-header">
              <span className="legal-section-num">3</span>
              <h2>Purpose of Collection</h2>
            </div>
            <p>Your information may be used for:</p>
            <ul>
              {[
                'Processing donations and issuing receipts',
                'Providing tax exemption certificates (if applicable)',
                'Communicating updates about our programs and initiatives',
                'Responding to inquiries',
                'Legal and regulatory compliance',
                'Preventing fraud and ensuring website security',
              ].map((item, i) => (
                <li key={i}>
                  <i className="fa-solid fa-circle legal-li-icon"></i> {item}
                </li>
              ))}
            </ul>
            <div className="legal-info-box" style={{marginTop: 20}}>
              <p>
                <i className="fa-solid fa-ban me-2" style={{color:'#c0392b'}}></i>
                We do <strong>not</strong> sell, rent, or trade personal information to third parties.
              </p>
            </div>
          </div>

          {/* Section 4 */}
          <div className="legal-section" id="payment-security">
            <div className="legal-section-header">
              <span className="legal-section-num">4</span>
              <h2>Payment Security</h2>
            </div>
            <p>
              All payments made through our website are processed securely via authorized third-party payment
              gateways compliant with industry-standard encryption protocols.
            </p>
            <p>
              <strong>Aagaz Foundation does not store</strong> your debit/credit card details, CVV, or banking
              credentials on its servers. All payment data is handled entirely by our certified payment partners.
            </p>
            <div className="legal-info-box">
              <p>
                <i className="fa-solid fa-lock me-2" style={{color:'#c0392b'}}></i>
                Your financial information is <span className="legal-highlight">encrypted and secure</span> at every step of the payment process.
              </p>
            </div>
          </div>

          {/* Section 5 */}
          <div className="legal-section" id="sharing">
            <div className="legal-section-header">
              <span className="legal-section-num">5</span>
              <h2>Sharing of Information</h2>
            </div>
            <p>We may share personal information only:</p>
            <ul>
              {[
                'With trusted payment gateway service providers',
                'With government or regulatory authorities where required by law',
                'With auditors or legal advisors for compliance purposes',
              ].map((item, i) => (
                <li key={i}>
                  <i className="fa-solid fa-circle legal-li-icon"></i> {item}
                </li>
              ))}
            </ul>
            <p style={{marginTop: 16}}>
              All third parties are obligated to maintain <strong>confidentiality and security</strong> of information shared with them.
            </p>
          </div>

          {/* Section 6 */}
          <div className="legal-section" id="data-protection">
            <div className="legal-section-header">
              <span className="legal-section-num">6</span>
              <h2>Data Protection</h2>
            </div>
            <p>
              We implement reasonable administrative, technical, and physical safeguards to protect personal
              information against unauthorized access, misuse, or disclosure.
            </p>
            <p>
              Despite these measures, no internet transmission or electronic storage is 100% secure. We
              continuously work to improve our security practices.
            </p>
          </div>

          {/* Section 7 */}
          <div className="legal-section" id="cookies">
            <div className="legal-section-header">
              <span className="legal-section-num">7</span>
              <h2>Cookies</h2>
            </div>
            <p>
              Our website may use cookies to enhance user experience and analyze website performance. Cookies
              are small text files stored on your device that help us understand how you use our site.
            </p>
            <p>
              You may control cookie settings through your browser preferences. Disabling cookies may affect
              certain functionalities of the website.
            </p>
          </div>

          {/* Section 8 */}
          <div className="legal-section" id="retention">
            <div className="legal-section-header">
              <span className="legal-section-num">8</span>
              <h2>Data Retention</h2>
            </div>
            <p>
              We retain personal information only as long as necessary to fulfill the purposes outlined in this
              Policy or as required by applicable law, regulatory obligations, or for dispute resolution.
            </p>
          </div>

          {/* Section 9 */}
          <div className="legal-section" id="your-rights">
            <div className="legal-section-header">
              <span className="legal-section-num">9</span>
              <h2>Your Rights</h2>
            </div>
            <p>You may request <strong>access, correction, or deletion</strong> of your personal information by contacting us at:</p>
            <ul>
              <li>
                <i className="fa-regular fa-envelope legal-li-icon" style={{fontSize:'0.9rem', marginTop:4}}></i>
                Aagajfoundationpaliganj@gmail.com
              </li>
              <li>
                <i className="fa-solid fa-phone legal-li-icon" style={{fontSize:'0.9rem', marginTop:4}}></i>
                6124065270 / 9431430464
              </li>
              <li>
                <i className="fa-solid fa-location-dot legal-li-icon" style={{fontSize:'0.9rem', marginTop:4}}></i>
                Surbhi Vihar, Bhupatipur, Near Krishi Anusandhan Kendra, Patna – 800020
              </li>
            </ul>
          </div>

          {/* Section 10 */}
          <div className="legal-section" id="changes">
            <div className="legal-section-header">
              <span className="legal-section-num">10</span>
              <h2>Changes to This Policy</h2>
            </div>
            <p>
              Aagaz Foundation reserves the right to update this Privacy Policy at any time. Changes will be
              posted on this page with the updated effective date.
            </p>
            <p>
              We encourage you to periodically review this page to stay informed about how we protect your information.
            </p>
          </div>

          {/* Contact CTA */}
          <div className="legal-section legal-contact-card">
            <h2>Questions About Our Privacy Policy?</h2>
            <p>
              If you have any concerns or questions regarding how we handle your data, please reach out to us.
              We're happy to help.
            </p>
            <a href="/contact" className="legal-contact-btn">
              <i className="fa-solid fa-envelope me-2"></i>Contact Us
            </a>
          </div>

        </main>
      </div>

      <Footer />
    </>
  );
};

export default PrivacyPolicy;
