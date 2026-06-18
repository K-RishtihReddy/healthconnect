const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorById,
  updateDoctorProfile,
  getDoctorAvailabilityByDate
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/availability', getDoctorAvailabilityByDate);

// Protected routes
router.put('/profile', protect, authorize('doctor'), updateDoctorProfile);

module.exports = router;
