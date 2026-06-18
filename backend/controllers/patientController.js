const Appointment = require('../models/appointment');
const Prescription = require('../models/prescription');
const MedicalRecord = require('../models/medicalRecord');
const FollowUp = require('../models/followUp');
const User = require('../models/user');

// @desc    Get patient dashboard summary
// @route   GET /api/patients/dashboard
// @access  Private (Patient only)
const getPatientDashboard = async (req, res) => {
  try {
    const patientId = req.user._id;

    // 1. Get next upcoming appointment
    const upcomingAppointment = await Appointment.findOne({
      patientId,
      date: { $gte: new Date() },
      status: { $in: ['Pending', 'Confirmed'] }
    })
    .sort({ date: 1, timeSlot: 1 })
    .populate('doctorId', 'name avatar');

    // 2. Get recent prescriptions (last 3)
    const recentPrescriptions = await Prescription.find({ patientId })
      .sort({ date: -1 })
      .limit(3)
      .populate('doctorId', 'name');

    // 3. Get pending follow-up reminders
    const upcomingFollowUps = await FollowUp.find({
      patientId,
      followUpDate: { $gte: new Date() },
      status: 'Scheduled'
    })
    .sort({ followUpDate: 1 })
    .populate('doctorId', 'name')
    .limit(3);

    // 4. Statistics summary
    const totalAppointments = await Appointment.countDocuments({ patientId });
    const totalRecords = await MedicalRecord.countDocuments({ patientId });
    const totalPrescriptions = await Prescription.countDocuments({ patientId });

    res.json({
      upcomingAppointment,
      recentPrescriptions,
      upcomingFollowUps,
      stats: {
        totalAppointments,
        totalRecords,
        totalPrescriptions
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get patient chronological treatment history (Health Timeline)
// @route   GET /api/patients/timeline
// @access  Private (Patient and Doctor only)
// Note: Doctors can access the timeline of a patient if they need to check medical history
const getPatientTimeline = async (req, res) => {
  const patientId = req.query.patientId || req.user._id;

  try {
    // If a doctor is accessing, allow it. If it's a patient, check that they are requesting their own timeline.
    if (req.user.role === 'patient' && req.user._id.toString() !== patientId.toString()) {
      return res.status(403).json({ message: 'Not authorized to view other patient timeline' });
    }

    // 1. Fetch Appointments
    const appointments = await Appointment.find({ patientId })
      .populate('doctorId', 'name avatar')
      .lean();

    // 2. Fetch Prescriptions
    const prescriptions = await Prescription.find({ patientId })
      .populate('doctorId', 'name')
      .lean();

    // 3. Fetch Medical Records
    const records = await MedicalRecord.find({ patientId })
      .populate('uploadedBy', 'name role')
      .lean();

    // 4. Fetch FollowUps
    const followups = await FollowUp.find({ patientId })
      .populate('doctorId', 'name')
      .lean();

    // Compile events into a single array
    const timelineEvents = [];

    // Map Appointments
    appointments.forEach(app => {
      timelineEvents.push({
        _id: app._id,
        date: app.date,
        type: 'appointment',
        title: `Doctor Appointment (${app.type})`,
        description: `Consultation with Dr. ${app.doctorId ? app.doctorId.name : 'Unknown'}. Status: ${app.status}. Reason: ${app.reason}`,
        doctorName: app.doctorId ? app.doctorId.name : 'Unknown',
        notes: app.notes,
        status: app.status,
        timeSlot: app.timeSlot,
        details: app
      });
    });

    // Map Prescriptions
    prescriptions.forEach(pres => {
      const medList = pres.medicines.map(m => `${m.name} (${m.dosage})`).join(', ');
      timelineEvents.push({
        _id: pres._id,
        date: pres.date,
        type: 'prescription',
        title: 'Prescription Prescribed',
        description: `Prescribed by Dr. ${pres.doctorId ? pres.doctorId.name : 'Unknown'}. Medicines: ${medList}`,
        doctorName: pres.doctorId ? pres.doctorId.name : 'Unknown',
        medicines: pres.medicines,
        notes: pres.notes,
        details: pres
      });
    });

    // Map Medical Records
    records.forEach(rec => {
      timelineEvents.push({
        _id: rec._id,
        date: rec.date,
        type: 'record',
        title: `${rec.recordType} Uploaded`,
        description: `"${rec.title}" uploaded by ${rec.uploadedBy ? rec.uploadedBy.name : 'Unknown'} (${rec.uploadedBy ? rec.uploadedBy.role : 'user'})`,
        filePath: rec.filePath,
        details: rec
      });
    });

    // Map FollowUps
    followups.forEach(fol => {
      timelineEvents.push({
        _id: fol._id,
        date: fol.followUpDate,
        type: 'followup',
        title: 'Follow-Up Scheduled',
        description: `Follow-up check scheduled with Dr. ${fol.doctorId ? fol.doctorId.name : 'Unknown'}. Reason: ${fol.reason || 'Routine Check'}`,
        doctorName: fol.doctorId ? fol.doctorId.name : 'Unknown',
        status: fol.status,
        details: fol
      });
    });

    // Sort timeline events chronologically (newest first)
    timelineEvents.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(timelineEvents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPatientDashboard,
  getPatientTimeline
};
