const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema({
  bedNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  ward: {
    type: String,
    required: true,
    enum: ['ICU', 'General Ward', 'Emergency Care', 'Maternity', 'Pediatric', 'Surgical Ward']
  },
  floor: {
    type: String,
    default: '1st Floor'
  },
  status: {
    type: String,
    enum: ['Available', 'Occupied', 'Maintenance', 'Cleaning'],
    default: 'Available'
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  patientName: {
    type: String,
    trim: true
  },
  admissionDate: {
    type: Date
  },
  dailyRate: {
    type: Number,
    default: 1500
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Bed', bedSchema);
