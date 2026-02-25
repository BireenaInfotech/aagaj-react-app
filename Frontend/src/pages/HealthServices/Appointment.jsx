import React, { useState, useEffect } from 'react';
import './Appointment.css';

const Appointment = () => {
  const [lookupValue, setLookupValue] = useState(''); // Aadhar or Health ID
  const [lookupType, setLookupType] = useState('aadhar'); // 'aadhar' or 'healthid'

  const [patientData, setPatientData] = useState(null);
  const [playerFound, setPlayerFound] = useState(false);

  const [facilityType, setFacilityType] = useState('Hospital'); // Hospital, Lab, Pharmacy
  const [allProviders, setAllProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);

  const [availableServices, setAvailableServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    gender: 'Male',
    age: '',
    aadhar: '',
    phone: '',
    bloodGroup: 'Unknown',
    healthId: '',
    street: '',
    city: '',
    pin: '',
    date: '',
    message: ''
  });

  const [showReceipt, setShowReceipt] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch all providers
  useEffect(() => {
    fetchAllProviders();
  }, []);

  // Filter providers when facility type changes
  useEffect(() => {
    const filtered = allProviders.filter(p => p.category === facilityType);
    setFilteredProviders(filtered);
    setSelectedFacility(null);
    setAvailableServices([]);
    setSelectedServices([]);
  }, [facilityType, allProviders]);

  // Get services when facility is selected
  useEffect(() => {
    if (selectedFacility) {
      const services = selectedFacility.services || [];
      setAvailableServices(services);
      setSelectedServices([]);
    }
  }, [selectedFacility]);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchAllProviders = async () => {
    try {
      const res = await fetch(`${apiUrl}/swasthya/partners/all-providers`);
      const result = await res.json();
      if (result.success) {
        setAllProviders(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const handleLookup = async () => {
    if (!lookupValue.trim()) {
      alert('Please enter Aadhar or Health ID');
      return;
    }

    try {
      let endpoint = '';
      if (lookupType === 'aadhar') {
        endpoint = `${apiUrl}/api/healthcard/aadhar/${lookupValue}`;
      } else {
        endpoint = `${apiUrl}/api/healthcard/health-id/${lookupValue}`;
      }

      const res = await fetch(endpoint);
      const result = await res.json();

      if (result.success && result.data) {
        const card = result.data;
        setPatientData(card);
        setPlayerFound(true);
        setFormData(prev => ({
          ...prev,
          name: card.fullName || '',
          age: card.age || '',
          gender: card.gender || 'Male',
          bloodGroup: card.bloodGroup || 'Unknown',
          phone: card.mobile || '',
          healthId: card.healthId || '',
          aadhar: card.aadhar || lookupValue,
          street: card.address?.village || '',
          city: card.address?.district || '',
          pin: card.address?.pincode || ''
        }));
      } else {
        alert('Patient not found! Please check the number.');
        setPlayerFound(false);
      }
    } catch (error) {
      console.error('Error fetching patient data:', error);
      alert('Error fetching patient data');
    }
  };

  const handleServiceToggle = (service) => {
    setSelectedServices(prev => {
      if (prev.includes(service)) {
        return prev.filter(s => s !== service);
      } else {
        return [...prev, service];
      }
    });
  };

  const formatAadharDisplay = (aadhar) => {
    if (!aadhar) return '';
    return aadhar.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.aadhar || !formData.phone) {
      alert('Fill all required patient details!');
      return;
    }

    if (!selectedFacility) {
      alert('Please select a facility!');
      return;
    }

    if (selectedServices.length === 0) {
      alert('Please select at least one service!');
      return;
    }

    if (!formData.date) {
      alert('Please select appointment date!');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        name: formData.name,
        gender: formData.gender,
        age: formData.age,
        aadhar: formData.aadhar,
        phone: formData.phone,
        bloodGroup: formData.bloodGroup,
        healthId: formData.healthId,
        street: formData.street,
        city: formData.city,
        pin: formData.pin,
        department: selectedServices.join(', '),
        doctor: selectedFacility.businessName,
        date: formData.date,
        message: formData.message,
        providerType: facilityType,
        services: selectedServices
      };

      const response = await fetch(`${apiUrl}/appointment/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      const result = await response.json();

      if (result.success) {
        // Send WhatsApp
        const waNumber = selectedFacility.contact?.whatsappNumber || '9431430464';
        const waMsg = `*AAGAJ FOUNDATION - APPOINTMENT*%0A` +
          `------------------------%0A` +
          `*Patient:* ${formData.name.toUpperCase()}%0A` +
          `*Health ID:* ${formData.healthId}%0A` +
          `*Mobile:* ${formData.phone}%0A` +
          `*Facility:* ${selectedFacility.businessName}%0A` +
          `*Facility Address:* ${selectedFacility.address?.full}${selectedFacility.address?.landmark ? ', ' + selectedFacility.address.landmark : ''}, ${selectedFacility.address?.city}${selectedFacility.address?.state ? ', ' + selectedFacility.address.state : ''} - ${selectedFacility.address?.pincode}%0A` +
          `*Services:* ${selectedServices.join(', ')}%0A` +
          `*Date:* ${formData.date}%0A` +
          `*Patient Address:* ${formData.street}, ${formData.city} - ${formData.pin}`;

        window.open(`https://wa.me/${waNumber}?text=${waMsg}`, '_blank');

        setShowReceipt(true);
        alert('✅ Appointment Booked Successfully!');
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error(error);
      alert('Server Error. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const facilityAddr = [
      selectedFacility?.address?.full,
      selectedFacility?.address?.landmark,
      selectedFacility?.address?.city,
      selectedFacility?.address?.state
    ].filter(Boolean).join(', ') + ' - ' + (selectedFacility?.address?.pincode || '');

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Appointment Receipt - ${formData.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: #fff; color: #000; padding: 30px; }
    .receipt-wrapper { max-width: 700px; margin: 0 auto; border: 2px solid #cc0000; border-radius: 10px; overflow: hidden; }
    .header { background: #cc0000; color: #fff; padding: 18px 24px; display: flex; align-items: center; gap: 16px; }
    .header img { height: 60px; width: 60px; object-fit: contain; background: #fff; border-radius: 6px; padding: 4px; }
    .header-text h1 { font-size: 22px; letter-spacing: 1px; }
    .header-text p { font-size: 13px; opacity: 0.9; margin-top: 2px; }
    .badge { background: #fff; color: #cc0000; font-size: 11px; font-weight: bold; padding: 2px 10px; border-radius: 20px; display: inline-block; margin-top: 6px; }
    .body { padding: 24px; }
    .section-title { font-size: 13px; font-weight: bold; color: #cc0000; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #eee; padding-bottom: 4px; margin: 18px 0 10px; }
    .row { display: flex; gap: 0; margin-bottom: 8px; font-size: 14px; }
    .label { font-weight: bold; min-width: 160px; color: #333; }
    .value { color: #111; }
    .divider { border: none; border-top: 1px dashed #ccc; margin: 20px 0; }
    .footer { background: #f9f9f9; border-top: 2px solid #cc0000; padding: 12px 24px; font-size: 12px; color: #555; text-align: center; }
    .status-badge { display: inline-block; background: #16a34a; color: #fff; padding: 3px 14px; border-radius: 20px; font-size: 13px; font-weight: bold; }
    @media print {
      body { padding: 0; }
      @page { margin: 0.5cm; size: A4; }
    }
  </style>
</head>
<body>
  <div class="receipt-wrapper">
    <div class="header">
      <img src="${window.location.origin}/logo.jpg" alt="Logo" />
      <div class="header-text">
        <h1>AAGAJ FOUNDATION</h1>
        <p>Swasth Suraksha Yojna</p>
        <span class="badge">APPOINTMENT CONFIRMED</span>
      </div>
    </div>
    <div class="body">
      <div class="section-title">Patient Details</div>
      <div class="row"><span class="label">Patient Name</span><span class="value">${formData.name.toUpperCase()}</span></div>
      <div class="row"><span class="label">Health ID</span><span class="value">${formData.healthId || 'N/A'}</span></div>
      <div class="row"><span class="label">Aadhar</span><span class="value">${formData.aadhar.replace(/(\d{4})(?=\d)/g, '$1 ')}</span></div>
      <div class="row"><span class="label">Mobile</span><span class="value">${formData.phone}</span></div>
      <div class="row"><span class="label">Gender / Age</span><span class="value">${formData.gender}, ${formData.age} yrs</span></div>
      <div class="row"><span class="label">Blood Group</span><span class="value">${formData.bloodGroup}</span></div>
      <div class="row"><span class="label">Patient Address</span><span class="value">${formData.street}, ${formData.city} - ${formData.pin}</span></div>

      <hr class="divider" />
      <div class="section-title">Appointment Details</div>
      <div class="row"><span class="label">Facility</span><span class="value">${selectedFacility?.businessName}</span></div>
      <div class="row"><span class="label">Facility Type</span><span class="value">${facilityType}</span></div>
      <div class="row"><span class="label">Facility Address</span><span class="value">${facilityAddr}</span></div>
      <div class="row"><span class="label">Services</span><span class="value">${selectedServices.join(', ')}</span></div>
      <div class="row"><span class="label">Appointment Date</span><span class="value">${formData.date}</span></div>
      <div class="row"><span class="label">Status</span><span class="value"><span class="status-badge">Confirmed</span></span></div>
      ${formData.message ? `<div class="row"><span class="label">Note</span><span class="value">${formData.message}</span></div>` : ''}
    </div>
    <div class="footer">
      Aagaj Foundation &mdash; Swasth Suraksha Yojna &nbsp;|&nbsp; This is a computer generated receipt.
    </div>
  </div>
</body>
</html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  const handleNewAppointment = () => {
    setShowReceipt(false);
    setLookupValue('');
    setPlayerFound(false);
    setPatientData(null);
    setSelectedFacility(null);
    setSelectedServices([]);
    setFormData({
      name: '',
      gender: 'Male',
      age: '',
      aadhar: '',
      phone: '',
      bloodGroup: 'Unknown',
      healthId: '',
      street: '',
      city: '',
      pin: '',
      date: '',
      message: ''
    });
  };

  return (
    <>
      <nav className="appointment-nav no-print">
        <div className="brand-container">
          <img src="/logo.jpg" alt="Logo" className="main-logo" />
          <div className="brand">
            AAGAJ <br /><span>FOUNDATION</span>
            <small className="yojna-tag">SWASTH SURAKSHA YOJNA</small>
          </div>
        </div>
      </nav>

      <div className="container-appointment">
        {showReceipt ? (
          <div id="print-area" className="glass-card">
            <div className="receipt-header">
              <img src="/logo.jpg" alt="Logo" style={{ height: '60px' }} />
              <div>
                <h2 style={{ color: 'var(--primary)', margin: 0 }}>AAGAJ FOUNDATION</h2>
                <p style={{ color: '#dc2626', margin: 0, fontWeight: 'bold', fontSize: '14px' }}>
                  SWASTH SURAKSHA YOJNA
                </p>
              </div>
            </div>
            <div className="receipt-body">
              <div id="receipt-details" style={{ flex: 1, fontSize: '14px', lineHeight: 1.8 }}>
                <strong>Patient:</strong> {formData.name.toUpperCase()}<br />
                <strong>Healthcard ID:</strong> {formData.healthId}<br />
                <strong>Aadhar:</strong> {formatAadharDisplay(formData.aadhar)}<br />
                <strong>Mobile:</strong> {formData.phone}<br />
                <strong>Facility:</strong> {selectedFacility?.businessName}<br />
                <strong>Facility Address:</strong> {selectedFacility?.address?.full}{selectedFacility?.address?.landmark ? `, ${selectedFacility.address.landmark}` : ''}, {selectedFacility?.address?.city}{selectedFacility?.address?.state ? `, ${selectedFacility.address.state}` : ''} - {selectedFacility?.address?.pincode}<br />
                <strong>Services:</strong> {selectedServices.join(', ')}<br />
                <strong>Date:</strong> {formData.date}<br />
                <strong>Patient Address:</strong> {formData.street}, {formData.city} - {formData.pin}
              </div>
            </div>
            <div className="no-print" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" onClick={handlePrint}>
                Print
              </button>
              <button className="btn" onClick={handleNewAppointment} style={{ background: '#eee' }}>
                New Appointment
              </button>
            </div>
          </div>
        ) : (
          <div className="glass-card no-print" id="form-card">
            <div className="form-header">
              <h2>📋 Appointment Booking</h2>
            </div>

            {!playerFound ? (
              <div className="lookup-section">
                <h3>Step 1: Patient Lookup</h3>
                <div className="lookup-container">
                  <div className="lookup-type-selector">
                    <label>
                      <input
                        type="radio"
                        name="lookupType"
                        value="aadhar"
                        checked={lookupType === 'aadhar'}
                        onChange={(e) => {
                          setLookupType(e.target.value);
                          setLookupValue('');
                        }}
                      />
                      Aadhar (12 Digit)
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="lookupType"
                        value="healthid"
                        checked={lookupType === 'healthid'}
                        onChange={(e) => {
                          setLookupType(e.target.value);
                          setLookupValue('');
                        }}
                      />
                      Health ID
                    </label>
                  </div>

                  <div className="lookup-input-group">
                    <input
                      type="text"
                      placeholder={lookupType === 'aadhar' ? 'Enter 12-digit Aadhar' : 'Enter Health ID (e.g. MC-225221)'}
                      value={lookupValue}
                      onChange={(e) => {
                        if (lookupType === 'aadhar') {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          if (val.length <= 12) setLookupValue(val);
                        } else {
                          // Health ID format: MC-XXXXXX — allow letters, digits, hyphen
                          const val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
                          if (val.length <= 9) setLookupValue(val);
                        }
                      }}
                      maxLength={lookupType === 'aadhar' ? 12 : 9}
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleLookup}
                      style={{ marginLeft: '10px' }}
                    >
                      <i className="fas fa-search"></i> Find Patient
                    </button>
                  </div>
                </div>
                {patientData && (
                  <div className="patient-preview">
                    <strong>✅ Patient Found:</strong> {patientData.fullName} | {patientData.age} years | {patientData.mobile}
                  </div>
                )}
              </div>
            ) : (
              <form id="appointmentForm" onSubmit={handleSubmit}>
                {/* Step 2: Facility Selection */}
                <div className="form-section">
                  <h3>Step 2: Select Facility Type</h3>
                  <div className="facility-type-selector">
                    {['Hospital', 'Lab', 'Pharmacy'].map(type => (
                      <button
                        key={type}
                        type="button"
                        className={`facility-btn ${facilityType === type ? 'active' : ''}`}
                        onClick={() => setFacilityType(type)}
                      >
                        {type === 'Hospital' ? '🏥' : type === 'Lab' ? '🧪' : '💊'} {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 3: Select Specific Facility */}
                <div className="form-section">
                  <h3>Step 3: Select {facilityType}</h3>
                  {filteredProviders.length > 0 ? (
                    <div className="facility-cards-grid">
                      {filteredProviders.map(provider => (
                        <div
                          key={provider._id}
                          className={`facility-card ${selectedFacility?._id === provider._id ? 'selected' : ''}`}
                          onClick={() => setSelectedFacility(provider)}
                        >
                          <div className="facility-card-header">
                            <h4>{provider.businessName}</h4>
                            <div className="facility-badge">{facilityType}</div>
                          </div>

                          <div className="facility-card-details">
                            <div className="detail-item">
                              <span className="detail-label">📍</span>
                              <span className="detail-value">{provider.address.full}, {provider.address.city} - {provider.address.pincode}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">📞</span>
                              <span className="detail-value">{provider.contact.whatsappNumber}</span>
                            </div>
                          </div>

                          {provider.services && provider.services.length > 0 && (
                            <div className="facility-services">
                              <strong>Services:</strong>
                              <div className="services-list">
                                {provider.services.slice(0, 3).map((service, idx) => (
                                  <span key={idx} className="service-tag">{service}</span>
                                ))}
                                {provider.services.length > 3 && (
                                  <span className="service-tag">+{provider.services.length - 3} more</span>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="facility-card-footer">
                            {selectedFacility?._id === provider._id ? (
                              <div className="selected-indicator">✅ Selected</div>
                            ) : (
                              <button type="button" className="btn-select-facility">
                                Select
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="placeholder-msg">
                      📭 No {facilityType}s available in this area
                    </div>
                  )}
                </div>

                {/* Step 4: Select Services */}
                {availableServices.length > 0 && (
                  <div className="form-section">
                    <h3>Step 4: Select Services</h3>
                    <p className="services-hint">Select the services you want to book:</p>
                    <div className="services-checkbox-group">
                      {availableServices.map((service, idx) => (
                        <label key={idx} className="checkbox-item">
                          <input
                            type="checkbox"
                            checked={selectedServices.includes(service)}
                            onChange={() => handleServiceToggle(service)}
                          />
                          <span>{service}</span>
                        </label>
                      ))}
                    </div>
                    {selectedServices.length > 0 && (
                      <div className="selected-services">
                        <strong>✅ Selected Services:</strong><br />
                        {selectedServices.join(', ')}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 5: Patient Details */}
                <div className="form-section">
                  <h3>Step 5: Patient Details</h3>
                  <div className="grid-row">
                    <div>
                      <label>Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        readOnly
                        className="read-only"
                      />
                    </div>
                    <div>
                      <label>Age *</label>
                      <input
                        type="text"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        readOnly
                        className="read-only"
                      />
                    </div>
                    <div>
                      <label>Gender *</label>
                      <select name="gender" value={formData.gender} onChange={handleInputChange}>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label>Blood Group *</label>
                      <input
                        type="text"
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleInputChange}
                        readOnly
                        className="read-only"
                      />
                    </div>
                  </div>

                  <div className="grid-row">
                    <div>
                      <label>Aadhar *</label>
                      <input
                        type="text"
                        name="aadhar"
                        value={formatAadharDisplay(formData.aadhar)}
                        readOnly
                        className="read-only"
                      />
                    </div>
                    <div>
                      <label>Mobile Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        readOnly
                        className="read-only"
                      />
                    </div>
                    <div>
                      <label>Health ID *</label>
                      <input
                        type="text"
                        name="healthId"
                        value={formData.healthId}
                        readOnly
                        className="read-only"
                      />
                    </div>
                  </div>
                </div>

                {/* Step 6: Address */}
                <div className="form-section">
                  <h3>Step 6: Address</h3>
                  <div className="grid-row">
                    <div style={{ gridColumn: 'span 2' }}>
                      <label>Street / Village *</label>
                      <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        placeholder="Enter street/village name"
                      />
                    </div>
                    <div>
                      <label>City / District *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <label>Pincode *</label>
                      <input
                        type="text"
                        name="pin"
                        value={formData.pin}
                        onChange={handleInputChange}
                        maxLength="6"
                        placeholder="Enter pincode"
                      />
                    </div>
                  </div>
                </div>

                {/* Step 7: Appointment Details */}
                <div className="form-section">
                  <h3>Step 7: Appointment Details</h3>
                  <div className="grid-row">
                    <div>
                      <label>Preferred Date *</label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label>Problem / Symptoms</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Describe your symptoms or health concern..."
                      rows="3"
                    ></textarea>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="form-section" style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #e5e7eb' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '12px', fontSize: '16px', fontWeight: 'bold' }}
                    disabled={loading || !selectedFacility || selectedServices.length === 0}
                  >
                    <i className="fas fa-calendar-check"></i> {loading ? 'Booking...' : 'Book Appointment'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Appointment;
