import React, { useState, useEffect, useCallback } from 'react';
import client from '../../api/client';
import { FaPrint, FaEdit, FaTrash, FaHospital } from 'react-icons/fa';
import './Prescriptions.css';

const PrescriptionView = ({ appointmentId, onEdit, onDelete, isDoctor }) => {
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPrescription = useCallback(async () => {
    try {
      const response = await client.get(`/api/prescriptions/appointment/${appointmentId}`);
      setPrescription(response.data);
    } catch (err) {
      console.error('Error fetching prescription:', err);
      setError('Prescription could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    fetchPrescription();
  }, [fetchPrescription]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Loading prescription...</div>;
  }

  if (error || !prescription) {
    return (
      <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
        {error || 'No digital prescription issued for this visit yet.'}
      </div>
    );
  }

  const patientName = prescription.patient?.name || prescription.appointment?.patientName || 'Patient';
  const doctorName = prescription.doctor?.name || prescription.appointment?.doctor?.name || 'Specialist';
  const specialization = prescription.doctor?.specialization || 'Clinical Specialist';

  return (
    <div className="prescription-view-card" style={{
      background: '#fff',
      padding: '28px',
      borderRadius: '16px',
      maxWidth: '740px',
      margin: '0 auto',
      color: '#0f172a'
    }}>
      {/* Hospital Letterhead Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '2.5px solid #0d9488',
        paddingBottom: '16px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ background: '#ecfdf5', color: '#0d9488', padding: '12px', borderRadius: '12px' }}>
            <FaHospital size={26} />
          </span>
          <div>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>Smart Hospital System</h2>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
              123 Health Avenue, Wellness City • Helpline: 1800-123-4567
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Official Rx Record
          </span>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>
            Date: {new Date(prescription.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Patient & Doctor Sub-Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        background: '#f8fafc',
        padding: '16px 20px',
        borderRadius: '12px',
        marginBottom: '20px',
        fontSize: '13px'
      }}>
        <div>
          <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Patient Details</span>
          <p style={{ margin: '4px 0 0', fontWeight: 700, fontSize: '15px' }}>{patientName}</p>
          <p style={{ margin: '2px 0 0', color: '#64748b' }}>
            Age: {prescription.appointment?.age || 'N/A'} • Gender: {prescription.appointment?.gender || 'N/A'} • Blood: {prescription.appointment?.bloodGroup || 'N/A'}
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Attending Physician</span>
          <p style={{ margin: '4px 0 0', fontWeight: 700, fontSize: '15px', color: '#0d9488' }}>Dr. {doctorName}</p>
          <p style={{ margin: '2px 0 0', color: '#64748b' }}>{specialization}</p>
        </div>
      </div>

      {/* Diagnosis */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 6px', fontSize: '13px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
          Clinical Diagnosis
        </h4>
        <div style={{ background: '#ecfdf5', color: '#065f46', padding: '10px 14px', borderRadius: '8px', fontWeight: 600, fontSize: '15px' }}>
          {prescription.diagnosis}
        </div>
      </div>

      {/* Medications Table */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px', fontSize: '13px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
          Rx - Prescribed Medications
        </h4>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
              <th style={{ padding: '10px 12px' }}>Medicine Name</th>
              <th style={{ padding: '10px 12px' }}>Dosage</th>
              <th style={{ padding: '10px 12px' }}>Frequency</th>
              <th style={{ padding: '10px 12px' }}>Duration</th>
            </tr>
          </thead>
          <tbody>
            {(prescription.medications || []).map((med, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0f172a' }}>{med.name}</td>
                <td style={{ padding: '10px 12px' }}>{med.dosage}</td>
                <td style={{ padding: '10px 12px', color: '#0d9488', fontWeight: 500 }}>{med.frequency}</td>
                <td style={{ padding: '10px 12px' }}>{med.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Instructions & Notes */}
      <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '10px', marginBottom: '20px', fontSize: '13px' }}>
        <p style={{ margin: '0 0 6px', color: '#334155' }}>
          <strong>Dietary & Intake Instructions:</strong> {prescription.instructions || 'Take medications as prescribed.'}
        </p>
        {prescription.followUpDate && (
          <p style={{ margin: '0 0 6px', color: '#0d9488', fontWeight: 600 }}>
            Next Review Follow-up Date: {new Date(prescription.followUpDate).toLocaleDateString()}
          </p>
        )}
        {prescription.additionalNotes && (
          <p style={{ margin: 0, color: '#64748b', fontStyle: 'italic' }}>
            Doctor Remarks: {prescription.additionalNotes}
          </p>
        )}
      </div>

      {/* Footer & Signature Stamp */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '16px' }}>
        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
          <p style={{ margin: 0 }}>Smart Hospital System • Verified Digital Prescription</p>
          <p style={{ margin: '2px 0 0' }}>Generated on {new Date().toLocaleDateString()}</p>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ borderBottom: '1px solid #0f172a', width: '160px', marginBottom: '6px' }} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>Dr. {doctorName}</span>
          <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>Authorized Medical Signature</p>
        </div>
      </div>

      {/* Actions (hidden when printing) */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
        <button
          onClick={handlePrint}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, #0d9488, #10b981)',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <FaPrint /> Print / Save as PDF
        </button>

        {isDoctor && (
          <>
            <button
              onClick={() => onEdit && onEdit(prescription)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                padding: '9px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <FaEdit /> Edit
            </button>
            <button
              onClick={() => onDelete && onDelete(prescription._id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                padding: '9px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <FaTrash /> Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PrescriptionView;