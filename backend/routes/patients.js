const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const User = require('../models/User');

// Get patient profile (protected route)
router.get('/profile', auth, checkRole(['patient']), async (req, res) => {
  try {
    const patient = await User.findById(req.user.id).select('-password');
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patient profile', error: error.message });
  }
});

// Update patient profile (protected route)
router.put('/profile', auth, checkRole(['patient']), async (req, res) => {
  try {
    const { name, mobileNumber, gender, age, bloodGroup } = req.body;
    const patient = await User.findById(req.user.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    if (name) patient.name = name;
    if (mobileNumber) patient.mobileNumber = mobileNumber;
    if (gender) patient.gender = gender;
    if (age) patient.age = age;
    if (bloodGroup) patient.bloodGroup = bloodGroup;

    await patient.save();

    const updated = patient.toObject();
    delete updated.password;
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating patient profile', error: error.message });
  }
});

// Example: Get all doctors (only for patients)
router.get('/doctors', auth, checkRole(['patient']), async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctors', error: error.message });
  }
});

module.exports = router;