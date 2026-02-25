import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import getepayPortal from '../../GetepayComponents';
import './SilayiRegistration.css';

const SilayiRegistration = () => {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const getAuthHeaders = () => {
    const token = sessionStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
  const [formData, setFormData] = useState({
    serialNo: '',
    name: '',
    fatherName: '',
    address: '',
    mobileNo: '',
    gender: '',
    email: '',
    aadharNo: '',
    age: '',
    caste: '',
    trainingName: 'सिलाई प्रशिक्षण',
    skills: '',
    duration: '45 दिन',
    trainingDate: ''
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Generate Serial Number on Load
  useEffect(() => {
    const userType = sessionStorage.getItem('userType');
    if (userType !== 'employee') {
      navigate('/admin-login');
      return;
    }

    const fetchSerial = async () => {
      try {
        const response = await axios.get(`${apiUrl}/schemes/silayi/next-serial`, {
          withCredentials: true,
          headers: getAuthHeaders()
        });
        const serverSerial = response.data?.serialNumber;
        if (serverSerial) {
          setFormData(prev => ({
            ...prev,
            serialNo: serverSerial
          }));
          return;
        }
      } catch (error) {
        console.warn('Serial fetch failed:', error.message);
      }

      const yearShort = new Date().getFullYear().toString().slice(-2);
      const autoSerial = yearShort + '00001';
      setFormData(prev => ({
        ...prev,
        serialNo: autoSerial
      }));
    };

    fetchSerial();
  }, [navigate, apiUrl]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setErrors(prev => ({ ...prev, photoFile: '' }));
      const reader = new FileReader();
      reader.onload = (event) => setPhotoPreview(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  // --- Regex rules ---
  const MOBILE_RE = /^[6-9]\d{9}$/;
  const AADHAR_RE = /^\d{12}$/;
  const EMAIL_RE  = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case 'name':
        if (!value.trim()) return 'नाम आवश्यक है';
        if (value.trim().length < 2) return 'नाम कम से कम 2 अक्षर का हो';
        return '';
      case 'fatherName':
        if (value && value.trim().length < 2) return 'कम से कम 2 अक्षर';
        return '';
      case 'address':
        if (!value.trim() || value.trim().length < 5) return 'पूरा पता आवश्यक है';
        return '';
      case 'mobileNo':
        if (!MOBILE_RE.test(value)) return 'मोबाइल 10 अंकों का हो (6-9 से शुरू)';
        return '';
      case 'gender':
        if (!value) return 'लिंग चुनें';
        return '';
      case 'email':
        if (value && !EMAIL_RE.test(value)) return 'सही Email लिखें';
        return '';
      case 'aadharNo':
        if (!AADHAR_RE.test(value)) return 'आधार 12 अंकों का होना चाहिए';
        return '';
      case 'age':
        if (value && (isNaN(value) || Number(value) < 15 || Number(value) > 60))
          return 'उम्र 15-60 के बीच होनी चाहिए';
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const fields = ['name', 'fatherName', 'address', 'mobileNo', 'gender', 'email', 'aadharNo', 'age'];
    const newErrors = {};
    fields.forEach(f => {
      const err = validateField(f, formData[f] || '');
      if (err) newErrors[f] = err;
    });
    setErrors(prev => ({ ...prev, ...newErrors }));
    if (Object.keys(newErrors).length > 0) {
      setTimeout(() => {
        const el = document.querySelector('.field-error');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const sanitized = ['name', 'fatherName', 'caste'].includes(name)
      ? value.replace(/[0-9]/g, '')
      : value;
    setFormData(prev => ({ ...prev, [name]: sanitized }));
    const err = validateField(name, sanitized);
    setErrors(prev => ({ ...prev, [name]: err }));
  };

  const sanitizeNumber = (value) => value.replace(/[^0-9]/g, '');

  const handlePhoneChange = (e) => {
    const sanitized = sanitizeNumber(e.target.value).slice(0, 10);
    setFormData(prev => ({ ...prev, mobileNo: sanitized }));
    setErrors(prev => ({ ...prev, mobileNo: validateField('mobileNo', sanitized) }));
  };

  const handleAadharChange = (e) => {
    const sanitized = sanitizeNumber(e.target.value).slice(0, 12);
    setFormData(prev => ({ ...prev, aadharNo: sanitized }));
    setErrors(prev => ({ ...prev, aadharNo: validateField('aadharNo', sanitized) }));
  };

  const checkUnique = async (field, value, errorKey, label) => {
    if (!value) return;

    if (field === 'mobileNumber' && value.length < 10) return;
    if (field === 'aadharNumber' && value.length < 12) return;

    try {
      const response = await axios.get(`${apiUrl}/schemes/check-unique`, {
        params: { field, value },
        withCredentials: true
      });

      if (response.data?.exists) {
        setErrors(prev => ({ ...prev, [errorKey]: `${label} पहले से मौजूद है` }));
      }
    } catch (error) {
      console.warn('Unique check failed:', error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    const userData = sessionStorage.getItem('userData');
    const parsedData = userData ? JSON.parse(userData) : {};

    try {
      const orderId = `SILAI_${formData.serialNo}_${Date.now()}`;

      const payload = new FormData();
      payload.append('yojanaName', 'Mahila Silai Prasikshan Yojana');
      payload.append('serialNumber', formData.serialNo);
      payload.append('name', formData.name);
      payload.append('guardianName', formData.fatherName);
      payload.append('address', formData.address);
      payload.append('mobileNumber', formData.mobileNo);
      payload.append('gender', formData.gender);
      payload.append('email', formData.email || '');
      payload.append('aadharNumber', formData.aadharNo);
      payload.append('age', formData.age || '');
      payload.append('caste', formData.caste || '');
      payload.append('trainingName', formData.trainingName);
      payload.append('existingSkills', formData.skills || '');
      payload.append('trainingDuration', formData.duration);
      payload.append('trainingDate', formData.trainingDate || '');
      payload.append('registrationFee', '799');
      payload.append('paymentOrderId', orderId);
      payload.append('applicantPhone', parsedData.phone || formData.mobileNo);
      payload.append(
        'registeredByName',
        parsedData.fullName || parsedData.emp_username || parsedData.email || 'Employee'
      );

      if (photoFile) {
        payload.append('photo', photoFile);
      }

      await axios.post(`${apiUrl}/schemes/silayi/initiate`, payload, {
        withCredentials: true,
        headers: getAuthHeaders()
      });

      const config = {
        getepay_mid: import.meta.env.VITE_GETEPAY_MID ,
        getepay_terminal_id: import.meta.env.VITE_GETEPAY_TERMINAL_ID ,
        getepay_keys: import.meta.env.VITE_GETEPAY_KEYS ,
        getepay_ivs: import.meta.env.VITE_GETEPAY_IV ,
        getepay_url: import.meta.env.VITE_GETEPAY_URL 
      };

      const paymentData = {
        mid: config.getepay_mid,
        amount: '799.00',
        merchantTransactionId: orderId,
        transactionDate: new Date().toISOString(),
        terminalId: config.getepay_terminal_id,
        udf1: formData.mobileNo || '0000000000',
        udf2: formData.email || 'noemail@agaz.in',
        udf3: formData.name || 'Silayi Registration',
        udf4: formData.serialNo || '',
        udf5: '',
        udf6: '',
        udf7: '',
        udf8: '',
        udf9: '',
        udf10: '',
        ru: `${apiUrl}/silayi-pgresponse`,
        callbackUrl: '',
        currency: 'INR',
        paymentMode: 'ALL',
        bankId: '455',
        txnType: 'single',
        productType: 'IPG',
        txnNote: 'Silayi Registration',
        vpa: config.getepay_terminal_id,
      };

      sessionStorage.setItem('silayiPaymentData', JSON.stringify({
        orderId,
        amount: 799,
        name: formData.name,
        serialNo: formData.serialNo
      }));

      await getepayPortal(paymentData, config);
    } catch (error) {
      const status = error?.response?.status;
      const apiMessage = error?.response?.data?.message;
      const apiField = error?.response?.data?.field;
      const apiErrors = error?.response?.data?.errors;

      if (status === 401 || status === 403) {
        alert('कृपया पहले लॉगिन करें (Authentication required)');
        setLoading(false);
        return;
      }

      // 422: backend validation errors object
      if (status === 422 && apiErrors) {
        const localMap = { mobileNumber: 'mobileNo', aadharNumber: 'aadharNo' };
        const mapped = {};
        Object.entries(apiErrors).forEach(([k, v]) => { mapped[localMap[k] || k] = v; });
        setErrors(prev => ({ ...prev, ...mapped }));
        setTimeout(() => {
          const el = document.querySelector('.field-error');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
        setLoading(false);
        return;
      }

      // 409: duplicate field
      if (apiField) {
        const fieldMap = { aadharNumber: 'aadharNo', mobileNumber: 'mobileNo', email: 'email' };
        const key = fieldMap[apiField] || apiField;
        setErrors(prev => ({ ...prev, [key]: apiMessage || 'यह फील्ड पहले से मौजूद है' }));
      } else {
        alert(apiMessage || 'Registration failed. Please try again.');
      }
      setLoading(false);
      return;
    }
  };

  return (
    <div className="registration-container">
      <div className="printable-form" id="printableForm">
        <div className="logo-box">
          <img src="/logo.jpg" alt="Logo" className="logo-img" onError={(e) => e.target.style.visibility = 'hidden'} />
        </div>

        <div className="header-main">
          <h1 className="main-title">आगाज फाउंडेशन</h1>
          <p className="address-header">पता – भूपतिपुर मोड़, सुरभी विहार पटना–20</p>
        </div>

        <div className="form-title-box">
          <span className="form-title-red">प्रशिक्षण पंजीकरण फार्म</span>
          <div className="fee-box">
            <div className="fee-label">प्रशिक्षण शुल्क</div>
            <div className="fee-amount">₹ 799</div>
          </div>
        </div>

        <div className="photo-area" onClick={() => document.getElementById('photoInput').click()}>
          {photoPreview ? (
            <img src={photoPreview} alt="Preview" className="photo-preview" />
          ) : (
            <div className="photo-text">
              यहाँ पासपोर्ट <br /> फोटो लगाएँ
            </div>
          )}
          <input
            type="file"
            id="photoInput"
            hidden
            accept="image/*"
            onChange={handlePhotoChange}
          />
        </div>

        <div className="content-area">
          <div className="field-row row-next-to-photo">
            <span className="label">क्रमांक संख्या:</span>
            <input
              type="text"
              name="serialNo"
              value={formData.serialNo}
              className="input-line"
              readOnly
              style={{ fontWeight: 'bold' }}
            />
          </div>

          <div className="field-row row-next-to-photo">
            <span className="label">नाम:</span>
            <div style={{flex:1,display:'flex',flexDirection:'column'}}>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`input-line${errors.name ? ' sili-input-err' : ''}`}
                placeholder="पूरा नाम"
                required
              />
              {errors.name && <div className="field-error">{errors.name}</div>}
            </div>
          </div>

          <div className="field-row row-next-to-photo">
            <span className="label">पिता / पति का नाम:</span>
            <div style={{flex:1,display:'flex',flexDirection:'column'}}>
              <input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleInputChange}
                className={`input-line${errors.fatherName ? ' sili-input-err' : ''}`}
                placeholder="पिता / पति का नाम"
              />
              {errors.fatherName && <div className="field-error">{errors.fatherName}</div>}
            </div>
          </div>

          <div className="field-row">
            <span className="label">पता:</span>
            <div style={{flex:1,display:'flex',flexDirection:'column'}}>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={`input-line${errors.address ? ' sili-input-err' : ''}`}
                placeholder="पूरा पता"
                required
              />
              {errors.address && <div className="field-error">{errors.address}</div>}
            </div>
          </div>

          <div className="flex-split">
            <div className="field-row">
              <span className="label">मोबाइल नं:</span>
              <input
                type="text"
                name="mobileNo"
                value={formData.mobileNo}
                onChange={handlePhoneChange}
                onBlur={() => checkUnique('mobileNumber', formData.mobileNo, 'mobileNo', 'मोबाइल नंबर')}
                className={`input-line${errors.mobileNo ? ' sili-input-err' : ''}`}
                placeholder="10 अंकों का नंबर"
                maxLength="10"
                required
              />
              {errors.mobileNo && <div className="field-error">{errors.mobileNo}</div>}
            </div>
            <div className="field-row">
              <span className="label">लिंग:</span>
              <select name="gender" value={formData.gender} onChange={handleInputChange} className={`input-line${errors.gender ? ' sili-input-err' : ''}`}>
                <option value="">चुनें</option>
                <option value="Female">महिला</option>
                <option value="Other">अन्य</option>
              </select>
              {errors.gender && <div className="field-error">{errors.gender}</div>}
            </div>
          </div>

          <div className="field-row">
            <span className="label">Email ID:</span>
            <div style={{flex:1,display:'flex',flexDirection:'column'}}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={() => checkUnique('email', formData.email, 'email', 'Email')}
                className={`input-line${errors.email ? ' sili-input-err' : ''}`}
                placeholder="Email ID"
              />
              {errors.email && <div className="field-error">{errors.email}</div>}
            </div>
          </div>

          <div className="field-row">
            <span className="label">आधार कार्ड नं:</span>
            <div style={{flex:1,display:'flex',flexDirection:'column'}}>
              <input
                type="text"
                name="aadharNo"
                value={formData.aadharNo}
                onChange={handleAadharChange}
                onBlur={() => checkUnique('aadharNumber', formData.aadharNo, 'aadharNo', 'आधार नंबर')}
                className={`input-line${errors.aadharNo ? ' sili-input-err' : ''}`}
                placeholder="12 अंकों का आधार नंबर"
                maxLength="12"
                required
              />
              {errors.aadharNo && <div className="field-error">{errors.aadharNo}</div>}
            </div>
          </div>

          <div className="flex-split">
            <div className="field-row">
              <span className="label">उम्र:</span>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className={`input-line${errors.age ? ' sili-input-err' : ''}`}
                placeholder="उम्र"
                min="15"
                max="60"
              />
              {errors.age && <div className="field-error">{errors.age}</div>}
            </div>
            <div className="field-row">
              <span className="label">जाति:</span>
              <input
                type="text"
                name="caste"
                value={formData.caste}
                onChange={handleInputChange}
                className="input-line"
                placeholder="जाति"
              />
            </div>
          </div>

          <div className="flex-split">
            <div className="field-row">
              <span className="label">प्रशिक्षण का नाम:</span>
              <input
                type="text"
                name="trainingName"
                value={formData.trainingName}
                onChange={handleInputChange}
                className="input-line"
                disabled
              />
            </div>
            <div className="field-row">
              <span className="label">मौजूदा कौशल:</span>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                className="input-line"
                placeholder="आपकी कौशल"
              />
            </div>
          </div>

          <div className="field-row">
            <span className="label">प्रशिक्षण अवधि:</span>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              className="input-line"
              disabled
            />
          </div>

          <div className="field-row">
            <span className="label">प्रशिक्षण की तारीख:</span>
            <input
              type="date"
              name="trainingDate"
              value={formData.trainingDate}
              onChange={handleInputChange}
              className="input-line"
            />
          </div>

          <div className="sig-wrapper">
            <div className="sig-item">ऑफिस का हस्ताक्षर</div>
            <div className="sig-item">पंचायत कोर्डिनेटर हस्ताक्षर</div>
            <div className="sig-item">आवेदक का हस्ताक्षर</div>
          </div>
        </div>

        <div className="divider-line"></div>

        <div className="office-section-title">कार्यालय उपयोग हेतु (प्राप्ति रसीद)</div>

        <div className="content-area">
          <div className="field-row">
            <span className="label">क्रमांक संख्या:</span>
            <input type="text" className="input-line" style={{ flex: '0 0 150px' }} />
            <div style={{ flexGrow: 1, textAlign: 'center', fontSize: '22px', fontWeight: '900', color: '#d32f2f' }}>
              पावती रसीद
            </div>
          </div>

          <div className="field-row">
            <span className="label">नाम:</span>
            <input type="text" className="input-line" value={formData.name} readOnly />
          </div>

          <div className="field-row">
            <span className="label">पिता / पति का नाम:</span>
            <input type="text" className="input-line" value={formData.fatherName} readOnly />
          </div>

          <div className="field-row">
            <span className="label">पता:</span>
            <input
              type="text"
              className="input-line"
              value="भूपतिपुर मोड़, पटना – 20"
              readOnly
              style={{ fontWeight: 'normal' }}
            />
          </div>

          <div className="field-row">
            <span className="label">संपर्क:</span>
            <input
              type="text"
              className="input-line"
              value="0612465270, 7361936168"
              readOnly
              style={{ fontWeight: 'normal' }}
            />
          </div>

          <div className="sig-wrapper">
            <div className="sig-item">ऑफिस का हस्ताक्षर</div>
            <div className="sig-item">पंचायत कोर्डिनेटर हस्ताक्षर</div>
            <div className="sig-item">आवेदक का हस्ताक्षर</div>
          </div>
        </div>
      </div>

      <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
        {loading ? 'पेमेंट प्रोसेस हो रहा है...' : 'Pay ₹799 & Submit'}
      </button>
    </div>
  );
};

export default SilayiRegistration;
