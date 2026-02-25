// Backend/models/SwasthyaSurakshaProvider.js

const mongoose = require('mongoose');

const SwasthyaSurakshaProviderSchema = new mongoose.Schema({
  // --- UNIQUE ID ---
  uniqueId: {
    type: String,
    unique: true,
    trim: true
  },

  // --- BUSINESS INFORMATION ---
  businessCategory: {
    type: String,
    enum: ['Hospital', 'Lab', 'Pharmacy'],
    required: true
  },

  businessName: {
    type: String,
    required: true,
    trim: true
  },

  businessDetails: {
    type: String,
    trim: true
  },

  extraInfo: {
    type: String,
    trim: true
  },

  licenseNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  // --- LOCATION DETAILS ---
  address: {
    type: String,
    required: true
  },

  landmark: {
    type: String,
    trim: true
  },

  city: {
    type: String,
    required: true,
    trim: true
  },

  state: {
    type: String,
    required: true,
    trim: true
  },

  pincode: {
    type: String,
    required: true,
    trim: true
  },

  // --- CONTACT INFORMATION ---
  authorizedPersonName: {
    type: String,
    required: true,
    trim: true
  },

  whatsappNumber: {
    type: String,
    required: true,
    trim: true
  },

  // --- SERVICES OFFERED ---
  servicesOffered: [{
    type: String,
    trim: true
  }],

  // --- REGISTRATION STATUS ---
  registrationStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },

  // --- REGISTRATION TRACKING ---
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Applicant',
    default: null
  },

  registeredByName: {
    type: String,
    default: null
  },

  registrationNotes: {
    type: String,
    default: null
  },

  // --- TIMESTAMPS ---
  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SwasthyaSurakshaProvider', SwasthyaSurakshaProviderSchema);
