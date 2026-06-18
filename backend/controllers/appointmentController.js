const Appointment = require('../models/appointment');
const Doctor = require('../models/doctor');
const User = require('../models/user');

// @desc    Book an appointment
// @route   POST /api/appointments
// @access  Private (Patient only)
const bookAppointment = async (req, res) => {
  const { doctorId, date, timeSlot, reason, type } = req.body;

  if (!doctorId || !date || !timeSlot || !reason) {
    return res.status(400).json({ message: 'Please provide all required fields: doctorId, date, timeSlot, reason' });
  }

  try {
    // Check if doctor exists and is verified
    const doctor = await Doctor.findOne({ userId: doctorId });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    if (!doctor.isVerified) {
      return res.status(400).json({ message: 'Doctor is not verified yet by admin' });
    }

    // Parse date and set to midnight/day-only for checking matching date
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);

    const startOfDay = new Date(bookingDate);
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Check if slot is already booked for this doctor
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      timeSlot,
      status: { $ne: 'Cancelled' }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'This time slot is already booked for the selected date' });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId,
      date: bookingDate,
      timeSlot,
      reason,
      type: type || 'In-Person'
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user appointments (lists based on roles)
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
  try {
    let appointments;

    if (req.user.role === 'patient') {
      appointments = await Appointment.find({ patientId: req.user._id })
        .populate('doctorId', 'name email phone avatar')
        .sort({ date: -1, timeSlot: -1 });
    } else if (req.user.role === 'doctor') {
      appointments = await Appointment.find({ doctorId: req.user._id })
        .populate('patientId', 'name email phone gender dateOfBirth avatar')
        .sort({ date: -1, timeSlot: -1 });
    } else if (req.user.role === 'admin') {
      appointments = await Appointment.find({})
        .populate('patientId', 'name email')
        .populate('doctorId', 'name email')
        .sort({ date: -1 });
    }

    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email phone gender dateOfBirth avatar address')
      .populate('doctorId', 'name email phone avatar');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Authorization checks
    const isPatient = req.user.role === 'patient' && appointment.patientId._id.toString() === req.user._id.toString();
    const isDoctor = req.user.role === 'doctor' && appointment.doctorId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this appointment' });
    }

    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private
const updateAppointmentStatus = async (req, res) => {
  const { status } = req.body;

  if (!['Pending', 'Confirmed', 'Completed', 'Cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Role-based auth for status changes
    // Patients can only cancel their own pending/confirmed appointments
    if (req.user.role === 'patient') {
      if (appointment.patientId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      if (status !== 'Cancelled') {
        return res.status(400).json({ message: 'Patients can only cancel appointments' });
      }
      if (appointment.status === 'Completed') {
        return res.status(400).json({ message: 'Cannot cancel a completed appointment' });
      }
    }

    // Doctors can only manage their own appointments
    if (req.user.role === 'doctor') {
      if (appointment.doctorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    appointment.status = status;
    const updatedAppointment = await appointment.save();

    res.json(updatedAppointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add appointment consultation notes
// @route   PUT /api/appointments/:id/notes
// @access  Private (Doctor only)
const updateAppointmentNotes = async (req, res) => {
  const { notes } = req.body;

  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Ensure doctor is the owner
    if (appointment.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized, you are not the assigned doctor' });
    }

    appointment.notes = notes || '';
    const updatedAppointment = await appointment.save();

    res.json(updatedAppointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  bookAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  updateAppointmentNotes
};
