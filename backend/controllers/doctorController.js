const Doctor = require('../models/doctor');
const User = require('../models/user');
const Appointment = require('../models/appointment');

// @desc    Get all verified doctors (with optional search and specialization filters)
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res) => {
  const { specialization, search, verified } = req.query;

  // By default return ALL doctors; pass ?verified=true to restrict to verified only
  let query = {};
  if (verified === 'true') {
    query.isVerified = true;
  }

  if (specialization) {
    query.specialization = specialization;
  }

  try {
    let doctors = await Doctor.find(query).populate('userId', 'name email phone gender avatar');

    // Filter by search term on doctor name or bio if search query exists
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      doctors = doctors.filter(doc =>
        doc.userId && (
          searchRegex.test(doc.userId.name) ||
          (doc.bio && searchRegex.test(doc.bio)) ||
          (doc.specialization && searchRegex.test(doc.specialization))
        )
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
  const { date, startDate, endDate } = req.query; // Date format: YYYY-MM-DD
  const doctorUserId = req.params.id; // User ID of doctor

  try {
    const doctor = await Doctor.findOne({ userId: doctorUserId });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
 
    // Helper to get UTC date string YYYY-MM-DD
    const getUTCDateString = (dateObj) => {
      return dateObj.toISOString().split('T')[0];
    };
 
    // Handle range query
    if (startDate && endDate) {
      const startPart = startDate.split('T')[0];
      const endPart = endDate.split('T')[0];
      const start = new Date(`${startPart}T00:00:00.000Z`);
      const end = new Date(`${endPart}T00:00:00.000Z`);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: 'Invalid date formats. Use YYYY-MM-DD.' });
      }
 
      // Get all appointments in this date range for the doctor (exclude Cancelled)
      const startOfDay = new Date(`${startPart}T00:00:00.000Z`);
      const endOfDay = new Date(`${endPart}T23:59:59.999Z`);
 
      const appointments = await Appointment.find({
        doctorId: doctorUserId,
        date: {
          $gte: startOfDay,
          $lte: endOfDay
        },
        status: { $ne: 'Cancelled' }
      });
 
      // Group appointments by UTC date string YYYY-MM-DD
      const appointmentsByDate = {};
      appointments.forEach(app => {
        const appDateStr = getUTCDateString(new Date(app.date));
        if (!appointmentsByDate[appDateStr]) {
          appointmentsByDate[appDateStr] = [];
        }
        appointmentsByDate[appDateStr].push(app.timeSlot);
      });
 
      // Generate result for each date in range
      const results = {};
      let current = new Date(`${startPart}T12:00:00.000Z`); // Noon UTC to avoid boundary issues when incrementing
      const targetEnd = new Date(`${endPart}T12:00:00.000Z`);
 
      while (current <= targetEnd) {
        const dateStr = getUTCDateString(current);
        const dayOfWeek = days[current.getUTCDay()];
 
        // Find standard availability for this day of week
        const dayAvailability = doctor.availability.find(av => av.day === dayOfWeek);
        
        if (!dayAvailability || dayAvailability.slots.length === 0) {
          results[dateStr] = {
            day: dayOfWeek,
            totalSlotsCount: 0,
            bookedSlotsCount: 0,
            availableSlotsCount: 0,
            slots: []
          };
        } else {
          const totalSlots = dayAvailability.slots;
          const bookedSlotsForDate = appointmentsByDate[dateStr] || [];
          const availableSlots = totalSlots.filter(slot => !bookedSlotsForDate.includes(slot));
 
          results[dateStr] = {
            day: dayOfWeek,
            totalSlotsCount: totalSlots.length,
            bookedSlotsCount: bookedSlotsForDate.length,
            availableSlotsCount: availableSlots.length,
            slots: availableSlots
          };
        }
 
        // Increment date by 1 day
        current.setUTCDate(current.getUTCDate() + 1);
      }
 
      return res.json({
        range: true,
        startDate: startPart,
        endDate: endPart,
        dates: results
      });
    }
 
    // Single date query
    if (!date) {
      return res.status(400).json({ message: 'Please provide a date query parameter (YYYY-MM-DD) or startDate and endDate.' });
    }
 
    const datePart = date.split('T')[0];
    const queryDate = new Date(`${datePart}T00:00:00.000Z`);
    if (isNaN(queryDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }
    const dayOfWeek = days[queryDate.getUTCDay()];
 
    // Find the slots for this day of the week
    const dayAvailability = doctor.availability.find(av => av.day === dayOfWeek);
 
    if (!dayAvailability || dayAvailability.slots.length === 0) {
      return res.json({
        day: dayOfWeek,
        date: datePart,
        slots: [],
        totalSlotsCount: 0,
        bookedSlotsCount: 0,
        availableSlotsCount: 0
      });
    }
 
    // Get all appointments booked for this doctor on this day (exclude Cancelled)
    const startOfDay = new Date(`${datePart}T00:00:00.000Z`);
    const endOfDay = new Date(`${datePart}T23:59:59.999Z`);
 
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
      date: datePart,
      slots: availableSlots,
      totalSlotsCount: dayAvailability.slots.length,
      bookedSlotsCount: bookedSlots.length,
      availableSlotsCount: availableSlots.length
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
