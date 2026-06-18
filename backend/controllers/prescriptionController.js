const Prescription = require('../models/prescription');
const Appointment = require('../models/appointment');

// @desc    Create prescription
// @route   POST /api/prescriptions
// @access  Private (Doctor only)
const createPrescription = async (req, res) => {
  const { appointmentId, patientId, medicines, notes } = req.body;

  if (!patientId || !medicines || medicines.length === 0) {
    return res.status(400).json({ message: 'Please provide patientId and medicines list' });
  }

  try {
    const prescription = await Prescription.create({
      appointmentId,
      patientId,
      doctorId: req.user._id,
      medicines,
      notes: notes || ''
    });

    // If prescription is linked to an appointment, auto-complete the appointment
    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId);
      if (appointment) {
        appointment.status = 'Completed';
        await appointment.save();
      }
    }

    res.status(201).json(prescription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get prescriptions
// @route   GET /api/prescriptions
// @access  Private (Patient and Doctor)
const getPrescriptions = async (req, res) => {
  const patientId = req.query.patientId;

  try {
    let query = {};
    
    if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    } else if (req.user.role === 'doctor') {
      // If doctor specifies a patientId, show for that patient. Otherwise, show all written by this doctor
      if (patientId) {
        query.patientId = patientId;
      } else {
        query.doctorId = req.user._id;
      }
    }

    const prescriptions = await Prescription.find(query)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email')
      .sort({ date: -1 });

    res.json(prescriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get prescription by ID
// @route   GET /api/prescriptions/:id
// @access  Private
const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patientId', 'name email gender dateOfBirth address phone')
      .populate('doctorId', 'name email phone');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Access control
    if (req.user.role === 'patient' && prescription.patientId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (req.user.role === 'doctor' && prescription.doctorId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(prescription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPrescription,
  getPrescriptions,
  getPrescriptionById
};
