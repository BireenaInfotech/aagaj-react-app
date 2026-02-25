// Backend/routes/swasthyasuraksha.js

const express = require('express');
const router = express.Router();
const SwasthyaSurakshaProvider = require('../models/SwasthyaSurakshaProvider');
const { Applicant, NormalApplicant } = require('../models/Applicant');
const { verifyAuth, authorizeRoles } = require('../middleware/auth');

// 🔐 PROTECTED: POST: Register a new health partner (Hospital/Lab/Pharmacy)
router.post('/register', verifyAuth, authorizeRoles(['employee', 'admin']), async (req, res) => {
  try {
    console.log('🚀 SWASTHYA SURAKSHA PROVIDER REGISTRATION STARTED');
    console.log('📋 Request body fields:', Object.keys(req.body));
    console.log('👤 User info:', { userId: req.user?.userId, email: req.user?.email });

    const {
      businessCategory,
      businessName,
      businessDetails,
      extraInfo,
      licenseNumber,
      address,
      landmark,
      city,
      state,
      pincode,
      authorizedPersonName,
      whatsappNumber,
      servicesOffered
    } = req.body;

    // Validate required fields
    if (!businessCategory || !businessName || !licenseNumber || !address || !city || !state || !pincode || !authorizedPersonName || !whatsappNumber) {
      console.log('❌ VALIDATION FAILED - Missing required fields');
      return res.status(400).json({ 
        success: false, 
        message: 'कृपया सभी आवश्यक फील्ड भरें' 
      });
    }

    // Check if provider with this license already exists
    console.log('🔍 Checking for duplicate license...');
    const existingProvider = await SwasthyaSurakshaProvider.findOne({ licenseNumber });
    if (existingProvider) {
      console.log('❌ License already exists:', licenseNumber);
      return res.status(400).json({ 
        success: false, 
        message: 'यह लाइसेंस नंबर पहले से रजिस्टर है' 
      });
    }

    console.log('✅ No duplicate license found');

    // Generate Unique ID (Format: 1000YY - Counter + Year Suffix)
    const date = new Date();
    const yearSuffix = date.getFullYear().toString().slice(-2); // e.g., "26" for 2026

    console.log('📊 Generating unique ID for year:', yearSuffix);

    const lastProvider = await SwasthyaSurakshaProvider.findOne({
      uniqueId: { $regex: `${yearSuffix}$` }
    }).sort({ _id: -1 });

    let counter = 1000;
    if (lastProvider && lastProvider.uniqueId) {
      const lastCounterStr = lastProvider.uniqueId.slice(0, -2);
      const lastCounter = parseInt(lastCounterStr);
      if (!isNaN(lastCounter)) {
        counter = lastCounter + 1;
      }
    }

    const newUniqueId = `${counter}${yearSuffix}`;
    console.log('✅ Generated Unique ID:', newUniqueId);

    // Create new provider document
    console.log('💾 Creating provider document...');
    console.log('👤 User Info:', { userId: req.user?.userId, email: req.user?.email, type: typeof req.user?.userId });
    const newProvider = new SwasthyaSurakshaProvider({
      uniqueId: newUniqueId,
      businessCategory,
      businessName,
      businessDetails,
      extraInfo,
      licenseNumber,
      address,
      landmark,
      city,
      state,
      pincode,
      authorizedPersonName,
      whatsappNumber,
      servicesOffered: Array.isArray(servicesOffered) ? servicesOffered : [],
      registeredBy: req.user.userId,
      registrationStatus: 'Approved',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('📝 Provider document to save:', {
      uniqueId: newProvider.uniqueId,
      registeredBy: newProvider.registeredBy,
      registeredByType: typeof newProvider.registeredBy
    });
    
    const savedProvider = await newProvider.save();
    console.log('✅ PROVIDER REGISTERED SUCCESSFULLY:', {
      _id: savedProvider._id,
      registeredBy: savedProvider.registeredBy,
      registeredByType: typeof savedProvider.registeredBy
    });

    res.status(201).json({
      success: true,
      message: 'पार्टनर रजिस्ट्रेशन सफल!',
      data: {
        providerId: savedProvider._id,
        uniqueId: savedProvider.uniqueId,
        businessName: savedProvider.businessName,
        registrationStatus: savedProvider.registrationStatus
      }
    });

  } catch (error) {
    console.error('❌ ERROR in provider registration:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'सर्वर त्रुटि', 
      error: error.message 
    });
  }
});

// GET: List all registered providers (Admin only)
router.get('/all', verifyAuth, authorizeRoles(['admin']), async (req, res) => {
  try {
    console.log('📊 Fetching all providers...');
    const providers = await SwasthyaSurakshaProvider.find()
      .sort({ createdAt: -1 })
      .lean();

    console.log(`✅ Found ${providers.length} providers`);
    console.log('📝 Provider registeredBy values:', providers.map(p => ({ id: p._id, registeredBy: p.registeredBy, type: typeof p.registeredBy })));

    // Extract registeredBy IDs को get करो - सभी को string में convert कर दो
    const registeredIds = Array.from(
      new Set(
        providers
          .map(item => {
            // registeredBy को string में convert करो अगर ObjectId है तो भी
            if (item.registeredBy) {
              const idStr = item.registeredBy.toString ? item.registeredBy.toString() : String(item.registeredBy);
              console.log(`🔄 Converting ${typeof item.registeredBy} to string: ${idStr}`);
              return idStr;
            }
            return null;
          })
          .filter(value => value !== null && value !== undefined && value.length === 24)
      )
    );

    console.log(`🔍 Found ${registeredIds.length} unique registered IDs:`, registeredIds);

    // Applicant collection से names निकालो
    let nameMap = {};
    if (registeredIds.length > 0) {
      console.log('🔎 Searching in Applicant collection for these IDs:', registeredIds);
      const applicants = await Applicant.find({ _id: { $in: registeredIds } })
        .select('fullName email emp_username _id')
        .lean();
      
      console.log(`🔎 Searching in NormalApplicant collection for these IDs:`, registeredIds);
      const normalApplicants = await NormalApplicant.find({ _id: { $in: registeredIds } })
        .select('fullName email emp_username _id')
        .lean();

      console.log(`📋 Found ${applicants.length} applicants:`, applicants.map(a => ({ _id: a._id.toString(), fullName: a.fullName, email: a.email, emp_username: a.emp_username })));
      console.log(`📋 Found ${normalApplicants.length} normal applicants:`, normalApplicants.map(a => ({ _id: a._id.toString(), fullName: a.fullName, email: a.email, emp_username: a.emp_username })));

      const combined = [...applicants, ...normalApplicants];
      nameMap = combined.reduce((acc, item) => {
        const name = item.fullName || item.emp_username || item.email || 'Employee';
        const idStr = item._id.toString();
        acc[idStr] = name;
        console.log(`✅ Mapped ${idStr} => ${name}`);
        return acc;
      }, {});

      console.log('✅ Final Name map:', nameMap);
    }

    // Add names to response
    const dataWithNames = providers.map(item => {
      const registeredByStr = item.registeredBy ? item.registeredBy.toString() : '';
      const resolvedName = nameMap[registeredByStr] || item.registeredByName || registeredByStr || 'Employee';
      console.log(`Provider ${item.uniqueId}: registeredBy=${registeredByStr}, resolved=${resolvedName}`);
      return {
        ...item,
        registeredByName: resolvedName
      };
    });

    console.log('✅ Response data prepared');

    res.json({
      success: true,
      count: dataWithNames.length,
      data: dataWithNames
    });
  } catch (error) {
    console.error('❌ Error fetching providers:', error);
    res.status(500).json({ 
      success: false, 
      message: 'डेटा प्राप्त करने में विफल' 
    });
  }
});

// GET: Single provider details
router.get('/:id', verifyAuth, async (req, res) => {
  try {
    const provider = await SwasthyaSurakshaProvider.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ 
        success: false, 
        message: 'प्रदाता नहीं मिला' 
      });
    }

    res.json({
      success: true,
      data: provider
    });
  } catch (error) {
    console.error('Error fetching provider:', error);
    res.status(500).json({ 
      success: false, 
      message: 'त्रुटि' 
    });
  }
});

