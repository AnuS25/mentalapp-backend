// const mongoose = require('mongoose');

// const moodSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   mood: { type: String, required: true }, // e.g., "Happy", "Sad", etc.
//   date: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model('Mood', moodSchema);
const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
  // userId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'userinfo', // References the User model
  //   required: true,
  // },
  userEmail: {
    type: String,  // Store email directly
    required: true,
  },
  mood: {
    type: String,
    enum: ['😡', '😟', '😐', '😊', '😌'], // Restricts mood to predefined emojis
    required: true,
  },
  note: {
    type: String, // Optional note or journal entry
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically records when the mood was logged
  },
});

module.exports = mongoose.model('Mood', moodSchema);
