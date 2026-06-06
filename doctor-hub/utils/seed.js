const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

const connectDB = require('../config/db');

const seedData = async () => {
  await connectDB();

  // Clear existing
  await User.deleteMany({});
  await Doctor.deleteMany({});
  await Patient.deleteMany({});

  console.log('🗑️  Cleared existing data');

  const password = await bcrypt.hash('password123', 12);

  // Create users
  const superAdmin = await User.create({
    name: 'Super Admin',
    email: 'superadmin@doctorhub.com',
    password: 'password123',
    role: 'super_admin',
    phone: '03001234567',
  });

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@doctorhub.com',
    password: 'password123',
    role: 'admin',
    phone: '03011234567',
  });

  const doctorUser1 = await User.create({
    name: 'Dr. Ahmad Raza',
    email: 'dr.ahmad@doctorhub.com',
    password: 'password123',
    role: 'doctor',
    phone: '03021234567',
  });

  const doctorUser2 = await User.create({
    name: 'Dr. Sara Khan',
    email: 'dr.sara@doctorhub.com',
    password: 'password123',
    role: 'doctor',
    phone: '03031234567',
  });

  const doctorUser3 = await User.create({
    name: 'Dr. Bilal Ahmed',
    email: 'dr.bilal@doctorhub.com',
    password: 'password123',
    role: 'doctor',
    phone: '03041234567',
  });

  const assistantUser = await User.create({
    name: 'Ali Assistant',
    email: 'assistant@doctorhub.com',
    password: 'password123',
    role: 'assistant',
    phone: '03051234567',
  });

  const patientUser = await User.create({
    name: 'Rayan Patient',
    email: 'patient@doctorhub.com',
    password: 'password123',
    role: 'patient',
    phone: '03061234567',
  });

  // Create doctor profiles
  await Doctor.create({
    user: doctorUser1._id,
    specialization: 'General Physician',
    treatmentType: 'allopathic',
    diseases: ['fever', 'cold', 'flu', 'hypertension', 'diabetes'],
    experience: 10,
    qualification: 'MBBS, FCPS',
    bio: 'Experienced general physician with 10 years in allopathic medicine.',
    isVerified: true,
    rating: 4.8,
    totalReviews: 120,
    consultationFee: 1500,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    clinics: [{
      name: 'Raza Medical Center',
      address: 'Block 5, Gulshan-e-Iqbal',
      city: 'Karachi',
      timings: 'Mon-Fri 9AM-5PM',
      fee: 1500,
    }],
  });

  await Doctor.create({
    user: doctorUser2._id,
    specialization: 'Homeopathic Specialist',
    treatmentType: 'homeopathic',
    diseases: ['skin problems', 'allergies', 'asthma', 'migraine'],
    experience: 8,
    qualification: 'BHMS, DHom',
    bio: 'Specialist in homeopathic treatment for chronic conditions.',
    isVerified: true,
    rating: 4.5,
    totalReviews: 80,
    consultationFee: 1000,
    availableDays: ['Monday', 'Wednesday', 'Saturday'],
    clinics: [{
      name: 'Sara Homeo Clinic',
      address: 'G-10 Markaz',
      city: 'Islamabad',
      timings: 'Mon, Wed, Sat 10AM-4PM',
      fee: 1000,
    }],
  });

  await Doctor.create({
    user: doctorUser3._id,
    specialization: 'Herbal Medicine Expert',
    treatmentType: 'herbal',
    diseases: ['digestive issues', 'liver problems', 'joint pain', 'obesity'],
    experience: 15,
    qualification: 'PhD Herbal Medicine',
    bio: 'Expert in traditional herbal remedies and natural treatments.',
    isVerified: true,
    rating: 4.6,
    totalReviews: 95,
    consultationFee: 800,
    availableDays: ['Tuesday', 'Thursday', 'Saturday'],
    clinics: [{
      name: 'Green Herbal Center',
      address: 'Model Town',
      city: 'Lahore',
      timings: 'Tue, Thu, Sat 11AM-6PM',
      fee: 800,
    }],
  });

  // Create patient profile
  await Patient.create({
    user: patientUser._id,
    dateOfBirth: new Date('1998-05-15'),
    gender: 'male',
    bloodGroup: 'O+',
    address: 'Johar Town, Lahore',
  });

  console.log('✅ Seed data created successfully!\n');
  console.log('--- LOGIN CREDENTIALS ---');
  console.log('Super Admin : superadmin@doctorhub.com / password123');
  console.log('Admin       : admin@doctorhub.com / password123');
  console.log('Doctor 1    : dr.ahmad@doctorhub.com / password123');
  console.log('Doctor 2    : dr.sara@doctorhub.com / password123');
  console.log('Doctor 3    : dr.bilal@doctorhub.com / password123');
  console.log('Assistant   : assistant@doctorhub.com / password123');
  console.log('Patient     : patient@doctorhub.com / password123');

  process.exit(0);
};

seedData().catch(err => {
  console.error(err);
  process.exit(1);
});
