const mongoose = require('mongoose');

const gymSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  contact: {
    phone: { type: String, required: true },
    email: { type: String, required: true }
  },
  description: {
    type: String,
    required: true
  },
  facilities: [{
    type: String
  }],
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  membershipPlans: [{
    name: { type: String, required: true },
    duration: { type: Number, required: true }, // in months
    price: { type: Number, required: true },
    description: String,
    features: [String]
  }],
  images: [{
    type: String // URLs to gym images
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Gym', gymSchema);
