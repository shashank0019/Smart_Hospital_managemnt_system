const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { auth, checkRole } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const { sendWelcomeEmail } = require('../utils/emailService');

// Get doctor profile
router.get('/profile', auth, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id).select('-password');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    res.status(500).json({ message: 'Error fetching doctor profile' });
  }
});

// Update doctor profile (schedule, fees, room, bio)
router.put('/profile', auth, checkRole(['doctor']), async (req, res) => {
  try {
    const { consultationFee, availableDays, workingHours, slotDuration, bio, roomNumber, contactNumber } = req.body;
    const doctor = await Doctor.findById(req.user.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    if (consultationFee !== undefined) doctor.consultationFee = consultationFee;
    if (availableDays) doctor.availableDays = availableDays;
    if (workingHours) doctor.workingHours = workingHours;
    if (slotDuration) doctor.slotDuration = slotDuration;
    if (bio) doctor.bio = bio;
    if (roomNumber) doctor.roomNumber = roomNumber;
    if (contactNumber) doctor.contactNumber = contactNumber;

    await doctor.save();
    const updated = doctor.toObject();
    delete updated.password;
    res.json(updated);
  } catch (error) {
    console.error('Error updating doctor profile:', error);
    res.status(500).json({ message: 'Error updating doctor profile' });
  }
});

// Get available slots for a doctor on a specific date
router.get('/:id/available-slots', async (req, res) => {
  try {
    const doctorId = req.params.id;
    const dateQuery = req.query.date; // YYYY-MM-DD
    if (!dateQuery) {
      return res.status(400).json({ message: 'Date query parameter is required (YYYY-MM-DD)' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Determine day of week
    const targetDate = new Date(dateQuery);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[targetDate.getDay()];

    const isAvailableDay = (doctor.availableDays || []).includes(dayName);
    if (!isAvailableDay) {
      return res.json({
        available: false,
        dayName,
        message: `Dr. ${doctor.name} does not have scheduled hours on ${dayName}s.`,
        slots: []
      });
    }

    // Generate intervals
    const startTimeStr = doctor.workingHours?.start || '09:00';
    const endTimeStr = doctor.workingHours?.end || '17:00';
    const duration = doctor.slotDuration || 30; // in minutes

    const [startH, startM] = startTimeStr.split(':').map(Number);
    const [endH, endM] = endTimeStr.split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    // Fetch existing appointments for doctor on target date
    const dayStart = new Date(dateQuery);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dateQuery);
    dayEnd.setHours(23, 59, 59, 999);

    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: dayStart, $lte: dayEnd },
      status: { $ne: 'REJECTED' }
    });

    const bookedTimes = new Set();
    bookedAppointments.forEach(app => {
      const d = new Date(app.date);
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      bookedTimes.add(`${h}:${m}`);
    });

    const slots = [];
    for (let m = startMinutes; m < endMinutes; m += duration) {
      const slotHour = String(Math.floor(m / 60)).padStart(2, '0');
      const slotMin = String(m % 60).padStart(2, '0');
      const timeStr = `${slotHour}:${slotMin}`;
      const isBooked = bookedTimes.has(timeStr);
      slots.push({
        time: timeStr,
        isBooked,
        label: `${timeStr}`
      });
    }

    res.json({
      available: true,
      dayName,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        specialization: doctor.specialization,
        consultationFee: doctor.consultationFee
      },
      slots
    });
  } catch (error) {
    console.error('Error calculating slots:', error);
    res.status(500).json({ message: 'Error calculating slots' });
  }
});

// Get all doctors (protected route - accessible by management)
router.get('/', auth, checkRole(['management']), async (req, res) => {
  try {
    const doctors = await Doctor.find().select('-password').sort({ createdAt: -1 });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new doctor (protected route - accessible by management)
router.post('/', auth, checkRole(['management']), async (req, res) => {
  try {
    const { name, email, password, specialization, experience, contactNumber, consultationFee, roomNumber } = req.body;

    let doctorExists = await Doctor.findOne({ email });
    let userExists = await User.findOne({ email });
    if (doctorExists || userExists) {
      return res.status(400).json({ message: 'Doctor with this email already exists' });
    }

    const user = new User({
      name,
      email,
      password,
      mobileNumber: contactNumber,
      gender: 'Prefer not to say',
      age: 35,
      bloodGroup: 'Unknown',
      role: 'doctor',
      specialization
    });
    await user.save();

    const doctor = new Doctor({
      name,
      email,
      password: user.password,
      specialization,
      experience: experience || 5,
      contactNumber,
      role: 'doctor',
      consultationFee: consultationFee || 500,
      roomNumber: roomNumber || 'Consultation Room 1'
    });

    await doctor.save();
    await sendWelcomeEmail(email, name, email, password);

    const doctorResponse = doctor.toObject();
    delete doctorResponse.password;

    res.status(201).json(doctorResponse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete doctor (protected route - accessible by management)
router.delete('/:id', auth, checkRole(['management']), async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    await Doctor.findByIdAndDelete(req.params.id);
    await User.findOneAndDelete({ email: doctor.email });
    res.json({ message: 'Doctor removed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Public: Get all emergency/trauma doctors (no auth required)
router.get('/emergency', async (req, res) => {
  try {
    const doctors = await Doctor.find({
      $or: [
        { specialization: { $regex: /(emergency|trauma|general|cardio)/i } },
        { email: { $in: ['veereshasinganal@gmail.com', 'v633993@gmail.com'] } }
      ]
    }).select('name email specialization contactNumber consultationFee roomNumber');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;