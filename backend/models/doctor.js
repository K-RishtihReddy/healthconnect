const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  slots: {
    type: [String], // Array of time slots, e.g., ['09:00', '10:00', '11:00']
    default: []
  }
});

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required']
  },
  experience: {
    type: Number,
    required: [true, 'Experience is required']
  },
  qualification: {
    type: String,
    required: [true, 'Qualification is required']
  },
  fees: {
    type: Number,
    required: [true, 'Consultation fees is required']
  },
  bio: {
    type: String,
    default: ''
  },
  availability: [availabilitySchema],
  isVerified: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 4.5
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Doctor', doctorSchema);
