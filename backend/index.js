require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/loginApp", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// User Schema
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = mongoose.model("User", UserSchema);

// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ userId: user._id }, "secret_key", { expiresIn: "1h" });
  res.json({ message: "Login Successful", token });
});

// Register Route (for adding a new user)
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ email, password: hashedPassword });

  await newUser.save();
  res.json({ message: "User registered successfully" });
});

// Start Server
app.listen(5000, () => console.log("Server running on port 5000"));
