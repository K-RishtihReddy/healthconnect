const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Doctor = require('../models/doctor');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'healthconnect_secret_123', {
    expiresIn: '30d'
  });
};

// @desc    Register user (Patient or Doctor)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, role, phone, gender, dateOfBirth, address, specialization, experience, qualification, fees, bio } = req.body;

  try {
    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create User
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'patient',
      phone,
      gender,
      dateOfBirth,
      address
    });

    if (user) {
      // If the registered user is a doctor, create the doctor profile
      if (user.role === 'doctor') {
        if (!specialization || !experience || !qualification || !fees) {
          // Rollback user creation if doctor details are missing
          await User.findByIdAndDelete(user._id);
          return res.status(400).json({ message: 'Please provide specialization, experience, qualification, and fees for Doctor role' });
        }

        await Doctor.create({
          userId: user._id,
          specialization,
          experience: Number(experience),
          qualification,
          fees: Number(fees),
          bio: bio || '',
          availability: [
            { day: 'Monday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
            { day: 'Wednesday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
            { day: 'Friday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] }
          ],
          isVerified: false // Admin must verify doctor
        });
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // If doctor, check verification status (optional: can allow login but restrict actions)
      let isVerified = true;
      if (user.role === 'doctor') {
        const doctorProfile = await Doctor.findOne({ userId: user._id });
        if (doctorProfile) {
          isVerified = doctorProfile.isVerified;
        }
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      let profileData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        address: user.address,
        avatar: user.avatar
      };

      // If doctor, append doctor profile fields
      if (user.role === 'doctor') {
        const doctorProfile = await Doctor.findOne({ userId: user._id });
        if (doctorProfile) {
          profileData.doctorProfile = doctorProfile;
        }
      }

      res.json(profileData);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
      user.gender = req.body.gender || user.gender;
      user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
      user.address = req.body.address !== undefined ? req.body.address : user.address;
      
      if (req.file) {
        // avatar file path relative to server
        user.avatar = `/uploads/${req.file.filename}`;
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      // If doctor, also allow updating doctor-specific fields if passed
      let doctorProfile = null;
      if (user.role === 'doctor') {
        doctorProfile = await Doctor.findOne({ userId: user._id });
        if (doctorProfile) {
          doctorProfile.specialization = req.body.specialization || doctorProfile.specialization;
          doctorProfile.experience = req.body.experience !== undefined ? Number(req.body.experience) : doctorProfile.experience;
          doctorProfile.qualification = req.body.qualification || doctorProfile.qualification;
          doctorProfile.fees = req.body.fees !== undefined ? Number(req.body.fees) : doctorProfile.fees;
          doctorProfile.bio = req.body.bio !== undefined ? req.body.bio : doctorProfile.bio;
          
          if (req.body.availability) {
            // Parses availability array if sent as JSON string
            try {
              doctorProfile.availability = typeof req.body.availability === 'string' 
                ? JSON.parse(req.body.availability) 
                : req.body.availability;
            } catch (err) {
              console.error('Error parsing availability', err);
            }
          }

          await doctorProfile.save();
        }
      }

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        gender: updatedUser.gender,
        dateOfBirth: updatedUser.dateOfBirth,
        address: updatedUser.address,
        avatar: updatedUser.avatar,
        doctorProfile,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
};
