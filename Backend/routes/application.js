// Backend/routes/application.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Applicant, NormalApplicant } = require('../models/Applicant');
const { uploadBufferToCloudinary } = require('../config/cloudinary');

// Multer — memory storage (buffer sent to Cloudinary, not saved to disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// ✅ SUBMIT APPLICATION ROUTE - Handle optional file upload
router.post('/submit', (req, res, next) => {
  // Try to upload file if present, but don't fail if not
  upload.single('photoFile')(req, res, (err) => {
    if (err) {
      console.warn('⚠️  Multer warning:', err.message);
      // Don't return error, continue processing
    }
    console.log('✅ Multer processing complete');
    next();
  });
}, async (req, res) => {
  try {
    console.log('📨 Received submission request');
    console.log('📋 Body fields:', Object.keys(req.body).slice(0, 5), '...');
    console.log('📁 File received:', req.file ? `Yes (${req.file.originalname})` : 'No');

    const {
      fullName, fatherName, motherName, dob, mobileNo, email, aadharNo,
      village, panchayat, postOffice, block, policeStation, district, state, pinCode,
      wardNo, totalWard, nationality, languageKnown, accountNo, ifscCode,
      accountHolderName, bankName, place, date,
      matricSchool, matricYear, matricBoard, matricSubjects, matricDiv, matricMarks, matricRemarks,
      interSchool, interYear, interBoard, interSubjects, interDiv, interMarks, interRemarks,
      gradSchool, gradYear, gradBoard, gradSubjects, gradDiv, gradMarks, gradRemarks,
      roleApplied, jobCategory
    } = req.body;

    // ===== Backend Validation =====
    const MOBILE_RE  = /^[6-9]\d{9}$/;
    const EMAIL_RE   = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const AADHAR_RE  = /^\d{12}$/;
    const PIN_RE     = /^\d{6}$/;
    const DOB_RE     = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(19|20)\d{2}$/;
    const IFSC_RE    = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    const ACCNO_RE   = /^\d{9,18}$/;
    const YEAR_RE    = /^(19|20)\d{2}$/;
    const NAME_RE    = /^[a-zA-Z\s]+$/;

    const validationErrors = [];

    if (!fullName?.trim()) validationErrors.push('Full name is required.');
    else if (!NAME_RE.test(fullName.trim())) validationErrors.push('Full name must contain letters only.');

    if (!fatherName?.trim()) validationErrors.push('Father / Husband name is required.');
    else if (!NAME_RE.test(fatherName.trim())) validationErrors.push('Father name must contain letters only.');

    if (motherName && !NAME_RE.test(motherName.trim())) validationErrors.push('Mother name must contain letters only.');

    if (!dob?.trim()) validationErrors.push('Date of birth is required.');
    else if (!DOB_RE.test(dob.trim())) validationErrors.push('Date of birth must be in DD/MM/YYYY format.');
    else {
      const [dd, mm, yyyy] = dob.split('/');
      if (new Date(`${yyyy}-${mm}-${dd}`) > new Date()) validationErrors.push('Date of birth cannot be a future date.');
    }

    if (!mobileNo?.trim()) validationErrors.push('Mobile number is required.');
    else if (!MOBILE_RE.test(mobileNo.trim())) validationErrors.push('Mobile must be 10 digits starting with 6–9.');

    if (!email?.trim()) validationErrors.push('Email is required.');
    else if (!EMAIL_RE.test(email.trim())) validationErrors.push('Enter a valid email address.');

    if (!aadharNo?.trim()) validationErrors.push('Aadhar number is required.');
    else if (!AADHAR_RE.test(aadharNo.trim())) validationErrors.push('Aadhar must be exactly 12 digits.');

    if (!village?.trim()) validationErrors.push('Village is required.');
    if (!district?.trim()) validationErrors.push('District is required.');
    if (!state?.trim()) validationErrors.push('State is required.');

    if (pinCode && !PIN_RE.test(pinCode.trim())) validationErrors.push('Pin Code must be exactly 6 digits.');
    if (ifscCode && !IFSC_RE.test(ifscCode.trim().toUpperCase())) validationErrors.push('Invalid IFSC code format (e.g. SBIN0001234).');
    if (accountNo && !ACCNO_RE.test(accountNo.trim())) validationErrors.push('Account number must be 9–18 digits.');
    if (matricYear && !YEAR_RE.test(matricYear.trim())) validationErrors.push('Matric year must be a valid 4-digit year.');
    if (interYear && !YEAR_RE.test(interYear.trim())) validationErrors.push('Inter year must be a valid 4-digit year.');
    if (gradYear && !YEAR_RE.test(gradYear.trim())) validationErrors.push('Graduation year must be a valid 4-digit year.');

    if (validationErrors.length > 0) {
      console.log('❌ Validation errors:', validationErrors);
      return res.status(400).json({ success: false, message: validationErrors[0], errors: validationErrors });
    }
    // ===== End Validation =====

    // Upload photo to Cloudinary if provided
    let photoPath = null;
    if (req.file && req.file.buffer) {
      try {
        const publicId = `agaz_applicant_${Date.now()}`;
        photoPath = await uploadBufferToCloudinary(req.file.buffer, 'agaz/applications', publicId);
        console.log('☁️  Photo uploaded to Cloudinary:', photoPath);
      } catch (cloudErr) {
        console.error('❌ Cloudinary upload error:', cloudErr.message);
        // Non-blocking — proceed without photo rather than failing the whole submission
        photoPath = null;
      }
    } else {
      console.log('📸 No photo provided');
    }

    // Create qualification object
    const qualifications = {
      matric: {
        school: matricSchool,
        year: matricYear,
        board: matricBoard,
        subject: matricSubjects,
        division: matricDiv,
        marks: matricMarks,
        remarks: matricRemarks
      },
      inter: {
        school: interSchool,
        year: interYear,
        board: interBoard,
        subject: interSubjects,
        division: interDiv,
        marks: interMarks,
        remarks: interRemarks
      },
      grad: {
        school: gradSchool,
        year: gradYear,
        board: gradBoard,
        subject: gradSubjects,
        division: gradDiv,
        marks: gradMarks,
        remarks: gradRemarks
      }
    };

    // Generate unique ID
    const uniqueId = 'APP-' + Date.now();

    // Create applicant object
    const applicantData = {
      uniqueId,
      fullName: fullName.toUpperCase(),
      fatherName: fatherName?.toUpperCase() || '',
      motherName: motherName?.toUpperCase() || '',
      email,
      mobile: mobileNo,
      dob,
      aadhar: aadharNo,
      village: village?.toUpperCase() || '',
      panchayat: panchayat?.toUpperCase() || '',
      postOffice: postOffice?.toUpperCase() || '',
      block: block?.toUpperCase() || '',
      policeStation: policeStation?.toUpperCase() || '',
      district: district?.toUpperCase() || '',
      state: state?.toUpperCase() || '',
      pinCode,
      wardNo,
      totalWard,
      nationality: nationality?.toUpperCase() || '',
      languageKnown: languageKnown?.toUpperCase() || '',
      accountNo,
      ifscCode,
      accountHolderName: accountHolderName?.toUpperCase() || '',
      bankName: bankName?.toUpperCase() || '',
      photoPath,
      roleApplied,
      job_category: jobCategory || 'NGO',
      qualifications,
      date: new Date(),
      applicationPdf: null // Will be updated if PDF generation is needed
    };

    // Save to appropriate collection based on category
    let applicant;
    const finalCategory = (jobCategory || 'NGO').toLowerCase();
    console.log('🔍 Category Check:', { received: jobCategory, normalized: finalCategory });

    if (finalCategory === 'general' || finalCategory === 'normal') {
      console.log('📁 Using NormalApplicant collection');
      applicant = new NormalApplicant(applicantData);
    } else {
      console.log('📁 Using Applicant (NGO) collection');
      applicant = new Applicant(applicantData);
    }

    try {
      await applicant.save();
      console.log('✅ Application saved successfully to', 
        (finalCategory === 'general' || finalCategory === 'normal') ? 'NormalApplicant' : 'Applicant', 
        'collection');
      console.log('   UniqueId:', applicant.uniqueId, '| MongoDB ID:', applicant._id);
    } catch (saveError) {
      console.error('❌ Database Save Error:', saveError.message);
      throw saveError;
    }

    res.json({
      success: true,
      message: 'Application submitted successfully!',
      applicant: {
        id: applicant._id,
        uniqueId: applicant.uniqueId,
        fullName: applicant.fullName,
        email: applicant.email,
        roleApplied: applicant.roleApplied
      }
    });

  } catch (error) {
    console.error('❌ Application Submit Error:', error.message);
    console.error('   Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error submitting application: ' + error.message,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ✅ GET APPLICATION BY ID
router.get('/:id', async (req, res) => {
  try {
    const applicant = await Applicant.findById(req.params.id);
    if (!applicant) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    res.json({ success: true, applicant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ GET ALL APPLICATIONS (Paginated)
router.get('/', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const skip = (page - 1) * limit;

    const applications = await Applicant.find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Applicant.countDocuments();

    res.json({
      success: true,
      applications,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ UPDATE APPLICATION
router.put('/:id', async (req, res) => {
  try {
    const applicant = await Applicant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ success: true, applicant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ DELETE APPLICATION
router.delete('/:id', async (req, res) => {
  try {
    await Applicant.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Application deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
module.exports = router;