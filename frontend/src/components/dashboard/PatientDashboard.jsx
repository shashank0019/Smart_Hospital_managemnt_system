import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import client, { API_BASE_URL } from '../../api/client';
import BookAppointment from '../appointments/BookAppointment';
import AppointmentHistory from '../appointments/AppointmentHistory';
import SymptomChecker from '../ai/SymptomChecker';
import LabReportsView from '../reports/LabReportsView';
import BillingView from '../billing/BillingView';
import './Dashboard.css';
import './PatientDashboard.css';
import { io } from 'socket.io-client';
import {
  FaUserMd,
  FaCalendarAlt,
  FaHistory,
  FaRobot,
  FaFlask,
  FaFileInvoiceDollar,
  FaComments,
  FaSignOutAlt,
  FaCalendarCheck,
  FaExclamationCircle,
  FaSearch
} from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('triage');
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [chatDoctor, setChatDoctor] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const socketRef = useRef(null);
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [recommendedSpec, setRecommendedSpec] = useState('');
  const { showToast } = useToast();

  const [summary, setSummary] = useState({
    upcoming: 0,
    doctors: 0,
    history: 0,
    reports: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoadingDoctors(true);
      // Fetch doctors
      const docRes = await client.get('/api/appointments/doctors');
      const docs = docRes.data || [];
      setDoctors(docs);

      // Fetch patient appointments for real metrics
      const appRes = await client.get('/api/appointments/patient');
      const apps = appRes.data || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcomingCount = apps.filter(a => {
        const d = new Date(a.date || a.appointmentDate);
        return d >= today && a.status !== 'REJECTED';
      }).length;

      // Fetch patient lab reports
      let reportCount = 0;
      try {
        const repRes = await client.get('/api/reports/my-reports');
        reportCount = (repRes.data || []).length;
      } catch (e) {}

      setSummary({
        upcoming: upcomingCount,
        doctors: docs.length,
        history: apps.length,
        reports: reportCount
      });
    } catch (err) {
      console.error('Error fetching patient dashboard data:', err);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    showToast('Logged out successfully', 'info');
    navigate('/login', { replace: true });
  };

  const handleSelectSpecialistFromAI = (specialist) => {
    setRecommendedSpec(specialist);
    setActiveTab('book');
    showToast(`Specialist ${specialist} recommended and selected for booking!`, 'success');
  };

  // Chat handling
  const handleOpenChat = (doctor) => {
    if (!userName) {
      setShowNamePrompt(true);
      setChatDoctor(doctor);
      return;
    }
    openChatWithDoctor(doctor);
  };

  const openChatWithDoctor = (doctor) => {
    setChatDoctor(doctor);
    setChatHistory([]);
    setChatMessage('');

    if (!socketRef.current) {
      socketRef.current = io(API_BASE_URL);
    }

    socketRef.current.emit('joinRoom', { room: doctor.email });

    socketRef.current.off('chatHistory');
    socketRef.current.on('chatHistory', (history) => {
      setChatHistory(history || []);
    });

    socketRef.current.off('receiveMessage');
    socketRef.current.on('receiveMessage', (msg) => {
      setChatHistory((prev) => [...prev, msg]);
    });
  };

  const handleCloseChat = () => {
    setChatDoctor(null);
    setChatHistory([]);
    setChatMessage('');
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  const handleSendMessage = () => {
    if (chatMessage.trim() && chatDoctor && socketRef.current) {
      socketRef.current.emit('sendMessage', {
        room: chatDoctor.email,
        sender: userName || 'Patient',
        text: chatMessage,
        senderRole: 'patient',
        senderEmail: localStorage.getItem('userEmail') || ''
      });
      setChatMessage('');
    }
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    setShowNamePrompt(false);
    if (userName) {
      localStorage.setItem('userName', userName);
    }
    if (chatDoctor) {
      openChatWithDoctor(chatDoctor);
    }
  };

  return (
    <div className="patient-portal">
      {/* 1. Left Corner Navigation Sidebar */}
      <aside className="patient-sidebar">
        <div>
          {/* User Profile Card */}
          <div className="patient-sidebar-user">
            <div className="sidebar-avatar">
              {(userName || 'P').charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <h3 className="sidebar-user-name" title={userName || 'Patient'}>
                {userName || 'Patient'}
              </h3>
              <div className="sidebar-user-badge">
                <span className="status-dot-active"></span>
                <span>Patient Portal</span>
              </div>
            </div>
          </div>

          {/* Section Heading */}
          <div className="sidebar-section-label">Clinical Care & Services</div>

          {/* 6 Feature Navigation Tabs */}
          <nav className="patient-sidebar-nav">
            <button
              className={`patient-nav-btn ${activeTab === 'triage' ? 'active' : ''}`}
              onClick={() => setActiveTab('triage')}
            >
              <div className="nav-btn-icon">
                <FaRobot />
              </div>
              <div className="nav-btn-text">
                <span className="nav-btn-title">AI Symptom Checker</span>
                <span className="nav-btn-sub">Smart health triage</span>
              </div>
              {activeTab === 'triage' && <span className="active-bar-indicator"></span>}
            </button>

            <button
              className={`patient-nav-btn ${activeTab === 'book' ? 'active' : ''}`}
              onClick={() => setActiveTab('book')}
            >
              <div className="nav-btn-icon">
                <FaCalendarAlt />
              </div>
              <div className="nav-btn-text">
                <span className="nav-btn-title">Book Appointment</span>
                <span className="nav-btn-sub">Schedule doctor visit</span>
              </div>
              {activeTab === 'book' && <span className="active-bar-indicator"></span>}
            </button>

            <button
              className={`patient-nav-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <div className="nav-btn-icon">
                <FaHistory />
              </div>
              <div className="nav-btn-text">
                <span className="nav-btn-title">Appointment History</span>
                <span className="nav-btn-sub">Visits & prescriptions</span>
              </div>
              {activeTab === 'history' && <span className="active-bar-indicator"></span>}
            </button>

            <button
              className={`patient-nav-btn ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <div className="nav-btn-icon">
                <FaFlask />
              </div>
              <div className="nav-btn-text">
                <span className="nav-btn-title">Diagnostic Lab Reports</span>
                <span className="nav-btn-sub">Pathology & lab tests</span>
              </div>
              {activeTab === 'reports' && <span className="active-bar-indicator"></span>}
            </button>

            <button
              className={`patient-nav-btn ${activeTab === 'billing' ? 'active' : ''}`}
              onClick={() => setActiveTab('billing')}
            >
              <div className="nav-btn-icon">
                <FaFileInvoiceDollar />
              </div>
              <div className="nav-btn-text">
                <span className="nav-btn-title">Billing & Receipts</span>
                <span className="nav-btn-sub">Invoices & payments</span>
              </div>
              {activeTab === 'billing' && <span className="active-bar-indicator"></span>}
            </button>

            <button
              className={`patient-nav-btn ${activeTab === 'doctors' ? 'active' : ''}`}
              onClick={() => setActiveTab('doctors')}
            >
              <div className="nav-btn-icon">
                <FaUserMd />
              </div>
              <div className="nav-btn-text">
                <span className="nav-btn-title">Specialist Directory & Chat</span>
                <span className="nav-btn-sub">Doctors & live consult</span>
              </div>
              {activeTab === 'doctors' && <span className="active-bar-indicator"></span>}
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="patient-sidebar-bottom">
          <div className="sidebar-help-card">
            <FaExclamationCircle className="sidebar-help-icon" />
            <div>
              <div className="sidebar-help-title">Emergency Support</div>
              <div className="sidebar-help-desc">24/7 Hotline: 108 / 911</div>
            </div>
          </div>
          <button onClick={handleLogout} className="sidebar-logout-btn">
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      </aside>

      {/* 2. Main Workspace Area */}
      <main className="patient-main">
        {/* Top Header Section with KPI Stats */}
        <header className="patient-top-header">
          <div className="patient-welcome-bar">
            <div>
              <h1 className="patient-portal-title">Patient Care Portal</h1>
              <p className="patient-portal-subtitle">
                Welcome back, {userName || 'Patient'} • Smart Health Management & Telemedicine
              </p>
            </div>
            <div className="patient-header-tags">
              <div className="header-date-badge">
                <FaCalendarCheck color="#0d9488" />
                <span>
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="header-live-badge">
                <span className="status-dot-active"></span>
                <span>Telemedicine Live</span>
              </div>
            </div>
          </div>

          {/* Top KPI Header Cards (Total Consultations, Upcoming Visits, etc.) */}
          <div className="patient-stats-header">
            <div className="patient-kpi-card">
              <div className="kpi-info">
                <span className="kpi-title">Upcoming Visits</span>
                <h3 className="kpi-value">{summary.upcoming}</h3>
                <span className="kpi-sub">Scheduled appointments</span>
              </div>
              <div className="kpi-icon-box upcoming">
                <FaCalendarAlt />
              </div>
            </div>

            <div className="patient-kpi-card">
              <div className="kpi-info">
                <span className="kpi-title">Total Consultations</span>
                <h3 className="kpi-value">{summary.history}</h3>
                <span className="kpi-sub">Completed doctor visits</span>
              </div>
              <div className="kpi-icon-box consultations">
                <FaHistory />
              </div>
            </div>

            <div className="patient-kpi-card">
              <div className="kpi-info">
                <span className="kpi-title">Diagnostic Lab Reports</span>
                <h3 className="kpi-value">{summary.reports}</h3>
                <span className="kpi-sub">Clinical test reports</span>
              </div>
              <div className="kpi-icon-box reports">
                <FaFlask />
              </div>
            </div>

            <div className="patient-kpi-card">
              <div className="kpi-info">
                <span className="kpi-title">Available Specialists</span>
                <h3 className="kpi-value">{summary.doctors}</h3>
                <span className="kpi-sub">Verified hospital doctors</span>
              </div>
              <div className="kpi-icon-box specialists">
                <FaUserMd />
              </div>
            </div>
          </div>
        </header>

        {/* 3. Workspace - Full Screen Width */}
        <section className="patient-workspace">
        {activeTab === 'triage' && (
          <SymptomChecker onSelectSpecialist={handleSelectSpecialistFromAI} />
        )}

        {activeTab === 'book' && (
          <BookAppointment preselectedSpecialization={recommendedSpec} />
        )}

        {activeTab === 'history' && (
          <AppointmentHistory />
        )}

        {activeTab === 'reports' && (
          <LabReportsView />
        )}

        {activeTab === 'billing' && (
          <BillingView isManagement={false} />
        )}

        {activeTab === 'doctors' && (
          <div>
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '22px 26px', marginBottom: '22px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: 700 }}>Our Specialists Directory</h2>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
                    Connect with licensed hospital specialists for teleconsultations and clinic visits.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Search doctor or specialty..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ padding: '10px 14px 10px 36px', borderRadius: '10px', border: '1px solid #cbd5e1', width: '260px', fontSize: '13.5px', outline: 'none' }}
                    />
                    <FaSearch style={{ position: 'absolute', left: '12px', top: '13px', color: '#94a3b8' }} />
                  </div>
                  <select
                    value={selectedSpecialization}
                    onChange={(e) => setSelectedSpecialization(e.target.value)}
                    style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13.5px', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="">All Specializations</option>
                    {[...new Set(doctors.map(d => d.specialization))].filter(Boolean).sort().map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {loadingDoctors ? (
              <div className="loading" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading specialists...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {doctors
                  .filter(d => {
                    const matchName = d.name?.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchSpec = !selectedSpecialization || d.specialization === selectedSpecialization;
                    return matchName && matchSpec;
                  })
                  .map((doctor) => (
                    <div
                      key={doctor._id}
                      style={{
                        background: '#fff',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        padding: '22px',
                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #0d9488, #10b981)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '18px'
                          }}>
                            {doctor.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                          <div>
                            <h3 style={{ margin: 0, fontSize: '17px', color: '#0f172a' }}>Dr. {doctor.name}</h3>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#0d9488' }}>
                              {doctor.specialization}
                            </span>
                          </div>
                        </div>

                        <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, marginBottom: '16px' }}>
                          <p style={{ margin: 0 }}>Experience: <strong>{doctor.experience || 5} years</strong></p>
                          <p style={{ margin: 0 }}>Consultation Fee: <strong>₹{doctor.consultationFee || 500}</strong></p>
                          <p style={{ margin: 0 }}>Clinic: <strong>{doctor.roomNumber || 'Consultation Suite 1'}</strong></p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => handleOpenChat(doctor)}
                          style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            background: '#f1f5f9',
                            color: '#0f172a',
                            border: '1px solid #cbd5e1',
                            padding: '9px 12px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <FaComments color="#0d9488" /> Chat
                        </button>
                        <button
                          onClick={() => {
                            setRecommendedSpec(doctor.specialization);
                            setActiveTab('book');
                          }}
                          style={{
                            flex: 1,
                            background: '#0d9488',
                            color: '#fff',
                            border: 'none',
                            padding: '9px 12px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Book Slot
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
        </section>
      </main>

        {/* Real-time Persistent Chat Modal */}
        {showNamePrompt && (
          <div className="chat-modal">
            <div className="chat-modal-content">
              <h3>Enter Your Name to Chat</h3>
              <form onSubmit={handleNameSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                  type="text"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  placeholder="Your Name"
                  required
                  className="chat-input"
                />
                <button className="send-chat-btn" type="submit">Start Chat</button>
              </form>
            </div>
          </div>
        )}

        {chatDoctor && !showNamePrompt && (
          <div className="chat-modal">
            <div className="chat-modal-content" style={{ borderRadius: '16px', maxWidth: '520px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>
                    Dr. {chatDoctor.name}
                  </h3>
                  <span style={{ fontSize: '12px', color: '#0d9488', fontWeight: 600 }}>
                    {chatDoctor.specialization} (Direct Clinic Chat)
                  </span>
                </div>
                <span className="close-chat" onClick={handleCloseChat} style={{ cursor: 'pointer', fontSize: '24px' }}>&times;</span>
              </div>

              <div className="chat-history" style={{ maxHeight: '360px', overflowY: 'auto', padding: '10px', background: '#f8fafc', borderRadius: '10px' }}>
                {chatHistory.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', margin: '20px 0' }}>
                    No messages yet. Send a message to start a consultation chat.
                  </p>
                ) : (
                  chatHistory.map((msg, i) => {
                    const isMe = msg.sender === userName || msg.senderRole === 'patient';
                    return (
                      <div
                        key={i}
                        className={isMe ? 'chat-msg user' : 'chat-msg doctor'}
                        style={{
                          margin: '8px 0',
                          padding: '10px 14px',
                          borderRadius: '12px',
                          maxWidth: '75%',
                          marginLeft: isMe ? 'auto' : '0',
                          marginRight: isMe ? '0' : 'auto',
                          background: isMe ? '#0d9488' : '#e2e8f0',
                          color: isMe ? '#ffffff' : '#0f172a',
                          fontSize: '13px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                        }}
                      >
                        <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '2px', fontWeight: 600 }}>
                          {msg.sender}
                        </div>
                        {msg.text}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="chat-input-row" style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                <input
                  type="text"
                  value={chatMessage}
                  onChange={e => setChatMessage(e.target.value)}
                  placeholder="Type clinical question or message..."
                  className="chat-input"
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(); }}
                />
                <button
                  className="send-chat-btn"
                  onClick={handleSendMessage}
                  style={{ background: '#0d9488', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default PatientDashboard;