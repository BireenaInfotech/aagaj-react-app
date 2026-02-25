import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import './legal.css';

const sections = [
  { id: 'acceptance', num: '1', title: 'Acceptance of Terms' },
  { id: 'donations', num: '2', title: 'Donations' },
  { id: 'refund', num: '3', title: 'Refund Policy' },
  { id: 'use-of-funds', num: '4', title: 'Use of Funds' },
  { id: 'intellectual-property', num: '5', title: 'Intellectual Property' },
  { id: 'liability', num: '6', title: 'Limitation of Liability' },
  { id: 'governing-law', num: '7', title: 'Governing Law' },
];

const TermsAndConditions = () => {
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
          <i className="fa-solid fa-file-contract me-2"></i>Legal Document
        </span>
        <h1>Terms &amp; Conditions</h1>
        <p>Please read these terms carefully before using our website or making a donation</p>
        <div className="legal-hero-meta">
          <span><i className="fa-regular fa-calendar"></i> Effective Date: January 1, 2025</span>
          <span><i className="fa-regular fa-clock"></i> Last Updated: February 2026</span>
          <span><i className="fa-solid fa-scale-balanced"></i> Governed by Laws of India</span>
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

          {/* Quick info box */}
          <div className="legal-toc" style={{marginTop: 20, borderTopColor: '#1a1a2e'}}>
            <p className="legal-toc-title" style={{color: '#1a1a2e'}}>
              <i className="fa-solid fa-circle-info me-2"></i>Quick Info
            </p>
            <p style={{fontSize: '0.82rem', color: '#555', lineHeight: 1.6, margin: 0}}>
              Refund requests must be submitted within
              <strong style={{color:'#c0392b'}}> 7 days</strong> of transaction date.
              Approved refunds are processed in <strong style={{color:'#c0392b'}}>7–10 working days</strong>.
            </p>
          </div>
        </aside>

        {/* Content */}
        <main className="legal-content">

          {/* Intro Banner */}
          <div className="legal-section" style={{borderLeftColor: '#1a1a2e', background: 'linear-gradient(135deg, #f8f9ff, #fff)'}}>
            <p style={{margin:0, fontSize:'0.95rem', color:'#444', lineHeight:1.8}}>
              These Terms and Conditions govern your use of the <strong>Aagaz Foundation</strong> website and
              donation services. By accessing this website or making a donation, you agree to be bound by these
              terms. If you do not agree, please refrain from using our services.
            </p>
          </div>

          {/* Section 1 */}
          <div className="legal-section" id="acceptance">
            <div className="legal-section-header">
              <span className="legal-section-num">1</span>
              <h2>Acceptance of Terms</h2>
            </div>
            <p>
              By accessing and using this website or making a donation, you agree to be bound by these Terms
              and Conditions, our Privacy Policy, and all applicable laws and regulations.
            </p>
            <p>
              These terms apply to all visitors, donors, volunteers, and beneficiaries who interact with
              the Aagaz Foundation website or services.
            </p>
          </div>

          {/* Section 2 */}
          <div className="legal-section" id="donations">
            <div className="legal-section-header">
              <span className="legal-section-num">2</span>
              <h2>Donations</h2>
            </div>
            <ul>
              {[
                'All donations are voluntary and made at the donor\'s own discretion.',
                'Donations once made are generally non-refundable except in cases of duplicate or erroneous transactions.',
                'Donation receipts will be issued in accordance with applicable Indian laws.',
                'Aagaz Foundation is registered and eligible to issue receipts as per applicable provisions.',
              ].map((item, i) => (
                <li key={i}>
                  <i className="fa-solid fa-circle legal-li-icon"></i> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3 */}
          <div className="legal-section" id="refund">
            <div className="legal-section-header">
              <span className="legal-section-num">3</span>
              <h2>Refund Policy</h2>
            </div>
            <p>
              We understand that payment issues can occur. In case of duplicate payments or technical errors,
              we are committed to resolving them promptly.
            </p>

            <div style={{display:'flex', gap:16, flexWrap:'wrap', margin:'16px 0'}}>
              <div style={{flex:'1', minWidth:200, background:'#fef5f5', borderRadius:10, padding:'18px 20px', border:'1px solid #f5c6c6'}}>
                <div style={{color:'#c0392b', fontWeight:700, marginBottom:6, fontSize:'0.9rem'}}>
                  <i className="fa-solid fa-calendar-days me-2"></i>Submit Request
                </div>
                <div style={{fontSize:'0.85rem', color:'#555', lineHeight:1.6}}>
                  Refund requests must be submitted within <strong>7 days</strong> of the transaction date
                  via email to us.
                </div>
              </div>
              <div style={{flex:'1', minWidth:200, background:'#f0fef4', borderRadius:10, padding:'18px 20px', border:'1px solid #b7e4c7'}}>
                <div style={{color:'#27ae60', fontWeight:700, marginBottom:6, fontSize:'0.9rem'}}>
                  <i className="fa-solid fa-clock-rotate-left me-2"></i>Processing Time
                </div>
                <div style={{fontSize:'0.85rem', color:'#555', lineHeight:1.6}}>
                  Approved refunds will be processed within <strong>7–10 working days</strong> through
                  the original payment method.
                </div>
              </div>
            </div>

            <p style={{marginTop: 8}}>
              To request a refund, please contact us at{' '}
              <a href="mailto:Aagajfoundationpaliganj@gmail.com" style={{color:'#c0392b', fontWeight:600}}>
                Aagajfoundationpaliganj@gmail.com
              </a>{' '}
              with your transaction details.
            </p>
          </div>

          {/* Section 4 */}
          <div className="legal-section" id="use-of-funds">
            <div className="legal-section-header">
              <span className="legal-section-num">4</span>
              <h2>Use of Funds</h2>
            </div>
            <p>
              All donations received by Aagaz Foundation will be utilized towards our charitable objectives
              and activities, including:
            </p>
            <ul>
              {[
                'Women skill development — Silayi Prasikshan Yojana',
                'Healthcare support and Swasthya Suraksha programs',
                'Sustainable livelihood and Swarojgaar initiatives',
                'Community welfare and educational programs',
              ].map((item, i) => (
                <li key={i}>
                  <i className="fa-solid fa-circle legal-li-icon"></i> {item}
                </li>
              ))}
            </ul>
            <p style={{marginTop:12}}>
              All fund utilization is done in accordance with applicable Indian laws and our organizational mandate.
            </p>
          </div>

          {/* Section 5 */}
          <div className="legal-section" id="intellectual-property">
            <div className="legal-section-header">
              <span className="legal-section-num">5</span>
              <h2>Intellectual Property</h2>
            </div>
            <p>
              All content on this website, including but not limited to text, images, graphics, logos, icons,
              and materials, is the <strong>property of Aagaz Foundation</strong> and is protected by applicable
              intellectual property laws.
            </p>
            <p>
              No content may be reproduced, distributed, modified, or used without prior written consent from
              Aagaz Foundation.
            </p>
          </div>

          {/* Section 6 */}
          <div className="legal-section" id="liability">
            <div className="legal-section-header">
              <span className="legal-section-num">6</span>
              <h2>Limitation of Liability</h2>
            </div>
            <p>
              Aagaz Foundation shall not be liable for any direct, indirect, incidental, or consequential
              damages arising from:
            </p>
            <ul>
              {[
                'The use or inability to use this website',
                'Payment processing delays or failures caused by third-party gateways',
                'Unauthorized access to or alteration of your data',
                'Any interruption or cessation of transmission to the website',
              ].map((item, i) => (
                <li key={i}>
                  <i className="fa-solid fa-circle legal-li-icon"></i> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Section 7 */}
          <div className="legal-section" id="governing-law">
            <div className="legal-section-header">
              <span className="legal-section-num">7</span>
              <h2>Governing Law</h2>
            </div>
            <p>
              These Terms and Conditions shall be governed by and interpreted in accordance with the
              <strong> laws of India</strong>. Any disputes arising shall be subject to the exclusive
              jurisdiction of courts in <strong>Patna, Bihar</strong>.
            </p>
            <div className="legal-info-box">
              <p>
                <i className="fa-solid fa-scale-balanced me-2" style={{color:'#c0392b'}}></i>
                By using our website, you submit to the jurisdiction of Indian courts for any dispute
                resolution arising out of these Terms.
              </p>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="legal-section legal-contact-card">
            <h2>Have Questions About These Terms?</h2>
            <p>
              If you have any questions about our Terms and Conditions or need clarification on any point,
              our team is here to help.
            </p>
            <div style={{display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap'}}>
              <a href="/contact" className="legal-contact-btn">
                <i className="fa-solid fa-envelope me-2"></i>Contact Us
              </a>
              <a href="/privacy-policy" className="legal-contact-btn" style={{background:'rgba(255,255,255,0.2)', color:'#fff', border:'2px solid rgba(255,255,255,0.5)'}}>
                <i className="fa-solid fa-shield-halved me-2"></i>Privacy Policy
              </a>
            </div>
          </div>

        </main>
      </div>

      <Footer />
    </>
  );
};

export default TermsAndConditions;
