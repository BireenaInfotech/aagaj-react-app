import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import getepayPortal from '../../GetepayComponents';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import './Donate.css';

const Donate = () => {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [donationType, setDonationType] = useState('oneTime');
  const [selectedAmount, setSelectedAmount] = useState(500);
  const [customAmount, setCustomAmount] = useState(500);
  const [displayAmount, setDisplayAmount] = useState(500);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    donorAddress: '',
    pincode: '',
    city: '',
    state: '',
    donorPan: '',
    dob: '',
    citizenCheck: false,
  });

  const [errors, setErrors] = useState({});

  const predefinedAmounts = [500, 1000, 2000, 5000, 10000];
  const today = new Date().toISOString().split('T')[0];

  const selectAmount = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount(amount);
    setDisplayAmount(amount);
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    setCustomAmount(value);
    setDisplayAmount(value || '0');
    setSelectedAmount('custom');
  };

  // ---- Validation ----
  const validate = (field, value) => {
    let msg = '';
    if (field === 'donorName' && !value.trim()) msg = 'Full name is required';
    if (field === 'donorEmail') {
      if (!value.trim()) msg = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) msg = 'Enter a valid email address';
    }
    if (field === 'donorPhone') {
      if (!value.trim()) msg = 'Phone number is required';
      else if (!/^\d{10}$/.test(value)) msg = 'Phone must be exactly 10 digits';
    }
    if (field === 'donorAddress' && !value.trim()) msg = 'Address is required';
    if (field === 'pincode' && value && !/^\d{6}$/.test(value)) msg = 'Pincode must be exactly 6 digits';
    if (field === 'donorPan' && value && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value)) msg = 'Invalid PAN format (e.g. ABCDE1234F)';
    if (field === 'dob' && value && new Date(value) > new Date()) msg = 'Date of birth cannot be a future date';
    setErrors(prev => ({ ...prev, [field]: msg }));
    return !msg;
  };

  const handleDobChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, dob: value }));
    validate('dob', value);
  };

  const handlePincodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, pincode: value }));
    validate('pincode', value);
    if (value.length === 6) {
      setFormData(prev => ({ ...prev, city: 'Patna', state: 'Bihar' }));
    }
  };

  const handleFormChange = (e) => {
    const { id, value, type, checked } = e.target;
    if (id === 'donorName') {
      const v = value.replace(/[^a-zA-Z\s]/g, '');
      setFormData(prev => ({ ...prev, donorName: v }));
      validate('donorName', v);
    } else if (id === 'donorPhone') {
      const v = value.replace(/[^0-9]/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, donorPhone: v }));
      validate('donorPhone', v);
    } else if (id === 'donorEmail') {
      setFormData(prev => ({ ...prev, donorEmail: value }));
      validate('donorEmail', value);
    } else if (id === 'donorAddress') {
      setFormData(prev => ({ ...prev, donorAddress: value }));
      validate('donorAddress', value);
    } else if (id === 'donorPan') {
      const v = value.toUpperCase().slice(0, 10);
      setFormData(prev => ({ ...prev, donorPan: v }));
      validate('donorPan', v);
    } else if (id === 'cityInput' || id === 'stateInput') {
      setFormData(prev => ({ ...prev, [id === 'cityInput' ? 'city' : 'state']: value.replace(/[^a-zA-Z\s]/g, '') }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [id]: checked }));
      if (id === 'citizenCheck') setErrors(prev => ({ ...prev, citizenCheck: checked ? '' : 'Please confirm you are a citizen of India' }));
    } else {
      setFormData(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = customAmount;
    if (!amount || amount < 1) { alert('Please enter a valid amount'); return; }

    // Full form validation before payment
    const fieldsToCheck = ['donorName', 'donorEmail', 'donorPhone', 'donorAddress', 'pincode', 'donorPan', 'dob'];
    const newErrors = {};
    fieldsToCheck.forEach(field => {
      const value = formData[field] || '';
      let msg = '';
      if (field === 'donorName' && !value.trim()) msg = 'Full name is required';
      if (field === 'donorEmail') {
        if (!value.trim()) msg = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) msg = 'Enter a valid email address';
      }
      if (field === 'donorPhone') {
        if (!value.trim()) msg = 'Phone number is required';
        else if (!/^\d{10}$/.test(value)) msg = 'Phone must be exactly 10 digits';
      }
      if (field === 'donorAddress' && !value.trim()) msg = 'Address is required';
      if (field === 'pincode' && value && !/^\d{6}$/.test(value)) msg = 'Pincode must be exactly 6 digits';
      if (field === 'donorPan' && value && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value)) msg = 'Invalid PAN format (e.g. ABCDE1234F)';
      if (field === 'dob' && value && new Date(value) > new Date()) msg = 'Date of birth cannot be a future date';
      if (msg) newErrors[field] = msg;
    });
    if (!formData.citizenCheck) newErrors.citizenCheck = 'Please confirm you are a citizen of India';
    setErrors(prev => ({ ...prev, ...newErrors }));
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const config = {
        getepay_mid: import.meta.env.VITE_GETEPAY_MID ,
        getepay_terminal_id: import.meta.env.VITE_GETEPAY_TERMINAL_ID ,
        getepay_keys: import.meta.env.VITE_GETEPAY_KEYS,
        getepay_ivs: import.meta.env.VITE_GETEPAY_IV ,
        getepay_url: import.meta.env.VITE_GETEPAY_URL,
      };
      const orderId = `${Date.now()}`;
      const data = {
        mid: config.getepay_mid,
        amount: parseFloat(amount).toFixed(2),
        merchantTransactionId: orderId,
        transactionDate: new Date().toISOString(),
        terminalId: config.getepay_terminal_id,
        udf1: formData.donorPhone ,
        udf2: formData.donorEmail ,
        udf3: formData.donorName ,
        udf4: '', udf5: '', udf6: '', udf7: '', udf8: '', udf9: '', udf10: '',
        ru: `${import.meta.env.VITE_API_URL}/pgresponse`,
        callbackUrl: '',
        currency: 'INR',
        paymentMode: 'ALL',
        bankId: '455',
        txnType: 'single',
        productType: 'IPG',
        txnNote: `Donation ${donationType}`,
        vpa: config.getepay_terminal_id,
      };
      try {
        await axios.post(`${apiUrl}/donation`, {
          order_id: orderId,
          amount: parseFloat(amount),
          donor_name: formData.donorName,
          email: formData.donorEmail,
          phone: formData.donorPhone,
          address: formData.donorAddress,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          pan: formData.donorPan,
          gateway: 'Getepay',
          status: 'Pending',
        });
      } catch (dbError) {
        console.warn('DB error (non-blocking):', dbError.message);
      }
      await getepayPortal(data, config);
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      {/* Page Header */}
      <header className="dn-page-header">
        <div className="dn-header-inner">
          <h1 className="dn-header-title">Make a Difference Today</h1>
          <p className="dn-lead">Your contribution can change a life forever.</p>
          <div className="dn-back-wrap">
            <button onClick={() => navigate('/')} className="dn-back-btn">
              <i className="fa-solid fa-arrow-left"></i> Back to Home
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="dn-page-wrap">
        <div className="dn-layout">

          {/* Sidebar */}
          <aside className="dn-sidebar">
            <div className="impact-box">
              <h3 className="dn-impact-title">Why Donate?</h3>
              <ul className="dn-impact-list">
                <li>
                  <i className="fa-solid fa-check-circle dn-icon-red"></i>
                  <span><strong>Tax Benefits:</strong> Get 50% tax exemption u/s 80G.</span>
                </li>
                <li>
                  <i className="fa-solid fa-check-circle dn-icon-red"></i>
                  <span><strong>Transparency:</strong> Regular updates on how your money is used.</span>
                </li>
                <li>
                  <i className="fa-solid fa-check-circle dn-icon-red"></i>
                  <span><strong>Impact:</strong> Directly support rural women and child education.</span>
                </li>
              </ul>
              <div className="dn-tax-box">
                <span className="dn-tax-label">Tax Exemption (80G) No:</span>
                <div className="dn-tax-number">AAGAJ/80G/2026/XXXX</div>
              </div>
            </div>
          </aside>

          {/* Main Card */}
          <div className="dn-main">
            <div className="donation-card">

              <h4 className="dn-section-title">1. Choose Donation Amount</h4>

              {/* One Time / Monthly Toggle */}
              <div className="dn-toggle-row">
                <button
                  className={`donation-toggle-btn ${donationType === 'oneTime' ? 'active' : ''}`}
                  onClick={() => setDonationType('oneTime')}
                >
                  One Time
                </button>
                <button
                  className={`donation-toggle-btn ${donationType === 'monthly' ? 'active' : ''}`}
                  onClick={() => setDonationType('monthly')}
                >
                  Monthly
                </button>
              </div>

              {/* Preset Amounts */}
              <div className="dn-amounts-grid">
                {predefinedAmounts.map((amount) => (
                  <div
                    key={amount}
                    className={`amount-box ${selectedAmount === amount ? 'selected' : ''}`}
                    onClick={() => selectAmount(amount)}
                  >
                    ₹{amount}
                  </div>
                ))}
                <div
                  className={`amount-box ${selectedAmount === 'custom' ? 'selected' : ''}`}
                  onClick={() => setSelectedAmount('custom')}
                >
                  Custom
                </div>
              </div>

              {/* Custom Amount Input */}
              <div className="dn-input-group">
                <span className="dn-input-prefix">₹</span>
                <input
                  type="number"
                  id="customAmountInput"
                  className="dn-input"
                  placeholder="Enter Custom Amount"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                />
              </div>

              <h4 className="dn-section-title dn-section-title--border">2. Enter Your Details</h4>

              <form id="fullDonationForm" onSubmit={handleSubmit}>
                <div className="dn-form-grid">

                  <div className="dn-col-half">
                    <label className="dn-label">Full Name <span className="dn-required">*</span></label>
                    <input type="text" id="donorName" className={`dn-input${errors.donorName ? ' dn-input-err' : ''}`}
                      placeholder="Ex: Rahul Kumar" value={formData.donorName} onChange={handleFormChange} />
                    {errors.donorName && <span className="dn-field-error">{errors.donorName}</span>}
                  </div>

                  <div className="dn-col-half">
                    <label className="dn-label">Email Address <span className="dn-required">*</span></label>
                    <input type="email" id="donorEmail" className={`dn-input${errors.donorEmail ? ' dn-input-err' : ''}`}
                      placeholder="Ex: rahul@email.com" value={formData.donorEmail} onChange={handleFormChange} />
                    {errors.donorEmail && <span className="dn-field-error">{errors.donorEmail}</span>}
                  </div>

                  <div className="dn-col-half">
                    <label className="dn-label">Phone Number <span className="dn-required">*</span></label>
                    <input type="tel" id="donorPhone" className={`dn-input${errors.donorPhone ? ' dn-input-err' : ''}`}
                      placeholder="10 digit mobile number" value={formData.donorPhone} onChange={handleFormChange} />
                    {errors.donorPhone && <span className="dn-field-error">{errors.donorPhone}</span>}
                  </div>

                  <div className="dn-col-half">
                    <label className="dn-label">Date of Birth</label>
                    <input type="date" id="dob" className={`dn-input${errors.dob ? ' dn-input-err' : ''}`}
                      max={today} value={formData.dob} onChange={handleDobChange} />
                    {errors.dob && <span className="dn-field-error">{errors.dob}</span>}
                  </div>

                  <div className="dn-col-full">
                    <label className="dn-label">Address <span className="dn-required">*</span></label>
                    <input type="text" id="donorAddress" className={`dn-input${errors.donorAddress ? ' dn-input-err' : ''}`}
                      placeholder="Full Address" value={formData.donorAddress} onChange={handleFormChange} />
                    {errors.donorAddress && <span className="dn-field-error">{errors.donorAddress}</span>}
                  </div>

                  <div className="dn-col-third">
                    <label className="dn-label">Pincode</label>
                    <input type="text" id="pincodeInput" className={`dn-input${errors.pincode ? ' dn-input-err' : ''}`}
                      placeholder="Pin Code" maxLength={6} value={formData.pincode} onChange={handlePincodeChange} />
                    {errors.pincode && <span className="dn-field-error">{errors.pincode}</span>}
                  </div>

                  <div className="dn-col-third">
                    <label className="dn-label">City</label>
                    <input type="text" id="cityInput" className="dn-input dn-readonly"
                      readOnly value={formData.city} onChange={handleFormChange} />
                  </div>

                  <div className="dn-col-third">
                    <label className="dn-label">State</label>
                    <input type="text" id="stateInput" className="dn-input"
                      value={formData.state} onChange={handleFormChange} />
                  </div>

                  <div className="dn-col-half">
                    <label className="dn-label">PAN Number</label>
                    <input type="text" id="donorPan" className={`dn-input dn-uppercase${errors.donorPan ? ' dn-input-err' : ''}`}
                      placeholder="ABCDE1234F" maxLength={10} value={formData.donorPan} onChange={handleFormChange} />
                    {errors.donorPan && <span className="dn-field-error">{errors.donorPan}</span>}
                  </div>

                </div>

                <div className="dn-check-wrap">
                  <input className="dn-checkbox" type="checkbox" id="citizenCheck"
                    checked={formData.citizenCheck} onChange={handleFormChange} />
                  <label className="dn-check-label" htmlFor="citizenCheck">
                    I hereby declare that I am a citizen of India.
                  </label>
                </div>
                {errors.citizenCheck && <span className="dn-field-error dn-field-error--check">{errors.citizenCheck}</span>}

                <div className="dn-submit-wrap">
                  <button type="submit" id="payBtn" className="btn-donate-submit" disabled={loading}>
                    {loading ? (
                      <><span className="spinner-border"></span> Processing...</>
                    ) : (
                      <>Pay ₹<span id="displayAmount">{displayAmount}</span> Securely</>
                    )}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Donate;
