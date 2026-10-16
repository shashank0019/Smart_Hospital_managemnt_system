const express = require('express');
const router = express.Router();
const Bed = require('../models/Bed');
const { auth, checkRole } = require('../middleware/auth');

// Get all beds (with statistics)
router.get('/', async (req, res) => {
  try {
    const { ward, status } = req.query;
    const filter = {};
    if (ward) filter.ward = ward;
    if (status) filter.status = status;

    const beds = await Bed.find(filter)
      .populate('patient', 'name email mobileNumber')
      .sort({ bedNumber: 1 });

    const total = await Bed.countDocuments();
    const available = await Bed.countDocuments({ status: 'Available' });
    const occupied = await Bed.countDocuments({ status: 'Occupied' });
    const maintenance = await Bed.countDocuments({ status: { $in: ['Maintenance', 'Cleaning'] } });

    res.json({
      stats: { total, available, occupied, maintenance },
      beds
    });
  } catch (error) {
    console.error('Error fetching beds:', error);
    res.status(500).json({ message: 'Error fetching hospital beds' });
  }
});

// Add new bed (management only)
router.post('/', auth, checkRole(['management']), async (req, res) => {
  try {
    const { bedNumber, ward, floor, dailyRate, notes } = req.body;
    const existing = await Bed.findOne({ bedNumber });
    if (existing) {
      return res.status(400).json({ message: `Bed number ${bedNumber} already exists` });
    }

    const bed = new Bed({
      bedNumber,
      ward,
      floor: floor || '1st Floor',
      dailyRate: dailyRate || 1500,
      notes,
      status: 'Available'
    });

    await bed.save();
    res.status(201).json(bed);
  } catch (error) {
    console.error('Error adding bed:', error);
    res.status(500).json({ message: 'Error adding bed', error: error.message });
  }
});

// Admit patient to bed (management or doctor)
router.put('/:id/admit', auth, checkRole(['management', 'doctor']), async (req, res) => {
  try {
    const { patientId, patientName, notes } = req.body;
    const bed = await Bed.findById(req.params.id);
    if (!bed) {
      return res.status(404).json({ message: 'Bed not found' });
    }

    bed.status = 'Occupied';
    bed.patient = patientId || undefined;
    bed.patientName = patientName || 'Admitted Patient';
    bed.admissionDate = new Date();
    if (notes) bed.notes = notes;

    await bed.save();
    res.json(bed);
  } catch (error) {
    console.error('Error admitting to bed:', error);
    res.status(500).json({ message: 'Error admitting patient to bed' });
  }
});

// Discharge patient from bed
router.put('/:id/discharge', auth, checkRole(['management', 'doctor']), async (req, res) => {
  try {
    const bed = await Bed.findById(req.params.id);
    if (!bed) {
      return res.status(404).json({ message: 'Bed not found' });
    }

    bed.status = 'Cleaning';
    bed.patient = undefined;
    bed.patientName = undefined;
    bed.admissionDate = undefined;

    await bed.save();
    res.json({ message: 'Patient discharged. Bed set to Cleaning mode.', bed });
  } catch (error) {
    console.error('Error discharging from bed:', error);
    res.status(500).json({ message: 'Error discharging patient' });
  }
});

// Update bed status (e.g. mark Available after cleaning, or Maintenance)
router.put('/:id/status', auth, checkRole(['management']), async (req, res) => {
  try {
    const { status } = req.body;
    const bed = await Bed.findById(req.params.id);
    if (!bed) {
      return res.status(404).json({ message: 'Bed not found' });
    }

    bed.status = status;
    await bed.save();
    res.json(bed);
  } catch (error) {
    res.status(500).json({ message: 'Error updating bed status' });
  }
});

// Delete bed (management only)
router.delete('/:id', auth, checkRole(['management']), async (req, res) => {
  try {
    await Bed.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bed deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting bed' });
  }
});

module.exports = router;
