const express = require("express");
const app = express();
const mongoose = require("mongoose");
app.use(express.json());
const cors = require("cors");
app.use(cors());
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// MongoDB connection string
const mongourl = "mongodb+srv://database1:anisha25mongo@cluster0.8djrk.mongodb.net/mental-health";
const JWT_SECRET = "abcdefgh[12345][6789]<>ijkl;/mnopqrstu";

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

app.post("/signup", async (req, res) => {
  const { email, password, phone } = req.body;

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
    const decodedUser = jwt.verify(token, JWT_SECRET);
    const userEmail = decodedUser.email;

    const userData = await user.findOne({ email: userEmail }, { email: 1, phone: 1, _id: 0 });
    if (userData) {
      return res.send({ status: "ok", data: userData });
    } else {
      return res.status(404).send({ status: "error", message: "User not found" });
    }
  } catch (error) {
    return res.status(500).send({ status: "error", message: "Invalid token", error: error.message });
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


app.listen(5001, () => {
  console.log("Node.js server started on port 5001");
});
