import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarCheck, FaAmbulance, FaRobot, FaVideo, FaFlask, FaBed, FaUserMd, FaShieldAlt } from 'react-icons/fa';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container" style={{ background: '#f8fafc' }}>
      {/* Hero Section */}
      <header className="home-hero" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#fff',
        padding: '60px 32px',
        borderRadius: '0 0 32px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '32px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)'
      }}>
        <div className="hero-content" style={{ maxWidth: '600px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(13, 148, 136, 0.2)',
            color: '#2dd4bf',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            marginBottom: '16px',
            border: '1px solid rgba(45, 212, 191, 0.3)'
          }}>
            <FaShieldAlt /> Next-Gen Smart Hospital Platform
          </div>

          <h1 style={{ fontSize: '42px', fontWeight: 800, margin: '0 0 16px', lineHeight: 1.15, letterSpacing: '-0.5px' }}>
            Advanced Healthcare, <span style={{ color: '#2dd4bf' }}>Telemedicine</span> & AI Clinical Triage
          </h1>

          <p style={{ fontSize: '16px', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 28px' }}>
            Seamlessly book appointments with top medical specialists, connect via live video consultations, access instant AI symptom triage, and review digital prescriptions & lab reports.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'linear-gradient(135deg, #0d9488, #10b981)',
                color: '#fff',
                border: 'none',
                padding: '13px 26px',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(13, 148, 136, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FaCalendarCheck /> Book Consultation
            </button>

            <button
              onClick={() => navigate('/emergency')}
              style={{
                background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                color: '#fff',
                border: 'none',
                padding: '13px 26px',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(220, 38, 38, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FaAmbulance /> 24/7 Emergency Care
            </button>
          </div>
        </div>

        <div style={{ flex: '1', minWidth: '320px', maxWidth: '480px' }}>
          <img
            src="https://images.unsplash.com/photo-1576765607925-9c2c7a3b1a6b?auto=format&fit=crop&w=800&q=80"
            alt="Smart Hospital Facility"
            style={{
              width: '100%',
              borderRadius: '20px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              border: '2px solid rgba(255, 255, 255, 0.1)'
            }}
          />
        </div>
      </header>

      {/* Feature Highlights Grid */}
      <section style={{ maxWidth: '1100px', margin: '48px auto', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2 style={{ fontSize: '28px', color: '#0f172a', fontWeight: 800, margin: '0 0 10px' }}>
            Comprehensive Integrated Hospital Modules
          </h2>
          <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
            Designed for high clinical precision, rapid emergency response, and patient comfort.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <span style={{ background: '#ecfdf5', color: '#059669', padding: '12px', borderRadius: '12px', display: 'inline-block', marginBottom: '14px' }}>
              <FaRobot size={24} />
            </span>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#0f172a' }}>AI Clinical Triage</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
              Interactive symptom analysis offering instant urgency scores, first-aid advice, and specialty matching.
            </p>
          </div>

          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <span style={{ background: '#eff6ff', color: '#2563eb', padding: '12px', borderRadius: '12px', display: 'inline-block', marginBottom: '14px' }}>
              <FaVideo size={24} />
            </span>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#0f172a' }}>Virtual Telemedicine</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
              HD encrypted audio-video consultation rooms directly in your dashboard with screen share and instant chat.
            </p>
          </div>

          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <span style={{ background: '#faf5ff', color: '#9333ea', padding: '12px', borderRadius: '12px', display: 'inline-block', marginBottom: '14px' }}>
              <FaFlask size={24} />
            </span>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#0f172a' }}>Diagnostic Lab Reports</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
              Direct access to complete blood counts, X-rays, pathology reports, and verified physician evaluations.
            </p>
          </div>

          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <span style={{ background: '#fff7ed', color: '#ea580c', padding: '12px', borderRadius: '12px', display: 'inline-block', marginBottom: '14px' }}>
              <FaBed size={24} />
            </span>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#0f172a' }}>Ward & Bed Management</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
              Real-time ICU, General Ward, and Emergency bed occupancy tracking for hospital administration.
            </p>
          </div>
        </div>
      </section>

      {/* Hospital Details / Contact */}
      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '40px 20px', borderTop: '1px solid #1e293b' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <h3 style={{ color: '#fff', margin: '0 0 8px', fontSize: '18px' }}>Smart Hospital System</h3>
            <p style={{ margin: 0, fontSize: '13px', maxWidth: '300px', lineHeight: 1.6 }}>
              Dedicated to delivering excellence in clinical care, compassionate emergency services, and telemedicine innovation.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#fff', margin: '0 0 10px', fontSize: '14px' }}>Emergency Assistance</h4>
            <p style={{ margin: '0 0 4px', fontSize: '13px' }}>📞 24/7 Helpline: 1800-123-4567</p>
            <p style={{ margin: '0 0 4px', fontSize: '13px' }}>🚑 Trauma Center: Block A, Ground Floor</p>
            <p style={{ margin: 0, fontSize: '13px' }}>✉️ contact@smarthospital.com</p>
          </div>

          <div>
            <h4 style={{ color: '#fff', margin: '0 0 10px', fontSize: '14px' }}>Hospital Address</h4>
            <p style={{ margin: '0 0 4px', fontSize: '13px' }}>123 Health Avenue, Medical Enclave</p>
            <p style={{ margin: 0, fontSize: '13px' }}>Wellness City, PIN 560001</p>
          </div>
        </div>

        <div style={{ maxWidth: '1100px', margin: '24px auto 0', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', fontSize: '12px' }}>
          © {new Date().getFullYear()} Smart Hospital Management System. All clinical rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;