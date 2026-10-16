const mongoose = require('mongoose');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
require('dotenv').config();

const realDoctors = [
  // Cardiology
  {
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@hospital.com',
    password: '123456',
    specialization: 'Cardiology',
    experience: 15,
    contactNumber: '9876543210',
    mobileNumber: '9876543210',
    gender: 'Male',
    age: 45,
    bloodGroup: 'B+'
  },
  {
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@hospital.com',
    password: '123456',
    specialization: 'Cardiology',
    experience: 12,
    contactNumber: '9876543211',
    mobileNumber: '9876543211',
    gender: 'Female',
    age: 38,
    bloodGroup: 'A+'
  },
  
  // Neurology
  {
    name: 'Dr. Amit Patel',
    email: 'amit.patel@hospital.com',
    password: '123456',
    specialization: 'Neurology',
    experience: 18,
    contactNumber: '9876543212',
    mobileNumber: '9876543212',
    gender: 'Male',
    age: 48,
    bloodGroup: 'O+'
  },
  {
    name: 'Dr. Sunita Gupta',
    email: 'sunita.gupta@hospital.com',
    password: '123456',
    specialization: 'Neurology',
    experience: 14,
    contactNumber: '9876543213',
    mobileNumber: '9876543213',
    gender: 'Female',
    age: 42,
    bloodGroup: 'AB+'
  },
  
  // Orthopedics
  {
    name: 'Dr. Vikram Singh',
    email: 'vikram.singh@hospital.com',
    password: '123456',
    specialization: 'Orthopedics',
    experience: 16,
    contactNumber: '9876543214',
    mobileNumber: '9876543214',
    gender: 'Male',
    age: 46,
    bloodGroup: 'B+'
  },
  {
    name: 'Dr. Meera Reddy',
    email: 'meera.reddy@hospital.com',
    password: '123456',
    specialization: 'Orthopedics',
    experience: 11,
    contactNumber: '9876543215',
    mobileNumber: '9876543215',
    gender: 'Female',
    age: 36,
    bloodGroup: 'A-'
  },
  
  // Pediatrics
  {
    name: 'Dr. Arjun Mehta',
    email: 'arjun.mehta@hospital.com',
    password: '123456',
    specialization: 'Pediatrics',
    experience: 13,
    contactNumber: '9876543216',
    mobileNumber: '9876543216',
    gender: 'Male',
    age: 40,
    bloodGroup: 'O+'
  },
  {
    name: 'Dr. Kavya Nair',
    email: 'kavya.nair@hospital.com',
    password: '123456',
    specialization: 'Pediatrics',
    experience: 9,
    contactNumber: '9876543217',
    mobileNumber: '9876543217',
    gender: 'Female',
    age: 34,
    bloodGroup: 'A+'
  },
  
  // Dermatology
  {
    name: 'Dr. Rohit Jain',
    email: 'rohit.jain@hospital.com',
    password: '123456',
    specialization: 'Dermatology',
    experience: 10,
    contactNumber: '9876543218',
    mobileNumber: '9876543218',
    gender: 'Male',
    age: 37,
    bloodGroup: 'B-'
  },
  {
    name: 'Dr. Anjali Verma',
    email: 'anjali.verma@hospital.com',
    password: '123456',
    specialization: 'Dermatology',
    experience: 8,
    contactNumber: '9876543219',
    mobileNumber: '9876543219',
    gender: 'Female',
    age: 33,
    bloodGroup: 'AB-'
  },
  
  // Gynecology
  {
    name: 'Dr. Deepika Agarwal',
    email: 'deepika.agarwal@hospital.com',
    password: '123456',
    specialization: 'Gynecology',
    experience: 17,
    contactNumber: '9876543220',
    mobileNumber: '9876543220',
    gender: 'Female',
    age: 47,
    bloodGroup: 'O-'
  },
  {
    name: 'Dr. Sanjana Rao',
    email: 'sanjana.rao@hospital.com',
    password: '123456',
    specialization: 'Gynecology',
    experience: 12,
    contactNumber: '9876543221',
    mobileNumber: '9876543221',
    gender: 'Female',
    age: 39,
    bloodGroup: 'A+'
  },
  
  // Psychiatry
  {
    name: 'Dr. Karan Malhotra',
    email: 'karan.malhotra@hospital.com',
    password: '123456',
    specialization: 'Psychiatry',
    experience: 14,
    contactNumber: '9876543222',
    mobileNumber: '9876543222',
    gender: 'Male',
    age: 43,
    bloodGroup: 'B+'
  },
  {
    name: 'Dr. Ritika Chopra',
    email: 'ritika.chopra@hospital.com',
    password: '123456',
    specialization: 'Psychiatry',
    experience: 11,
    contactNumber: '9876543223',
    mobileNumber: '9876543223',
    gender: 'Female',
    age: 38,
    bloodGroup: 'AB+'
  },
  
  // Gastroenterology
  {
    name: 'Dr. Suresh Bansal',
    email: 'suresh.bansal@hospital.com',
    password: '123456',
    specialization: 'Gastroenterology',
    experience: 19,
    contactNumber: '9876543224',
    mobileNumber: '9876543224',
    gender: 'Male',
    age: 50,
    bloodGroup: 'O+'
  },
  {
    name: 'Dr. Pooja Khanna',
    email: 'pooja.khanna@hospital.com',
    password: '123456',
    specialization: 'Gastroenterology',
    experience: 13,
    contactNumber: '9876543225',
    mobileNumber: '9876543225',
    gender: 'Female',
    age: 41,
    bloodGroup: 'A-'
  },
  
  // Ophthalmology
  {
    name: 'Dr. Nitin Saxena',
    email: 'nitin.saxena@hospital.com',
    password: '123456',
    specialization: 'Ophthalmology',
    experience: 16,
    contactNumber: '9876543226',
    mobileNumber: '9876543226',
    gender: 'Male',
    age: 45,
    bloodGroup: 'B-'
  },
  {
    name: 'Dr. Shweta Mishra',
    email: 'shweta.mishra@hospital.com',
    password: '123456',
    specialization: 'Ophthalmology',
    experience: 10,
    contactNumber: '9876543227',
    mobileNumber: '9876543227',
    gender: 'Female',
    age: 36,
    bloodGroup: 'AB-'
  },
  
  // ENT (Ear, Nose, Throat)
  {
    name: 'Dr. Manish Tiwari',
    email: 'manish.tiwari@hospital.com',
    password: '123456',
    specialization: 'ENT',
    experience: 12,
    contactNumber: '9876543228',
    mobileNumber: '9876543228',
    gender: 'Male',
    age: 39,
    bloodGroup: 'O-'
  },
  {
    name: 'Dr. Neha Srivastava',
    email: 'neha.srivastava@hospital.com',
    password: '123456',
    specialization: 'ENT',
    experience: 9,
    contactNumber: '9876543229',
    mobileNumber: '9876543229',
    gender: 'Female',
    age: 35,
    bloodGroup: 'A+'
  },
  
  // Emergency Medicine
  {
    name: 'Dr. Ravi Chandra',
    email: 'ravi.chandra@hospital.com',
    password: '123456',
    specialization: 'Emergency Medicine',
    experience: 15,
    contactNumber: '9876543230',
    mobileNumber: '9876543230',
    gender: 'Male',
    age: 44,
    bloodGroup: 'B+'
  }
];

