const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Blood Test', 'Radiology / X-Ray', 'Pathology', 'Cardiology / ECG', 'General', 'Urine Analysis'],
    default: 'General'
  },
  testDate: {
    type: Date,
    default: Date.now
  },
  resultsSummary: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Normal', 'Abnormal', 'Pending Review', 'Critical'],
    default: 'Normal'
  },
  notes: {
    type: String,
    trim: true
  },
  fileData: {
    type: String // base64 or URL data
  },
  fileName: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);
