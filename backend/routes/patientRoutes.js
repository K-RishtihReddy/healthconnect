const express = require('express');
const router = express.Router();
const {
  getPatientDashboard,
  getPatientTimeline
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');

// Protected routes
router.get('/dashboard', protect, authorize('patient'), getPatientDashboard);
router.get('/timeline', protect, authorize('patient', 'doctor'), getPatientTimeline);

module.exports = router;
