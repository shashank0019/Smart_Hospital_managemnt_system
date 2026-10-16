import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { FaHospital, FaUserInjured, FaUserMd, FaBuilding, FaBolt } from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';
import './Auth.css';

const Login = ({ setIsAuthenticated, setUserRole }) => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('patient');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const roleDetails = {
    patient: {
      title: 'Patient Care Portal',
      subtitle: 'Sign in to access personal health records, consults & AI triage',
      icon: <FaUserInjured size={24} />,
      color: '#0d9488',
      demoEmail: 'vv88610705@gmail.com',
      demoPass: '123456',
      placeholder: 'patient@gmail.com'
    },
    doctor: {
      title: 'Physician Clinical Portal',
      subtitle: 'Sign in to manage appointments, telemedicine & prescriptions',
      icon: <FaUserMd size={24} />,
      color: '#2563eb',
      demoEmail: 'doctor@gmail.com',
      demoPass: '123456',
      placeholder: 'doctor@gmail.com'
    },
    management: {
      title: 'Hospital Management Portal',
      subtitle: 'Sign in for ward beds, medical staff, pharmacy & billing',
      icon: <FaBuilding size={24} />,
      color: '#7c3aed',
      demoEmail: 'management@gmail.com',
      demoPass: '123456',
      placeholder: 'management@gmail.com'
    }
  };

  const currentRole = roleDetails[selectedRole];

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setError('');
  };

  const handleFillDemo = (role) => {
    setSelectedRole(role);
    setFormData({
      email: roleDetails[role].demoEmail,
      password: roleDetails[role].demoPass
    });
    setError('');
    showToast(`Autofilled demo credentials for ${roleDetails[role].title}`, 'info');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await client.post('/api/auth/login', formData);

      if (response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.user.role);
        localStorage.setItem('userId', response.data.user.id);
        localStorage.setItem('userName', response.data.user.name);
        localStorage.setItem('userEmail', response.data.user.email);

        setIsAuthenticated(true);
        setUserRole(response.data.user.role);
        showToast(`Welcome back, ${response.data.user.name}!`, 'success');

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
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Invalid email or password';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
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
            {currentRole.title}
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            {currentRole.subtitle}
          </p>
        </div>

        {/* 3 Portal Role Switcher Tabs */}
        <div className="auth-role-tabs">
          <button
            type="button"
            className={`auth-role-tab ${selectedRole === 'patient' ? 'active' : ''}`}
            onClick={() => handleRoleChange('patient')}
          >
            <FaUserInjured size={14} /> Patient
          </button>
          <button
            type="button"
            className={`auth-role-tab ${selectedRole === 'doctor' ? 'active' : ''}`}
            onClick={() => handleRoleChange('doctor')}
          >
            <FaUserMd size={14} /> Doctor
          </button>
          <button
            type="button"
            className={`auth-role-tab ${selectedRole === 'management' ? 'active' : ''}`}
            onClick={() => handleRoleChange('management')}
          >
            <FaBuilding size={14} /> Management
          </button>
        </div>

        {/* Quick One-Click Demo Login Strip */}
        <div className="demo-accounts-strip">
          <div className="demo-title">
            <FaBolt color="#f59e0b" /> One-Click Quick Test Credentials
          </div>
          <div className="demo-buttons-row">
            <button
              type="button"
              className="demo-pill-btn"
              onClick={() => handleFillDemo('patient')}
              title="Autofill Patient Account"
            >
              🩺 Demo Patient
            </button>
            <button
              type="button"
              className="demo-pill-btn"
              onClick={() => handleFillDemo('doctor')}
              title="Autofill Doctor Account"
            >
              👨‍⚕️ Demo Doctor
            </button>
            <button
              type="button"
              className="demo-pill-btn"
              onClick={() => handleFillDemo('management')}
              title="Autofill Management Account"
            >
              🏥 Demo Management
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Registered Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder={`e.g. ${currentRole.placeholder}`}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your account password"
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : `Sign In to ${currentRole.title}`}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px', color: '#64748b' }}>
          Don't have an account?{' '}
          <span
            onClick={() => navigate(`/register?role=${selectedRole}`)}
            style={{ color: '#0d9488', fontWeight: 700, cursor: 'pointer' }}
          >
            Register new account
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;