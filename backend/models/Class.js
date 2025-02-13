const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  gym: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Yoga', 'HIIT', 'Strength', 'Cardio', 'Pilates', 'Other']
  },
  schedule: {
    dayOfWeek: {
      type: String,
      required: true,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    }
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  level: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced', 'all']
  },
  enrolledMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['active', 'cancelled', 'completed'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Add index for efficient querying
classSchema.index({ gym: 1, 'schedule.dayOfWeek': 1, 'schedule.startTime': 1 });

module.exports = mongoose.model('Class', classSchema);
