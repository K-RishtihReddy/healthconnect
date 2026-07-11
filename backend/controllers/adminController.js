const User = require('../models/user');
const Doctor = require('../models/doctor');
const Appointment = require('../models/appointment');
const Category = require('../models/category');

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If it's a doctor, delete doctor profile as well
    if (user.role === 'doctor') {
      await Doctor.deleteOne({ userId: user._id });
    }

    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending doctors list
// @route   GET /api/admin/doctors/pending
// @access  Private (Admin only)
const getPendingDoctors = async (req, res) => {
  try {
    const pendingDoctors = await Doctor.find({ isVerified: false })
      .populate('userId', 'name email phone gender avatar address')
      .sort({ createdAt: -1 });
    res.json(pendingDoctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify a doctor profile
// @route   PUT /api/admin/doctors/:id/verify
// @access  Private (Admin only)
const verifyDoctor = async (req, res) => {
  const { isVerified } = req.body; // Can pass true or false to verify/unverify

  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    doctor.isVerified = isVerified !== undefined ? isVerified : true;
    const updatedDoctor = await doctor.save();

    res.json(updatedDoctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get system analytics and metrics
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
const getSystemAnalytics = async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    
    const verifiedDoctors = await Doctor.countDocuments({ isVerified: true });
    const pendingDoctors = await Doctor.countDocuments({ isVerified: false });
    
    const totalAppointments = await Appointment.countDocuments({});
    
    // Status counts
    const statusCounts = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format status counts as a key-value object
    const appointmentsByStatus = {
      Pending: 0,
      Confirmed: 0,
      Completed: 0,
      Cancelled: 0
    };
    statusCounts.forEach(stat => {
      if (appointmentsByStatus.hasOwnProperty(stat._id)) {
        appointmentsByStatus[stat._id] = stat.count;
      }
    });

    // Specialization breakdown
    const specCounts = await Doctor.aggregate([
      {
        $group: {
          _id: '$specialization',
          count: { $sum: 1 }
        }
      }
    ]);
    // Transform to objects with 'specialization' key for frontend consistency
    const specializationBreakdown = specCounts.map(item => ({ specialization: item._id, count: item.count }));

    // Recent user registrations (last 5)
    const recentUsers = await User.find({})
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      metrics: {
        totalPatients,
        totalDoctors,
        totalAdmins,
        verifiedDoctors,
        pendingDoctors,
        totalAppointments
      },
      appointmentsByStatus,
      specializationBreakdown,
      recentUsers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add medical category
// @route   POST /api/admin/categories
// @access  Private (Admin only)
const addCategory = async (req, res) => {
  const { name, description, icon } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  try {
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({ name, description, icon });
    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get categories list (Public)
// @route   GET /api/admin/categories
// @access  Public
const getCategories = async (req, res) => {
    try {
      const categories = await Category.find({}).sort({ name: 1 });
      res.json(categories);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  };

// @desc    Update medical category (specialization)
// @route   PUT /api/admin/categories/:id
// @access  Private (Admin only)
const updateCategory = async (req, res) => {
    const { name, description, icon } = req.body;
    try {
      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      if (name) category.name = name;
      if (description) category.description = description;
      if (icon) category.icon = icon;
      const updated = await category.save();
      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  };

// @desc    Delete medical category
// @route   DELETE /api/admin/categories/:id
// @access  Private (Admin only)
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await category.deleteOne();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
  getPendingDoctors,
  verifyDoctor,
  getSystemAnalytics,
  addCategory,
  getCategories,
  updateCategory,
  deleteCategory
};
