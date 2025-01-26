const mongoose = require("mongoose");

const journalSchema = new mongoose.Schema({
userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: "userinfo" // Reference to the "userinfo" collection
  }, 
   title: { type: String, required: [true, "Title is required"]  },
  content: { type: String, required: [true, "Content is required"] },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Journal", journalSchema);
