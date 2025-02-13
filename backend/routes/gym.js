const router = require('express').Router();
const Gym = require('../models/Gym');
const Class = require('../models/Class');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Create a new gym
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const gym = new Gym({
      ...req.body,
      owner: req.user._id
    });
    await gym.save();
    res.status(201).json(gym);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get gym by owner
router.get('/owner', auth, adminAuth, async (req, res) => {
  try {
    const gym = await Gym.findOne({ owner: req.user._id });
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }
    res.json(gym);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update gym
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const gym = await Gym.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true }
    );
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }
    res.json(gym);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create a new class
router.post('/:gymId/classes', auth, adminAuth, async (req, res) => {
  try {
    const gym = await Gym.findOne({ _id: req.params.gymId, owner: req.user._id });
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    const classData = new Class({
      ...req.body,
      gym: gym._id,
      instructor: req.body.instructor || req.user._id
    });
    await classData.save();
    res.status(201).json(classData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all classes for a gym
router.get('/:gymId/classes', auth, async (req, res) => {
  try {
    const classes = await Class.find({ gym: req.params.gymId })
      .populate('instructor', 'full_name email')
      .populate('enrolledMembers', 'full_name email');
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a class
router.put('/:gymId/classes/:classId', auth, adminAuth, async (req, res) => {
  try {
    const classData = await Class.findOneAndUpdate(
      { _id: req.params.classId, gym: req.params.gymId },
      req.body,
      { new: true }
    );
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json(classData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a class
router.delete('/:gymId/classes/:classId', auth, adminAuth, async (req, res) => {
  try {
    const classData = await Class.findOneAndDelete({
      _id: req.params.classId,
      gym: req.params.gymId
    });
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
