const router = require('express').Router();
const Reservation = require('../models/Reservation');
const Attendance = require('../models/Attendance');
const Class = require('../models/Class');

// Create a new reservation
router.post('/', async (req, res) => {
  try {
    // Check if class exists and has space
    const classItem = await Class.findById(req.body.class_id);
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if user already has a reservation for this class
    const existingReservation = await Reservation.findOne({
      user_id: req.body.user_id,
      class_id: req.body.class_id
    });

    if (existingReservation) {
      return res.status(400).json({ message: 'You already have a reservation for this class' });
    }

    // Create reservation
    const reservation = new Reservation({
      user_id: req.body.user_id,
      class_id: req.body.class_id,
      status: 'confirmed'
    });

    await reservation.save();

    // Create attendance record
    const attendance = new Attendance({
      reservation_id: reservation._id,
      attended: false
    });

    await attendance.save();

    res.status(201).json({
      reservation,
      attendance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all reservations for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const reservations = await Reservation.find({ user_id: req.params.userId })
      .populate('class_id')
      .sort({ 'class_id.date_time': -1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all reservations for a class
router.get('/class/:classId', async (req, res) => {
  try {
    const reservations = await Reservation.find({ class_id: req.params.classId })
      .populate('user_id', '-password_hash');
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel a reservation
router.put('/:id/cancel', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Check if class hasn't started yet
    const classItem = await Class.findById(reservation.class_id);
    if (new Date(classItem.date_time) < new Date()) {
      return res.status(400).json({ message: 'Cannot cancel past classes' });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark attendance
router.put('/:id/attendance', async (req, res) => {
  try {
    const attendance = await Attendance.findOne({ reservation_id: req.params.id });
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    attendance.attended = req.body.attended;
    await attendance.save();

    // Update reservation status
    const reservation = await Reservation.findById(req.params.id);
    if (attendance.attended) {
      reservation.status = 'attended';
      await reservation.save();
    }

    res.json({
      attendance,
      reservation
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance for a reservation
router.get('/:id/attendance', async (req, res) => {
  try {
    const attendance = await Attendance.findOne({ reservation_id: req.params.id });
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
