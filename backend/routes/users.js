const router = require('express').Router();
const User = require('../models/User');

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
