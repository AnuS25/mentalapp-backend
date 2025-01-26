const express = require("express");
const app = express();
const mongoose = require("mongoose");
app.use(express.json());
const cors = require("cors");
app.use(cors());
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("./mood");
const Mood=mongoose.model("Mood")
const Menu=require('./menu')
// MongoDB connection string
const mongourl = "mongodb+srv://database1:anisha25mongo@cluster0.8djrk.mongodb.net/mental-health";
const JWT_SECRET = "abcdefgh[12345][6789]<>ijkl;/mnopqrstu";
const { createHabit, getHabits, trackHabitCompletion, getHabitStats } = require('./controller/habitcontroller');  // Import controller
const Habit = require('./habits');

mongoose.connect(mongourl)
  .then(() => console.log("Database Connected"))
  .catch((e) => console.log(e));

require("./userdetails");
const user = mongoose.model("userinfo");

// Email validation regex
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

// Phone number validation regex (10 digits, only numbers)
const phoneRegex = /^[0-9]{10}$/;

app.get("/", (req, res) => {
  res.send({ status: "Started" });
});


// const authenticateToken = (req, res, next) => {
//     const token = req.header('Authorization')?.split(' ')[1]; // Extract token from Authorization header
//     if (!token) {
//         return res.status(401).json({ message: 'Access Denied' });
//     }
    
//     jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//         if (err) {
//             return res.status(403).json({ message: 'Invalid Token' });
//         }
//         req.user = user;
//         next();
//     });
// };
// app.get('/profile', authenticateToken, async (req, res) => {
//     try {
//         const userId = req.user.id; // Assuming the token contains user ID
//         const user = await User.findById(userId); // Find user in the database using the ID from the token

//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Return the user's profile data (you can customize the fields here)
//         res.status(200).json({
//             name: user.name,
//             bio: user.bio,
//             profession: user.profession,
//             email: user.email,
//             // Any other fields you want to send
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });


// const jwt = require('jsonwebtoken');

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

