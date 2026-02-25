import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './HealthCard.css';
import getepayPortal from '../../GetepayComponents';
import QRCode from 'qrcode';
import html2pdf from 'html2pdf.js';

const HealthCard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    aadhar: '',
    age: '',
    gender: 'Male',
    bloodGroup: 'A+',
    village: '',
    panchayat: '',
    block: '',
    district: '',
    state: '',
    pincode: ''
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [errors, setErrors] = useState({
    mobile: false,
    aadhar: false
  });

  const [isMobileDuplicate, setIsMobileDuplicate] = useState(false);
  const [isAadharDuplicate, setIsAadharDuplicate] = useState(false);
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCardPreview, setShowCardPreview] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [qrCodeImage, setQrCodeImage] = useState(null);
  const printAreaRef = useRef(null);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Handle payment response from Getepay
  useEffect(() => {
    const handlePaymentResponse = async () => {
      const status = searchParams.get('payment');
      const healthCardId = searchParams.get('healthCardId');
      
      if (status !== 'response') {
        return;
      }

      try {
        setProcessingPayment(true);
        console.log('💳 PAYMENT RESPONSE: Received redirect from Getepay');
        console.log('📊 Health Card ID:', healthCardId);

        // Get stored form data from session
        const getHealthCardFormData = sessionStorage.getItem('healthCardFormData');
        if (!getHealthCardFormData) {
          alert('Session data lost. Please try again.');
          setProcessingPayment(false);
          return;
        }

        const formDataStored = JSON.parse(getHealthCardFormData);
        
        // Fetch the health card details
        const fetchRes = await fetch(`${apiUrl}/api/healthcard/get-by-id/${healthCardId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        let cardData;
        if (!fetchRes.ok) {
          console.log('⚠️ Using stored data for display');
          cardData = {
            ...formDataStored,
            _id: healthCardId,
            paymentStatus: 'Paid',
            healthId: formDataStored.healthCardIdForDisplay,
            expiryDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString()
          };
        } else {
          const response = await fetchRes.json();
          cardData = response.data;
        }

        console.log('✨ HEALTH CARD CREATED SUCCESSFULLY!');
        console.log('🎯 Health Card ID:', cardData.healthId);
        console.log('📊 Database ID:', cardData._id);
        
        setCardData(cardData);
        setShowPaymentModal(true); // Show payment success modal instead of full page
        setShowCard(false); // Don't show card yet
        sessionStorage.removeItem('healthCardFormData');

        // Auto open preview after a short delay
        setTimeout(() => {
          // User will click Preview Card manually
        }, 500);

      } catch (err) {
        console.error('❌ Error processing payment response:', err);
        alert('Error: ' + err.message);
      } finally {
        setProcessingPayment(false);
      }
    };

    handlePaymentResponse();
  }, [searchParams, apiUrl]);

  // Generate QR code when card data is available
  useEffect(() => {
    if (cardData) {
      const generateQR = async () => {
        try {
          // Create the view URL for the QR code
          const viewUrl = `${window.location.origin}/view-health-card/${cardData.healthId}`;
          
          const qrDataURL = await QRCode.toDataURL(viewUrl, {
            errorCorrectionLevel: 'H',
            type: 'image/jpeg',
            quality: 0.95,
            margin: 1,
            width: 200,
            color: {
              dark: '#2e3192',
              light: '#ffffff'
            }
          });
          setQrCodeImage(qrDataURL);
          console.log('✅ QR Code generated successfully');
          console.log('📱 QR URL:', viewUrl);
        } catch (error) {
          console.error('QR Code generation error:', error);
        }
      };
      generateQR();
    }
  }, [cardData]);

  const validateNumber = (value) => {
    return value.replace(/[^0-9]/g, '');
  };

  const validateText = (value) => {
    return value.replace(/[^a-zA-Z\s]/g, '');
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    const fieldName = id.replace('u-', '');

    let processedValue = value;
    if (['age', 'aadhar', 'mobile', 'pincode'].includes(fieldName)) {
      processedValue = validateNumber(value);
    } else if (['fullName', 'district', 'state', 'village', 'panchayat', 'block'].includes(fieldName)) {
      processedValue = validateText(value);
    }

    setFormData(prev => ({
      ...prev,
      [fieldName]: processedValue
    }));
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('📸 Photo selected:', file.name);
      
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        e.target.value = '';
        return;
      }

      setUploadingPhoto(true);
      console.log('⏳ Uploading to backend...');

      try {
        // Upload to Backend which will upload to Cloudinary
        const formData = new FormData();
        formData.append('photo', file);

        const response = await fetch(`${apiUrl}/api/healthcard/upload`, {
          method: 'POST',
          body: formData
        });

        const data = await response.json();

        if (data.success && data.data.secure_url) {
          setPhotoPreview(data.data.secure_url);
          setPhotoFile(file);
          console.log('✅ Photo uploaded to Cloudinary:', data.data.secure_url);
          console.log('📊 Public ID:', data.data.public_id);
        } else {
          console.error('❌ Upload failed:', data.message);
          alert('Failed to upload photo: ' + (data.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('❌ Upload error:', error);
        alert('Error uploading photo: ' + error.message);
      } finally {
        setUploadingPhoto(false);
      }
    }
  };

  const checkLiveExist = async (field) => {
    const value = field === 'mobile' ? formData.mobile : formData.aadhar;

    if (value.length < 5) {
      setErrors(prev => ({ ...prev, [field]: false }));
      if (field === 'mobile') setIsMobileDuplicate(false);
      if (field === 'aadhar') setIsAadharDuplicate(false);
      return;
    }

    const payload = field === 'mobile' ? { mobile: value } : { aadhar: value };

    try {
      const res = await fetch(`${apiUrl}/api/healthcard/check-exists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      setErrors(prev => ({ ...prev, [field]: data.exists }));
      if (field === 'mobile') setIsMobileDuplicate(data.exists);
      if (field === 'aadhar') setIsAadharDuplicate(data.exists);
    } catch (error) {
      console.error('Check Error:', error);
    }
  };

  const handleBlur = (field) => {
    checkLiveExist(field);
  };

  const validateForm = () => {
    const { fullName, mobile, aadhar, age } = formData;
    if (!fullName.trim()) {
      alert('Please enter your full name');
      return false;
    }
    if (mobile.length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return false;
    }
    if (aadhar.length !== 12) {
      alert('Please enter a valid 12-digit Aadhar number');
      return false;
    }
    if (!age || isNaN(age) || age < 1 || age > 150) {
      alert('Please enter a valid age');
      return false;
    }
    if (!photoPreview) {
      alert('Please upload a passport size photo');
      return false;
    }
    if (isMobileDuplicate || isAadharDuplicate) {
      alert('This mobile or Aadhar number already exists');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      return;
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('💳 INITIATING HEALTH CARD PAYMENT');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📋 Form Data:');
    console.log('  ✓ Name:', formData.fullName);
    console.log('  ✓ Mobile:', formData.mobile);
    console.log('  ✓ Aadhar:', formData.aadhar);
    console.log('  ✓ Age:', formData.age);
    console.log('  ✓ Gender:', formData.gender);
    console.log('  ✓ Blood Group:', formData.bloodGroup);
    console.log('  ✓ Photo:', photoPreview ? 'Uploaded ✓' : 'Missing ✗');
    console.log('');

    setLoading(true);

    try {
      // Step 1: Create Order on Server
      console.log('🔹 Step 1: Creating order on server...');
      const orderRes = await fetch(`${apiUrl}/api/healthcard/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: 201,
          fullName: formData.fullName,
          mobile: formData.mobile,
          aadhar: formData.aadhar
        })
      });

      if (!orderRes.ok) {
        throw new Error('Failed to create order');
      }

      const orderData = await orderRes.json();
      console.log('✅ Order Created:', orderData.orderId);
      console.log('');

      // Step 1.5: Register Pending Health Card Record
      console.log('🔹 Step 1.5: Registering pending health card...');
      const registerRes = await fetch(`${apiUrl}/api/healthcard/register-pending`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fullName: formData.fullName,
          mobile: formData.mobile,
          aadhar: formData.aadhar,
          age: formData.age,
          gender: formData.gender,
          bloodGroup: formData.bloodGroup,
          village: formData.village,
          panchayat: formData.panchayat,
          block: formData.block,
          district: formData.district,
          state: formData.state,
          pincode: formData.pincode,
          photoData: photoPreview,
          orderId: orderData.orderId,
          amount: 201
        })
      });

      if (!registerRes.ok) {
        throw new Error('Failed to register pending health card');
      }

      const registerData = await registerRes.json();
      console.log('✅ Pending Record Created:', registerData.data.healthId);
      console.log('📊 Health Card ID:', registerData.data._id);
      console.log('⏳ Status: Pending (awaiting payment)');
      console.log('');

      // Store form data + health card ID in sessionStorage for later use
      sessionStorage.setItem('healthCardFormData', JSON.stringify({
        ...formData,
        photoData: photoPreview,
        orderId: orderData.orderId,
        healthCardId: registerData.data._id,
        healthCardIdForDisplay: registerData.data.healthId
      }));

      console.log('✅ Health card data stored in session');
      console.log('');

      // Step 2: Prepare Getepay Config
      console.log('🔹 Step 2: Initiating Getepay payment...');
      const config = {
        getepay_mid: import.meta.env.VITE_GETEPAY_MID || '108',
        getepay_terminal_id: import.meta.env.VITE_GETEPAY_TERMINAL_ID || 'Getepay.merchant61062@icici',
        getepay_keys: import.meta.env.VITE_GETEPAY_KEYS || 'JoYPd+qso9s7T+Ebj8pi4Wl8i+AHLv+5UNJxA3JkDgY=',
        getepay_ivs: import.meta.env.VITE_GETEPAY_IV || 'hlnuyA9b4YxDq6oJSZFl8g==',
        getepay_url: import.meta.env.VITE_GETEPAY_URL || 'https://pay1.getepay.in:8443/getepayPortal/pg/v2/generateInvoice',
      };

      // Step 3: Prepare Payment Data
      const paymentData = {
        mid: config.getepay_mid,
        amount: '201.00',
        merchantTransactionId: orderData.orderId,
        transactionDate: new Date().toISOString(),
        terminalId: config.getepay_terminal_id,
        udf1: formData.fullName || 'Health Card',
        udf2: formData.district || 'N/A',
        udf3: formData.village || 'N/A',
        udf4: formData.mobile || '',
        udf5: formData.aadhar || '',
        udf6: '',
        udf7: '',
        udf8: '',
        udf9: '',
        udf10: '',
        ru: `${window.location.origin.replace('5173', '5000')}/api/healthcard/payment-response`,
        callbackUrl: `${window.location.origin.replace('5173', '5000')}/api/healthcard/payment-response`,
        currency: 'INR',
        paymentMode: 'ALL',
        bankId: '455',
        txnType: 'single',
        productType: 'IPG',
        txnNote: `Health Card Registration - ${formData.fullName}`,
        vpa: config.getepay_terminal_id,
      };

      console.log('✅ Payment data prepared');
      console.log('  ✓ Amount: ₹201.00');
      console.log('  ✓ Order ID:', orderData.orderId);
      console.log('');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('▶️  Redirecting to Getepay portal...');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('');

      // Initiate Getepay Payment
      await getepayPortal(paymentData, config);

    } catch (error) {
      console.error('');
      console.error('═══════════════════════════════════════════════════════════');
      console.error('❌ PAYMENT INITIATION ERROR');
      console.error('═══════════════════════════════════════════════════════════');
      console.error('Error:', error.message);
      console.error('═══════════════════════════════════════════════════════════');
      console.error('');
      alert('Payment initiation failed: ' + error.message);
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      // Get the print area element
      const printArea = document.querySelector('[data-print-area]');
      if (!printArea) {
        alert('Card data not found');
        return;
      }

      const element = printArea.cloneNode(true);
      element.style.display = 'block';
      element.style.padding = '20px';
      element.style.background = '#ffffff';

      const opt = {
        margin: 5,
        filename: `Swasthya_Suraksha_Card_${cardData?.healthId || 'Card'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff' },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
      };

      html2pdf().set(opt).from(element).save();
      alert('✅ PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF download error:', error);
      alert('Error downloading PDF. Please try taking a screenshot instead.');
    }
  };

  const generateCardDisplay = () => {
    if (!cardData) return null;

    const formatAadhar = (aadhar) => {
      return aadhar.replace(/(\d{4})/g, '$1 ').trim();
    };

    const formatExpiryDate = (date) => {
      const d = new Date(date);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
    };

    return (
      <div>
        {/* Payment Success Modal */}
        {showPaymentModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '15px', overflowY: 'auto' }}>
            <div style={{ background: 'white', borderRadius: '18px', maxWidth: '580px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', maxHeight: '85vh', margin: 'auto' }}>
              {/* Header */}
              <div style={{ padding: '30px 25px 15px 25px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                <i className="fas fa-check-circle" style={{ fontSize: '60px', color: '#10b981', marginBottom: '12px', display: 'block' }}></i>
                <h1 style={{ color: '#0f172a', margin: '0 0 8px 0', fontSize: '26px', fontWeight: '900' }}>Payment Successful! 🎉</h1>
              </div>

              {/* Scrollable Content */}
              <div style={{ overflowY: 'auto', flex: 1, padding: '20px 25px' }}>
                {/* Card Details */}
                <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '12px', border: '2px solid #10b981', marginBottom: '15px' }}>
                  <h3 style={{ color: '#10b981', margin: '0 0 12px 0', fontSize: '13px', fontWeight: '800' }}>✓ Card Details</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div><p style={{ margin: '0 0 3px 0', color: '#64748b', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase' }}>Card ID</p><p style={{ margin: '0', color: '#10b981', fontSize: '12px', fontWeight: '900' }}>{cardData.healthId}</p></div>
                    <div><p style={{ margin: '0 0 3px 0', color: '#64748b', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase' }}>Status</p><p style={{ margin: '0', color: '#10b981', fontSize: '12px', fontWeight: '900' }}>PAID ✓</p></div>
                    <div><p style={{ margin: '0 0 3px 0', color: '#64748b', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase' }}>Valid Till</p><p style={{ margin: '0', color: '#10b981', fontSize: '12px', fontWeight: '900' }}>{formatExpiryDate(cardData.expiryDate)}</p></div>
                    <div><p style={{ margin: '0 0 3px 0', color: '#64748b', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase' }}>Name</p><p style={{ margin: '0', color: '#10b981', fontSize: '11px', fontWeight: '900', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cardData.fullName}</p></div>
                  </div>
                </div>

                {/* Transaction Details */}
                {cardData.paymentResponse && (
                  <div style={{ background: '#f0f9ff', padding: '16px', borderRadius: '12px', border: '2px solid #0ea5e9' }}>
                    <h3 style={{ color: '#0284c7', margin: '0 0 10px 0', fontSize: '12px', fontWeight: '800' }}>💳 Transaction Details</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {cardData.paymentResponse.getepayTxnId && <div><p style={{ margin: '0 0 2px 0', color: '#64748b', fontSize: '8px', fontWeight: '700', textTransform: 'uppercase' }}>TXN</p><p style={{ margin: '0', color: '#0284c7', fontSize: '9px', fontWeight: '800', wordBreak: 'break-all' }}>{cardData.paymentResponse.getepayTxnId.substring(0, 15)}...</p></div>}
                      {cardData.paymentResponse.mid && <div><p style={{ margin: '0 0 2px 0', color: '#64748b', fontSize: '8px', fontWeight: '700', textTransform: 'uppercase' }}>Merchant</p><p style={{ margin: '0', color: '#0284c7', fontSize: '9px', fontWeight: '800' }}>{cardData.paymentResponse.mid}</p></div>}
                      {cardData.paymentResponse.txnDate && <div><p style={{ margin: '0 0 2px 0', color: '#64748b', fontSize: '8px', fontWeight: '700', textTransform: 'uppercase' }}>Date</p><p style={{ margin: '0', color: '#0284c7', fontSize: '9px', fontWeight: '800' }}>{cardData.paymentResponse.txnDate}</p></div>}
                      {cardData.paymentResponse.paymentMode && <div><p style={{ margin: '0 0 2px 0', color: '#64748b', fontSize: '8px', fontWeight: '700', textTransform: 'uppercase' }}>Mode</p><p style={{ margin: '0', color: '#0284c7', fontSize: '9px', fontWeight: '800' }}>{cardData.paymentResponse.paymentMode}</p></div>}
                      {cardData.paymentResponse.txnAmount && <div><p style={{ margin: '0 0 2px 0', color: '#64748b', fontSize: '8px', fontWeight: '700', textTransform: 'uppercase' }}>Amount</p><p style={{ margin: '0', color: '#10b981', fontSize: '10px', fontWeight: '900' }}>₹{cardData.paymentResponse.txnAmount}</p></div>}
                      {cardData.paymentResponse.txnStatus && <div><p style={{ margin: '0 0 2px 0', color: '#64748b', fontSize: '8px', fontWeight: '700', textTransform: 'uppercase' }}>Status</p><p style={{ margin: '0', color: '#10b981', fontSize: '9px', fontWeight: '900' }}>✓ {cardData.paymentResponse.txnStatus}</p></div>}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Buttons */}
              <div style={{ padding: '15px 25px 20px 25px', borderTop: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button onClick={() => { setShowPaymentModal(false); setShowCardPreview(true); }} style={{ padding: '10px 12px', background: '#2e3192', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '12px', whiteSpace: 'nowrap' }}>
                  <i className="fas fa-eye"></i> Preview
                </button>
                <button onClick={() => downloadPDF()} style={{ padding: '10px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '12px', whiteSpace: 'nowrap' }}>
                  <i className="fas fa-download"></i> Download
                </button>
              </div>
              <div style={{ padding: '0 25px 20px 25px' }}>
                <button onClick={() => { setShowPaymentModal(false); window.location.href = '/'; }} style={{ width: '100%', padding: '10px', background: '#f1f5f9', color: '#2e3192', border: '2px solid #cbd5e1', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '12px' }}>
                  <i className="fas fa-home"></i> Go Home
                </button>
              </div>
            </div>
          </div>
        )}
        {showCardPreview && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
            <div style={{ background: 'white', width: '95%', maxWidth: '800px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
              <div style={{ background: '#1e293b', color: 'white', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Health Card Preview</h2>
                <button
                  onClick={() => setShowCardPreview(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '24px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  ×
                </button>
              </div>
              
              <div style={{ overflowY: 'auto', flex: 1, padding: '30px 20px', background: '#f5f5f5' }}>
                {/* Front Card */}
                <div className="modern-health-card" style={{ marginBottom: '40px' }}>
                  <div style={{ background: '#fff', textAlign: 'center', padding: '2px 0', fontSize: '9px', fontWeight: '800', color: '#2e3192', letterSpacing: '1px', borderBottom: '1px solid #eee' }}>
                    This Card is Being Issued Under Swasthya Suraksha Yojna
                  </div>
                  <div className="card-header-premium">
                    <div className="card-header-left">
                      <img src="/logo.jpg" alt="Logo" className="card-logo" />
                      <div className="foundation-logo-text">AAGAJ<span>.</span>FOUNDATION</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '8px', fontWeight: '700' }}>HEALTH CARD</div>
                      <div style={{ fontSize: '12px', fontWeight: '900', color: '#ed1c24' }}>{cardData.healthId}</div>
                    </div>
                  </div>

                  <div className="card-body-main">
                    <div className="photo-box">
                      <img src={cardData.photoPath} alt="Patient" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div className="patient-info-grid">
                      <div className="data-item full"><label>PATIENT NAME</label><span>{cardData.fullName.toUpperCase()}</span></div>
                      <div className="data-item"><label>AGE / GENDER</label><span>{cardData.age} YRS / {cardData.gender.toUpperCase()}</span></div>
                      <div className="data-item"><label>BLOOD GROUP</label><span>{cardData.bloodGroup}</span></div>
                      <div className="data-item full"><label>AADHAR NUMBER</label><span>{formatAadhar(cardData.aadhar)}</span></div>
                      <div className="data-item full"><label>CONTACT NO.</label><span style={{ color: '#2e3192' }}>+91 {cardData.mobile}</span></div>
                    </div>
                  </div>

                  <div className="card-footer-strip">
                    <div>
                      <div style={{ fontSize: '9px', fontWeight: '800', color: '#10b981' }}>VALID IDENTITY</div>
                      <div style={{ fontSize: '7px', color: '#94a3b8' }}>Digitally Secured Profile</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '7px', color: '#94a3b8' }}>EXPIRY DATE</div>
                      <div style={{ fontSize: '10px', fontWeight: '800' }}>{formatExpiryDate(cardData.expiryDate)}</div>
                    </div>
                  </div>
                </div>

                {/* Back Card */}
                <div className="modern-health-card">
                  <div style={{ background: '#2e3192', color: 'white', textAlign: 'center', padding: '12px', fontWeight: '800', fontSize: '14px' }}>
                    RESIDENTIAL & OTHER DETAILS
                  </div>
                  <div className="card-body-main" style={{ flexDirection: 'row', padding: '20px', gap: '20px', alignItems: 'flex-start' }}>
                    {/* Address Details - Left Side */}
                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div className="data-item"><label>VILLAGE</label><span>{cardData.address.village.toUpperCase()}</span></div>
                      <div className="data-item"><label>PANCHAYAT</label><span>{cardData.address.panchayat.toUpperCase()}</span></div>
                      <div className="data-item"><label>BLOCK</label><span>{cardData.address.block.toUpperCase()}</span></div>
                      <div className="data-item"><label>DISTRICT</label><span>{cardData.address.district.toUpperCase()}</span></div>
                      <div className="data-item"><label>STATE</label><span>{cardData.address.state.toUpperCase()}</span></div>
                      <div className="data-item"><label>PIN CODE</label><span>{cardData.address.pincode}</span></div>
                    </div>

                    {/* QR Code - Right Side */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      {qrCodeImage && (
                        <img src={qrCodeImage} alt="QR Code" style={{ width: '120px', height: '120px', border: '2px solid #2e3192', borderRadius: '8px', padding: '4px', background: 'white' }} />
                      )}
                      <p style={{ margin: '0', fontSize: '7px', fontWeight: '700', color: '#2e3192', textAlign: 'center' }}>SCAN FOR<br/>DETAILS</p>
                    </div>
                  </div>

                  <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <p style={{ margin: '0', fontSize: '8px', fontWeight: '800', color: '#2e3192' }}>AAGAJ FOUNDATION - REG: 1882 ACT</p>
                    <p style={{ margin: '3px 0 0 0', fontSize: '6px', color: '#64748b' }}>Digital health identity | Keep it safe</p>
                  </div>
                </div>
              </div>

              <div style={{ background: '#f5f5f5', padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
                <button
                  onClick={() => { setShowCardPreview(false); setShowPaymentModal(true); }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#e2e8f0',
                    color: '#2e3192',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ← Back
                </button>
                <button
                  onClick={() => downloadPDF()}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <i className="fas fa-download"></i>
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Print Area */}
        <div ref={printAreaRef} data-print-area style={{ display: 'none', padding: '40px', background: '#eee' }}>
          {/* Front Card */}
          <div className="modern-health-card">
          <div style={{ background: '#fff', textAlign: 'center', padding: '2px 0', fontSize: '9px', fontWeight: '800', color: '#2e3192', letterSpacing: '1px', borderBottom: '1px solid #eee' }}>
            This Card is Being Issued Under Swasthya Suraksha Yojna
          </div>
          <div className="card-header-premium">
            <div className="card-header-left">
              <img src="/logo.jpg" alt="Logo" className="card-logo" />
              <div className="foundation-logo-text">AAGAJ<span>.</span>FOUNDATION</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '8px', fontWeight: '700' }}>HEALTH CARD</div>
              <div style={{ fontSize: '12px', fontWeight: '900', color: '#ed1c24' }}>{cardData.healthId}</div>
            </div>
          </div>

          <div className="card-body-main">
            <div className="photo-box">
              <img src={cardData.photoPath} alt="Patient" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className="patient-info-grid">
              <div className="data-item full"><label>PATIENT NAME</label><span>{cardData.fullName.toUpperCase()}</span></div>
              <div className="data-item"><label>AGE / GENDER</label><span>{cardData.age} YRS / {cardData.gender.toUpperCase()}</span></div>
              <div className="data-item"><label>BLOOD GROUP</label><span>{cardData.bloodGroup}</span></div>
              <div className="data-item full"><label>AADHAR NUMBER</label><span>{formatAadhar(cardData.aadhar)}</span></div>
              <div className="data-item full"><label>CONTACT NO.</label><span style={{ color: '#2e3192' }}>+91 {cardData.mobile}</span></div>
            </div>
          </div>

          <div className="card-footer-strip">
            <div>
              <div style={{ fontSize: '9px', fontWeight: '800', color: '#10b981' }}>VALID IDENTITY</div>
              <div style={{ fontSize: '7px', color: '#94a3b8' }}>Digitally Secured Profile</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '7px', color: '#94a3b8' }}>EXPIRY DATE</div>
              <div style={{ fontSize: '10px', fontWeight: '800' }}>{formatExpiryDate(cardData.expiryDate)}</div>
            </div>
          </div>
        </div>

        {/* Back Card */}
        <div className="modern-health-card" style={{ marginTop: '30px' }}>
          <div style={{ background: '#2e3192', color: 'white', textAlign: 'center', padding: '12px', fontWeight: '800', fontSize: '14px' }}>
            RESIDENTIAL & OTHER DETAILS
          </div>
          <div className="card-body-main" style={{ flexDirection: 'row', padding: '20px', gap: '20px', alignItems: 'flex-start' }}>
            {/* Address Details - Left Side */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div className="data-item"><label>VILLAGE</label><span>{cardData.address.village.toUpperCase()}</span></div>
              <div className="data-item"><label>PANCHAYAT</label><span>{cardData.address.panchayat.toUpperCase()}</span></div>
              <div className="data-item"><label>BLOCK</label><span>{cardData.address.block.toUpperCase()}</span></div>
              <div className="data-item"><label>DISTRICT</label><span>{cardData.address.district.toUpperCase()}</span></div>
              <div className="data-item"><label>STATE</label><span>{cardData.address.state.toUpperCase()}</span></div>
              <div className="data-item"><label>PIN CODE</label><span>{cardData.address.pincode}</span></div>
            </div>

            {/* QR Code - Right Side */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              {qrCodeImage && (
                <img src={qrCodeImage} alt="QR Code" style={{ width: '120px', height: '120px', border: '2px solid #2e3192', borderRadius: '8px', padding: '4px', background: 'white' }} />
              )}
              <p style={{ margin: '0', fontSize: '7px', fontWeight: '700', color: '#2e3192', textAlign: 'center' }}>SCAN FOR<br/>DETAILS</p>
            </div>
          </div>

          <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
            <p style={{ margin: '0', fontSize: '8px', fontWeight: '800', color: '#2e3192' }}>AAGAJ FOUNDATION - REG: 1882 ACT</p>
            <p style={{ margin: '3px 0 0 0', fontSize: '6px', color: '#64748b' }}>Digital health identity | Keep it safe</p>
          </div>
        </div>
        </div>
      </div>
    );
  };

  if (processingPayment) {
    return (
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#f1f5f9', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', color: '#2e3192', marginBottom: '20px' }}></i>
          <h2 style={{ color: '#2e3192', marginBottom: '10px' }}>Processing Payment...</h2>
          <p style={{ color: '#64748b' }}>Please wait while we verify your payment and generate your health card.</p>
        </div>
      </div>
    );
  }

  const isPaymentDisabled = loading || isMobileDuplicate || isAadharDuplicate || uploadingPhoto || !photoPreview;

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#f1f5f9', minHeight: '100vh', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Form Card */}
      <div style={{ background: 'white', padding: '35px', borderRadius: '28px', boxShadow: '0 10px 40px rgba(0,0,0,0.06)', width: '100%', maxWidth: '750px', position: 'relative' }}>
        <img src="/logo.jpg" alt="Logo" style={{ position: 'absolute', top: '25px', left: '25px', width: '70px', height: '70px', objectFit: 'contain' }} />

        <p style={{ textAlign: 'center', color: '#10b981', fontWeight: '800', fontSize: '13px', marginBottom: '5px' }}>
          This Card is Being Issued Under Swasthya Suraksha Yojna.
        </p>

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#2e3192', margin: '0', fontWeight: '900' }}>AAGAJ FOUNDATION</h1>
          <p style={{ color: '#ed1c24', fontWeight: '700', margin: '0', letterSpacing: '2px' }}>HEALTH IDENTITY ENROLLMENT</p>
        </div>

        {/* Patient Details Section */}
        <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '18px', border: '1px solid #edf2f7', marginBottom: '30px' }}>
          <h4 style={{ margin: '0 0 25px 0', fontSize: '14px', color: '#2e3192', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fas fa-user-medical"></i> Patient Details
          </h4>

          <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', marginBottom: '8px', color: '#0f172a', textTransform: 'uppercase' }}>📸 Upload Passport Size Photo</label>
            <input
              type="file"
              id="u-img"
              accept="image/*"
              onChange={handlePhotoChange}
              disabled={uploadingPhoto}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                cursor: uploadingPhoto ? 'wait' : 'pointer'
              }}
            />
            {uploadingPhoto && <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#2e3192' }}>⏳ Uploading...</p>}
            {photoPreview && <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#10b981' }}>✅ Photo uploaded successfully</p>}
            {photoPreview && (
              <div style={{ marginTop: '15px', textAlign: 'center' }}>
                <img 
                  src={photoPreview} 
                  alt="Photo Preview" 
                  style={{ width: '150px', height: '180px', objectFit: 'cover', borderRadius: '10px', border: '3px solid #10b981' }}
                />
                <p style={{ fontSize: '11px', color: '#10b981', marginTop: '8px', marginBottom: '0', fontWeight: '800' }}>✓ Photo Preview</p>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', marginBottom: '8px', color: '#0f172a', textTransform: 'uppercase' }}>Full Name</label>
              <input
                type="text"
                id="u-fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Name as per Aadhar"
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', fontSize: '14px', background: 'white', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', marginBottom: '8px', color: '#0f172a', textTransform: 'uppercase' }}>Contact Number</label>
              <input
                type="text"
                id="u-mobile"
                maxLength="10"
                value={formData.mobile}
                onChange={handleInputChange}
                onBlur={() => handleBlur('mobile')}
                placeholder="WhatsApp No."
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: errors.mobile ? '2px solid #ef4444' : '2px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', fontSize: '14px', background: 'white', boxSizing: 'border-box' }}
              />
              {errors.mobile && <small style={{ color: 'red', display: 'block', fontWeight: '800', marginTop: '5px' }}>This contact number already exists</small>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', marginBottom: '8px', color: '#0f172a', textTransform: 'uppercase' }}>Aadhar Number</label>
              <input
                type="text"
                id="u-aadhar"
                maxLength="12"
                value={formData.aadhar}
                onChange={handleInputChange}
                onBlur={() => handleBlur('aadhar')}
                placeholder="12 Digit No."
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: errors.aadhar ? '2px solid #ef4444' : '2px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', fontSize: '14px', background: 'white', boxSizing: 'border-box' }}
              />
              {errors.aadhar && <small style={{ color: 'red', display: 'block', fontWeight: '800', marginTop: '5px' }}>This aadhar number already exists</small>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', marginBottom: '8px', color: '#0f172a', textTransform: 'uppercase' }}>Age</label>
              <input
                type="text"
                id="u-age"
                maxLength="3"
                value={formData.age}
                onChange={handleInputChange}
                placeholder="Age"
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', fontSize: '14px', background: 'white', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', marginBottom: '8px', color: '#0f172a', textTransform: 'uppercase' }}>Gender</label>
              <select
                id="u-gender"
                value={formData.gender}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', fontSize: '14px', background: 'white', boxSizing: 'border-box' }}
              >
                <option>Male</option>
                <option>Female</option>
                <option>Others</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', marginBottom: '8px', color: '#0f172a', textTransform: 'uppercase' }}>Blood Group</label>
              <select
                id="u-bloodGroup"
                value={formData.bloodGroup}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', fontSize: '14px', background: 'white', boxSizing: 'border-box' }}
              >
                <option>A+</option>
                <option>B+</option>
                <option>O+</option>
                <option>AB+</option>
                <option>AB-</option>
                <option>A-</option>
                <option>B-</option>
                <option>O-</option>
              </select>
            </div>
          </div>
        </div>

        {/* Address Information Section */}
        <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '18px', border: '1px solid #edf2f7', marginBottom: '30px' }}>
          <h4 style={{ margin: '0 0 25px 0', fontSize: '14px', color: '#2e3192', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fas fa-map-marker-alt"></i> Address Information
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', marginBottom: '8px', color: '#0f172a', textTransform: 'uppercase' }}>Village/Area</label>
              <input
                type="text"
                id="u-village"
                value={formData.village}
                onChange={handleInputChange}
                placeholder="Locality"
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', fontSize: '14px', background: 'white', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', marginBottom: '8px', color: '#0f172a', textTransform: 'uppercase' }}>Panchayat</label>
              <input
                type="text"
                id="u-panchayat"
                value={formData.panchayat}
                onChange={handleInputChange}
                placeholder="Panchayat Name"
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', fontSize: '14px', background: 'white', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', marginBottom: '8px', color: '#0f172a', textTransform: 'uppercase' }}>Block</label>
              <input
                type="text"
                id="u-block"
                value={formData.block}
                onChange={handleInputChange}
                placeholder="Block Name"
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', fontSize: '14px', background: 'white', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', marginBottom: '8px', color: '#0f172a', textTransform: 'uppercase' }}>District</label>
              <input
                type="text"
                id="u-district"
                value={formData.district}
                onChange={handleInputChange}
                placeholder="Patna"
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', fontSize: '14px', background: 'white', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', marginBottom: '8px', color: '#0f172a', textTransform: 'uppercase' }}>State</label>
              <input
                type="text"
                id="u-state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="Bihar"
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', fontSize: '14px', background: 'white', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', marginBottom: '8px', color: '#0f172a', textTransform: 'uppercase' }}>Pin Code</label>
              <input
                type="text"
                id="u-pincode"
                maxLength="6"
                value={formData.pincode}
                onChange={handleInputChange}
                placeholder="Pincode"
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', fontSize: '14px', background: 'white', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={isPaymentDisabled}
          style={{
            width: '100%',
            padding: '20px',
            background: isPaymentDisabled ? '#d1d5db' : '#2e3192',
            color: 'white',
            border: 'none',
            borderRadius: '16px',
            fontWeight: '800',
            cursor: isPaymentDisabled ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            boxShadow: isPaymentDisabled ? 'none' : '0 10px 20px rgba(46, 49, 146, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            opacity: isPaymentDisabled ? '0.6' : '1',
            transition: 'all 0.3s'
          }}
        >
          <i className={`fas ${loading ? 'fa-spinner fa-spin' : uploadingPhoto ? 'fa-spinner fa-spin' : 'fa-print'}`}></i>
          {uploadingPhoto ? 'Uploading Photo...' : loading ? 'Processing...' : !photoPreview ? '⬆️ UPLOAD PHOTO FIRST' : 'PAY & GENERATE HEALTH CARD'}
        </button>
      </div>

      {/* Card Display Area */}
      {generateCardDisplay()}
    </div>
  );
};

export default HealthCard;

