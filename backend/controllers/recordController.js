const MedicalRecord = require('../models/medicalRecord');
const User = require('../models/user');

// @desc    Upload/Create medical record
// @route   POST /api/records
// @access  Private (Patient and Doctor)
const uploadMedicalRecord = async (req, res) => {
  const { title, description, recordType, patientId } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a medical report file' });
  }

  if (!title) {
    return res.status(400).json({ message: 'Record title is required' });
  }

  try {
    // If doctor is uploading, patientId must be provided.
    // If patient is uploading, they upload for themselves.
    let targetPatientId;
    if (req.user.role === 'doctor') {
      if (!patientId) {
        return res.status(400).json({ message: 'Patient ID is required when uploaded by a Doctor' });
      }
      targetPatientId = patientId;
    } else {
      targetPatientId = req.user._id;
    }

    // Check if patient exists
    const patient = await User.findById(targetPatientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const record = await MedicalRecord.create({
      patientId: targetPatientId,
      title,
      description: description || '',
      recordType: recordType || 'Report',
      filePath: `/uploads/${req.file.filename}`,
      uploadedBy: req.user._id
    });

    res.status(201).json(record);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get medical records of a patient
// @route   GET /api/records
// @access  Private (Patient and Doctor)
const getMedicalRecords = async (req, res) => {
  // Doctors must pass patientId query param to fetch records of a specific patient
  const patientId = req.query.patientId || req.user._id;

  try {
    // Access control
    if (req.user.role === 'patient' && req.user._id.toString() !== patientId.toString()) {
      return res.status(403).json({ message: 'Not authorized to view other patient records' });
    }

    const records = await MedicalRecord.find({ patientId })
      .populate('uploadedBy', 'name role')
      .sort({ date: -1 });

    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete medical record
// @route   DELETE /api/records/:id
// @access  Private (Owner/Uploader only)
const deleteMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    // Only allow deletion if the logged-in user uploaded it
    if (record.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this record' });
    }

    // Remove document from db (note: we can also unlink the local file if desired)
    // For safety, let's just delete the DB record
    await record.deleteOne();

    res.json({ message: 'Medical record deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadMedicalRecord,
  getMedicalRecords,
  deleteMedicalRecord
};
