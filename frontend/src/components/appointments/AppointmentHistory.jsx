import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import PrescriptionView from '../prescriptions/PrescriptionView';
import TelemedicineRoom from '../telemedicine/TelemedicineRoom';
import { FaVideo, FaTrash, FaFilePrescription, FaUserCheck, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';
import './Appointments.css';

const AppointmentHistory = () => {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showPrescription, setShowPrescription] = useState(false);
  const [selectedPatientDetails, setSelectedPatientDetails] = useState(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [activeTelemedicine, setActiveTelemedicine] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await client.get('/api/appointments/patient');
      setAppointments(response.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Error fetching appointment history');
      showToast('Error loading appointments', 'error');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString;
  };

  const handleViewPrescription = (appointment) => {
    setSelectedAppointment(appointment);
    setShowPrescription(true);
  };

  const handleClosePrescription = () => {
    setShowPrescription(false);
    setSelectedAppointment(null);
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await client.delete(`/api/appointments/${appointmentId}`);
      showToast('Appointment cancelled successfully', 'info');
      setAppointments((prev) => prev.filter((a) => a._id !== appointmentId));
    } catch (err) {
      showToast('Error cancelling appointment', 'error');
    }
  };

  const handleViewPatientDetails = async (appointment) => {
    try {
      const res = await client.get(`/api/appointments/${appointment._id}/patient-details`);
      setSelectedPatientDetails(res.data);
      setShowPatientDetails(true);
    } catch (err) {
      showToast('No clinical doctor records found yet for this visit', 'info');
    }
  };

  if (loading) {
    return (
      <div className="appointment-container">
        <div className="appointment-form-container" style={{ textAlign: 'center', padding: '40px' }}>
          <h2>Loading your appointments...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="appointment-container">
      <div className="appointment-form-container" style={{ maxWidth: '820px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '22px', color: '#0f172a' }}>Appointment History</h2>
            <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b' }}>
              Track past and upcoming appointments, clinical notes, and prescriptions.
            </p>
          </div>
          <span style={{ background: '#f1f5f9', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
            Total Visits: {appointments.length}
          </span>
        </div>

        {error && <div className="error-message">{error}</div>}

        {appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
            <FaCalendarAlt size={36} color="#94a3b8" style={{ marginBottom: '12px' }} />
            <p style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>No appointments booked yet.</p>
            <p style={{ margin: '4px 0 0', fontSize: '13px' }}>Go to "Book Appointment" or try the "AI Symptom Checker" to schedule a visit.</p>
          </div>
        ) : (
          <div className="appointments-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {appointments.map((appointment) => {
              const statusColors = {
                ACCEPTED: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
                REJECTED: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
                PENDING: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' }
              };
              const currentStatus = statusColors[appointment.status] || statusColors.PENDING;

              return (
                <div
                  key={appointment._id}
                  className="appointment-card"
                  style={{
                    border: `1.5px solid ${currentStatus.border}`,
                    borderRadius: '14px',
                    padding: '20px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
                    background: '#ffffff'
                  }}
                >
                  <div className="appointment-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>
                        Dr. {(appointment.doctor && appointment.doctor.name) || 'Attending Specialist'}
                      </h3>
                      {appointment.doctor?.specialization && (
                        <span style={{ fontSize: '13px', color: '#0d9488', fontWeight: 600 }}>
                          {appointment.doctor.specialization}
                        </span>
                      )}
                    </div>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 700,
                      background: currentStatus.bg,
                      color: currentStatus.text
                    }}>
                      {appointment.status}
                    </span>
                  </div>

                  <div className="appointment-details" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', fontSize: '13px', color: '#334155', background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', marginBottom: '14px' }}>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>Date & Time</span>
                      <p style={{ margin: '2px 0 0', fontWeight: 600 }}>
                        {formatDate(appointment.appointmentDate)} at {formatTime(appointment.appointmentTime)}
                      </p>
                    </div>

                    <div>
                      <span style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>Patient</span>
                      <p style={{ margin: '2px 0 0', fontWeight: 600 }}>
                        {appointment.patientName} ({appointment.gender}, {appointment.age} yrs)
                      </p>
                    </div>

                    <div>
                      <span style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>Reason</span>
                      <p style={{ margin: '2px 0 0', fontWeight: 500 }}>
                        {appointment.reasonForVisit || appointment.reason}
                      </p>
                    </div>
                  </div>

                  <div className="appointment-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                    {/* Telemedicine Video Room Button */}
                    {appointment.status === 'ACCEPTED' && (
                      <button
                        onClick={() => setActiveTelemedicine(appointment)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'linear-gradient(135deg, #0d9488, #10b981)',
                          color: '#fff',
                          border: 'none',
                          padding: '9px 16px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <FaVideo /> Join Video Call
                      </button>
                    )}

                    {/* Prescription button */}
                    {appointment.status === 'ACCEPTED' && appointment.prescription && (
                      <button
                        className="view-prescription-button"
                        onClick={() => handleViewPrescription(appointment)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#3b82f6',
                          color: '#fff',
                          border: 'none',
                          padding: '9px 16px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <FaFilePrescription /> View Prescription
                      </button>
                    )}

                    {/* Clinical Details */}
                    <button
                      className="view-patient-details-button"
                      onClick={() => handleViewPatientDetails(appointment)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
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
                      <FaUserCheck /> Clinical Notes
                    </button>

                    {/* Delete button */}
                    {appointment.status !== 'ACCEPTED' && (
                      <button
                        className="delete-appointment-button"
                        onClick={() => handleDeleteAppointment(appointment._id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'transparent',
                          color: '#ef4444',
                          border: '1px solid #fecaca',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          marginLeft: 'auto'
                        }}
                      >
                        <FaTrash /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Prescription View Modal */}
      {showPrescription && selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '780px', borderRadius: '16px' }}>
            <button className="close-button" onClick={handleClosePrescription}>
              ×
            </button>
            <PrescriptionView appointmentId={selectedAppointment._id} />
          </div>
        </div>
      )}

      {/* Patient Clinical Details Modal */}
      {showPatientDetails && selectedPatientDetails && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '580px', borderRadius: '16px', padding: '28px' }}>
            <button className="close-button" onClick={() => setShowPatientDetails(false)}>×</button>
            <h3 style={{ margin: '0 0 16px', fontSize: '20px', color: '#0f172a' }}>Clinical Examination Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#334155' }}>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px' }}>
                <strong>Chief Complaint:</strong> {selectedPatientDetails.chiefComplaint || 'None recorded'}
              </div>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px' }}>
                <strong>Medical History:</strong> {selectedPatientDetails.medicalHistory || 'None'} {selectedPatientDetails.medicalHistoryOther && `(${selectedPatientDetails.medicalHistoryOther})`}
              </div>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px' }}>
                <strong>Family History:</strong> {selectedPatientDetails.familyHistory || 'None'} {selectedPatientDetails.familyHistoryOther && `(${selectedPatientDetails.familyHistoryOther})`}
              </div>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px' }}>
                <strong>Provisional Diagnosis:</strong> {selectedPatientDetails.provisionalDiagnosis || 'Under observation'} {selectedPatientDetails.provisionalDiagnosisOther && `(${selectedPatientDetails.provisionalDiagnosisOther})`}
              </div>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px' }}>
                <strong>Final Diagnosis:</strong> {selectedPatientDetails.finalDiagnosis || 'Pending'} {selectedPatientDetails.finalDiagnosisOther && `(${selectedPatientDetails.finalDiagnosisOther})`}
              </div>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px' }}>
                <strong>Treatment Plan:</strong> {selectedPatientDetails.treatmentPlan || 'Rest and prescribed medications'} {selectedPatientDetails.treatmentPlanOther && `(${selectedPatientDetails.treatmentPlanOther})`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Telemedicine Video Consultation Room */}
      {activeTelemedicine && (
        <TelemedicineRoom
          roomName={activeTelemedicine._id}
          doctorName={activeTelemedicine.doctor?.name}
          patientName={activeTelemedicine.patientName}
          onClose={() => setActiveTelemedicine(null)}
        />
      )}
    </div>
  );
};

export default AppointmentHistory;