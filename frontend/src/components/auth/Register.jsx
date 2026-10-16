import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import client from '../../api/client';
import { FaHospital, FaUserInjured, FaUserMd, FaBuilding } from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';
import './Auth.css';

const Register = ({ setIsAuthenticated, setUserRole }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get initial role from query params if passed e.g. /register?role=doctor
  const queryParams = new URLSearchParams(location.search);
  const initialRole = queryParams.get('role') || 'patient';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobileNumber: '',
    gender: 'Male',
    age: '',
    bloodGroup: 'O+',
    role: initialRole,
    specialization: initialRole === 'doctor' ? 'General Medicine' : ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const roleFromUrl = queryParams.get('role');
    if (roleFromUrl && ['patient', 'doctor', 'management'].includes(roleFromUrl)) {
      setFormData(prev => ({
        ...prev,
        role: roleFromUrl,
        specialization: roleFromUrl === 'doctor' ? (prev.specialization || 'General Medicine') : ''
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const roleDescriptions = {
    patient: {
      title: 'Patient Account Registration',
      subtitle: 'Create your digital patient profile to book appointments & access telemedicine',
      color: '#0d9488'
    },
    doctor: {
      title: 'Medical Doctor Registration',
      subtitle: 'Register as a licensed hospital physician to consult patients and manage schedule',
      color: '#2563eb'
    },
    management: {
      title: 'Hospital Management Registration',
      subtitle: 'Register as a hospital administrator to oversee ward beds, pharmacy & billing',
      color: '#7c3aed'
    }
  };

  const handleRoleSelect = (newRole) => {
    setFormData(prev => ({
      ...prev,
      role: newRole,
      specialization: newRole === 'doctor' ? (prev.specialization || 'General Medicine') : ''
    }));
    setError('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await client.post('/api/auth/register', formData);

      if (response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.user.role);
        localStorage.setItem('userId', response.data.user.id);
        localStorage.setItem('userName', response.data.user.name);
        localStorage.setItem('userEmail', response.data.user.email);

        setIsAuthenticated(true);
        setUserRole(response.data.user.role);
        showToast('Registration successful! Welcome to Smart Hospital.', 'success');

        if (response.data.user.role === 'doctor') {
          navigate('/doctor/dashboard', { replace: true });
        } else if (response.data.user.role === 'patient') {
          navigate('/patient/dashboard', { replace: true });
        } else if (response.data.user.role === 'management') {
          navigate('/management/dashboard', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please verify your details.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const currentInfo = roleDescriptions[formData.role] || roleDescriptions.patient;

  return (
    <div className="auth-container">
      <div className="auth-form-container" style={{ maxWidth: '540px' }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <span style={{
            background: 'linear-gradient(135deg, #0d9488, #10b981)',
            padding: '12px',
            borderRadius: '14px',
            color: '#fff',
            display: 'inline-flex',
            marginBottom: '10px',
            boxShadow: '0 4px 14px rgba(13, 148, 136, 0.3)'
          }}>
            <FaHospital size={26} />
          </span>
          <h2 style={{ margin: '0 0 4px', fontSize: '24px', color: '#0f172a', fontWeight: 800 }}>
            {currentInfo.title}
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            {currentInfo.subtitle}
          </p>
        </div>

        {/* 3 Portal Role Switcher Tabs */}
        <div className="auth-role-tabs">
          <button
            type="button"
            className={`auth-role-tab ${formData.role === 'patient' ? 'active' : ''}`}
            onClick={() => handleRoleSelect('patient')}
          >
            <FaUserInjured size={14} /> Patient
          </button>
          <button
            type="button"
            className={`auth-role-tab ${formData.role === 'doctor' ? 'active' : ''}`}
            onClick={() => handleRoleSelect('doctor')}
          >
            <FaUserMd size={14} /> Doctor
          </button>
          <button
            type="button"
            className={`auth-role-tab ${formData.role === 'management' ? 'active' : ''}`}
            onClick={() => handleRoleSelect('management')}
          >
            <FaBuilding size={14} /> Management
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">
              {formData.role === 'doctor' ? 'Doctor Full Name (e.g. Dr. Rajesh Sharma)' : 'Full Name'}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder={formData.role === 'doctor' ? 'e.g. Dr. Rajesh Sharma' : 'e.g. Ramesh Kumar'}
            />
          </div>

          {/* If Doctor role selected, show Specialization field */}
          {formData.role === 'doctor' && (
            <div className="form-group">
              <label htmlFor="specialization">Medical Specialization / Department *</label>
              <select
                id="specialization"
                name="specialization"
                value={formData.specialization || 'General Medicine'}
                onChange={handleChange}
                required
              >
                <option value="General Medicine">General Medicine / Physician</option>
                <option value="Cardiology">Cardiology (Heart Care)</option>
                <option value="Neurology">Neurology (Brain & Spine)</option>
                <option value="Pediatrics">Pediatrics (Child Healthcare)</option>
                <option value="Orthopedics">Orthopedics (Bone & Joint)</option>
                <option value="Dermatology">Dermatology (Skin Care)</option>
                <option value="Gynecology">Gynecology & Obstetrics</option>
                <option value="Surgery">General Surgery</option>
                <option value="Emergency Medicine">Emergency & Critical Care</option>
              </select>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="name@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Create Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Min 6 characters"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="age">Age</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                min="1"
                max="120"
                placeholder="Years"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bloodGroup">Blood Group</label>
              <select
                id="bloodGroup"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                required
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="mobileNumber">10-Digit Contact Mobile</label>
            <input
              type="tel"
              id="mobileNumber"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              required
              pattern="[0-9]{10}"
              placeholder="e.g. 9876543210"
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Registering...' : `Create ${formData.role === 'management' ? 'Management' : formData.role === 'doctor' ? 'Doctor' : 'Patient'} Account`}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px', color: '#64748b' }}>
          Already registered?{' '}
          <span
            onClick={() => navigate('/login')}
            style={{ color: '#0d9488', fontWeight: 700, cursor: 'pointer' }}
          >
            Sign in to your portal
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register;