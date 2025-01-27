const express = require("express");
const app = express();
const mongoose = require("mongoose");
app.use(express.json());
const cors = require("cors");
app.use(cors());
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");  // Keep this import here at the top
require("./mood");
const Mood = mongoose.model("Mood");
const Menu = require('./menu');
const { createHabit, getHabits, trackHabitCompletion, getHabitStats } = require('./controller/habitcontroller');  // Import controller
const Habit = require('./habits');

// MongoDB connection string
const mongourl = "mongodb+srv://database1:anisha25mongo@cluster0.8djrk.mongodb.net/mental-health";
const JWT_SECRET = "abcdefgh[12345][6789]<>ijkl;/mnopqrstu";
require("./userdetails");
const user = mongoose.model("userinfo");


mongoose.connect(mongourl)
  .then(() => console.log("Database Connected"))
  .catch((e) => console.log(e));
// Email validation regex
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

// Phone number validation regex (10 digits, only numbers)
const phoneRegex = /^[0-9]{10}$/;

app.get("/", (req, res) => {
  res.send({ status: "Started" });
});

// Token verification middleware
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // "Bearer token"
  if (!token) {
    return res.status(403).json({ error: 'No token provided' });
  }
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.userEmail = decoded.email;  // Set user ID from the decoded token
    next();
  });
};
// Track user activity middleware
const trackActivity = (req, res, next) => {
  const userEmail = req.user.email; // Now it's guaranteed to be set by `verifyToken`

  if (userEmail) {
    const activity = `${userEmail} performed ${req.method} ${req.originalUrl}`;
    logUserActivity(activity);
  }

  next();
};

app.use(verifyToken); // First verify token
app.use(trackActivity); // Then log the activity

app.post("/signup", async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name) {
    return res.status(400).send({ status: "error", message: "Name is required" });
  }
  // Validate email format
  if (!email || !emailRegex.test(email)) {
    return res.status(400).send({ status: "error", message: "Invalid email format" });
  }

  // Validate phone number (should be 10 digits)
  if (!phone || !phoneRegex.test(phone)) {
    return res.status(400).send({ status: "error", message: "Phone number must be 10 digits" });
  }

  // Validate password (ensure it is not empty)
  if (!password) {
    return res.status(400).send({ status: "error", message: "Password is required" });
  }

  try {
    // Check if user already exists
    const olduser = await user.findOne({ email: email });
    if (olduser) {
      return res.status(400).send({ status: "error", message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user in the database
    await user.create({
      name: name,
      email: email,
      password: hashedPassword,
      phone: phone,
    });

    res.send({ status: "ok", message: "User created successfully" });

  } catch (error) {
    res.status(500).send({ status: "error", message: "Error creating user", error: error.message });
  }
});



app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const olduser = await user.findOne({ email: email });
  console.log("Retrieved user:", olduser);

  if (!olduser) {
    return res.status(400).send({ status: "error", message: "User doesn't exist" });
  }

  if (!olduser.password) {
    return res.status(400).send({ status: "error", message: "Password not set for user" });
  }

  try {
    // Compare entered password with hashed password
    if (await bcrypt.compare(password, olduser.password)) {
      const token = jwt.sign({ email: olduser.email }, JWT_SECRET);
      return res.send({ status: "ok", data: token });
    } else {
      return res.status(400).send({ status: "error", message: "Invalid password" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: "error", message: "Error comparing passwords", error: error.message });
  }
});

// Usage example in a protected route
// app.get("/profile", verifyToken,  async(req, res) => {
//   const userId = req.user.userId;  // Access the userId from the decoded token
//   //res.send({ message: `User profile of ID ${userId}` });
//    try {
//     // Fetch the user from the database using the userId
//     const userDetails = await user.findById(userId);

//     if (!userDetails) {
//       return res.status(404).send({ status: "error", message: "User not found" });
//     }

