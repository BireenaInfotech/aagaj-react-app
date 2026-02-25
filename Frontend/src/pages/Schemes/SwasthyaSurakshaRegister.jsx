import React, { useState, useEffect } from 'react';
import './SwasthyaSurakshaRegister.css';
import Navbar from '../../components/Navbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const CONFIG = {
  Hospital: {
    label: 'Total Beds / Specialist Doctors',
    placeholder: 'e.g. 50 Beds, 10 Doctors',
    license: 'Medical Registration No.',
    services: ['ICU', 'Emergency', 'OPD', 'Ambulance', 'Surgery', 'General Ward', 'Private Ward', 'NICU']
  },
  Lab: {
    label: 'NABL Accreditation Status',
    placeholder: 'Yes / No / Applied',
    license: 'Lab License Number',
    services: ['Blood Test', 'Home Collection', 'X-Ray', 'CT Scan', 'Pathology', 'MRI', 'Ultrasound', 'ECG']
  },
  Pharmacy: {
    label: 'Drug License Expiry',
    placeholder: 'DD/MM/YYYY',
    license: 'Pharmacy License No.',
    services: ['Home Delivery', 'Generic Meds', 'Surgicals', 'Refrigerated Items', 'Baby Care', 'Ayurvedic', 'Allopathic']
  }
};

const sanitize = {
  num: (value) => value.replace(/[^0-9]/g, ''),
  pureText: (value) => value.replace(/[^a-zA-Z\s]/g, ''),
  alphanumeric: (value) => value.replace(/[^a-zA-Z0-9\s]/g, ''),
  textComma: (value) => value.replace(/[^a-zA-Z0-9\s,]/g, ''),
  dateChar: (value) => value.replace(/[^0-9/]/g, '')
};

