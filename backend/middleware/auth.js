const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Management = require('../models/Management');
const Patient = require('../models/Patient');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user data based on role
    if (decoded.role === 'doctor') {
      let doctor = await Doctor.findById(decoded.id);
      let user = null;
      if (!doctor) {
        user = await User.findById(decoded.id);
        if (user) {
          doctor = await Doctor.findOne({ email: user.email });
        }
      }
      if (!doctor && !user) {
        console.log('Auth middleware: Doctor not found for ID', decoded.id);
        return res.status(401).json({ message: 'Doctor not found' });
      }
      req.user = {
        id: doctor ? doctor._id : user._id,
        email: doctor ? doctor.email : user.email,
        role: 'doctor'
      };
    } else if (decoded.role === 'management') {
      let management = await Management.findById(decoded.id);
      let user = null;
      if (!management) {
        user = await User.findById(decoded.id);
        if (user) {
          management = await Management.findOne({ email: user.email });
        }
      }
      if (!management && !user) {
        console.log('Auth middleware: Management user not found for ID', decoded.id);
        return res.status(401).json({ message: 'Management user not found' });
      }
      req.user = {
        id: management ? management._id : user._id,
        email: management ? management.email : user.email,
        role: 'management'
      };
    } else {
      let user = await User.findById(decoded.id);
      if (!user) {
        const patient = await Patient.findById(decoded.id);
        if (patient) {
          user = patient;
        }
      }
      if (!user) {
        console.log('Auth middleware: User not found for ID', decoded.id);
        return res.status(401).json({ message: 'User not found' });
      }
      req.user = {
        id: user._id,
        email: user.email,
        role: user.role || decoded.role || 'patient'
      };
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const checkRole = (roles) => {
  return (req, res, next) => {
    console.log('checkRole middleware: User role is', req.user?.role);
    console.log('checkRole middleware: Required roles are', roles);
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
    next();
  };
};

module.exports = { auth, checkRole }; 