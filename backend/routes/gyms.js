const router = require('express').Router();
const Gym = require('../models/Gym');
const Class = require('../models/Class');
const User = require('../models/User');
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
router.get('/:gymId/classes', auth, async (req, res) => {
  try {
    const classes = await Class.find({ gym: req.params.gymId });
   
    // Add enrollment status for each class
    const classesWithEnrollmentStatus = classes.map(classItem => {
      const isEnrolled = classItem.enrolledMembers.some(memberId =>
        memberId.equals(req.user._id)
      );
      return {
        ...classItem.toObject(),
        isEnrolled,
        currentCapacity: classItem.enrolledMembers.length
      };
    });
   
    res.json(classesWithEnrollmentStatus);
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

// Enroll in a class
router.post('/:gymId/classes/:classId/enroll', auth, async (req, res) => {
  try {
    const classItem = await Class.findOne({
      _id: req.params.classId,
      gym: req.params.gymId
    });

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

    res.json({
      message: 'Successfully enrolled in class',
      enrollmentStatus: 'enrolled'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel class enrollment
router.post('/:gymId/classes/:classId/cancel', auth, async (req, res) => {
  try {
    const classItem = await Class.findOne({
      _id: req.params.classId,
      gym: req.params.gymId
    });

    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if user is enrolled
    const userId = req.user._id;
    const enrolledIndex = classItem.enrolledMembers.findIndex(memberId =>
      memberId.equals(userId)
    );

    if (enrolledIndex === -1) {
      return res.status(400).json({ message: 'Not enrolled in this class' });
    }

    // Remove user from enrolled members
    classItem.enrolledMembers.splice(enrolledIndex, 1);
    await classItem.save();

    res.json({
      message: 'Successfully cancelled enrollment',
      enrollmentStatus: ''
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all members for a gym
router.get('/:gymId/members', auth, adminAuth, async (req, res) => {
  try {
    const gym = await Gym.findOne({ _id: req.params.gymId, owner: req.user._id });
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found or unauthorized' });
    }

    // Find all classes in this gym
    const classes = await Class.find({ gym: req.params.gymId });
   
    // Get unique member IDs from all classes
    const memberIds = new Set();
    classes.forEach(classItem => {
      classItem.enrolledMembers.forEach(memberId => {
        memberIds.add(memberId.toString());
      });
    });

    // Get member details
    const members = await User.find(
      { _id: { $in: Array.from(memberIds) } },
      { password: 0 } // Exclude password field
    );

    // Add enrollment info to each member
    const membersWithEnrollments = members.map(member => {
      const enrolledClasses = classes.filter(classItem =>
        classItem.enrolledMembers.some(id => id.equals(member._id))
      );

      return {
        _id: member._id,
        name: member.full_name,
        email: member.email,
        profilePicture: member.profile_picture,
        status: member.status,
        plan: member.plan,
        joinedDate: member.createdAt,
        enrolledClasses: enrolledClasses.map(classItem => ({
          _id: classItem._id,
          name: classItem.name,
          schedule: classItem.schedule
        }))
      };
    });

    res.json(membersWithEnrollments);
  } catch (error) {
    console.error('Error getting gym members:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get specific member details for a gym
router.get('/:gymId/members/:memberId', auth, adminAuth, async (req, res) => {
  try {
    const gym = await Gym.findOne({ _id: req.params.gymId, owner: req.user._id });
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found or unauthorized' });
    }

    // Get member details
    const member = await User.findById(req.params.memberId, { password: 0 });
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Get classes where this member is enrolled
    const enrolledClasses = await Class.find({
      gym: req.params.gymId,
      enrolledMembers: member._id
    });

    const memberDetails = {
      _id: member._id,
      name: member.full_name,
      email: member.email,
      profilePicture: member.profile_picture,
      status: member.status,
      plan: member.plan,
      joinedDate: member.createdAt,
      enrolledClasses: enrolledClasses.map(classItem => ({
        _id: classItem._id,
        name: classItem.name,
        schedule: classItem.schedule
      }))
    };

    res.json(memberDetails);
  } catch (error) {
    console.error('Error getting member details:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update member status
router.patch('/:gymId/members/:memberId/status', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const gym = await Gym.findOne({ _id: req.params.gymId, owner: req.user._id });
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found or unauthorized' });
    }

    const member = await User.findById(req.params.memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    member.status = status;
    await member.save();

    res.json({ message: 'Member status updated successfully', member });
  } catch (error) {
    console.error('Error updating member status:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
