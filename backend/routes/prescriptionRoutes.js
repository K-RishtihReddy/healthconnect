const express = require('express');
const router = express.Router();
const {
  createPrescription,
  getPrescriptions,
  getPrescriptionById
} = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/auth');

// All prescription routes are protected
router.use(protect);

router.route('/')
  .post(authorize('doctor'), createPrescription)
  .get(getPrescriptions);

router.route('/:id')
  .get(getPrescriptionById);

module.exports = router;
