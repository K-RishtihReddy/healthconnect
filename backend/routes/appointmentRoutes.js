const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  updateAppointmentNotes
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

// All appointment routes are protected
router.use(protect);

router.route('/')
  .post(authorize('patient'), bookAppointment)
  .get(getAppointments);

router.route('/:id')
  .get(getAppointmentById);

router.put('/:id/status', updateAppointmentStatus);
router.put('/:id/notes', authorize('doctor'), updateAppointmentNotes);

module.exports = router;
