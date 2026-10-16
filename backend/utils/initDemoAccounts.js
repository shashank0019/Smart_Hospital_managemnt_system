const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Management = require('../models/Management');
const Patient = require('../models/Patient');
const Medicine = require('../models/Medicine');
const Bed = require('../models/Bed');
const Invoice = require('../models/Invoice');

const initDemoAccounts = async () => {
  try {
    console.log('--- Initializing / Verifying Demo Accounts & Essential Data ---');

    // 1. Management Account (management@gmail.com / 123456)
    let mgmtUser = await User.findOne({ email: 'management@gmail.com' });
    if (!mgmtUser) {
      mgmtUser = new User({
        name: 'Apex Hospital Administration',
        email: 'management@gmail.com',
        password: '123456',
        mobileNumber: '9876543211',
        gender: 'Other',
        age: 38,
        bloodGroup: 'O+',
        role: 'management'
      });
      await mgmtUser.save();
      console.log('Created demo management in User collection: management@gmail.com');
    }

    let mgmtDoc = await Management.findOne({ email: 'management@gmail.com' });
    if (!mgmtDoc) {
      mgmtDoc = new Management({
        email: 'management@gmail.com',
        password: mgmtUser.password,
        role: 'management'
      });
      await mgmtDoc.save();
      console.log('Created demo management in Management collection: management@gmail.com');
    }

    // Sync all existing management users into Management collection
    const allMgmtUsers = await User.find({ role: 'management' });
    for (const u of allMgmtUsers) {
      const exists = await Management.findOne({ email: u.email });
      if (!exists) {
        await Management.create({
          email: u.email,
          password: u.password,
          role: 'management'
        });
        console.log(`Synced user ${u.email} into Management collection`);
      }
    }

    // 2. Doctor Account (doctor@gmail.com / 123456)
    let docUser = await User.findOne({ email: 'doctor@gmail.com' });
    if (!docUser) {
      docUser = new User({
        name: 'Dr. Sarah Jenkins',
        email: 'doctor@gmail.com',
        password: '123456',
        mobileNumber: '9876543210',
        gender: 'Female',
        age: 36,
        bloodGroup: 'A+',
        role: 'doctor',
        specialization: 'General Medicine'
      });
      await docUser.save();
      console.log('Created demo doctor in User collection: doctor@gmail.com');
    }

    let doctorProfile = await Doctor.findOne({ email: 'doctor@gmail.com' });
    if (!doctorProfile) {
      doctorProfile = new Doctor({
        name: 'Dr. Sarah Jenkins',
        email: 'doctor@gmail.com',
        password: docUser.password,
        specialization: 'General Medicine',
        experience: 8,
        contactNumber: '9876543210',
        consultationFee: 500,
        roomNumber: 'Room 204',
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        workingHours: { start: '09:00', end: '17:00' },
        slotDuration: 30,
        role: 'doctor'
      });
      await doctorProfile.save();
      console.log('Created demo doctor in Doctor collection: doctor@gmail.com');
    }

    // Sync all existing doctor users into Doctor collection
    const allDoctorUsers = await User.find({ role: 'doctor' });
    for (const u of allDoctorUsers) {
      const exists = await Doctor.findOne({ email: u.email });
      if (!exists) {
        await Doctor.create({
          name: u.name || 'Doctor',
          email: u.email,
          password: u.password,
          specialization: u.specialization || 'General Medicine',
          experience: 5,
          contactNumber: u.mobileNumber || '9876543210',
          consultationFee: 500,
          roomNumber: 'Room 101',
          role: 'doctor'
        });
        console.log(`Synced user ${u.email} into Doctor collection`);
      }
    }

    // 3. Patient Accounts (vv88610705@gmail.com and patient@gmail.com / 123456)
    const patientDemos = [
      { name: 'John Doe', email: 'vv88610705@gmail.com', mobile: '9876543212', gender: 'Male', age: 29, bloodGroup: 'B+' },
      { name: 'Demo Patient', email: 'patient@gmail.com', mobile: '9876543213', gender: 'Male', age: 26, bloodGroup: 'O+' }
    ];

    for (const p of patientDemos) {
      let patUser = await User.findOne({ email: p.email });
      if (!patUser) {
        patUser = new User({
          name: p.name,
          email: p.email,
          password: '123456',
          mobileNumber: p.mobile,
          gender: p.gender,
          age: p.age,
          bloodGroup: p.bloodGroup,
          role: 'patient'
        });
        await patUser.save();
        console.log(`Created demo patient in User collection: ${p.email}`);
      }

      let patProfile = await Patient.findOne({ email: p.email });
      if (!patProfile) {
        patProfile = new Patient({
          name: p.name,
          email: p.email,
          password: patUser.password,
          mobileNumber: p.mobile,
          gender: p.gender,
          age: p.age,
          bloodGroup: p.bloodGroup,
          role: 'patient'
        });
        await patProfile.save();
        console.log(`Created demo patient in Patient collection: ${p.email}`);
      }
    }

    // 4. Seed Medicines if empty
    const medCount = await Medicine.countDocuments();
    if (medCount === 0) {
      const sampleMeds = [
        { name: 'Paracetamol 500mg', quantity: 150, expiryDate: new Date('2027-12-31') },
        { name: 'Amoxicillin 250mg', quantity: 80, expiryDate: new Date('2027-08-15') },
        { name: 'Ibuprofen 400mg', quantity: 120, expiryDate: new Date('2028-01-20') },
        { name: 'Metformin 500mg', quantity: 95, expiryDate: new Date('2027-11-10') },
        { name: 'Cetirizine 10mg', quantity: 200, expiryDate: new Date('2028-05-30') },
        { name: 'Azithromycin 500mg', quantity: 60, expiryDate: new Date('2027-09-18') },
        { name: 'Omeprazole 20mg', quantity: 110, expiryDate: new Date('2027-10-05') }
      ];
      await Medicine.insertMany(sampleMeds);
      console.log('Seeded sample medicine inventory (7 items)');
    }

    // 5. Seed Beds if empty
    const bedCount = await Bed.countDocuments();
    if (bedCount === 0) {
      const sampleBeds = [
        { bedNumber: 'ICU-01', ward: 'ICU', floor: '2nd Floor', status: 'Available', dailyRate: 5000 },
        { bedNumber: 'ICU-02', ward: 'ICU', floor: '2nd Floor', status: 'Occupied', patientName: 'Robert Vance', admissionDate: new Date(), dailyRate: 5000 },
        { bedNumber: 'GW-101', ward: 'General Ward', floor: '1st Floor', status: 'Available', dailyRate: 1500 },
        { bedNumber: 'GW-102', ward: 'General Ward', floor: '1st Floor', status: 'Available', dailyRate: 1500 },
        { bedNumber: 'GW-103', ward: 'General Ward', floor: '1st Floor', status: 'Occupied', patientName: 'Michael Scott', admissionDate: new Date(), dailyRate: 1500 },
        { bedNumber: 'EMG-01', ward: 'Emergency Care', floor: 'Ground Floor', status: 'Available', dailyRate: 3500 },
        { bedNumber: 'EMG-02', ward: 'Emergency Care', floor: 'Ground Floor', status: 'Occupied', patientName: 'Pam Beesly', admissionDate: new Date(), dailyRate: 3500 },
        { bedNumber: 'MAT-01', ward: 'Maternity', floor: '3rd Floor', status: 'Available', dailyRate: 2500 },
        { bedNumber: 'PED-01', ward: 'Pediatric', floor: '3rd Floor', status: 'Available', dailyRate: 2000 },
        { bedNumber: 'SURG-01', ward: 'Surgical Ward', floor: '2nd Floor', status: 'Maintenance', dailyRate: 4000 }
      ];
      await Bed.insertMany(sampleBeds);
      console.log('Seeded sample ward beds (10 beds across wards)');
    }

    // 6. Seed Invoices if empty
    const invCount = await Invoice.countDocuments();
    if (invCount === 0 && mgmtUser && docUser) {
      const samplePatient = await User.findOne({ role: 'patient' });
      const sampleDoctor = await Doctor.findOne({ email: 'doctor@gmail.com' });
      if (samplePatient && sampleDoctor) {
        const sampleInvoices = [
          {
            invoiceNumber: 'INV-2026-1001',
            patient: samplePatient._id,
            patientName: samplePatient.name,
            doctor: sampleDoctor._id,
            items: [
              { description: 'General Consultation', category: 'Consultation', amount: 500 },
              { description: 'Paracetamol & Antibiotic pack', category: 'Pharmacy / Medicine', amount: 350 }
            ],
            subtotal: 850,
            tax: 42.5,
            discount: 0,
            totalAmount: 892.5,
            paymentStatus: 'Paid',
            paymentMethod: 'UPI / Online',
            paidAt: new Date()
          },
          {
            invoiceNumber: 'INV-2026-1002',
            patient: samplePatient._id,
            patientName: samplePatient.name,
            doctor: sampleDoctor._id,
            items: [
              { description: 'Comprehensive Blood Test Panel', category: 'Lab Test', amount: 1200 },
              { description: 'Physician Review Consultation', category: 'Consultation', amount: 500 }
            ],
            subtotal: 1700,
            tax: 85,
            discount: 100,
            totalAmount: 1685,
            paymentStatus: 'Pending',
            paymentMethod: 'UPI / Online'
          }
        ];
        await Invoice.insertMany(sampleInvoices);
        console.log('Seeded sample billing invoices (2 invoices)');
      }
    }

    console.log('--- Demo Accounts & Essential Data Initialized Successfully ---');
  } catch (err) {
    console.error('Error in initDemoAccounts:', err);
  }
};

module.exports = initDemoAccounts;
