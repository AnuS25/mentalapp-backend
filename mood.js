const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mood: { type: String, required: true }, // e.g., "Happy", "Sad", etc.
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Mood', moodSchema);
