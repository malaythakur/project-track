// server.js
const express = require('express');
const mongoose = require('mongoose');
const inviteRoutes = require('./routes/invite'); // Adjust path as necessary
const userRoutes = require('./routes/user');     // Import user routes
require('dotenv').config();

const app = express();
const PORT = 5000;

// Middleware for parsing application/json
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.log("Error connecting to MongoDB", err));

// Set up routes with a consistent base path
app.use('/api/invite', inviteRoutes);
app.use('/api/users', userRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
