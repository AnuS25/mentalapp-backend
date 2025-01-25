const mongoose = require('mongoose');

// Define the habit history schema
const habitHistorySchema = new mongoose.Schema({
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false, // Track if the habit was completed on that day
  },
  date: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model('HabitHistory', habitHistorySchema);