const seedRealDoctors = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Smart-Hospital-System');
    console.log('Connected to MongoDB');

    // Clear existing doctors (optional - comment out if you want to keep existing ones)
    // await User.deleteMany({ role: 'doctor' });
    // await Doctor.deleteMany({});
    // console.log('Cleared existing doctors');

    let createdCount = 0;
    let skippedCount = 0;

    for (const doctorData of realDoctors) {
      try {
        // Check if doctor already exists in User collection
        const existingUser = await User.findOne({ email: doctorData.email });
        
        if (!existingUser) {
          // Create user entry
          const userData = {
            name: doctorData.name,
            email: doctorData.email,
            password: doctorData.password,
            mobileNumber: doctorData.mobileNumber,
            gender: doctorData.gender,
            age: doctorData.age,
            bloodGroup: doctorData.bloodGroup,
            role: 'doctor',
            specialization: doctorData.specialization
          };

          const user = new User(userData);
          await user.save();

          // Create doctor entry
          const doctor = new Doctor({
            name: doctorData.name,
            email: doctorData.email,
            password: user.password, // Use hashed password from User model
            specialization: doctorData.specialization,
            experience: doctorData.experience,
            contactNumber: doctorData.contactNumber,
            role: 'doctor'
          });

          await doctor.save();
          createdCount++;
          console.log(`✓ Created doctor: ${doctorData.name} (${doctorData.specialization})`);
        } else {
          skippedCount++;
          console.log(`- Skipped existing doctor: ${doctorData.name}`);
        }
      } catch (error) {
        console.error(`Error creating doctor ${doctorData.name}:`, error.message);
      }
    }

    console.log('\n=== Seeding Summary ===');
    console.log(`✓ Created: ${createdCount} doctors`);
    console.log(`- Skipped: ${skippedCount} existing doctors`);
    console.log(`📊 Total doctors in database: ${await Doctor.countDocuments()}`);
    
    // Show specialization breakdown
    const specializations = await Doctor.aggregate([
      { $group: { _id: '$specialization', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('\n=== Specialization Breakdown ===');
    specializations.forEach(spec => {
      console.log(`${spec._id}: ${spec.count} doctors`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding doctors:', error);
    process.exit(1);
  }
};

seedRealDoctors();
