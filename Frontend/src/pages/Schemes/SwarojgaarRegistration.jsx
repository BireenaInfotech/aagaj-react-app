import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import getepayPortal from '../../GetepayComponents';
import './SwarojgaarRegistration.css';

const SwarojgaarRegistration = () => {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const getAuthHeaders = () => {
    const token = sessionStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const [formData, setFormData] = useState({
    village: '',
    panchayat: '',
    anumandal: '',
    district: '',
    groupName: '',
    members: Array(10)
      .fill(null)
      .map(() => ({ name: '', address: '', aadhar: '', pan: '', mobile: '', photo: null }))
  });

  const [photos, setPhotos] = useState({});
  const [paymentAmount, setPaymentAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [memberErrors, setMemberErrors] = useState({});  // { '0_aadhar': '...', '1_mobile': '...' }

  // Auth Protection
  useEffect(() => {
    const userType = sessionStorage.getItem('userType');
    if (userType !== 'employee') {
      navigate('/admin-login');
    }
  }, [navigate]);

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (value.trim()) setErrors(prev => ({ ...prev, [name]: '' }));
    else setErrors(prev => ({ ...prev, [name]: 'आवश्यक है' }));
  };

  const handleMemberChange = (index, field, value) => {
    const newMembers = [...formData.members];

    // Strip digits from name field
    const sanitized = field === 'name' ? value.replace(/[0-9]/g, '') : value;
    newMembers[index][field] = sanitized;
    setFormData(prev => ({ ...prev, members: newMembers }));

    // Inline validation
    const key = `${index}_${field}`;
    if (field === 'name') {
      let err = '';
      if (sanitized && sanitized.trim().length < 2) err = 'नाम कम से कम 2 अक्षर का हो';
      setMemberErrors(prev => ({ ...prev, [key]: err }));
    }
    if (field === 'aadhar') {
      const err = value && !/^\d{12}$/.test(value) ? 'आधार 12 अंक होना चाहिए' : '';
      setMemberErrors(prev => ({ ...prev, [key]: err }));
    }
    if (field === 'mobile') {
      const err = value && !/^[6-9]\d{9}$/.test(value) ? 'मोबाइल 10 अंक (6-9 से शुरू)' : '';
      setMemberErrors(prev => ({ ...prev, [key]: err }));
    }
  };

  const handlePhotoUpload = (index, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotos(prev => ({
          ...prev,
          [index]: e.target.result
        }));
        const newMembers = [...formData.members];
        newMembers[index].photo = file;
        setFormData(prev => ({
          ...prev,
          members: newMembers
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addMember = () => {
    // Already 10 members, no need to add more
    if (formData.members.length < 10) {
      setFormData(prev => ({
        ...prev,
        members: [...prev.members, { name: '', address: '', aadhar: '', pan: '', mobile: '', photo: null }]
      }));
    }
  };

  const removeMember = (index) => {
    // Can only remove if more than 10 (should not happen in normal case)
    if (formData.members.length > 10) {
      const newMembers = formData.members.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        members: newMembers
      }));
      const newPhotos = { ...photos };
      delete newPhotos[index];
      setPhotos(newPhotos);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const newMemberErrors = {};
    let valid = true;

    if (!formData.village.trim())   { newErrors.village   = 'गाँव आवश्यक है';       valid = false; }
    if (!formData.district.trim())  { newErrors.district  = 'जिला आवश्यक है';       valid = false; }
    if (!formData.groupName.trim()) { newErrors.groupName = 'समूह का नाम आवश्यक है'; valid = false; }

    const amountValue = parseFloat(paymentAmount);
    if (!amountValue || amountValue <= 0) { newErrors.paymentAmount = 'भुगतान राशि आवश्यक है'; valid = false; }

    let hasMember = false;
    formData.members.forEach((m, i) => {
      const hasData = m.name || m.aadhar || m.pan || m.mobile;
      if (hasData) {
        hasMember = true;
        if (!m.name.trim()) {
          newMemberErrors[`${i}_name`] = 'नाम आवश्यक है'; valid = false;
        }
        if (m.aadhar && !/^\d{12}$/.test(m.aadhar)) {
          newMemberErrors[`${i}_aadhar`] = 'आधार 12 अंक होना चाहिए'; valid = false;
        }
        if (m.mobile && !/^[6-9]\d{9}$/.test(m.mobile)) {
          newMemberErrors[`${i}_mobile`] = 'मोबाइल 10 अंक (6-9 से शुरू)'; valid = false;
        }
      }
    });
    if (!hasMember) { newErrors.members = 'कम से कम एक सदस्य का विवरण भरें'; valid = false; }

    setErrors(prev => ({ ...prev, ...newErrors }));
    setMemberErrors(prev => ({ ...prev, ...newMemberErrors }));

    if (!valid) {
      setTimeout(() => {
        const el = document.querySelector('.swaro-field-error');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const amountValue = parseFloat(paymentAmount);

    try {
      setLoading(true);

      const orderId = `SWARO_${Date.now()}`;
      const membersPayload = formData.members.map((member, index) => ({
        index,
        name: member.name || '',
        address: member.address || '',
        details: `${member.aadhar || ''} | ${member.pan || ''} | ${member.mobile || ''}`
      }));

      const payload = new FormData();
      payload.append('village', formData.village);
      payload.append('panchayat', formData.panchayat);
      payload.append('anumandal', formData.anumandal);
      payload.append('district', formData.district);
      payload.append('groupName', formData.groupName);
      payload.append('members', JSON.stringify(membersPayload));
      payload.append('registrationFee', String(amountValue));
      payload.append('paymentOrderId', orderId);

      const userData = sessionStorage.getItem('userData');
      const parsedData = userData ? JSON.parse(userData) : {};
      payload.append(
        'registeredByName',
        parsedData.fullName || parsedData.emp_username || parsedData.email || 'Employee'
      );

      formData.members.forEach((member, index) => {
        if (member.photo) {
          payload.append(`member_photo_${index}`, member.photo);
        }
      });

      await axios.post(`${apiUrl}/swarojgaar/initiate`, payload, {
        withCredentials: true,
        headers: getAuthHeaders()
      });

      const config = {
        getepay_mid: import.meta.env.VITE_GETEPAY_MID || '108',
        getepay_terminal_id: import.meta.env.VITE_GETEPAY_TERMINAL_ID || 'Getepay.merchant61062@icici',
        getepay_keys: import.meta.env.VITE_GETEPAY_KEYS || 'JoYPd+qso9s7T+Ebj8pi4Wl8i+AHLv+5UNJxA3JkDgY=',
        getepay_ivs: import.meta.env.VITE_GETEPAY_IV || 'hlnuyA9b4YxDq6oJSZFl8g==',
        getepay_url: import.meta.env.VITE_GETEPAY_URL || 'https://pay1.getepay.in:8443/getepayPortal/pg/v2/generateInvoice',
      };

      const paymentData = {
        mid: config.getepay_mid,
        amount: amountValue.toFixed(2),
        merchantTransactionId: orderId,
        transactionDate: new Date().toISOString(),
        terminalId: config.getepay_terminal_id,
        udf1: formData.groupName || 'Swarojgaar Group',
        udf2: formData.district || 'N/A',
        udf3: formData.village || 'N/A',
        udf4: '',
        udf5: '',
        udf6: '',
        udf7: '',
        udf8: '',
        udf9: '',
        udf10: '',
        ru: `${apiUrl}/swarojgaar-pgresponse`,
        callbackUrl: '',
        currency: 'INR',
        paymentMode: 'ALL',
        bankId: '455',
        txnType: 'single',
        productType: 'IPG',
        txnNote: `Swarojgaar Registration - ${formData.groupName || 'Group'}`,
        vpa: config.getepay_terminal_id,
      };

      sessionStorage.setItem('swarojgaarPaymentData', JSON.stringify({
        orderId,
        amount: amountValue,
        groupName: formData.groupName
      }));

      await getepayPortal(paymentData, config);
    } catch (error) {
      const status = error?.response?.status;
      const apiMessage = error?.response?.data?.message;
      const apiErrors = error?.response?.data?.errors;

      if (status === 401 || status === 403) {
        alert('कृपया पहले लॉगिन करें (Authentication required)');
        setLoading(false);
        return;
      }

      if (status === 422 && apiErrors) {
        setErrors(prev => ({ ...prev, ...apiErrors }));
        setTimeout(() => {
          const el = document.querySelector('.swaro-field-error');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
      } else if (status === 422 && apiMessage) {
        // member-level single error from backend
        alert(apiMessage);
      } else {
        alert(apiMessage || 'आवेदन जमा करने में त्रुटि हुई');
      }
      setLoading(false);
    }
  };

  return (
    <div className="swarojgaar-container">
      {/* Page 1: Header & Guidelines Part 1 */}
      <div className="swarojgaar-page">
        <div className="header-text">
          यह अनुबंध आगाज फाउंडेशन और महिला समूह के बीच महिला स्वरोजगार हेतु किया जा रहा है।
        </div>

        <ul className="guidelines">
          <li>यह महिलाओं द्वारा एकत्रित होकर किया जाने वाला कार्य है। जिसे हम स्वयं सहायता समूह स्वरोजगार कहते है। इस ग्रुप पर आगाज फाउंडेशन द्वारा निर्धारित स्वयं सहायता समूह के सभी नियम लागू होंगे।</li>
          <li>प्रत्येक समूह में 10 महिला होगी।</li>
          <li>प्रत्येक समूह के एक अध्यक्ष, एक सचिव और एक कोषाध्यक्ष होंगे।</li>
          <li>महिला अपनी निजी रकम निजी जरूरत में न लगाकर कपड़े के व्यापार में लगाएगी, कपड़े के काम से जुड़ी सभी चीजों की जानकारी व मार्गदर्शन आगाज फाउंडेशन करेगी।</li>
          <li>आगाज फाउंडेशन महिलाओं को समूह कार्य का प्रोत्साहन दे रही है जिसमें कपड़े की सिलाई, कढ़ाई, बुनाई, धुलाई, प्रेस, सजना संवारना प्रिंटिंग बेचना व बिकवाना आदि सम्मिलित हैं।</li>
          <li>समूह सदस्य स्वरोजगार स्थापना हेतु 50,000 / पचास हजार रुपए का इंतजाम स्वयं करेंगे।</li>
          <li>महिलाओं के समूह को पूंजी उपलब्ध कराने में आगाज फाउंडेशन के सहयोग से बैंक या वित्तीय संस्थान से लोन प्राप्त कर सकेंगे।</li>
          <li>महिलाओं द्वारा प्राप्त रकम महिला के स्वरोजगार हेतु कच्चे माल खरीदने, जरूरत का सामान लाने व मार्केटिंग आदि में इस्तेमाल की जाएगी।</li>
          <li>महिला अपनी क्षमता व दक्षता के अनुसार तथा समूह की सहमति से महिला अपने कार्य काल को व्यावहारिक कर सकती हैं।</li>
          <li>महिला समूह में जो भी कपड़ा सिलेगी उस पर प्रत्येक उत्पाद प्रति लागत (पीस रेट) के आधार पर पैसा अदा किया जाएगा।</li>
        </ul>
      </div>

      {/* Page 2: Guidelines Part 2 */}
      <div className="swarojgaar-page">
        <ul className="guidelines swaro-guidelines-mt">
          <li>महिला समूह की सभी सदस्य सिलाई यूनिट की सामग्री आदि खरीदने हेतु रकम बैंक से आहरण के लिए चेक या ए टी एम या नेट बैंकिंग या मोबाइल बैंकिंग हेतु सहमत है।</li>
          <li>आगाज फाउंडेशन के सहयोग से मुहैया कराया गया पैसा महिला कपड़े के स्वरोजगार में ही लगाएगी। यदि महिला पैसे को आगाज फाउंडेशन के साथ स्वरोजगार में नहीं लगाती है तो यह वादा खिलाफी कहलाएगी।</li>
          <li>जिस महिला समूह के द्वारा पैसा गबन किया जाएगा उनपर कानूनी कार्रवाई की जाएगी।</li>
          <li>महिला समूह के द्वारा अर्जित किया गया पैसा का 10% आगाज फाउंडेशन के पास जमा रहेगा।</li>
          <li>आगाज फाउंडेशन व महिला की सहमति से महिलाओं के पद निर्धारित किए जाएंगे तथा पदाधिकारी सभी तरह के रजिस्टर जैसे हाजिरी, स्टोर कीपिंग, स्टॉक मैनेजमेंट आदि बनाएगी।</li>
          <li>समूह में मौजूद कोई भी सामान व कागजात बेमेल होने पर समूह की आय पर इसका प्रभाव पड़ सकता है।</li>
        </ul>
      </div>

      {/* Page 3: Form & Table */}
      <div className="swarojgaar-page">
        <div className="form-fill-area">
          <p>
            • आगाज फाउंडेशन के अथक प्रयास से
            <input
              type="text"
              name="village"
              value={formData.village}
              onChange={handleLocationChange}
              className="editable-input swaro-input-sm"
              placeholder="गांव"
            />{' '}
            गांव,
            <input
              type="text"
              name="panchayat"
              value={formData.panchayat}
              onChange={handleLocationChange}
              className="editable-input swaro-input-sm"
              placeholder="पंचायत"
            />{' '}
            पंचायत
            <input
              type="text"
              name="anumandal"
              value={formData.anumandal}
              onChange={handleLocationChange}
              className="editable-input swaro-input-sm"
              placeholder="अनुमंडल"
            />{' '}
            अनुमंडल
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleLocationChange}
              className="editable-input swaro-input-sm"
              placeholder="जिला"
            />{' '}
            जिला में महिलाओं का समूह बनाकर रोजगार मुहैया कराया जा रहा है।
          </p>
        </div>

        <div className="group-name">
          महिला समूह का नाम :{' '}
          <input
            type="text"
            name="groupName"
            value={formData.groupName}
            onChange={handleLocationChange}
            className={`editable-input swaro-input-lg${errors.groupName ? ' swaro-input-err' : ''}`}
            placeholder="समूह का नाम"
          />
          {errors.groupName && <span className="swaro-field-error">{errors.groupName}</span>}
        </div>

        {/* Table */}
        <table className="members-table">
          <thead>
            <tr>
              <th>महिलाओं का नाम व पता :</th>
              <th>(आधार कार्ड / पैन कार्ड / मोबाइल नं)</th>
              <th>PHOTO</th>
            </tr>
          </thead>
          <tbody>
            {formData.members.map((member, index) => (
              <tr key={index}>
                {/* Name & Address Cell */}
                <td>
                  <div className="inner-cell">
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                      placeholder="नाम"
                      className={`member-text-input${memberErrors[`${index}_name`] ? ' swaro-input-err' : ''}`}
                    />
                    {memberErrors[`${index}_name`] && <div className="swaro-field-error">{memberErrors[`${index}_name`]}</div>}
                  </div>
                  <div className="swaro-cell-divider"></div>
                  <div className="inner-cell">
                    <input
                      type="text"
                      value={member.address}
                      onChange={(e) => handleMemberChange(index, 'address', e.target.value)}
                      placeholder="पता"
                      className="member-text-input"
                    />
                  </div>
                </td>

                {/* Aadhar / Pan / Mobile Cell */}
                <td>
                  <div className="inner-cell">
                    <input
                      type="text"
                      value={member.aadhar}
                      onChange={(e) => handleMemberChange(index, 'aadhar', e.target.value.replace(/\D/g, '').slice(0, 12))}
                      placeholder="आधार (12 अंक)"
                      className={`member-text-input${memberErrors[`${index}_aadhar`] ? ' swaro-input-err' : ''}`}
                      maxLength="12"
                    />
                    {memberErrors[`${index}_aadhar`] && <div className="swaro-field-error">{memberErrors[`${index}_aadhar`]}</div>}
                  </div>
                  <div className="swaro-cell-divider"></div>
                  <div className="inner-cell">
                    <input
                      type="text"
                      value={member.pan}
                      onChange={(e) => handleMemberChange(index, 'pan', e.target.value.toUpperCase().slice(0, 10))}
                      placeholder="पैन"
                      className="member-text-input"
                      maxLength="10"
                    />
                  </div>
                  <div className="swaro-cell-divider"></div>
                  <div className="inner-cell">
                    <input
                      type="text"
                      value={member.mobile}
                      onChange={(e) => handleMemberChange(index, 'mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="मोबाइल (10 अंक)"
                      className={`member-text-input${memberErrors[`${index}_mobile`] ? ' swaro-input-err' : ''}`}
                      maxLength="10"
                    />
                    {memberErrors[`${index}_mobile`] && <div className="swaro-field-error">{memberErrors[`${index}_mobile`]}</div>}
                  </div>
                </td>

                {/* Photo Cell */}
                <td className="photo-cell" onClick={() => document.getElementById(`photo-${index}`).click()}>
                  {photos[index] ? (
                    <img src={photos[index]} alt="Member Photo" />
                  ) : (
                    <div className="photo-placeholder">
                      यहाँ <br /> फोटो लगाएँ
                    </div>
                  )}
                  <input
                    type="file"
                    id={`photo-${index}`}
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(index, e.target.files[0])}
                    hidden
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Signature Section */}
        <div className="signature-section">
          <span>आधिकारिक हस्ताक्षर</span>
          <span>एरिया को ऑर्डिनेटर</span>
          <span>आधिकारिक हस्ताक्षर</span>
        </div>
      </div>

      {/* Payment Amount Input */}
      <div className="payment-section">
        <label className="payment-label">भुगतान राशि (₹):</label>
        <input
          type="number"
          value={paymentAmount}
          onChange={(e) => { setPaymentAmount(e.target.value); if (parseFloat(e.target.value) > 0) setErrors(prev => ({...prev, paymentAmount: ''})); }}
          className={`payment-input${errors.paymentAmount ? ' swaro-input-err' : ''}`}
          placeholder="राशि दर्ज करें"
        />
        {errors.paymentAmount && <div className="swaro-field-error">{errors.paymentAmount}</div>}
        {errors.members && <div className="swaro-field-error">{errors.members}</div>}
      </div>

      {/* Submit Button */}
      <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
        {loading ? 'पेमेंट प्रोसेस हो रहा है...' : 'Pay & Submit'}
      </button>
    </div>
  );
};

export default SwarojgaarRegistration;
