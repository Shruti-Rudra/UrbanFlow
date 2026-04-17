const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [120, 'Name cannot be more than 120 characters'],
    match: [/^[a-zA-Z\s]+$/, 'Name must contain only alphabetic characters']
  },
  email: {
    type: String,
    unique: true,
    sparse: true,  // Allow null/undefined (phone-only users)
    lowercase: true,
    trim: true,
    match: [/^[\w.-]+@[\w.-]+\.\w{2,}$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,  // Allow null/undefined (email-only users)
    trim: true,
    match: [/^\d{10}$/, 'Phone number must be exactly 10 digits']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  otp: String,
  otpExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date
});

// Ensure at least one of email or phone is provided
userSchema.pre('save', async function() {
  if (!this.email && !this.phone) {
    throw new Error('Either email or phone number is required.');
  }
});

module.exports = mongoose.model('User', userSchema);
