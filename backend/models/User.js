const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        match: /.+\@.+\..+/ // Basic email regex
    },
    password: { type: String, required: true },
    name: { type: String, required: true },
    invitedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: [] }]
}, { timestamps: true });

// Hash the password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        next(error); // Pass the error to the next middleware
    }
});

// models/User.js

// models/User.js
userSchema.methods.comparePassword = async function (inputPassword) {
    try {
      console.log('Input password:', inputPassword);
      console.log('Stored hashed password:', this.password);
  
      const isMatch = await bcrypt.compare(inputPassword, this.password);
      console.log('Password match:', isMatch);
  
      return isMatch;
    } catch (error) {
      console.error('Error in comparePassword:', error.message);
      throw new Error('Error comparing passwords');
    }
  };


// Check if the model already exists to avoid overwriting it
const User = mongoose.models.User || mongoose.model('User', userSchema);
module.exports = User;
