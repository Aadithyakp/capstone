const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  class_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'attended'],
    default: 'confirmed'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Reservation', reservationSchema);
