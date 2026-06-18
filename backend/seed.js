const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/user');
const Doctor = require('./models/doctor');
const Category = require('./models/category');
const Appointment = require('./models/appointment');
const MedicalRecord = require('./models/medicalRecord');
const Prescription = require('./models/prescription');
const FollowUp = require('./models/followUp');

dotenv.config();

const categories = [
  { name: 'Cardiology', description: 'Heart and cardiovascular health', icon: 'Heart' },
  { name: 'Pediatrics', description: 'Children health and development', icon: 'Baby' },
  { name: 'Dermatology', description: 'Skin, hair, and nail treatments', icon: 'Sparkles' },
  { name: 'Neurology', description: 'Brain, nerves, and spinal cord care', icon: 'Brain' },
  { name: 'Orthopedics', description: 'Bone, joint, and muscle care', icon: 'Activity' },
  { name: 'General Medicine', description: 'General checkups and diagnostic healthcare', icon: 'Stethoscope' }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/healthconnect');
    console.log('MongoDB Connected for Seeding...');

    // Clear existing data
    await User.deleteMany();
    await Doctor.deleteMany();
    await Category.deleteMany();
    await Appointment.deleteMany();
    await MedicalRecord.deleteMany();
    await Prescription.deleteMany();
    await FollowUp.deleteMany();
    console.log('Database collections cleared!');

    // Seed Categories
    const seededCategories = await Category.insertMany(categories);
    console.log(`Seeded ${seededCategories.length} categories.`);

    // Seed Admin
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@healthconnect.com',
      password: 'admin123', // Will be hashed by pre-save middleware
      role: 'admin',
      phone: '+15550199',
      gender: 'Male',
      address: 'HealthConnect Headquarters'
    });
    console.log('Seeded Admin account:', admin.email);

    // Seed Patient
    const patient = await User.create({
      name: 'John Doe',
      email: 'patient@healthconnect.com',
      password: 'patient123',
      role: 'patient',
      phone: '+15550188',
      gender: 'Male',
      dateOfBirth: new Date('1990-05-15'),
      address: '742 Evergreen Terrace, Springfield'
    });
    console.log('Seeded Patient account:', patient.email);

    // Seed Verified Doctor
    const docUser1 = await User.create({
      name: 'Dr. Sarah Connor',
      email: 'doctor@healthconnect.com',
      password: 'doctor123',
      role: 'doctor',
      phone: '+15550177',
      gender: 'Female',
      dateOfBirth: new Date('1980-08-25'),
      address: 'Suite 404, Medical Center Complex'
    });

    const docProfile1 = await Doctor.create({
      userId: docUser1._id,
      specialization: 'Cardiology',
      experience: 15,
      qualification: 'MBBS, MD Cardiology (Stanford University)',
      fees: 150,
      bio: 'Dr. Sarah Connor has over 15 years of experience in managing cardiac disorders, including heart failure, arrhythmia, and coronary artery disease.',
      availability: [
        { day: 'Monday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
        { day: 'Wednesday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
        { day: 'Friday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] }
      ],
      isVerified: true,
      rating: 4.8
    });
    console.log('Seeded Verified Doctor:', docUser1.email);

    // Seed Pending Doctor
    const docUser2 = await User.create({
      name: 'Dr. James Smith',
      email: 'doctor2@healthconnect.com',
      password: 'doctor123',
      role: 'doctor',
      phone: '+15550166',
      gender: 'Male',
      dateOfBirth: new Date('1988-12-10'),
      address: '100 Broadway St, New York'
    });

    const docProfile2 = await Doctor.create({
      userId: docUser2._id,
      specialization: 'Pediatrics',
      experience: 8,
      qualification: 'MBBS, MD Pediatrics (Johns Hopkins University)',
      fees: 100,
      bio: 'Dr. James Smith specializes in pediatric care, child growth monitoring, and pediatric disease management.',
      availability: [
        { day: 'Tuesday', slots: ['09:00', '10:00', '11:00', '12:00'] },
        { day: 'Thursday', slots: ['14:00', '15:00', '16:00', '17:00'] }
      ],
      isVerified: false, // Pending verification
      rating: 4.5
    });
    console.log('Seeded Pending Doctor (Awaiting Verification):', docUser2.email);

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedDB();
