const router = require('express').Router();
const Class = require('../models/Class');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

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
    
    // Add isEnrolled flag for each class
    const classesWithEnrollmentStatus = classes.map(classItem => {
      const isEnrolled = classItem.enrolledMembers.some(memberId => 
        memberId.equals(req.user._id)
      );
      return {
        ...classItem.toObject(),
        isEnrolled
      };
    });
    
    res.json(classesWithEnrollmentStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Enroll in a class
router.post('/:classId/enroll', auth, async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.classId);
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if user is already enrolled
    const userId = req.user._id;
    if (classItem.enrolledMembers.some(memberId => memberId.equals(userId))) {
      return res.status(400).json({ message: 'Already enrolled in this class' });
    }

    // Check if class is full
    if (classItem.enrolledMembers.length >= classItem.capacity) {
      return res.status(400).json({ message: 'Class is full' });
    }

    // Check if class is active
    if (classItem.status !== 'active') {
      return res.status(400).json({ message: 'Class is not available for enrollment' });
    }

    // Add user to enrolled members
    classItem.enrolledMembers.push(userId);
    await classItem.save();

    // Return updated class info
    res.json({ 
      message: 'Successfully enrolled in class',
      enrollmentStatus: 'enrolled',
      classId: classItem._id,
      enrolledMembers: classItem.enrolledMembers,
      currentCapacity: classItem.enrolledMembers.length,
      maxCapacity: classItem.capacity
    });
  } catch (error) {
    console.error('Enrollment error:', error);
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