// PUT: Update provider status (Admin only)
router.put('/:id/status', verifyAuth, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { registrationStatus, registrationNotes } = req.body;

    const provider = await SwasthyaSurakshaProvider.findByIdAndUpdate(
      req.params.id,
      { registrationStatus, registrationNotes },
      { new: true }
    );

    res.json({
      success: true,
      message: 'स्टेटस अपडेट किया गया',
      data: provider
    });
  } catch (error) {
    console.error('Error updating provider:', error);
    res.status(500).json({ 
      success: false, 
      message: 'स्टेटस अपडेट करने में विफल' 
    });
  }
});

// 🔓 PUBLIC: GET: List all approved partners for appointment booking
router.get('/partners/all-providers', async (req, res) => {
  try {
    const providers = await SwasthyaSurakshaProvider.find({ registrationStatus: 'Approved' })
      .select('_id businessName businessCategory address landmark city state pincode contact whatsappNumber servicesOffered')
      .lean();

    console.log(`✅ Found ${providers.length} approved providers`);

    // Transform data to match frontend expectations
    const transformedData = providers.map(provider => ({
      _id: provider._id,
      businessName: provider.businessName,
      category: provider.businessCategory, // Changed from businessCategory to category
      address: {
        full: provider.address,
        landmark: provider.landmark || '',
        city: provider.city,
        state: provider.state || '',
        pincode: provider.pincode
      },
      contact: {
        whatsappNumber: provider.whatsappNumber
      },
      services: provider.servicesOffered || []
    }));

    res.json({
      success: true,
      count: transformedData.length,
      data: transformedData
    });
  } catch (error) {
    console.error('Error fetching partners:', error);
    res.status(500).json({
      success: false,
      message: 'पार्टनर डेटा प्राप्त करने में विफल'
    });
  }
});

module.exports = router;
