import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { jwtDecode } from 'jwt-decode';
import { FaUserMd, FaCalendarAlt, FaClock, FaCheckCircle, FaMoneyBillWave } from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';
import './Appointments.css';

const BookAppointment = ({ preselectedSpecialization }) => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorData, setSelectedDoctorData] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotMessage, setSlotMessage] = useState('');
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    patientName: localStorage.getItem('userName') || '',
    age: '',
    gender: 'Male',
    bloodGroup: 'O+',
    mobile: '',
    doctor: '',
    appointmentDate: '',
    appointmentTime: '',
    reasonForVisit: '',
    additionalNotes: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await client.get('/api/appointments/doctors');
        if (response.data && response.data.length > 0) {
          setDoctors(response.data);

          // If a preselected specialization was passed from the AI Symptom Checker:
          if (preselectedSpecialization) {
            const matchedDoc = response.data.find(d =>
              d.specialization?.toLowerCase().includes(preselectedSpecialization.toLowerCase())
            );
            if (matchedDoc) {
              setFormData(prev => ({ ...prev, doctor: matchedDoc._id }));
              setSelectedDoctorData(matchedDoc);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError('Error loading doctors list.');
      }
    };

    fetchDoctors();
  }, [preselectedSpecialization]);

  // When doctor changes, update selectedDoctorData
  useEffect(() => {
    if (formData.doctor) {
      const doc = doctors.find(d => d._id === formData.doctor);
      setSelectedDoctorData(doc || null);
    } else {
      setSelectedDoctorData(null);
    }
  }, [formData.doctor, doctors]);

  // When doctor or appointmentDate changes, fetch available time slots
  useEffect(() => {
    if (formData.doctor && formData.appointmentDate) {
      fetchSlots(formData.doctor, formData.appointmentDate);
    } else {
      setAvailableSlots([]);
      setSlotMessage('');
    }
  }, [formData.doctor, formData.appointmentDate]);

  const fetchSlots = async (doctorId, date) => {
    setSlotsLoading(true);
    setSlotMessage('');
    try {
      const res = await client.get(`/api/doctors/${doctorId}/available-slots?date=${date}`);
      if (res.data.available) {
        setAvailableSlots(res.data.slots || []);
      } else {
        setAvailableSlots([]);
        setSlotMessage(res.data.message || 'Doctor has no scheduled clinic hours on this day.');
      }
    } catch (err) {
      // Fallback slots if calculation endpoint isn't reached
      setAvailableSlots([
        { time: '09:00', isBooked: false },
        { time: '09:30', isBooked: false },
        { time: '10:00', isBooked: false },
        { time: '10:30', isBooked: false },
        { time: '11:00', isBooked: false },
        { time: '14:00', isBooked: false },
        { time: '14:30', isBooked: false },
        { time: '15:00', isBooked: false }
      ]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectSlot = (slotTime) => {
    setFormData(prev => ({ ...prev, appointmentTime: slotTime }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.appointmentTime) {
      showToast('Please select an appointment time slot', 'warning');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Please login to book an appointment', 'error');
        return;
      }

      const decoded = jwtDecode(token);
      const appointmentDateTime = new Date(
        `${formData.appointmentDate}T${formData.appointmentTime}`
      ).toISOString();

      const appointmentData = {
        doctor: formData.doctor,
        date: appointmentDateTime,
        reason: formData.reasonForVisit,
        patientName: formData.patientName,
        age: Number(formData.age),
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        mobile: formData.mobile,
        email: formData.email,
        patient: decoded.id
      };

      const response = await client.post('/api/appointments', appointmentData);

      if (response.data) {
        showToast('Appointment booked successfully! Doctor will review shortly.', 'success');
        setSuccess('Appointment booked successfully!');
        setError('');
        setFormData({
          patientName: localStorage.getItem('userName') || '',
          age: '',
          gender: 'Male',
          bloodGroup: 'O+',
          mobile: '',
          doctor: '',
          appointmentDate: '',
          appointmentTime: '',
          reasonForVisit: '',
          additionalNotes: '',
          email: ''
        });
        setAvailableSlots([]);
      }
    } catch (err) {
      console.error('Appointment booking error:', err);
      const errorMessage = err.response?.data?.message || 'Error booking appointment';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    }
  };

  return (
    <div className="appointment-container">
      <div className="appointment-form-container" style={{ maxWidth: '780px', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
          <span style={{ background: '#ecfdf5', color: '#0d9488', padding: '12px', borderRadius: '12px' }}>
            <FaCalendarAlt size={22} />
          </span>
          <div>
            <h2 style={{ margin: 0, fontSize: '22px', color: '#0f172a' }}>Book a Doctor Consultation</h2>
            <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b' }}>
              Choose a specialist, check available schedule slots, and confirm your appointment.
            </p>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="appointment-form">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label htmlFor="patientName">Patient Full Name</label>
              <input
                type="text"
                id="patientName"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                required
                placeholder="Enter patient full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Patient Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Confirmation email will be sent here"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
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
                placeholder="Age in years"
              />
            </div>

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
            <label htmlFor="mobile">10-Digit Mobile Number</label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              pattern="[6-9][0-9]{9}"
              placeholder="e.g. 9876543210"
              required
            />
          </div>

          {/* Doctor Selection */}
          <div className="form-group">
            <label htmlFor="doctor">Select Consulting Doctor</label>
            <select
              id="doctor"
              name="doctor"
              value={formData.doctor}
              onChange={handleChange}
              required
            >
              <option value="">-- Choose Doctor / Specialist --</option>
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  Dr. {doctor.name} — {doctor.specialization} ({doctor.experience || 5} yrs exp)
                </option>
              ))}
            </select>
          </div>

          {/* Doctor Summary Badge */}
          {selectedDoctorData && (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '14px 18px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '13px'
            }}>
              <div>
                <p style={{ margin: '0 0 2px', fontWeight: 700, color: '#0f172a' }}>
                  Dr. {selectedDoctorData.name} ({selectedDoctorData.specialization})
                </p>
                <p style={{ margin: 0, color: '#64748b' }}>
                  Contact: {selectedDoctorData.contactNumber || 'Hospital Desk'} • Location: {selectedDoctorData.roomNumber || 'Consultation Room 1'}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Consultation Fee</span>
                <p style={{ margin: '2px 0 0', fontSize: '16px', fontWeight: 800, color: '#0d9488' }}>
                  ₹{selectedDoctorData.consultationFee || 500}
                </p>
              </div>
            </div>
          )}

          {/* Date Picker */}
          <div className="form-group">
            <label htmlFor="appointmentDate">Appointment Date</label>
            <input
              type="date"
              id="appointmentDate"
              name="appointmentDate"
              value={formData.appointmentDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {/* Available Slots Selector */}
          {formData.doctor && formData.appointmentDate && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                Available Time Slots for {new Date(formData.appointmentDate).toLocaleDateString()}:
              </label>

              {slotsLoading ? (
                <div style={{ fontSize: '13px', color: '#64748b', padding: '10px 0' }}>
                  Checking doctor clinic schedule and slot availability...
                </div>
              ) : slotMessage ? (
                <div style={{ background: '#fffbeb', color: '#b45309', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' }}>
                  ⚠️ {slotMessage}
                </div>
              ) : availableSlots.length === 0 ? (
                <div style={{ fontSize: '13px', color: '#ef4444' }}>
                  No available slots found for this date. Please choose another date.
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {availableSlots.map((slot, idx) => {
                    const isSelected = formData.appointmentTime === slot.time;
                    const isBooked = slot.isBooked;

                    return (
                      <button
                        type="button"
                        key={idx}
                        disabled={isBooked}
                        onClick={() => handleSelectSlot(slot.time)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          border: isSelected
                            ? '2px solid #0d9488'
                            : isBooked
                            ? '1px solid #e2e8f0'
                            : '1px solid #cbd5e1',
                          background: isSelected
                            ? '#0d9488'
                            : isBooked
                            ? '#f1f5f9'
                            : '#ffffff',
                          color: isSelected
                            ? '#ffffff'
                            : isBooked
                            ? '#94a3b8'
                            : '#0f172a',
                          fontSize: '13px',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: isBooked ? 'not-allowed' : 'pointer',
                          textDecoration: isBooked ? 'line-through' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <FaClock size={11} />
                        {slot.time}
                        {isBooked && <span style={{ fontSize: '10px' }}>(Booked)</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="reasonForVisit">Reason for Visit / Symptoms</label>
            <textarea
              id="reasonForVisit"
              name="reasonForVisit"
              value={formData.reasonForVisit}
              onChange={handleChange}
              required
              rows="3"
              placeholder="Describe your primary symptoms or health concern"
            />
          </div>

          <div className="form-group">
            <label htmlFor="additionalNotes">Additional Medical Notes / Allergies (Optional)</label>
            <textarea
              id="additionalNotes"
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleChange}
              rows="2"
              placeholder="Any prior medical conditions, existing prescriptions, or known drug allergies"
            />
          </div>

          <button
            type="submit"
            className="appointment-button"
            disabled={!formData.appointmentTime}
            style={{
              background: 'linear-gradient(135deg, #0d9488, #10b981)',
              padding: '14px',
              fontSize: '15px',
              fontWeight: 700,
              borderRadius: '10px',
              boxShadow: '0 4px 15px rgba(13, 148, 136, 0.3)',
              cursor: formData.appointmentTime ? 'pointer' : 'not-allowed',
              opacity: formData.appointmentTime ? 1 : 0.6
            }}
          >
            Confirm & Book Appointment
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;