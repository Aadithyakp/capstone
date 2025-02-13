const router = require('express').Router();
const UserMembership = require('../models/UserMembership');
const MembershipPlan = require('../models/MembershipPlan');

// Create a membership plan
router.post('/plans', async (req, res) => {
  try {
    const plan = new MembershipPlan(req.body);
    await plan.save();
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all membership plans
router.get('/plans', async (req, res) => {
  try {
    const plans = await MembershipPlan.find();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Purchase a membership
router.post('/purchase', async (req, res) => {
  try {
    const membership = new UserMembership(req.body);
    await membership.save();
    res.status(201).json(membership);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user memberships
router.get('/user/:userId', async (req, res) => {
  try {
    const memberships = await UserMembership.find({ user_id: req.params.userId })
      .populate('gym_id')
      .populate('membership_plan_id');
    res.json(memberships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
