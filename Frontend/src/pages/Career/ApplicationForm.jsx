import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import JobApplicationPayment from './JobApplicationPayment';
import './ApplicationForm.css';

const ApplicationForm = () => {
  const apiUrl = import.meta.env.VITE_API_URL ;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roleParam = searchParams.get('role');
  const categoryParam = searchParams.get('category');

  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [showPaymentStep, setShowPaymentStep] = useState(false);
  const [applicantId, setApplicantId] = useState(null);
  const [jobFee, setJobFee] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '', fatherName: '', motherName: '', dob: '', mobileNo: '', email: '', aadharNo: '',
    village: '', panchayat: '', postOffice: '', block: '', policeStation: '', district: '', state: '', pinCode: '',
    wardNo: '', totalWard: '', nationality: '', languageKnown: '', accountNo: '', ifscCode: '', 
    accountHolderName: '', bankName: '', place: '', date: '',
    matricSchool: '', matricYear: '', matricBoard: '', matricSubjects: '', matricDiv: '', matricMarks: '', matricRemarks: '',
    interSchool: '', interYear: '', interBoard: '', interSubjects: '', interDiv: '', interMarks: '', interRemarks: '',
    gradSchool: '', gradYear: '', gradBoard: '', gradSubjects: '', gradDiv: '', gradMarks: '', gradRemarks: '',
    photoFile: null
  });

  const [errors, setErrors] = useState({});

  // -------- Per-field validation rules --------
  const validateField = (id, value) => {
    const v = (value || '').trim();
    let msg = '';
    const nameOnly = /^[a-zA-Z\s]+$/;

    if (id === 'fullName') {
      if (!v) msg = 'Full name is required.';
      else if (!nameOnly.test(v)) msg = 'Name must contain letters only (no numbers).';
    }
    if (id === 'fatherName') {
      if (!v) msg = 'Father / Husband name is required.';
      else if (!nameOnly.test(v)) msg = 'Name must contain letters only (no numbers).';
    }
    if (id === 'motherName' && v && !nameOnly.test(v)) msg = 'Name must contain letters only (no numbers).';
    if (id === 'accountHolderName' && v && !nameOnly.test(v)) msg = 'Name must contain letters only.';
    if (id === 'dob') {
      const dobPat = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(19|20)\d{2}$/;
      if (!v) msg = 'Date of birth is required.';
      else if (!dobPat.test(v)) msg = 'Enter date in DD/MM/YYYY format.';
      else {
        const [dd, mm, yyyy] = v.split('/');
        if (new Date(`${yyyy}-${mm}-${dd}`) > new Date()) msg = 'Date of birth cannot be a future date.';
      }
    }
    if (id === 'mobileNo') {
      if (!v) msg = 'Mobile number is required.';
      else if (!/^[6-9]\d{9}$/.test(v)) msg = 'Must be 10 digits and start with 6, 7, 8 or 9.';
    }
    if (id === 'email') {
      if (!v) msg = 'Email is required.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = 'Enter a valid email address.';
    }
    if (id === 'aadharNo') {
      if (!v) msg = 'Aadhar number is required.';
      else if (!/^\d{12}$/.test(v)) msg = 'Aadhar must be exactly 12 digits.';
    }
    if (id === 'village' && !v) msg = 'Village is required.';
    if (id === 'district' && !v) msg = 'District is required.';
    if (id === 'state' && !v) msg = 'State is required.';
    if (id === 'pinCode' && v && !/^\d{6}$/.test(v)) msg = 'Pin Code must be exactly 6 digits.';
    if (id === 'ifscCode' && v && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(v.toUpperCase())) msg = 'Invalid IFSC (e.g. SBIN0001234).';
    if (id === 'accountNo' && v && !/^\d{9,18}$/.test(v)) msg = 'Account number must be 9–18 digits.';
    if (['matricYear','interYear','gradYear'].includes(id) && v && !/^(19|20)\d{2}$/.test(v)) msg = 'Enter a valid 4-digit year.';

    setErrors(prev => ({ ...prev, [id]: msg }));
    return !msg;
  };

  const jobRoles = {
    'panchayat': 'Panchayat Coordinator',
    'block': 'Block Coordinator',
    'district': 'District Coordinator',
    'health': 'Health Supervisor',
    'mitra': 'Mahila Mitra',
    'trainer': 'Trainer',
    'ngo': 'Other NGO Job',
    'general-job': 'General Job Opportunity'
  };

  // Job fees mapping - matches your job listings
  const jobFees = {
    'panchayat': 999,       // Panchayat Coordinator
    'block': 1499,          // Block Coordinator
    'district': 2100,       // District Coordinator
    'health': 1499,         // Health Supervisor
    'mitra': 999,           // Mahila Mitra
    'trainer': 0,           // Trainer - Contact for fee
    'ngo': 0,               // Other NGO Job - Custom
    'general-job': 499      // General Job Opportunity
  };

  const translations = {
    en: {
      photo_label: 'PHOTO', foundation_name: 'AAGAJ FOUNDATION', reg_text: 'Registered Under Indian Trust Act 1882',
      app_form: 'APPLICATION FORM', block_letters: 'ALL ENTERS TO BE MADE IN CAPITAL BLOCK LETTERS',
      name_full: 'Name in full (in block letters)', father_name: 'Father/ Husband Name (in block letters)',
      mother_name: "Mother's Name (in block letters)", dob: 'Date of Birth (DD/MM/YYYY)', mobile: 'Mobile No.',
      email: 'Email ID', aadhar: 'Aadhar NO',
      perm_address: 'Permanent home address:', village: 'Village:', panchayat: 'Panchayat:',
      post: 'Post Office:', block: 'Block:', police: 'Police Station:', dist: 'District:', state: 'State:',
      pin: 'Pin Code:', ward: 'Ward No:', total_ward: 'Total Ward:', nation: 'Nationality:',
      lang: 'Language Known:', acc_no: 'Account No:', ifsc: 'IFSC Code:', acc_holder: 'Account Holder Name:',
      bank: 'Bank Name:',
      qualification: 'Qualification:', exam_col: 'Exam', school_addr: 'Name of School/College',
      pass_year: 'Year', board: 'Board/Univ', subjects: 'Subjects', division: 'Div', percent: '%', remarks: 'Remarks',
      matric: 'Matric', inter: 'Intermediate', grad: 'Graduation',
      choose_post: 'Choose option of the post:',
      declaration: 'I hereby give my consent and sign as per the above.',
      sig_guardian: 'Guardian Signature', place: 'Place:', date: 'Date:', sig_coord: 'Coordinator Signature',
      note_text: 'Note: Fee once paid is not refundable.',
      helpline: '📞 Helpline:', sig_officer: 'Officer Signature', btn_print: 'Print Form',
      btn_submit: 'Submit Application',
      empty_name: 'Please enter Full Name.', empty_father: 'Please enter Father/Husband Name.',
      empty_dob: 'Please enter Date of Birth.', invalid_dob: 'Date must be in DD/MM/YYYY format.',
      invalid_mobile: 'Please enter a valid 10-digit Mobile Number.',
      invalid_email: 'Please enter a valid Email ID.', invalid_aadhar: 'Please enter a valid 12-digit Aadhar Number.',
      empty_photo: 'Please upload your Photo.', empty_address: 'Please fill Village, District, State and Pin Code.',
      invalid_pin: 'Pin Code must be 6 digits.', success: 'Application submitted successfully!'
    },
    hi: {
      photo_label: 'फोटो', foundation_name: 'आगाज फाउंडेशन', reg_text: 'भारतीय ट्रस्ट अधिनियम 1882 के तहत पंजीकृत',
      app_form: 'आवेदन पत्र', block_letters: 'सभी प्रविष्टियां बड़े अक्षरों में की जाएं',
      name_full: 'पूरा नाम (बड़े अक्षरों में)', father_name: 'पिता / पति का नाम (बड़े अक्षरों में)',
      mother_name: 'माता का नाम (बड़े अक्षरों में)', dob: 'जन्म तिथि (DD/MM/YY)', mobile: 'मोबाइल नं.',
      email: 'ईमेल आईडी', aadhar: 'आधार नं.',
      perm_address: 'स्थायी घर का पता:', village: 'गाँव:', panchayat: 'पंचायत:',
      post: 'डाकघर:', block: 'प्रखंड:', police: 'थाना:', dist: 'जिला:', state: 'राज्य:',
      pin: 'पिन कोड:', ward: 'वार्ड नं:', total_ward: 'कुल वार्ड:', nation: 'राष्ट्रीयता:',
      lang: 'भाषा ज्ञान:', acc_no: 'खाता सं:', ifsc: 'IFSC कोड:', acc_holder: 'खाता धारक का नाम:',
      bank: 'बैंक का नाम:',
      qualification: 'योग्यता:', exam_col: 'परीक्षा', school_addr: 'स्कूल/कॉलेज का नाम',
      pass_year: 'वर्ष', board: 'बोर्ड/विवि', subjects: 'विषय', division: 'श्रेणी', percent: '%', remarks: 'टिप्पणी',
      matric: 'मैट्रिक', inter: 'इंटरमीडिएट', grad: 'स्नातक',
      choose_post: 'पद का विकल्प चुनें:',
      declaration: 'अतः उपरोक्त के अनुसार मैं अपना / अपनी सहमति देकर अपना हस्ताक्षर करता / करती हूँ।',
      sig_guardian: 'अभिभावक का हस्ताक्षर', place: 'स्थान:', date: 'दिनांक:', sig_coord: 'समन्वयक का हस्ताक्षर',
      note_text: 'नोट: फॉर्म शुल्क वापसी का कोई प्रावधान नहीं है।',
      helpline: '📞 हेल्पलाइन:', sig_officer: 'ऑफिसर का हस्ताक्षर', btn_print: 'प्रिंट करें',
      btn_submit: 'आवेदन जमा करें',
      empty_name: 'कृपया पूरा नाम भरें।', empty_father: 'कृपया पिता/पति का नाम भरें।',
      empty_dob: 'कृपया जन्म तिथि भरें।', invalid_dob: 'तारीख DD/MM/YYYY फॉर्मेट में होनी चाहिए।',
      invalid_mobile: 'कृपया मान्य 10-अंकीय मोबाइल नंबर दर्ज करें।',
      invalid_email: 'कृपया मान्य ईमेल आईडी दर्ज करें।', invalid_aadhar: 'कृपया मान्य 12-अंकीय आधार नंबर दर्ज करें।',
      empty_photo: 'कृपया अपनी फोटो अपलोड करें।', empty_address: 'कृपया गाँव, जिला, राज्य और पिन कोड भरें।',
      invalid_pin: 'पिन कोड 6 अंकों का होना चाहिए।', success: 'आवेदन सफलतापूर्वक जमा हो गया!'
    }
  };

  const t = translations[language];

  // Initialize role on mount
  useEffect(() => {
    if (roleParam && jobRoles[roleParam]) {
      // Role parameter exists in our mapping - store the KEY
      setSelectedRole(roleParam);
      console.log(`✅ Pre-selected role from URL: ${jobRoles[roleParam]} (${roleParam})`);
    } else if (categoryParam === 'general') {
      // Category parameter specifies general/normal jobs
      setSelectedRole('general-job');
      console.log('✅ Pre-selected role from category: General Job Opportunity');
    }
  }, [roleParam, categoryParam]);

  const handleInputChange = (e) => {
    const { id, value, type } = e.target;
    let processedValue = value;

    // HTML5 date picker — store as-is (YYYY-MM-DD)
    if (type === 'date') {
      setFormData(prev => ({ ...prev, [id]: value }));
      return;
    }

    // Name fields — letters & spaces only (strip digits/special chars) + uppercase
    const nameFields = ['fullName','fatherName','motherName','accountHolderName','bankName'];
    if (nameFields.includes(id)) {
      processedValue = value.replace(/[^a-zA-Z\s]/g, '').toUpperCase();
    }

    // Auto-uppercase for other text fields
    if (id.includes('village') || id.includes('panchayat') || id.includes('postOffice') ||
        id.includes('block') || id.includes('policeStation') || id.includes('district') ||
        id.includes('state') || id.includes('nationality') || id.includes('languageKnown') ||
        id.includes('place') || id.includes('School') || id.includes('Board') || id.includes('Subjects')) {
      processedValue = value.toUpperCase();
    }

    // Numbers only
    if (['mobileNo','aadharNo','pinCode','wardNo','totalWard','accountNo'].includes(id)) {
      processedValue = value.replace(/\D/g, '');
    }

    // Marks % fields — numeric with one decimal allowed (0–100)
    if (['matricMarks','interMarks','gradMarks'].includes(id)) {
      // Allow digits and a single dot
      let val = value.replace(/[^\d.]/g, '');
      // Only one dot
      const parts = val.split('.');
      if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
      // Cap at 100
      if (parseFloat(val) > 100) val = '100';
      processedValue = val;
    }

    // IFSC — uppercase alphanumeric
    if (id === 'ifscCode') {
      processedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11);
    }

    // Year format
    if (id.includes('Year')) {
      processedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    // DOB auto-format DD/MM/YYYY — only used if text dob input is present; kept for safety
    if (id === 'dob') {
      let val = value.replace(/\D/g, '').slice(0, 8);
      if (val.length >= 6) processedValue = val.slice(0,2)+'/'+val.slice(2,4)+'/'+val.slice(4,8);
      else if (val.length >= 4) processedValue = val.slice(0,2)+'/'+val.slice(2,4)+'/'+val.slice(4);
      else if (val.length >= 2) processedValue = val.slice(0,2)+'/'+val.slice(2);
      else processedValue = val;
    }

    setFormData(prev => ({ ...prev, [id]: processedValue }));
    validateField(id, processedValue);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, photoFile: file }));
      setErrors(prev => ({ ...prev, photoFile: '' }));
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  // Handle date picker input (HTML5 date input)
  const handleDatePickerChange = (e) => {
    const dateValue = e.target.value; // Format: YYYY-MM-DD
    if (dateValue) {
      const [yyyy, mm, dd] = dateValue.split('-');
      const formattedDate = `${dd}/${mm}/${yyyy}`; // Convert to DD/MM/YYYY
      setFormData(prev => ({ ...prev, dob: formattedDate }));
      validateField('dob', formattedDate);
    } else {
      setFormData(prev => ({ ...prev, dob: '' }));
      validateField('dob', '');
    }
  };

  // Convert DD/MM/YYYY to YYYY-MM-DD for date picker
  const getDobForDatePicker = () => {
    if (formData.dob && formData.dob.includes('/')) {
      const [dd, mm, yyyy] = formData.dob.split('/');
      if (dd && mm && yyyy && yyyy.length === 4) {
        return `${yyyy}-${mm}-${dd}`;
      }
    }
    return '';
  };
  const validateForm = () => {
    const fieldsToCheck = [
      'fullName','fatherName','motherName','dob','mobileNo','email','aadharNo',
      'village','district','state','pinCode','ifscCode','accountNo',
      'matricYear','interYear','gradYear'
    ];
    let valid = true;
    fieldsToCheck.forEach(id => {
      if (!validateField(id, formData[id])) valid = false;
    });
    if (!formData.photoFile) {
      setErrors(prev => ({ ...prev, photoFile: 'Please upload your passport-size photo.' }));
      valid = false;
    }
    if (!selectedRole) {
      setErrors(prev => ({ ...prev, role: 'Please select a role.' }));
      valid = false;
    }
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      // Scroll to first error
      setTimeout(() => {
        const first = document.querySelector('.af-field-error');
        if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }

    setLoading(true);
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;

    try {
      // Create FormData object
      const formDataToSend = new FormData();
      
      // Add all form fields (but skip photoFile as we'll add it separately)
      Object.keys(formData).forEach(key => {
        if (key === 'photoFile') {
          // Skip photoFile, we'll add it separately if it exists
          return;
        }
        const value = formData[key];
        // Skip null/undefined, but include empty strings
        if (value !== null && value !== undefined) {
          formDataToSend.append(key, value);
        }
      });
      
      // Add file only if it exists
      if (formData.photoFile && formData.photoFile instanceof File) {
        formDataToSend.append('photoFile', formData.photoFile);
        console.log('📸 File added:', formData.photoFile.name);
      }
      
      // Add role and category
      let jobCategory = 'NGO'; // default
      
      if (selectedRole === 'general-job') {
        jobCategory = 'general';
        console.log('⚙️ Auto-set category to "general" because role is "general-job"');
      } else if (categoryParam === 'general') {
        jobCategory = 'general';
        console.log('⚙️ Using URL parameter category: "general"');
      }
      
      formDataToSend.append('roleApplied', jobRoles[selectedRole] || selectedRole);
      formDataToSend.append('jobCategory', jobCategory);

      console.log('📤 Sending form data to API...');
      console.log('👤 Role Applied:', jobRoles[selectedRole]);
      console.log('🏢 Job Category:', jobCategory);

      const response = await fetch(`${apiUrl}/api/application/submit`, {
        method: 'POST',
        body: formDataToSend
        // Don't set Content-Type header - browser will set it with correct boundary
      });

      // Log response details for debugging
      console.log('📥 Response status:', response.status);
      
      const data = await response.json();
      console.log('📥 Response data:', data);
      
      if (response.ok && data.success) {
        // Application saved successfully, now proceed to payment
        console.log('✅ Application saved with ID:', data.applicant.uniqueId);
        setApplicantId(data.applicant.uniqueId);
        
        // Get job fee based on selected role
        const jobFee = jobFees[selectedRole] || 0;
        console.log(`💰 Job Fee for ${selectedRole}:`, jobFee);
        setJobFee(jobFee);
        
        // Show payment step
        setShowPaymentStep(true);
        setLoading(false);
      } else {
        alert('Error: ' + (data.message || 'Failed to submit'));
        submitBtn.disabled = false;
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Submit Error:', error);
      alert('Error: ' + error.message);
      submitBtn.disabled = false;
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    console.log('✅ Payment successful for applicant:', applicantId);
    alert(`💳 Payment of ₹${jobFee} successful! Your application has been submitted.`);
    navigate('/');
  };

  const handlePaymentFailed = () => {
    console.log('❌ Payment failed for applicant:', applicantId);
    alert('Payment failed. Your application is saved as pending. Please try again later.');
    // Reset payment state to show form again
    setShowPaymentStep(false);
    setApplicantId(null);
    setJobFee(null);
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) submitBtn.disabled = false;
  };

  const handlePrint = () => {
    window.print();
  };

  // If payment step is active, show payment component (only if fee > 0)
  if (showPaymentStep && applicantId && jobFee && jobFee > 0) {
    return (
      <>
        <Navbar />
        <JobApplicationPayment
          jobRole={selectedRole}
          jobTitle={jobRoles[selectedRole] || selectedRole}
          jobFee={jobFee}
          applicantData={formData}
          photoFile={formData.photoFile}
          applicantId={applicantId}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentFailed={handlePaymentFailed}
        />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="form-wrapper">
        <div className="container-form" id="form-container">
          {/* Language Switch */}
          <div className="lang-switch">
            <label>
              <input type="radio" name="lang" value="en" checked={language === 'en'} onChange={() => setLanguage('en')} />
              English
            </label>
            <label>
              <input type="radio" name="lang" value="hi" checked={language === 'hi'} onChange={() => setLanguage('hi')} />
              हिंदी
            </label>
          </div>

          {/* Left Logo Container */}
          <div className="left-logo-container">
            <img src="/logo.jpeg" className="small-logo" alt="Logo" />
            <span className="small-logo-text">AAGAJ FOUNDATION</span>
          </div>

          {/* Photo Box */}
          <label className="photo-box photo-right" htmlFor="photoInput">
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span>{t.photo_label}</span>
            )}
            <input type="file" id="photoInput" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
          </label>
          {errors.photoFile && <div className="af-field-error af-photo-error">{errors.photoFile}</div>}

          {/* Header */}
          <div className="header">
            <h1 className="logo-text">{t.foundation_name}</h1>
            <p className="sub-header">{t.reg_text}</p>
            <p className="contact-info">
              GST No.10AAHTA9693GIZM <br />
              PAN No.AAHTA9693G <br />
              Email: aagajfoundationpaliganj@gmail.com
            </p>
          </div>

          {/* Instruction */}
          <div className="instruction">
            <span>{t.app_form}</span> <br />
            <span>{t.block_letters}</span>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Personal Details Table */}
            <table>
              <tbody>
                <tr>
                  <td className="label-col">{t.name_full}</td>
                  <td>
                    <input type="text" id="fullName" className={errors.fullName ? 'af-input-err' : ''} value={formData.fullName} onChange={handleInputChange} />
                    {errors.fullName && <div className="af-field-error">{errors.fullName}</div>}
                  </td>
                </tr>
                <tr>
                  <td className="label-col">{t.father_name}</td>
                  <td>
                    <input type="text" id="fatherName" className={errors.fatherName ? 'af-input-err' : ''} value={formData.fatherName} onChange={handleInputChange} />
                    {errors.fatherName && <div className="af-field-error">{errors.fatherName}</div>}
                  </td>
                </tr>
                <tr>
                  <td className="label-col">{t.mother_name}</td>
                  <td>
                    <input type="text" id="motherName" className={errors.motherName ? 'af-input-err' : ''} value={formData.motherName} onChange={handleInputChange} />
                    {errors.motherName && <div className="af-field-error">{errors.motherName}</div>}
                  </td>
                </tr>
                <tr>
                  <td className="label-col">{t.dob}</td>
                  <td>
                    <input
                      type="date"
                      id="dobPicker"
                      max={new Date().toISOString().split('T')[0]}
                      value={getDobForDatePicker()}
                      onChange={handleDatePickerChange}
                      className={errors.dob ? 'af-input-err' : ''}
                      style={{ padding: '5px', cursor: 'pointer' }}
                    />
                    {errors.dob && <div className="af-field-error">{errors.dob}</div>}
                  </td>
                </tr>
                <tr>
                  <td className="label-col">{t.mobile}</td>
                  <td>
                    <input type="text" id="mobileNo" maxLength="10" className={errors.mobileNo ? 'af-input-err' : ''} value={formData.mobileNo} onChange={handleInputChange} />
                    {errors.mobileNo && <div className="af-field-error">{errors.mobileNo}</div>}
                  </td>
                </tr>
                <tr>
                  <td className="label-col">{t.email}</td>
                  <td>
                    <input type="email" id="email" className={errors.email ? 'af-input-err' : ''} value={formData.email} onChange={handleInputChange} />
                    {errors.email && <div className="af-field-error">{errors.email}</div>}
                  </td>
                </tr>
                <tr>
                  <td className="label-col">{t.aadhar}</td>
                  <td>
                    <input type="text" id="aadharNo" maxLength="12" className={errors.aadharNo ? 'af-input-err' : ''} value={formData.aadharNo} onChange={handleInputChange} />
                    {errors.aadharNo && <div className="af-field-error">{errors.aadharNo}</div>}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Address Section */}
            <div className="address-section">
              <span>{t.perm_address}</span><br />
              <span>{t.village}</span>
              <input type="text" id="village" style={{ width: '180px' }} className={errors.village ? 'af-input-err' : ''} value={formData.village} onChange={handleInputChange} />
              {errors.village && <span className="af-field-error af-inline-error">{errors.village}</span>}
              <span>{t.panchayat}</span>
              <input type="text" id="panchayat" style={{ width: '180px' }} value={formData.panchayat} onChange={handleInputChange} />
              <span>{t.post}</span>
              <input type="text" id="postOffice" style={{ width: '180px' }} value={formData.postOffice} onChange={handleInputChange} /><br />
              
              <span>{t.block}</span>
              <input type="text" id="block" style={{ width: '150px' }} value={formData.block} onChange={handleInputChange} />
              <span>{t.police}</span>
              <input type="text" id="policeStation" style={{ width: '180px' }} value={formData.policeStation} onChange={handleInputChange} />
              <span>{t.dist}</span>
              <input type="text" id="district" style={{ width: '180px' }} className={errors.district ? 'af-input-err' : ''} value={formData.district} onChange={handleInputChange} />
              {errors.district && <span className="af-field-error af-inline-error">{errors.district}</span>}<br />
              
              <span>{t.state}</span>
              <input type="text" id="state" style={{ width: '150px' }} className={errors.state ? 'af-input-err' : ''} value={formData.state} onChange={handleInputChange} />
              {errors.state && <span className="af-field-error af-inline-error">{errors.state}</span>}
              <span>{t.pin}</span>
              <input type="text" id="pinCode" style={{ width: '100px' }} maxLength="6" className={errors.pinCode ? 'af-input-err' : ''} value={formData.pinCode} onChange={handleInputChange} />
              {errors.pinCode && <span className="af-field-error af-inline-error">{errors.pinCode}</span>}
              <span>{t.ward}</span>
              <input type="text" id="wardNo" style={{ width: '80px' }} value={formData.wardNo} onChange={handleInputChange} />
              <span>{t.total_ward}</span>
              <input type="text" id="totalWard" style={{ width: '80px' }} value={formData.totalWard} onChange={handleInputChange} /><br />
              
              <span>{t.nation}</span>
              <input type="text" id="nationality" style={{ width: '150px' }} value={formData.nationality} onChange={handleInputChange} />
              <span>{t.lang}</span>
              <input type="text" id="languageKnown" style={{ width: '350px' }} value={formData.languageKnown} onChange={handleInputChange} /><br />
              
              <span>{t.acc_no}</span>
              <input type="text" id="accountNo" style={{ width: '380px' }} className={errors.accountNo ? 'af-input-err' : ''} value={formData.accountNo} onChange={handleInputChange} />
              {errors.accountNo && <span className="af-field-error af-inline-error">{errors.accountNo}</span>}
              <span>{t.ifsc}</span>
              <input type="text" id="ifscCode" style={{ width: '150px' }} className={errors.ifscCode ? 'af-input-err' : ''} value={formData.ifscCode} onChange={handleInputChange} />
              {errors.ifscCode && <span className="af-field-error af-inline-error">{errors.ifscCode}</span>}<br />
              
              <span>{t.acc_holder}</span>
              <input type="text" id="accountHolderName" style={{ width: '250px' }} className={errors.accountHolderName ? 'af-input-err' : ''} value={formData.accountHolderName} onChange={handleInputChange} />
              {errors.accountHolderName && <span className="af-field-error af-inline-error">{errors.accountHolderName}</span>}
              <span>{t.bank}</span>
              <input type="text" id="bankName" style={{ width: '250px' }} value={formData.bankName} onChange={handleInputChange} />
            </div>

            {/* Qualification Table */}
            <p style={{ color: '#e31e24', fontWeight: 'bold', marginBottom: '5px' }}>{t.qualification}</p>
            <table className="qual-table">
              <thead>
                <tr>
                  <th style={{ width: '10%' }}>{t.exam_col}</th>
                  <th style={{ width: '25%' }}>{t.school_addr}</th>
                  <th>{t.pass_year}</th>
                  <th>{t.board}</th>
                  <th>{t.subjects}</th>
                  <th>{t.division}</th>
                  <th>{t.percent}</th>
                  <th>{t.remarks}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{t.matric}</td>
                  <td><input type="text" id="matricSchool" value={formData.matricSchool} onChange={handleInputChange} /></td>
                  <td><input type="text" id="matricYear" maxLength="4" placeholder="YYYY" className={errors.matricYear ? 'af-input-err' : ''} value={formData.matricYear} onChange={handleInputChange} />{errors.matricYear && <div className="af-field-error">{errors.matricYear}</div>}</td>
                  <td><input type="text" id="matricBoard" value={formData.matricBoard} onChange={handleInputChange} /></td>
                  <td><input type="text" id="matricSubjects" value={formData.matricSubjects} onChange={handleInputChange} /></td>
                  <td><input type="text" id="matricDiv" value={formData.matricDiv} onChange={handleInputChange} /></td>
                  <td><input type="text" id="matricMarks" maxLength="6" value={formData.matricMarks} onChange={handleInputChange} /></td>
                  <td><input type="text" id="matricRemarks" value={formData.matricRemarks} onChange={handleInputChange} /></td>
                </tr>
                <tr>
                  <td>{t.inter}</td>
                  <td><input type="text" id="interSchool" value={formData.interSchool} onChange={handleInputChange} /></td>
                  <td><input type="text" id="interYear" maxLength="4" placeholder="YYYY" className={errors.interYear ? 'af-input-err' : ''} value={formData.interYear} onChange={handleInputChange} />{errors.interYear && <div className="af-field-error">{errors.interYear}</div>}</td>
                  <td><input type="text" id="interBoard" value={formData.interBoard} onChange={handleInputChange} /></td>
                  <td><input type="text" id="interSubjects" value={formData.interSubjects} onChange={handleInputChange} /></td>
                  <td><input type="text" id="interDiv" value={formData.interDiv} onChange={handleInputChange} /></td>
                  <td><input type="text" id="interMarks" maxLength="6" value={formData.interMarks} onChange={handleInputChange} /></td>
                  <td><input type="text" id="interRemarks" value={formData.interRemarks} onChange={handleInputChange} /></td>
                </tr>
                <tr>
                  <td>{t.grad}</td>
                  <td><input type="text" id="gradSchool" value={formData.gradSchool} onChange={handleInputChange} /></td>
                  <td><input type="text" id="gradYear" maxLength="4" placeholder="YYYY" className={errors.gradYear ? 'af-input-err' : ''} value={formData.gradYear} onChange={handleInputChange} />{errors.gradYear && <div className="af-field-error">{errors.gradYear}</div>}</td>
                  <td><input type="text" id="gradBoard" value={formData.gradBoard} onChange={handleInputChange} /></td>
                  <td><input type="text" id="gradSubjects" value={formData.gradSubjects} onChange={handleInputChange} /></td>
                  <td><input type="text" id="gradDiv" value={formData.gradDiv} onChange={handleInputChange} /></td>
                  <td><input type="text" id="gradMarks" maxLength="6" value={formData.gradMarks} onChange={handleInputChange} /></td>
                  <td><input type="text" id="gradRemarks" value={formData.gradRemarks} onChange={handleInputChange} /></td>
                </tr>
              </tbody>
            </table>

            {/* Role Selection */}
            <div className="post-choice">
              <span>{t.choose_post}</span> <br />
              <select style={{border: 'none', borderBottom: '1px solid #000', fontWeight: 'bold', color: '#e31e24', width: '200px'}}
                value={selectedRole} onChange={(e) => { setSelectedRole(e.target.value); setErrors(prev => ({...prev, role: ''})); }}>
                <option value="">Select Role</option>
                <option value="panchayat">Panchayat Coordinator</option>
                <option value="block">Block Coordinator</option>
                <option value="district">District Coordinator</option>
                <option value="health">Health Supervisor</option>
                <option value="mitra">Mahila Mitra</option>
                <option value="trainer">Trainer</option>
                <option value="ngo">Other NGO Job</option>
                <option value="general-job">General Job Opportunity</option>
              </select>
              {errors.role && <div className="af-field-error">{errors.role}</div>}
              
              {/* Show selected role and job category */}
              {selectedRole && (
                <div style={{ 
                  marginTop: '10px', 
                  padding: '8px', 
                  background: '#f0f0f0', 
                  borderLeft: '4px solid #e31e24',
                  borderRadius: '3px'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#000080', marginBottom: '4px' }}>
                    ✅ Role: {jobRoles[selectedRole]}
                  </div>
                  <div style={{ fontSize: '11px', color: '#666' }}>
                    Category: {selectedRole === 'general-job' ? '🏢 General Job (Normal)' : '🏢 NGO'}
                  </div>
                </div>
              )}
            </div>

            {/* Declaration */}
            <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080', textAlign: 'center' }}>
              {t.declaration}
            </p>

            {/* Footer Signature Section */}
            <div className="footer-sig">
              <span>{t.sig_guardian}</span>
              <span>{t.place} <input type="text" id="place" style={{ width: '100px', borderBottom: '1px dotted #000080' }} value={formData.place} onChange={handleInputChange} /></span>
              <span>{t.date} <input type="date" id="date" style={{ width: '100px', borderBottom: '1px dotted #000080' }} value={formData.date} onChange={handleInputChange} /></span>
              <span>{t.sig_coord}</span>
            </div>

            {/* Note Text */}
            <div className="red-text" style={{ marginTop: '10px', fontSize: '11px', textAlign: 'justify' }}>
              {t.note_text}
            </div>

            {/* Helpline & Officer Signature */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '20px' }}>
              <span style={{ fontWeight: 'bold', color: '#000080' }}>{t.helpline} 06124065270, 8507355085</span>
              <span className="red-text" style={{ fontSize: '20px' }}>{t.sig_officer}</span>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button type="button" className="btn btn-print" onClick={handlePrint}>
                {t.btn_print}
              </button>
              <button type="submit" className="btn btn-submit" id="submitBtn" disabled={loading}>
                {loading ? 'Submitting...' : t.btn_submit}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ApplicationForm;
