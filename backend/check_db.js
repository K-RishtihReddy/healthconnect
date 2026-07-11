const mongoose = require('mongoose');

async function check() {
  try {
    await mongoose.connect('mongodb://localhost:27017/healthconnect');
    console.log("Connected to MongoDB");

    const users = await mongoose.connection.db.collection('users').find().toArray();
    console.log("\n--- Users ---");
    users.forEach(u => {
      console.log(`Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, ID: ${u._id}`);
    });

    const doctors = await mongoose.connection.db.collection('doctors').find().toArray();
    console.log("\n--- Doctors ---");
    doctors.forEach(d => {
      console.log(`Doctor ID: ${d._id}, UserID: ${d.userId}, Verified: ${d.isVerified}`);
    });

    const appts = await mongoose.connection.db.collection('appointments').find().toArray();
    console.log("\n--- Appointments ---");
    appts.forEach(a => {
      console.log(`Date: ${a.date}, Time: ${a.timeSlot}, Doctor: ${a.doctorId}, Patient: ${a.patientId}, Status: ${a.status}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
