const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all instructors
router.get('/instructors', auth, async (req, res) => {
  try {
    const instructors = await User.find({ role: 'instructor' })
      .select('_id full_name email');
    res.json(instructors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password_hash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user status
router.patch('/status', auth, async (req, res) => {
  try {
    const { status, plan } = req.body;
    
    if (!status || !plan) {
      return res.status(400).json({ message: 'Status and plan are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user status and plan
    user.status = status;
    user.plan = plan;
    
    // Reset remaining bookings based on plan
    if (plan === 'free') {
      user.remaining_bookings = 2;
    } else if (plan === 'premium') {
      user.remaining_bookings = Infinity;
    }

    // Set last booking reset date
    user.last_booking_reset = new Date();

    // Save the changes
    await user.save();

    console.log(`User ${user._id} status updated:`, {
      status: user.status,
      plan: user.plan,
      remaining_bookings: user.remaining_bookings
    });

    res.json({
      message: 'User status updated successfully',
      user: {
        status: user.status,
        plan: user.plan,
        remaining_bookings: user.remaining_bookings
      }
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
});

// Update user profile
/* router.put('/users/:id', async (req, res) => {
  try {
    const { username, email, full_name, profile_picture } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, full_name, profile_picture },
      { new: true }
    ).select('-password_hash');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}); */

module.exports = router;
