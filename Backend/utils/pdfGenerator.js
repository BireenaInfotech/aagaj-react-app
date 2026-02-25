// Backend/utils/pdfGenerator.js
// PDF generation utility

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate PDF for employee application
 * @param {Object} applicant - Applicant data
 * @param {String} filename - Output filename
 */
const generateApplicationPDF = (applicant, filename) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 30, size: 'A4' });
            const filePath = path.join(__dirname, '../../uploads', filename);
            const stream = fs.createWriteStream(filePath);
            
            doc.pipe(stream);

            // Header
            doc.fontSize(22).font('Helvetica-Bold').text('AGAZ FOUNDATION', { align: 'center', underline: true });
            doc.fontSize(10).font('Helvetica').text('Registered Under Indian Trust Act 1882', { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(16).text('EMPLOYEE APPLICATION FORM', { align: 'center' });
            doc.moveDown(1);

            // Photo
            if (applicant.photoPath) {
                try {
                    const relativePath = applicant.photoPath.startsWith('/') ? applicant.photoPath.substring(1) : applicant.photoPath;
                    const imagePath = path.join(__dirname, '../../', relativePath);
                    if (fs.existsSync(imagePath)) {
                        doc.image(imagePath, 450, 100, { width: 100, height: 120 });
                    }
                } catch(e) { 
                    console.log("⚠️ PDF Photo Error:", e.message); 
                }
            }

            // Personal Details
            doc.fontSize(14).font('Helvetica-Bold').text('Personal Information', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(12).font('Helvetica');
            
            const details = [
                { label: 'Application ID', value: `AF-${applicant.uniqueId}` },
                { label: 'Applied Post', value: applicant.roleApplied },
                { label: 'Full Name', value: applicant.fullName },
                { label: 'Mobile No', value: applicant.mobile },
                { label: 'Email ID', value: applicant.email },
                { label: 'Date of Birth', value: applicant.dob },
                { label: 'District', value: applicant.district },
                { label: 'State', value: applicant.state },
                { label: 'Aadhar No', value: applicant.aadhar || 'N/A' }
            ];

            details.forEach(detail => {
                doc.text(`${detail.label}: ${detail.value}`);
            });

            doc.moveDown(1);
            doc.text('Generated on: ' + new Date().toLocaleDateString('en-IN'), { fontSize: 10 });

            doc.end();

            stream.on('finish', () => {
                resolve(filePath);
            });

            stream.on('error', (err) => {
                reject(err);
            });
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    generateApplicationPDF
};
