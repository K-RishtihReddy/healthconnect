const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: '' // Can store a class name or icon identifier (e.g. 'Activity', 'Heart')
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);
