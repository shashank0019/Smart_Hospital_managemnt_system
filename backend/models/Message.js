const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  room: {
    type: String,
    required: true,
    index: true
  },
  sender: {
    type: String,
    required: true,
    trim: true
  },
  senderRole: {
    type: String,
    enum: ['patient', 'doctor', 'guest', 'management'],
    default: 'patient'
  },
  senderEmail: {
    type: String,
    trim: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);
