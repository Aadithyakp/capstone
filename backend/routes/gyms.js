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
    res.status(500).json({ message: error.message });
  }
});

// Get all gyms
router.get('/', async (req, res) => {
  try {
    const gyms = await Gym.find();
    res.json(gyms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get gym by owner (for gym owner dashboard)
router.get('/owner', auth, adminAuth, async (req, res) => {
  try {
    const gym = await Gym.findOne({ owner: req.user._id });
    if (!gym) {
      return res.status(404).json({ message: 'No gym found for this owner' });
    }
    res.json(gym);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get gym by ID
router.get('/:id', async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);
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
      return res.status(404).json({ message: 'Gym not found or unauthorized' });
    }
    res.json(gym);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete gym
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const gym = await Gym.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found or unauthorized' });
    }
    res.json({ message: 'Gym deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Class routes nested under gym routes

// Create a class for a gym
router.post('/:gymId/classes', auth, adminAuth, async (req, res) => {
  try {
    const gym = await Gym.findOne({ _id: req.params.gymId, owner: req.user._id });
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found or unauthorized' });
    }

    const newClass = new Class({
      ...req.body,
      gym: req.params.gymId
    });
    await newClass.save();
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all classes for a gym
router.get('/:gymId/classes', async (req, res) => {
  try {
    const classes = await Class.find({ gym: req.params.gymId });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a class
router.put('/:gymId/classes/:classId', auth, adminAuth, async (req, res) => {
  try {
    const gym = await Gym.findOne({ _id: req.params.gymId, owner: req.user._id });
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found or unauthorized' });
    }

    const updatedClass = await Class.findOneAndUpdate(
      { _id: req.params.classId, gym: req.params.gymId },
      req.body,
      { new: true }
    );
    if (!updatedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json(updatedClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a class
router.delete('/:gymId/classes/:classId', auth, adminAuth, async (req, res) => {
  try {
    const gym = await Gym.findOne({ _id: req.params.gymId, owner: req.user._id });
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found or unauthorized' });
    }

    const deletedClass = await Class.findOneAndDelete({
      _id: req.params.classId,
      gym: req.params.gymId
    });
    if (!deletedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