app.post("/signup", async (req, res) => {
  const { name,email, password, phone } = req.body;
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
      name:name,
      email: email,
      password: hashedPassword,
      phone:phone,
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

app.post("/userdata", async (req, res) => {
  const { token } = req.body;
  try {
    const user = jwt.verify(token, JWT_SECRET);
    console.log('Decoded user:', user); // Check if the decoded user is correct
    const useremail = user.email;
    User.findOne({ email: useremail }).then((data) => {
      if (data) {
        return res.send({ status: 'Ok', data });
      } else {
        return res.status(404).send({ status: 'error', message: 'User not found' });
      }
    });
  } catch (error) {
    console.log('Error decoding token:', error);
    return res.send({ error: error });
  }
});


// app.post('/moods',verifyToken, async (req, res) => {
//   console.log('Route /moods hit');
//    const { mood } = req.body;
//   const userId = req.userId; 
//   try {
//     //const { userId, mood } = req.body;
//     const newMood = new Mood({ userId, mood });
//     await newMood.save();
//     res.status(201).json({ message: 'Mood saved successfully' });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to save mood' });
//   }
// });
app.post('/moods', async (req, res) => {
  const { mood, note } = req.body;
  //const userEmail = req.userEmail;
    const token = req.headers.authorization?.split(" ")[1]; // Correctly extract the token from headers

  if (!token) {
    return res.status(401).json({ error: 'Token is missing' });
  }
  //const { token } = req.headers; 
  try {
     const decodedUser = jwt.verify(token, JWT_SECRET);  // Decode the JWT
    const userEmail = decodedUser.email;  // Get user email from the decoded token

    const UserData = await user.findOne({ email: userEmail });

    if (!UserData) {
      return res.status(404).json({ error: 'User not found' });
    }

    //const userId = user._id; // Extract userId from the user document

    const newMood = new Mood({ 
      //userId:userId,
      //  mood:mood, 
      //  note:note 
      mood,note,userEmail});
    await newMood.save();
    //res.status(201).json(newMood);
     res.send({ status: "ok", message: "Mood saved successfully" });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to save mood', details: error.message });
  }
});
// app.post("/userdata",async(req,res)=>{
//   const {token}=req.body;
//   try{
//     const user=jwt.verify(token,JWT_SECRET);
//     const useremail=user.email;
//     user.findOne({email:useremailmail}).then((data)=>{
//       return res.send({status:"Ok",data:data});
//     });
//   }catch(error){
//     return res.send({error:error});
//   }
// });
// app.post('/updateProfile', async (req, res) => {
//   const { name, age, gender, userId } = req.body;

//   if (!name || !age || !gender || !userId) {
//     return res.status(400).json({ success: false, message: 'All fields are required.' });
//   }

//   try {
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found.' });
//     }

//     user.name = name;
//     user.age = age;
//     user.gender = gender;

//     await user.save();

//     res.json({ success: true, message: 'Profile updated successfully.' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Server error.' });
//   }
// });
app.post('/menu/addDish', async (req, res) => {
  try {
    const {date, name, type, mealType} = req.body;

    let menuItem = await Menu.findOne({date});

    if (!menuItem) {
      menuItem = new Menu({date});
    }

    menuItem.items.push({name, type, mealType});

    await menuItem.save();
  } catch (error) {
    console.log('Error', error);
    res.status(500).json({message: 'Internal server error'});
  }
});

app.get('/menu/all', async (req, res) => {
  try {
    const allMenuData = await Menu.find({});

    if (!allMenuData || allMenuData.length == 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(allMenuData);
  } catch (error) {
    res.status(500).json({error: 'Internal server error'});
  }
});

app.post('/copyItems', async (req, res) => {
  try {
    const {prevDate, nextDate} = req.body;

    const prevMenu = await Menu.findOne({date: prevDate});
    if (!prevMenu) {
      return res.status(500).json({message: 'Previous date not found'});
    }

    let nextMenu = await Menu.findOne({date: nextDate});
    if (!nextMenu) {
      nextMenu = new Menu({date: nextDate, items: prevMenu.items});
    } else {
      nextMenu.items = prevMenu.items;
    }

    await nextMenu.save();

    res.status(200).json({message: 'items copied'});
  } catch (error) {
    res.status(500).json({message: 'Internal server error'});
  }
});

// app.delete('/deleteItems/:date', async (req, res) => {
//   const dateToDelete = req.params.date;

//   try {
//     const deletedItem = await Menu.findOneAndDelete({date: dateToDelete});
//     if (deletedItem) {
//       res.status(200).json({message: 'Item deleted'});
//     } else {
//       res.status(404).json({message: 'error deleting the items'});
//     }
//   } catch (error) {
//     res.status(500).json({message: 'Internal server error'});
//   }
// });

app.delete('/deleteItems/:date', async (req, res) => {
  try {
    // Decode the date parameter to ensure proper comparison
    const dateToDelete = decodeURIComponent(req.params.date);
        console.log("Date to delete:", dateToDelete); // Add this log to see the date received

    if (!dateToDelete) {
      console.log('Error: No date provided for deletion.');
      return res.status(400).json({ message: 'No date provided for deletion.' });
    }
    console.log("Deleting items for date:", dateToDelete);  // Debugging log

    // Try to find the item by date and delete it
    const deletedItem = await Menu.findOneAndDelete({ date: dateToDelete }); // Use date for query

    if (deletedItem) {
      res.status(200).json({ message: 'Item deleted successfully' });
    } else {
      res.status(404).json({ message: 'No item found to delete' });
    }
  } catch (error) {
    console.error('Error deleting the item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



const deleteItemsByDate = async () => {
  try {
    const encodedDate = encodeURIComponent(selectedDate); // Encoding the date for URL
    console.log("Attempting to delete items for date:", encodedDate); // Debugging log
    const response = await axios.delete(`https://mentalapp-backend.onrender.com/deleteItems/${encodedDate}`);
    if (response.status === 200) {
      fetchAllMenuData(); // Re-fetch the menu data after deletion
    }
  } catch (error) {
    console.log('Error deleting the items by date', error);
  }
};

app.post('/logout', verifyToken, (req, res) => {
    // Invalidate token on the frontend by deleting it (done in the frontend)
    // Backend could also have a token blacklist to invalidate tokens server-side

    res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/moods/history', async (req, res) => {
  //const { token } = req.headers;
    const token = req.headers.authorization?.split(" ")[1];  // Extract token from the Authorization header

  const { startDate, endDate } = req.query;  // Accept start and end dates from the query
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const decodedUser = jwt.verify(token, JWT_SECRET);
    const userEmail = decodedUser.email;

    // const query = { userEmail };
    // if (startDate && endDate) {
    //   query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    // }

    //const moodHistory = await Mood.find(query).sort({ createdAt: -1 });
    const moodHistory = await Mood.find({ userEmail }).sort({ createdAt: -1 });
if (!moodHistory) {
      return res.status(404).json({ error: "No mood history found" });
    }

    res.status(200).json({ moodHistory });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mood history' });
  }
});

app.post('/updateProfile', async (req, res) => {
    const { token, name, bio, profession } = req.body;

    try {
        // Find the user (you may want to use token or another identifier for this)
        const user = await User.findOne({ token });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update user profile fields
        if (name !== undefined) {
            user.name = name;  // Update name
        }
        if (bio !== undefined) {
            user.bio = bio;    // Update bio
        }
        if (profession !== undefined) {
            user.profession = profession;  // Update profession
        }

        // Save the updated user profile
        await user.save();

        return res.status(200).json({ message: "Profile updated successfully", data: user });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
});
app.post('/habits', verifyToken, createHabit);  // Create a new habit
app.get('/habits', verifyToken, getHabits);  // Get all habits for a user
app.post('/habits/track', verifyToken, trackHabitCompletion);  // Track habit completion
app.get('/habits/stats', verifyToken, getHabitStats);  // Get habit statistics

const Journal = require("./journal");

// Create a journal entry
app.post("/", async (req, res) => {
  const { userId, title, content } = req.body;

  try {
    const newJournal = new Journal({ userId, title, content });
    await newJournal.save();
    res.status(201).json({ message: "Journal created successfully", newJournal });
  } catch (error) {
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

app.listen(5001, () => {
  console.log("Node.js server started on port 5001");
});
