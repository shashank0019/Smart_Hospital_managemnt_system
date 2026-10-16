import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import client, { API_BASE_URL } from '../../api/client';
import PrescriptionForm from '../prescriptions/PrescriptionForm';
import PrescriptionView from '../prescriptions/PrescriptionView';
import TelemedicineRoom from '../telemedicine/TelemedicineRoom';
import LabReportsView from '../reports/LabReportsView';
import './Dashboard.css';
import { io } from 'socket.io-client';
import {
  FaCalendarCheck,
  FaUserInjured,
  FaFilePrescription,
  FaVideo,
  FaClock,
  FaFlask,
  FaComments,
  FaCog,
  FaSignOutAlt,
  FaCheck,
  FaTimes,
  FaMoneyBillWave
} from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [doctorData, setDoctorData] = useState({
    name: '',
    specialization: '',
    email: '',
    consultationFee: 500,
    workingHours: { start: '09:00', end: '17:00' },
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    roomNumber: 'Room 101',
    slotDuration: 30
  });

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('appointments');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [showPrescriptionView, setShowPrescriptionView] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTelemedicine, setActiveTelemedicine] = useState(null);
  const { showToast } = useToast();

  // Chat
  const [chatRooms, setChatRooms] = useState({});
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const socketRef = useRef(null);

  // Patient Clinical Details
  const [showPatientDetailsForm, setShowPatientDetailsForm] = useState(false);
  const [showPatientDetailsView, setShowPatientDetailsView] = useState(false);
  const [patientDetails, setPatientDetails] = useState({});
  const [clinicalForm, setClinicalForm] = useState({
    chiefComplaint: '',
    medicalHistory: '',
    familyHistory: '',
    provisionalDiagnosis: '',
    finalDiagnosis: '',
    treatmentPlan: ''
  });

  // Schedule settings
  const [scheduleForm, setScheduleForm] = useState({
    consultationFee: 500,
    startHour: '09:00',
    endHour: '17:00',
    roomNumber: 'Room 101',
    slotDuration: 30,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  });

  const [summary, setSummary] = useState({
    today: 0,
    patients: 0,
    prescriptions: 0,
    accepted: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchDoctorProfile();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (activeTab === 'messages' && doctorData.email) {
      if (!socketRef.current) {
        socketRef.current = io(API_BASE_URL);
        socketRef.current.emit('joinRoom', { room: doctorData.email });

        socketRef.current.off('chatHistory');
        socketRef.current.on('chatHistory', (history) => {
          const grouped = {};
          (history || []).forEach((msg) => {
            const sender = msg.sender || 'Patient';
            if (!grouped[sender]) grouped[sender] = [];
            grouped[sender].push(msg);
          });
          setChatRooms(grouped);
        });

        socketRef.current.off('receiveMessage');
        socketRef.current.on('receiveMessage', (msg) => {
          setChatRooms((prev) => {
            const sender = msg.sender || 'Patient';
            const updated = { ...prev };
            if (!updated[sender]) updated[sender] = [];
            updated[sender] = [...updated[sender], msg];
            return updated;
          });
        });
      }
    }

    return () => {
      if (socketRef.current && activeTab !== 'messages') {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [activeTab, doctorData.email]);

  useEffect(() => {
    const todayStr = new Date().toDateString();
    const todayCount = appointments.filter(
      (a) => new Date(a.date).toDateString() === todayStr
    ).length;
    const acceptedCount = appointments.filter((a) => a.status === 'ACCEPTED').length;
    const rxCount = appointments.filter((a) => a.prescription).length;
    const uniquePatients = new Set(appointments.map((a) => a.patientName)).size;

    setSummary({
      today: todayCount,
      patients: uniquePatients,
      prescriptions: rxCount,
      accepted: acceptedCount
    });
  }, [appointments]);

  const fetchDoctorProfile = async () => {
    try {
      const response = await client.get('/api/doctors/profile');
      const doc = response.data;
      setDoctorData(doc);
      setScheduleForm({
        consultationFee: doc.consultationFee || 500,
        startHour: doc.workingHours?.start || '09:00',
        endHour: doc.workingHours?.end || '17:00',
        roomNumber: doc.roomNumber || 'Room 101',
        slotDuration: doc.slotDuration || 30,
        availableDays: doc.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      });
      fetchAppointments();
    } catch (err) {
      console.error('Error fetching doctor profile:', err);
      showToast('Error loading doctor profile', 'error');
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await client.get('/api/appointments/doctor');
      setAppointments(response.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching appointments:', err);
      showToast('Error loading appointments queue', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentAction = async (appointmentId, action) => {
    try {
      await client.put(`/api/appointments/${appointmentId}/${action}`, {});
      showToast(`Appointment ${action === 'accept' ? 'Accepted' : 'Rejected'}`, 'success');
      await fetchAppointments();
    } catch (err) {
      showToast(`Error updating appointment`, 'error');
    }
  };

  const handleCreatePrescription = (appointment) => {
    setSelectedAppointment(appointment);
    setShowPrescriptionForm(true);
    setIsEditing(false);
  };

  const handleEditPrescription = (prescription, appointment) => {
    setSelectedPrescription(prescription);
    setSelectedAppointment(appointment);
    setShowPrescriptionForm(true);
    setIsEditing(true);
  };

  const handleDeletePrescription = async (prescriptionId) => {
    if (!window.confirm('Delete this prescription?')) return;
    try {
      await client.delete(`/api/prescriptions/${prescriptionId}`);
      showToast('Prescription deleted', 'info');
      fetchAppointments();
      setShowPrescriptionView(false);
    } catch (err) {
      showToast('Error deleting prescription', 'error');
    }
  };

  const handlePrescriptionSuccess = () => {
    setShowPrescriptionForm(false);
    setSelectedAppointment(null);
    setSelectedPrescription(null);
    setIsEditing(false);
    fetchAppointments();
  };

  const handleOpenPatientDetails = async (appointment) => {
    setSelectedAppointment(appointment);
    try {
      const res = await client.get(`/api/appointments/${appointment._id}/patient-details`);
      setPatientDetails(res.data);
      setClinicalForm({
        chiefComplaint: res.data.chiefComplaint || '',
        medicalHistory: res.data.medicalHistory || '',
        familyHistory: res.data.familyHistory || '',
        provisionalDiagnosis: res.data.provisionalDiagnosis || '',
        finalDiagnosis: res.data.finalDiagnosis || '',
        treatmentPlan: res.data.treatmentPlan || ''
      });
      setShowPatientDetailsView(true);
    } catch (err) {
      setPatientDetails({});
      setClinicalForm({
        chiefComplaint: '',
        medicalHistory: '',
        familyHistory: '',
        provisionalDiagnosis: '',
        finalDiagnosis: '',
        treatmentPlan: ''
      });
      setShowPatientDetailsForm(true);
    }
  };

  const handleSaveClinicalDetails = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    try {
      await client.post(
        `/api/appointments/${selectedAppointment._id}/patient-details`,
        clinicalForm
      );
      showToast('Clinical examination notes saved successfully', 'success');
      setShowPatientDetailsForm(false);
      setShowPatientDetailsView(false);
    } catch (err) {
      showToast('Error saving clinical notes', 'error');
    }
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    try {
      await client.put('/api/doctors/profile', {
        consultationFee: Number(scheduleForm.consultationFee),
        workingHours: { start: scheduleForm.startHour, end: scheduleForm.endHour },
        roomNumber: scheduleForm.roomNumber,
        slotDuration: Number(scheduleForm.slotDuration),
        availableDays: scheduleForm.availableDays
      });
      showToast('Clinic schedule and fee updated successfully!', 'success');
      fetchDoctorProfile();
    } catch (err) {
      showToast('Error updating schedule', 'error');
    }
  };

  const toggleDay = (day) => {
    setScheduleForm((prev) => {
      const days = prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day];
      return { ...prev, availableDays: days };
    });
  };

  const handleSendChatMessage = () => {
    if (chatMessage.trim() && activeChat && socketRef.current) {
      socketRef.current.emit('sendMessage', {
        room: doctorData.email,
        sender: `Dr. ${doctorData.name}`,
        text: chatMessage,
        senderRole: 'doctor',
        senderEmail: doctorData.email
      });
      setChatMessage('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    showToast('Logged out', 'info');
    navigate('/login', { replace: true });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', color: '#0f172a' }}>
            Doctor Clinical Workspace
          </h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>
            Welcome, <strong>Dr. {doctorData.name}</strong> • {doctorData.specialization} ({doctorData.roomNumber || 'Room 101'})
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="logout-button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#f1f5f9',
            color: '#dc2626',
            border: '1px solid #fecaca',
            padding: '9px 18px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '18px', marginBottom: '32px' }}>
        <div className="summary-card" style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ background: '#ecfdf5', color: '#059669', padding: '10px', borderRadius: '10px' }}>
              <FaCalendarCheck size={20} />
            </span>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Today's Schedule</span>
          </div>
          <h3 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>{summary.today}</h3>
        </div>

        <div className="summary-card" style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ background: '#eff6ff', color: '#2563eb', padding: '10px', borderRadius: '10px' }}>
              <FaUserInjured size={20} />
            </span>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Active Patients</span>
          </div>
          <h3 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>{summary.patients}</h3>
        </div>

        <div className="summary-card" style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '10px', borderRadius: '10px' }}>
              <FaCheck size={20} />
            </span>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Accepted Visits</span>
          </div>
          <h3 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>{summary.accepted}</h3>
        </div>

        <div className="summary-card" style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ background: '#faf5ff', color: '#9333ea', padding: '10px', borderRadius: '10px' }}>
              <FaFilePrescription size={20} />
            </span>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Prescriptions Issued</span>
          </div>
          <h3 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>{summary.prescriptions}</h3>
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          className={`tab-button ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FaCalendarCheck /> Appointments & Telemedicine
        </button>
        <button
          className={`tab-button ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FaClock /> Clinic Schedule & Fees
        </button>
        <button
          className={`tab-button ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FaFlask /> Lab Reports
        </button>
        <button
          className={`tab-button ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FaComments /> Patient Messages ({Object.keys(chatRooms).length})
        </button>
      </div>

      {/* Content */}
      <div className="dashboard-content">
        {activeTab === 'appointments' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>Patient Appointment Queue</h2>
              <button
                onClick={fetchAppointments}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
              >
                Refresh Queue
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading appointments queue...</div>
            ) : appointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '12px', color: '#64748b' }}>
                No appointments scheduled currently.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {appointments.map((appointment) => {
                  const isAccepted = appointment.status === 'ACCEPTED';
                  const isPending = appointment.status === 'PENDING';

                  return (
                    <div
                      key={appointment._id}
                      style={{
                        background: '#fff',
                        borderRadius: '14px',
                        border: isAccepted ? '1.5px solid #a7f3d0' : isPending ? '1.5px solid #fde68a' : '1px solid #e2e8f0',
                        padding: '20px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>
                            {appointment.patientName}
                          </h3>
                          <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
                            {appointment.gender}, {appointment.age} yrs • Blood Group: <strong>{appointment.bloodGroup}</strong> • Mobile: {appointment.mobile}
                          </p>
                        </div>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 700,
                          background: isAccepted ? '#ecfdf5' : isPending ? '#fffbeb' : '#fef2f2',
                          color: isAccepted ? '#059669' : isPending ? '#d97706' : '#dc2626'
                        }}>
                          {appointment.status}
                        </span>
                      </div>

                      <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', marginBottom: '14px' }}>
                        <p style={{ margin: '0 0 4px', color: '#334155' }}>
                          <strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()} at {new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p style={{ margin: 0, color: '#334155' }}>
                          <strong>Chief Complaint / Reason:</strong> {appointment.reason}
                        </p>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleAppointmentAction(appointment._id, 'accept')}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: '#059669',
                                color: '#fff',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              <FaCheck /> Accept
                            </button>
                            <button
                              onClick={() => handleAppointmentAction(appointment._id, 'reject')}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: '#dc2626',
                                color: '#fff',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              <FaTimes /> Reject
                            </button>
                          </>
                        )}

                        {isAccepted && (
                          <button
                            onClick={() => setActiveTelemedicine(appointment)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: 'linear-gradient(135deg, #0d9488, #10b981)',
                              color: '#fff',
                              border: 'none',
                              padding: '8px 16px',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            <FaVideo /> Start Video Call
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenPatientDetails(appointment)}
                          style={{
                            background: '#f1f5f9',
                            color: '#334155',
                            border: '1px solid #cbd5e1',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Clinical Notes
                        </button>

                        {appointment.prescription ? (
                          <button
                            onClick={() => handleEditPrescription(appointment.prescription, appointment)}
                            style={{
                              background: '#3b82f6',
                              color: '#fff',
                              border: 'none',
                              padding: '8px 14px',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Edit Prescription
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCreatePrescription(appointment)}
                            style={{
                              background: '#0d9488',
                              color: '#fff',
                              border: 'none',
                              padding: '8px 14px',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Issue Prescription
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Schedule & Availability Settings Tab */}
        {activeTab === 'schedule' && (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', maxWidth: '640px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '20px', color: '#0f172a' }}>Clinic Hours & Availability Settings</h2>
            <form onSubmit={handleSaveSchedule}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Available Clinic Days</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                    const active = scheduleForm.availableDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleDay(day)}
                        style={{
                          padding: '7px 14px',
                          borderRadius: '20px',
                          border: active ? '1px solid #0d9488' : '1px solid #cbd5e1',
                          background: active ? '#0d9488' : '#f8fafc',
                          color: active ? '#fff' : '#334155',
                          fontSize: '13px',
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Shift Start Time</label>
                  <input
                    type="time"
                    value={scheduleForm.startHour}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, startHour: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Shift End Time</label>
                  <input
                    type="time"
                    value={scheduleForm.endHour}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, endHour: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Consultation Fee (₹)</label>
                  <input
                    type="number"
                    value={scheduleForm.consultationFee}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, consultationFee: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Room / Suite</label>
                  <input
                    type="text"
                    value={scheduleForm.roomNumber}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, roomNumber: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #0d9488, #10b981)',
                  color: '#fff',
                  border: 'none',
                  padding: '11px 24px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Save Schedule & Settings
              </button>
            </form>
          </div>
        )}

        {/* Lab Reports Tab */}
        {activeTab === 'reports' && (
          <LabReportsView isDoctor={true} />
        )}

        {/* Persistent Messages Tab */}
        {activeTab === 'messages' && (
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '16px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', minHeight: '440px', overflow: 'hidden' }}>
            <div style={{ borderRight: '1px solid #e2e8f0', padding: '16px', background: '#f8fafc' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '16px', color: '#0f172a' }}>Patient Chats</h3>
              {Object.keys(chatRooms).length === 0 ? (
                <p style={{ fontSize: '13px', color: '#94a3b8' }}>No active chat messages.</p>
              ) : (
                Object.keys(chatRooms).map((patientName) => (
                  <button
                    key={patientName}
                    onClick={() => setActiveChat(patientName)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: activeChat === patientName ? '#0d9488' : '#fff',
                      color: activeChat === patientName ? '#fff' : '#0f172a',
                      marginBottom: '8px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '13px'
                    }}
                  >
                    {patientName}
                  </button>
                ))
              )}
            </div>

            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              {activeChat ? (
                <>
                  <div>
                    <h3 style={{ margin: '0 0 12px', fontSize: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                      Conversation with {activeChat}
                    </h3>
                    <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '8px' }}>
                      {(chatRooms[activeChat] || []).map((msg, idx) => {
                        const isMe = msg.sender?.startsWith('Dr.');
                        return (
                          <div
                            key={idx}
                            style={{
                              margin: '6px 0',
                              padding: '8px 12px',
                              borderRadius: '10px',
                              maxWidth: '70%',
                              marginLeft: isMe ? 'auto' : '0',
                              background: isMe ? '#0d9488' : '#f1f5f9',
                              color: isMe ? '#fff' : '#0f172a',
                              fontSize: '13px'
                            }}
                          >
                            <div style={{ fontSize: '10px', opacity: 0.8 }}>{msg.sender}</div>
                            {msg.text}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <input
                      type="text"
                      placeholder="Type reply to patient..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSendChatMessage(); }}
                      style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                    <button
                      onClick={handleSendChatMessage}
                      style={{ background: '#0d9488', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Reply
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8', margin: 'auto' }}>
                  Select a patient chat from the left column to view message history.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Prescription Form Modal */}
      {showPrescriptionForm && selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '780px', borderRadius: '16px', padding: 0 }}>
            <PrescriptionForm
              appointment={selectedAppointment}
              prescription={selectedPrescription}
              isEditing={isEditing}
              onSuccess={handlePrescriptionSuccess}
              onCancel={() => setShowPrescriptionForm(false)}
            />
          </div>
        </div>
      )}

      {/* Clinical Details Form Modal */}
      {showPatientDetailsForm && selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '580px', borderRadius: '16px', padding: '24px' }}>
            <button className="close-button" onClick={() => setShowPatientDetailsForm(false)}>×</button>
            <h3 style={{ margin: '0 0 14px', fontSize: '18px', color: '#0f172a' }}>
              Record Clinical Examination for {selectedAppointment.patientName}
            </h3>
            <form onSubmit={handleSaveClinicalDetails}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>Chief Complaint</label>
                <input
                  type="text"
                  value={clinicalForm.chiefComplaint}
                  onChange={(e) => setClinicalForm({ ...clinicalForm, chiefComplaint: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>Medical History</label>
                <input
                  type="text"
                  value={clinicalForm.medicalHistory}
                  onChange={(e) => setClinicalForm({ ...clinicalForm, medicalHistory: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>Family History</label>
                <input
                  type="text"
                  value={clinicalForm.familyHistory}
                  onChange={(e) => setClinicalForm({ ...clinicalForm, familyHistory: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>Provisional Diagnosis</label>
                <input
                  type="text"
                  value={clinicalForm.provisionalDiagnosis}
                  onChange={(e) => setClinicalForm({ ...clinicalForm, provisionalDiagnosis: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>Final Diagnosis</label>
                <input
                  type="text"
                  value={clinicalForm.finalDiagnosis}
                  onChange={(e) => setClinicalForm({ ...clinicalForm, finalDiagnosis: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>Treatment Plan</label>
                <textarea
                  rows="2"
                  value={clinicalForm.treatmentPlan}
                  onChange={(e) => setClinicalForm({ ...clinicalForm, treatmentPlan: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowPatientDetailsForm(false)}
                  style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '6px', border: 'none', background: '#0d9488', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                >
                  Save Notes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Telemedicine Video Consultation Room */}
      {activeTelemedicine && (
        <TelemedicineRoom
          roomName={activeTelemedicine._id}
          doctorName={doctorData.name}
          patientName={activeTelemedicine.patientName}
          onClose={() => setActiveTelemedicine(null)}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;