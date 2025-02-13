const router = require('express').Router();
const Class = require('../models/Class');

// Create a new class
router.post('/', async (req, res) => {
  try {
    const newClass = new Class(req.body);
    await newClass.save();
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all classes for a gym
router.get('/gym/:gymId', async (req, res) => {
  try {
    const classes = await Class.find({ gym_id: req.params.gymId });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get class by ID
router.get('/:id', async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json(classItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
