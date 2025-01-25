const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  completed: { type: Boolean, default: false },
  userEmail: { type: String, required: true },  // Store user email to associate habits with users
  createdAt: { type: Date, default: Date.now }
});

const Habit = mongoose.model('Habit', habitSchema);

module.exports = Habit;