const SwasthyaSurakshaRegister = () => {
  const [entityType, setEntityType] = useState('Hospital');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Auth protection - check if employee is logged in
  useEffect(() => {
    const userType = sessionStorage.getItem('userType');
    if (userType !== 'employee') {
      navigate('/admin-login');
    }
  }, [navigate]);

  const getAuthHeaders = () => {
    const token = sessionStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const getExtraSanitizer = () => {
    if (entityType === 'Hospital') return sanitize.textComma;
    if (entityType === 'Pharmacy') return sanitize.dateChar;
    return sanitize.alphanumeric;
  };

  const handleSanitizeInput = (event, sanitizer) => {
    event.target.value = sanitizer(event.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🚀 FORM SUBMISSION STARTED');
    setLoading(true);

    try {
      // Get form data
      const bizName = document.getElementById('biz-name').value;
      const bizDetails = document.getElementById('biz-details').value;
      const extraInfo = document.getElementById('extra-info').value;
      const license = document.getElementById('license').value;
      const addrMain = document.getElementById('addr-main').value;
      const addrExtra = document.getElementById('addr-extra').value;
      const addrCity = document.getElementById('addr-city').value;
      const addrState = document.getElementById('addr-state').value;
      const addrPin = document.getElementById('addr-pin').value;
      const ownerName = document.getElementById('owner-name').value;
      const bizPhone = document.getElementById('biz-phone').value;

      // Get selected services
      const serviceCheckboxes = document.querySelectorAll('input[name="service"]:checked');
      const services = Array.from(serviceCheckboxes).map(cb => cb.value);

      console.log('📝 Form data collected:', { bizName, entityType, bizPhone });

      // Validate required fields
      if (!bizName || !addrMain || !addrCity || !addrState || !addrPin || !ownerName || !bizPhone) {
        alert('कृपया सभी आवश्यक फील्ड भरें');
        setLoading(false);
        return;
      }

      // Prepare payload
      const payload = {
        businessCategory: entityType,
        businessName: bizName,
        businessDetails: bizDetails,
        extraInfo: extraInfo,
        licenseNumber: license,
        address: addrMain,
        landmark: addrExtra,
        city: addrCity,
        state: addrState,
        pincode: addrPin,
        authorizedPersonName: ownerName,
        whatsappNumber: bizPhone,
        servicesOffered: services
      };

      console.log('📤 SENDING REQUEST TO: POST /swasthya-suraksha-provider/register');
      console.log('📦 Payload:', payload);

      // Send to backend
      const response = await axios.post(`${apiUrl}/swasthya-suraksha-provider/register`, payload, {
        withCredentials: true,
        headers: getAuthHeaders()
      });

      console.log('✅ RESPONSE RECEIVED:', response.status);
      console.log('📦 Response data:', response.data);

      if (response.data?.success) {
        alert('✅ डेटा फॉर्म सफलतापूर्वक सबमिट हो गया!');
        document.getElementById('tieupForm').reset();
        setLoading(false);
      } else {
        alert('❌ ' + (response.data?.message || 'कुछ गलत हुआ'));
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ ERROR DURING SUBMISSION:', error);
      console.error('Response:', error?.response?.data);
      alert('❌ ' + (error?.response?.data?.message || error.message || 'सर्वर से कनेक्शन विफल'));
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="swasthya-page">
      <div className="swasthya-header-container">
        <h1 className="swasthya-title">AAGAJ FOUNDATION</h1>
        <div className="swasthya-details">
          <div className="swasthya-reg-text">Registered Under Indian Trust Act 1882</div>
          <div className="swasthya-info-text">GST: 10AAHTA9693GIZM | PAN: AAHTA9693G</div>
          <div className="swasthya-info-text">Email: aagajfoundationpaliganj@gmail.com</div>
        </div>
      </div>

      <div className="swasthya-container">
        <section className="swasthya-page-card" id="form-card">
          <div className="swasthya-header-text">PARTNER TIE-UP PORTAL AGREEMENT</div>

          <p style={{ textAlign: 'justify', marginBottom: 30 }}>
            This document serves as an application for business partnership with Aagaj Foundation. Please fill in the details accurately.
          </p>

          <form id="tieupForm" onSubmit={handleSubmit}>
            <div className="swasthya-section">
              <h3 className="swasthya-section-heading">1. Business Identity (व्यवसाय का विवरण)</h3>

              <table className="swasthya-table" style={{ marginTop: 0 }}>
                <tbody>
                  <tr>
                    <td style={{ width: '30%', fontWeight: 'bold', background: '#fcfcfc' }}>Business Category</td>
                    <td>
                      <select
                        id="entity-type"
                        className="editable-input"
                        value={entityType}
                        onChange={(event) => setEntityType(event.target.value)}
                      >
                        <option value="Hospital">Hospital / Clinic</option>
                        <option value="Lab">Diagnostics Lab</option>
                        <option value="Pharmacy">Pharmacy / Medical Store</option>
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold', background: '#fcfcfc' }}>Business Name</td>
                    <td>
                      <input
                        type="text"
                        id="biz-name"
                        className="editable-input"
                        placeholder="Enter Full Registered Name"
                        onInput={(event) => handleSanitizeInput(event, sanitize.pureText)}
                        required
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold', background: '#fcfcfc' }}>Experience / Details</td>
                    <td>
                      <input
                        type="text"
                        id="biz-details"
                        className="editable-input"
                        placeholder="Years of experience, etc."
                        onInput={(event) => handleSanitizeInput(event, sanitize.alphanumeric)}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>

              <table className="swasthya-table">
                <tbody>
                  <tr>
                    <td style={{ width: '30%', fontWeight: 'bold', background: '#fcfcfc' }}>{CONFIG[entityType].label}</td>
                      <td>
                        <input
                          type="text"
                          id="extra-info"
                          className="editable-input"
                          placeholder={CONFIG[entityType].placeholder}
                          onInput={(event) => handleSanitizeInput(event, getExtraSanitizer())}
                          required
                        />
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold', background: '#fcfcfc' }}>{CONFIG[entityType].license}</td>
                      <td>
                        <input
                          type="text"
                          id="license"
                          className="editable-input"
                          placeholder="Reg/License Number"
                          onInput={(event) => handleSanitizeInput(event, sanitize.alphanumeric)}
                          required
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
            </div>

            <div className="swasthya-section">
              <h3 className="swasthya-section-heading">2. Location Details (स्थान विवरण)</h3>

              <div className="swasthya-form-row">
                <span className="swasthya-label-text">Full Address:</span>
                <input
                  type="text"
                  id="addr-main"
                  className="editable-input"
                  placeholder="Building, Street, Area"
                  onInput={(event) => handleSanitizeInput(event, sanitize.alphanumeric)}
                  required
                />
              </div>

              <div className="swasthya-form-row">
                <span className="swasthya-label-text">Landmark:</span>
                <input
                  type="text"
                  id="addr-extra"
                  className="editable-input"
                  placeholder="Near Temple, etc."
                  onInput={(event) => handleSanitizeInput(event, sanitize.alphanumeric)}
                />
              </div>

              <div className="swasthya-inline-row">
                <div className="swasthya-inline-field">
                  <span className="swasthya-label-text">City/Town:</span>
                  <input type="text" id="addr-city" className="editable-input" placeholder="e.g. Patna"
                    onInput={(event) => handleSanitizeInput(event, sanitize.pureText)} required />
                </div>
                <div className="swasthya-inline-field">
                  <span className="swasthya-label-text">State:</span>
                  <input type="text" id="addr-state" className="editable-input" placeholder="e.g. Bihar"
                    onInput={(event) => handleSanitizeInput(event, sanitize.pureText)} required />
                </div>
                <div className="swasthya-inline-field">
                  <span className="swasthya-label-text">Pincode:</span>
                  <input type="text" id="addr-pin" maxLength="6" className="editable-input" placeholder="800001"
                    onInput={(event) => handleSanitizeInput(event, sanitize.num)} required />
                </div>
              </div>
            </div>

            <div className="swasthya-section">
              <h3 className="swasthya-section-heading">3. Contact Information (संपर्क विवरण)</h3>
              <div className="swasthya-contact-row">
                <div className="swasthya-contact-field">
                  <label htmlFor="owner-name">Authorized Person Name:</label>
                  <input type="text" id="owner-name" className="editable-input" placeholder="Full Name"
                    onInput={(event) => handleSanitizeInput(event, sanitize.pureText)} required />
                </div>
                <div className="swasthya-contact-field">
                  <label htmlFor="biz-phone">WhatsApp Number:</label>
                  <input type="text" id="biz-phone" maxLength="10" className="editable-input" placeholder="10 Digit Number"
                    onInput={(event) => handleSanitizeInput(event, sanitize.num)} required />
                </div>
              </div>
            </div>

            <div className="swasthya-section">
              <h3 className="swasthya-section-heading">4. Services Offered (सेवाएं)</h3>
              <div className="service-grid" id="service-options">
                {CONFIG[entityType].services.map((service) => (
                  <div className="check-item" key={service}>
                    <input type="checkbox" name="service" value={service} />
                    <label>{service}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="swasthya-actions">
              <button type="submit" className="swasthya-submit" disabled={loading}>
                {loading ? '⏳ सबमिट कर रहे हैं...' : 'Submit'}
              </button>
            </div>
          </form>
        </section>
      </div>
      </div>
     
    </>
  );
};

export default SwasthyaSurakshaRegister;
