const mongoose = require('mongoose');

// Define the habit schema
const habitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true, // To associate habit with a specific user
  },
  icon: {
    type: String,
    default: 'check', // Default icon can be changed to whatever user selects
  },
  frequency: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Habit', habitSchema);
