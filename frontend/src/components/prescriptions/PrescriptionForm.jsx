import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { FaExclamationTriangle, FaPlus, FaTrash, FaPills } from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';
import './Prescriptions.css';

const DRUG_CONFLICTS = [
  { pair: ['aspirin', 'ibuprofen'], warning: 'Increased risk of gastrointestinal bleeding when combining Aspirin and Ibuprofen.' },
  { pair: ['warfarin', 'aspirin'], warning: 'Severe hemorrhage risk when combining Warfarin and Aspirin.' },
  { pair: ['amoxicillin', 'penicillin'], warning: 'Cross-allergenicity / duplicate beta-lactam class antibiotics.' },
  { pair: ['metformin', 'contrast'], warning: 'Monitor renal function to prevent lactic acidosis.' }
];

const PrescriptionForm = ({ appointment, prescription, isEditing, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    diagnosis: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    instructions: '',
    followUpDate: '',
    additionalNotes: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [safetyWarnings, setSafetyWarnings] = useState([]);
  const { showToast } = useToast();

  useEffect(() => {
    if (isEditing && prescription) {
      setFormData({
        diagnosis: prescription.diagnosis || '',
        medications: prescription.medications || [{ name: '', dosage: '', frequency: '', duration: '' }],
        instructions: prescription.instructions || '',
        followUpDate: prescription.followUpDate ? new Date(prescription.followUpDate).toISOString().split('T')[0] : '',
        additionalNotes: prescription.additionalNotes || ''
      });
    }
  }, [isEditing, prescription]);

  // Check drug interactions whenever medications change
  useEffect(() => {
    const medNames = (formData.medications || [])
      .map(m => m.name.trim().toLowerCase())
      .filter(Boolean);

    const warnings = [];

    // Check duplicate drugs
    const seen = new Set();
    medNames.forEach(name => {
      if (seen.has(name)) {
        warnings.push(`Duplicate medication detected: "${name}". Check prescribed quantity.`);
      }
      seen.add(name);
    });

    // Check conflict rules
    DRUG_CONFLICTS.forEach(rule => {
      const hasFirst = medNames.some(m => m.includes(rule.pair[0]));
      const hasSecond = medNames.some(m => m.includes(rule.pair[1]));
      if (hasFirst && hasSecond) {
        warnings.push(`⚠️ Clinical Conflict: ${rule.warning}`);
      }
    });

    setSafetyWarnings(warnings);
  }, [formData.medications]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMedicationChange = (index, field, value) => {
    setFormData(prev => {
      const newMedications = [...prev.medications];
      newMedications[index] = {
        ...newMedications[index],
        [field]: value
      };
      return {
        ...prev,
        medications: newMedications
      };
    });
  };

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: '', duration: '' }]
    }));
  };

  const removeMedication = (index) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = isEditing
        ? `/api/prescriptions/${prescription._id}`
        : '/api/prescriptions';

      const method = isEditing ? 'put' : 'post';

      await client[method](url, {
        ...formData,
        appointmentId: appointment._id
      });

      showToast(isEditing ? 'Prescription updated!' : 'Prescription created successfully!', 'success');
      onSuccess();
    } catch (err) {
      console.error('Error saving prescription:', err);
      const msg = err.response?.data?.message || 'Error saving prescription';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prescription-form" style={{ padding: '24px', background: '#fff', borderRadius: '16px', maxWidth: '720px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <span style={{ background: '#ecfdf5', color: '#059669', padding: '10px', borderRadius: '10px' }}>
          <FaPills size={20} />
        </span>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>
            {isEditing ? 'Edit Clinical Prescription' : 'Issue Medical Prescription'}
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
            Patient: <strong>{appointment.patientName}</strong> ({appointment.gender}, {appointment.age} yrs)
          </p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Safety warnings banner */}
      {safetyWarnings.length > 0 && (
        <div style={{
          background: '#fffbeb',
          border: '1.5px solid #f59e0b',
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '16px',
          fontSize: '13px',
          color: '#b45309'
        }}>
          <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <FaExclamationTriangle /> Automated Drug Interaction Alert:
          </strong>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {safetyWarnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '14px' }}>
          <label htmlFor="diagnosis" style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>
            Clinical Diagnosis
          </label>
          <input
            type="text"
            id="diagnosis"
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            required
            placeholder="e.g. Acute Bronchitis, Type 2 Diabetes, Hypertension"
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>

        <div className="medications-section" style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#1e293b' }}>Prescribed Medications</h3>
            <button
              type="button"
              onClick={addMedication}
              style={{
                background: '#0d9488',
                color: '#fff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <FaPlus size={10} /> Add Medication
            </button>
          </div>

          {formData.medications.map((medication, index) => (
            <div
              key={index}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr 1fr 1fr 34px',
                gap: '8px',
                background: '#f8fafc',
                padding: '12px',
                borderRadius: '10px',
                marginBottom: '8px',
                alignItems: 'center'
              }}
            >
              <input
                type="text"
                placeholder="Medicine Name (e.g. Paracetamol)"
                value={medication.name}
                onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                required
                style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
              <input
                type="text"
                placeholder="Dosage (e.g. 500mg)"
                value={medication.dosage}
                onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                required
                style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
              <input
                type="text"
                placeholder="Frequency (e.g. Twice daily)"
                value={medication.frequency}
                onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                required
                style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
              <input
                type="text"
                placeholder="Duration (e.g. 5 days)"
                value={medication.duration}
                onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                required
                style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
              {formData.medications.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMedication(index)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Remove Medicine"
                >
                  <FaTrash />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="form-group" style={{ marginBottom: '14px' }}>
          <label htmlFor="instructions" style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>
            Dietary & Intake Instructions
          </label>
          <textarea
            id="instructions"
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            required
            rows="3"
            placeholder="e.g. Take after meals with warm water. Drink plenty of fluids. Avoid dairy within 2 hours of antibiotics."
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
          <div className="form-group">
            <label htmlFor="followUpDate" style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Follow-up Review Date
            </label>
            <input
              type="date"
              id="followUpDate"
              name="followUpDate"
              value={formData.followUpDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="additionalNotes" style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Doctor Private Remarks
            </label>
            <input
              type="text"
              id="additionalNotes"
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleChange}
              placeholder="e.g. Routine blood panel recheck in 2 weeks"
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#fff',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '9px 24px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #0d9488, #10b981)',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {loading ? 'Saving Prescription...' : isEditing ? 'Update Prescription' : 'Issue Prescription'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PrescriptionForm;