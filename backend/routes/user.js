// routes/user.js
const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth'); // Import auth middleware
const router = express.Router();
require('dotenv').config();

// Route to register a new user
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  try {
      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(400).json({ error: 'User already exists' });
      }

      // Create a new user without hashing the password here
      const newUser = new User({ email, password, name });
      await newUser.save();

      // Log the new user details
      console.log('User registered:', newUser);

      // Respond with success
      res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
      console.error('Registration error:', error); // Log error details
      res.status(500).json({ error: error.message });
  }
});

// Route to login 
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
      const user = await User.findOne({ email });
      if (!user) {
          console.log('User not found'); 
          return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Compare the password
      const isMatch = await user.comparePassword(password); // Use the method from the schema
      console.log('Password match result (should be true):', isMatch); // Log match result

      if (!isMatch) {
          console.log('Password does not match'); 
          return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Generate JWT
      const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
          expiresIn: '1h',
      });

      res.status(200).json({ token });
  } catch (error) {
      console.error('Login error:', error); 
      res.status(500).json({ error: error.message });
  }
});

// Protected route to get user profile (example)
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // Exclude password
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
