// Backend/models/Applicant.js

const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
    // Identification
    uniqueId: { type: String, unique: true },
    
    // Personal Details
    fullName: String,
    fatherName: String,
    motherName: String,
    dob: String,
    email: String,
    mobile: String,
    aadhar: String,
    
    // Address Details
    village: String,
    panchayat: String,
    postOffice: String,
    block: String,
    policeStation: String,
    district: String,
    state: String,
    pinCode: String,
    wardNo: String,
    totalWard: String,
    
    // Additional Info
    nationality: String,
    languageKnown: String,
    
    // Banking Details
    accountNo: String,
    ifscCode: String,
    accountHolderName: String,
    bankName: String,
    
    // Education & Qualification
    qualifications: { type: mongoose.Schema.Types.Mixed },
    
    // Application Details
    roleApplied: String,
    job_category: String,
    photoPath: String,
    applicationPdf: String,
    
    // Financial/Payment
    paymentId: String,
    amount: Number,
    paymentStatus: { type: String, enum: ['Pending', 'Success', 'Failed'], default: 'Pending' },
    paymentMethod: { type: String, default: 'Getepay' },
    gatewayResponse: mongoose.Schema.Types.Mixed, // Store complete GetePay response
    getepayTransactionId: String,
    
    // Employee Assignment (for hiring)
    emp_username: { type: String, default: null },
    emp_password: { type: String, default: null },
    emp_password_plain: { type: String, default: null },
    
    // Timestamps
    date: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Applicant = mongoose.model('Applicant', applicantSchema);
const NormalApplicant = mongoose.model('NormalApplicant', applicantSchema);

module.exports = { Applicant, NormalApplicant };
