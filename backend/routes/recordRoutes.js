const express = require('express');
const router = express.Router();
const {
  uploadMedicalRecord,
  getMedicalRecords,
  deleteMedicalRecord
} = require('../controllers/recordController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../config/multer');

// All routes are protected
router.use(protect);

router.route('/')
  .post(authorize('patient', 'doctor'), upload.single('file'), uploadMedicalRecord)
  .get(authorize('patient', 'doctor'), getMedicalRecords);

router.delete('/:id', deleteMedicalRecord);

module.exports = router;
