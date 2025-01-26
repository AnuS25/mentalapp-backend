const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  todoList: [
    {
      task: { type: String, required: true },
      completed: { type: Boolean, default: false },
    },
  ],
  morningRoutine: {
    meditation: { type: Boolean, default: false },
    breakfast: { type: Boolean, default: false },
    vitamins: { type: Boolean, default: false },
  },
  waterIntake: { type: Number, default: 0 },
  gratitude: { type: String, default: '' },
  sleepHours: { type: Number, default: 0 },
  productivity: { type: Number, default: 0 },
  mood: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Tracking', trackingSchema);
