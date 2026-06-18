const Doctor = require('../models/doctor');
const User = require('../models/user');
const Appointment = require('../models/appointment');

// @desc    Get all verified doctors (with optional search and specialization filters)
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res) => {
  const { specialization, search } = req.query;
  let query = { isVerified: true };

  if (specialization) {
    query.specialization = specialization;
  }

  try {
    let doctors = await Doctor.find(query).populate('userId', 'name email phone gender avatar');

    // Filter by search term on doctor name or bio if search query exists
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      doctors = doctors.filter(doc => 
        doc.userId && (searchRegex.test(doc.userId.name) || (doc.bio && searchRegex.test(doc.bio)))
      );
    }

    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get doctor profile by ID
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res) => {
  try {
    // id can be doctor profile ID or user ID. Let's support both but assume it's the User ID or Doctor ID.
    // Standardizing: Assume it's the User ID of the doctor (since we link routes that way or from appointments)
    let doctor = await Doctor.findOne({ userId: req.params.id }).populate('userId', 'name email phone gender avatar address');
    
    if (!doctor) {
      // Try by Doctor ID
      doctor = await Doctor.findById(req.params.id).populate('userId', 'name email phone gender avatar address');
    }

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update doctor clinical details
// @route   PUT /api/doctors/profile
// @access  Private (Doctor only)
const updateDoctorProfile = async (req, res) => {
  const { specialization, experience, qualification, fees, bio, availability } = req.body;

  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    doctor.specialization = specialization || doctor.specialization;
    doctor.experience = experience !== undefined ? Number(experience) : doctor.experience;
    doctor.qualification = qualification || doctor.qualification;
    doctor.fees = fees !== undefined ? Number(fees) : doctor.fees;
    doctor.bio = bio !== undefined ? bio : doctor.bio;

    if (availability) {
      doctor.availability = availability;
    }

    const updatedDoctor = await doctor.save();
    res.json(updatedDoctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get doctor available slots for a specific date
// @route   GET /api/doctors/:id/availability
// @access  Public
const getDoctorAvailabilityByDate = async (req, res) => {
  const { date } = req.query; // Date format: YYYY-MM-DD
  const doctorUserId = req.params.id; // User ID of doctor

  if (!date) {
    return res.status(400).json({ message: 'Please provide a date query parameter (YYYY-MM-DD)' });
  }

  try {
    const doctor = await Doctor.findOne({ userId: doctorUserId });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Determine day of the week
    const queryDate = new Date(date);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[queryDate.getDay()];

    // Find the slots for this day of the week
    const dayAvailability = doctor.availability.find(av => av.day === dayOfWeek);

    if (!dayAvailability || dayAvailability.slots.length === 0) {
      return res.json({ day: dayOfWeek, slots: [] }); // Doctor is not available on this day
    }

    // Get all appointments booked for this doctor on this day (exclude Cancelled)
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      doctorId: doctorUserId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $ne: 'Cancelled' }
    });

    const bookedSlots = appointments.map(app => app.timeSlot);

    // Filter out already booked slots
    const availableSlots = dayAvailability.slots.filter(slot => !bookedSlots.includes(slot));

    res.json({
      day: dayOfWeek,
      date: date,
      slots: availableSlots
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  updateDoctorProfile,
  getDoctorAvailabilityByDate
};
