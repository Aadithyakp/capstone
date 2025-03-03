const router = require('express').Router();
const Class = require('../models/Class');
const auth = require('../middleware/auth');

// Create a new class
router.post('/', auth, async (req, res) => {
  try {
    const newClass = new Class({
      ...req.body,
      instructor: req.body.instructor // Use instructor name from request
    });
    await newClass.save();
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all classes for a gym
router.get('/gym/:gymId', auth, async (req, res) => {
  try {
    const classes = await Class.find({ gym: req.params.gymId });
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

// Update a class
router.put('/:id', auth, async (req, res) => {
  try {
    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        instructor: req.body.instructor // Use instructor name from request
      },
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
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedClass = await Class.findByIdAndDelete(req.params.id);
    if (!deletedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
