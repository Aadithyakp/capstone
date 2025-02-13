const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  reservation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation',
    required: true
  },
  attended: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Attendance', attendanceSchema);