//     // Send the user details back as response (you can include other details as well)
//     res.send({
//       status: "ok",
//       message: "User profile fetched successfully",
//       user: {
//         name: userDetails.name,
//         email: userDetails.email,
//         phone: userDetails.phone,
//         // Add any other fields you want to return here
//       }
//     });

//   } catch (error) {
//     res.status(500).send({ status: "error", message: "Error fetching user profile", error: error.message });
//   }
// });

// Sample route for habit tracking
app.post("/habit", createHabit); // Use controller functions for habit routes
app.get("/habits", getHabits); 
app.post("/habit-complete", trackHabitCompletion);
app.get("/habit-stats", getHabitStats);
require("./journal");
const Journal = mongoose.model("Journal");
console.log(Journal);  // Should log the Journal model object, not `undefined`

// Create a journal entry
app.post("/api/journals", async (req, res) => {
  const { userId, title, content } = req.body;
  console.log("Received data:", req.body); // Log the incoming data

  try {
    const newJournal = new Journal({ userId:userId, title:title, content:content });
    //await newJournal.save();
        console.log("Journal created:", newJournal); // Log the created journal object
await newJournal.save();
    console.log("Journal created successfully:", newJournal); // Log if saving was successful

    res.status(201).json({ message: "Journal created successfully", newJournal });
  } catch (error) {
        console.error("Error saving journal:", error.message); // More detailed error logging

    res.status(500).json({ error: error.message });
  }
});

// Get all journals for a user
app.get("/:userId", async (req, res) => {
  try {
    const journals = await Journal.find({ userId: req.params.userId });
    res.status(200).json(journals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a journal entry
app.put("/:id", async (req, res) => {
  try {
    const updatedJournal = await Journal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedJournal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a journal entry
app.delete("/:id", async (req, res) => {
  try {
    await Journal.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Journal deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import Tracking model
const Tracking = require('./Tracking');


// Assuming verifyToken middleware is already defined and used to extract `userId` from token
app.post('/api/tracking', verifyToken, async (req, res) => {
  // Destructure the data sent in the request body
  const { todoList, morningRoutine, waterIntake, gratitude, sleepHours, productivity, mood } = req.body;

  // Extract the userId from the req object which was populated by the verifyToken middleware
  const userId = req.userId; // This should now be set by the verifyToken middleware

  // Check if the token exists
  if (!userId) {
    return res.status(401).json({ error: 'No valid userId found in token' });
  }

  try {
    // Find the user in the database using the userId from the token
    const UserData = await user.findById(userId);

    if (!UserData) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create a new tracking entry with the provided data
    const newTracking = new Tracking({
      userId: UserData._id,  // Reference to the User's _id from the database
      todoList: todoList,
      morningRoutine: morningRoutine,
      waterIntake: waterIntake,
      gratitude: gratitude,
      sleepHours: sleepHours,
      productivity: productivity,
      mood: mood,
    });

    // Save the new tracking data entry
    await newTracking.save();

    // Return a success response
    res.status(201).json({ message: 'Tracking data saved successfully' });

  } catch (error) {
    console.error('Error saving tracking data:', error);
    res.status(500).json({ error: 'Error saving tracking data', details: error.message });
  }
});

// GET route to fetch tracking data
app.get('/api/tracking', verifyToken, async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decodedUser = jwt.verify(token, JWT_SECRET);
    const userEmail = decodedUser.email;

    // Find the user
    const UserData = await user.findOne({ email: userEmail });

    if (!UserData) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Retrieve all tracking data for the user
    const trackingData = await Tracking.find({ userId: UserData._id }).sort({ createdAt: -1 });

    if (!trackingData || trackingData.length === 0) {
      return res.status(404).json({ error: 'No tracking data found' });
    }

    res.status(200).json({ trackingData });
  } catch (error) {
    console.error('Error fetching tracking data:', error);
    res.status(500).json({ error: 'Error fetching tracking data', details: error.message });
  }
});

app.listen(5001, () => {
  console.log("Node.js server started on port 5001");
});
