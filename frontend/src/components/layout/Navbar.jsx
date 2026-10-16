import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHospital, FaAmbulance, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import './Navbar.css';

const Navbar = ({ isAuthenticated, userRole, setIsAuthenticated, setUserRole }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    navigate('/login', { replace: true });
    setIsAuthenticated(false);
    setUserRole(null);
  };

  const handleNavigation = (path) => {
    navigate(path, { replace: true });
  };

  const roleLabels = {
    doctor: 'Physician',
    patient: 'Patient',
    management: 'Administrator'
  };

  return (
    <nav className="navbar" style={{
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      padding: '12px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div
        className="navbar-brand"
        onClick={() => handleNavigation('/')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer'
        }}
      >
        <span style={{
          background: 'linear-gradient(135deg, #0d9488, #10b981)',
          padding: '8px 10px',
          borderRadius: '10px',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 10px rgba(13, 148, 136, 0.4)'
        }}>
          <FaHospital size={20} />
        </span>
        <div>
          <span style={{
            fontSize: '18px',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '0.3px'
          }}>
            Smart Hospital
          </span>
          <span style={{
            display: 'block',
            fontSize: '10px',
            color: '#94a3b8',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            fontWeight: 600
          }}>
            Integrated Healthcare
          </span>
        </div>
      </div>

      <div className="navbar-menu" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Emergency Quick Action */}
        <button
          onClick={() => handleNavigation('/emergency')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, #dc2626, #ef4444)',
            color: '#ffffff',
            border: 'none',
            padding: '7px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(239, 68, 68, 0.35)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          <FaAmbulance size={14} /> 24/7 Emergency
        </button>

        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '6px 14px',
              borderRadius: '20px',
              color: '#e2e8f0',
              fontSize: '13px'
            }}>
              <FaUserCircle size={16} color="#0d9488" />
              <span>{localStorage.getItem('userName') || 'User'}</span>
              <span style={{
                background: '#0d9488',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '10px',
                textTransform: 'uppercase'
              }}>
                {roleLabels[userRole] || userRole}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="logout-button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#f8fafc',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => handleNavigation('/login')}
              style={{
                background: 'transparent',
                color: '#e2e8f0',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '7px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => handleNavigation('/register')}
              style={{
                background: 'linear-gradient(135deg, #0d9488, #10b981)',
                color: '#ffffff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(13, 148, 136, 0.3)'
              }}
            >
              Register
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;