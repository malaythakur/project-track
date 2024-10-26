// Load environment variables
require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const User = require('../models/User'); // Adjust the path as necessary
const Project = require('../models/Project'); // Adjust the path as necessary
const auth = require('../middleware/auth'); // Import the auth middleware

const router = express.Router();


const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Your SMTP server
  port: 465, // Port number
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL, // Your full Gmail address (e.g., your_email@gmail.com)
    pass: process.env.EMAIL_PASSWORD, // Your Gmail password or App Password
  },
});

// POST /invite
router.post('/', auth, async (req, res) => { // Apply auth middleware
  const { email, projectId } = req.body;

  // Validate request body
  if (!email || !projectId) {
    return res.status(400).json({ message: 'Email and projectId are required' });
  }

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send an invitation email
    const inviteLink = `http://localhost:5000/api/accept-invite/${projectId}/${user._id}`;
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Project Invitation',
      text: `You have been invited to join the project. Click the link to accept: ${inviteLink}`
    };

    await transporter.sendMail(mailOptions);

    // Optionally, update the invitedProjects field
    if (!user.invitedProjects.includes(projectId)) {
      user.invitedProjects.push(projectId);
      await user.save();
    }

    res.status(200).json({ message: 'Invitation sent successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending invitation', error: error.message });
  }
});

// PUT /accept-invite/:projectId/:userId
router.put('/accept-invite/:projectId/:userId', auth, async (req, res) => { // Apply auth middleware
  const { projectId, userId } = req.params;

  try {
    // Find the project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add user to the assignedUsers field
    if (!project.assignedUsers.includes(user._id)) {
      project.assignedUsers.push(user._id);
    }

    // Add project ID to user's invitedProjects field
    if (!user.invitedProjects.includes(projectId)) {
      user.invitedProjects.push(projectId);
    }

    await project.save();
    await user.save();

    res.status(200).json({ message: 'Invitation accepted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error accepting invitation', error: error.message });
  }
});

module.exports = router;
