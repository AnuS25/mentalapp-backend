const mongoose = require("mongoose");

const userdetailschema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },  // Changed to String if you're using a string as userId, or you can leave _id and use it directly
    
    email: { type: String, required: true, unique: true },
    password: { type: String },
    phone: { type: String, required: true, unique: true },
    name: { type: String, default: '' },  // Default empty string for name
    bio: { type: String, default: '' },   // Default empty string for bio
    profession: { type: String, default: '' }, // Default empty string for profession
}, {
    collection: "userinfo"
});

// Create model from the schema
mongoose.model("userinfo", userdetailschema);
