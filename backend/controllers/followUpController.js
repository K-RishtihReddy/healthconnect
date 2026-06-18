const FollowUp = require('../models/followUp');

// @desc    Create follow-up scheduled alert
// @route   POST /api/followups
// @access  Private (Doctor only)
const createFollowUp = async (req, res) => {
  const { appointmentId, patientId, followUpDate, reason } = req.body;

  if (!patientId || !followUpDate) {
    return res.status(400).json({ message: 'Please provide patientId and followUpDate' });
  }

  try {
    const followup = await FollowUp.create({
      appointmentId,
      patientId,
      doctorId: req.user._id,
      followUpDate,
      reason: reason || 'Routine checkup'
    });

    res.status(201).json(followup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get follow-up alerts
// @route   GET /api/followups
// @access  Private (Patient and Doctor)
const getFollowUps = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctorId = req.user._id;
    }

    const followups = await FollowUp.find(query)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email')
      .sort({ followUpDate: 1 });

    res.json(followups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update follow-up status
// @route   PUT /api/followups/:id
// @access  Private (Doctor/Patient)
const updateFollowUpStatus = async (req, res) => {
  const { status } = req.body;

  if (!['Scheduled', 'Completed', 'Missed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const followup = await FollowUp.findById(req.params.id);

    if (!followup) {
      return res.status(404).json({ message: 'Follow-up not found' });
    }

    // Auth check
    const isDoctor = req.user.role === 'doctor' && followup.doctorId.toString() === req.user._id.toString();
    const isPatient = req.user.role === 'patient' && followup.patientId.toString() === req.user._id.toString();

    if (!isDoctor && !isPatient) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    followup.status = status;
    const updated = await followup.save();

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createFollowUp,
  getFollowUps,
  updateFollowUpStatus
};
