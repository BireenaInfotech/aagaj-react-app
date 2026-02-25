// Backend/routes/appointment.js

const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const multer = require('multer');

// ✅ Import Auth Middleware
const { verifyAuth, optionalAuth } = require('../middleware/auth');

// ✅ मेमोरी स्टोरेज सेटअप (फाइल फोल्डर में नहीं जाएगी)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB Limit
});

// 🔐 PROTECTED: Route: Register & Upload to DB
router.post('/book', async (req, res) => {
    try {
        const { 
            name, gender, age, aadhar, phone, bloodGroup, 
            healthId, street, city, pin, department, doctor, date, message, providerType 
        } = req.body;

        // Check if appointment already exists for this date
        const existingAppointment = await Appointment.findOne({
            aadhar: aadhar,
            date: date,
            doctor: doctor
        });

        if (existingAppointment) {
            return res.status(400).json({ 
                success: false, 
                message: "You already have an appointment on this date at this facility" 
            });
        }

        const newAppointment = new Appointment({
            name, 
            gender, 
            age, 
            aadhar, 
            phone, 
            bloodGroup,
            healthId, 
            street, 
            city, 
            pincode: pin,
            department, 
            doctor, 
            date, 
            message,
            providerType: providerType || 'Hospital',
            appointmentStatus: 'Confirmed'
        });

        // ✅ फाइल को डेटाबेस बफर में डालना (अगर अपलोड होती है)
        if (req.file) {
            newAppointment.healthCardData = req.file.buffer;
            newAppointment.healthCardContentType = req.file.mimetype;
            newAppointment.healthCardFileName = req.file.originalname;
        }

        await newAppointment.save();
        
        console.log('');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('✅ APPOINTMENT BOOKED SUCCESSFULLY');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('👤 Patient:', name);
        console.log('🏥 Facility:', doctor);
        console.log('📅 Date:', date);
        console.log('🔗 Facility Type:', providerType);
        console.log('═══════════════════════════════════════════════════════════');
        console.log('');

        res.status(200).json({ 
            success: true, 
            message: "Appointment Booked Successfully!",
            data: newAppointment
        });

    } catch (error) {
        console.error("❌ Booking Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Booking Error: " + error.message 
        });
    }
});

// 🟢 PUBLIC: Route: फाइल देखने के लिए (ID के ज़रिये डेटाबेस से फाइल निकालना)
router.get('/view-card/:id', optionalAuth, async (req, res) => {
    try {
        const patient = await Appointment.findById(req.params.id);
        if (!patient || !patient.healthCardData) return res.status(404).send("No file found");

        res.set('Content-Type', patient.healthCardContentType);
        res.send(patient.healthCardData);
    } catch (e) { res.status(500).send(e.message); }
});

// ✅ Route: Get All Appointments (For Admin Dashboard)
router.get('/all', async (req, res) => {
    try {
        const appointments = await Appointment.find().sort({ createdAt: -1 });
        res.json({ success: true, data: appointments });
    } catch (error) {
        console.error("Fetch Appointments Error:", error);
        res.status(500).json({ success: false, message: "Error fetching appointments" });
    }
});

// 🔐 Route: Update Appointment Status (Admin)
router.put('/:id/status', async (req, res) => {
    try {
        const { appointmentStatus } = req.body;

        // Validate status
        const validStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
        if (!validStatuses.includes(appointmentStatus)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid status" 
            });
        }

        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { appointmentStatus: appointmentStatus },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ 
                success: false, 
                message: "Appointment not found" 
            });
        }

        console.log(`✅ Appointment ${req.params.id} status updated to ${appointmentStatus}`);

        res.json({ 
            success: true, 
            message: "Status updated successfully",
            data: appointment
        });
    } catch (error) {
        console.error("Update Status Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error updating appointment status" 
        });
    }
});

module.exports = router;
