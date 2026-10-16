const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const { auth, checkRole } = require('../middleware/auth');

// Get current patient's reports
router.get('/my-reports', auth, async (req, res) => {
  try {
    const reports = await Report.find({ patient: req.user.id })
      .populate('doctor', 'name specialization')
      .populate('appointment', 'reason date')
      .sort({ testDate: -1 });
    res.json(reports);
  } catch (error) {
    console.error('Error fetching patient reports:', error);
    res.status(500).json({ message: 'Error fetching lab reports' });
  }
});

// Get reports for a specific patient (doctor or management view)
router.get('/patient/:patientId', auth, async (req, res) => {
  try {
    const reports = await Report.find({ patient: req.params.patientId })
      .populate('doctor', 'name specialization')
      .populate('appointment', 'reason date')
      .sort({ testDate: -1 });
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports for patient:', error);
    res.status(500).json({ message: 'Error fetching patient lab reports' });
  }
});

// Create new report
router.post('/', auth, async (req, res) => {
  try {
    const { patientId, appointmentId, title, category, testDate, resultsSummary, status, notes, fileData, fileName } = req.body;

    const targetPatientId = req.user.role === 'patient' ? req.user.id : (patientId || req.user.id);

    const report = new Report({
      patient: targetPatientId,
      doctor: req.user.role === 'doctor' ? req.user.id : undefined,
      appointment: appointmentId || undefined,
      title,
      category: category || 'General',
      testDate: testDate ? new Date(testDate) : new Date(),
      resultsSummary,
      status: status || 'Normal',
      notes,
      fileData,
      fileName
    });

    await report.save();
    res.status(201).json(report);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ message: 'Error creating lab report', error: error.message });
  }
});

// Delete report
router.delete('/:id', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const isOwner = report.patient.toString() === req.user.id.toString();
    const isStaff = req.user.role === 'doctor' || req.user.role === 'management';

    if (!isOwner && !isStaff) {
      return res.status(403).json({ message: 'Not authorized to delete this report' });
    }

    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ message: 'Error deleting lab report' });
  }
});

module.exports = router;
