const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  specialization: {
    type: String,
    required: true,
    trim: true
  },
  experience: {
    type: Number,
    required: true,
    min: 0
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    default: 'doctor'
  },
  consultationFee: {
    type: Number,
    default: 500
  },
  availableDays: {
    type: [String],
    default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  workingHours: {
    start: {
      type: String,
      default: '09:00'
    },
    end: {
      type: String,
      default: '17:00'
    }
  },
  slotDuration: {
    type: Number,
    default: 30 // minutes per slot
  },
  bio: {
    type: String,
    default: 'Dedicated healthcare professional providing compassionate patient care.'
  },
  roomNumber: {
    type: String,
    default: 'Room 101'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Doctor', doctorSchema);