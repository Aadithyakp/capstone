const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  full_name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'instructor', 'gym_owner'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive'
  },
  profile_picture: {
    type: String // This will store the Cloudinary URL
  },
  plan: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free'
  },
  remaining_bookings: {
    type: Number,
    default: 2, // Free plan users get 2 bookings per month
    min: 0
  },
  last_booking_reset: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Reset monthly bookings if it's a new month
userSchema.methods.resetMonthlyBookings = async function() {
  const now = new Date();
  const lastReset = this.last_booking_reset;
  
  if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    this.remaining_bookings = this.plan === 'free' ? 2 : Infinity;
    this.last_booking_reset = now;
    await this.save();
  }
};

module.exports = mongoose.model('User', userSchema);
