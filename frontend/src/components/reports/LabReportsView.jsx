import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { FaFlask, FaPlus, FaTrash } from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';

const LabReportsView = ({ patientId, isDoctor }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Blood Test',
    testDate: new Date().toISOString().split('T')[0],
    resultsSummary: '',
    status: 'Normal',
    notes: '',
    fileName: ''
  });
  const { showToast } = useToast();

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line
  }, [patientId]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const url = isDoctor && patientId
        ? `/api/reports/patient/${patientId}`
        : `/api/reports/my-reports`;
      const res = await client.get(url);
      setReports(res.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
      showToast('Error loading lab reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReport = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.resultsSummary) {
      showToast('Please provide a title and results summary', 'warning');
      return;
    }

    try {
      await client.post('/api/reports', {
        ...formData,
        patientId
      });
      showToast('Lab report uploaded successfully!', 'success');
      setShowAddModal(false);
      setFormData({
        title: '',
        category: 'Blood Test',
        testDate: new Date().toISOString().split('T')[0],
        resultsSummary: '',
        status: 'Normal',
        notes: '',
        fileName: ''
      });
      fetchReports();
    } catch (err) {
      showToast('Error saving report', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lab report?')) return;
    try {
      await client.delete(`/api/reports/${id}`);
      showToast('Report deleted', 'info');
      setReports((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      showToast('Error deleting report', 'error');
    }
  };

  return (
    <div style={{ marginTop: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ background: '#ecfdf5', color: '#059669', padding: '10px', borderRadius: '10px' }}>
            <FaFlask size={18} />
          </span>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Diagnostic & Lab Reports</h3>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
              Digital medical test results, pathology records, and clinical evaluations.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, #0d9488, #10b981)',
            color: '#fff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <FaPlus size={12} /> Add Lab Report
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading diagnostic reports...</div>
      ) : reports.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px dashed #cbd5e1',
          color: '#64748b'
        }}>
          No diagnostic lab reports recorded yet. Click "Add Lab Report" to add test records.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {reports.map((report) => {
            const statusColors = {
              Normal: { bg: '#ecfdf5', text: '#059669' },
              Abnormal: { bg: '#fffbeb', text: '#d97706' },
              Critical: { bg: '#fef2f2', text: '#dc2626' },
              'Pending Review': { bg: '#f0f9ff', text: '#0284c7' }
            };
            const currentBadge = statusColors[report.status] || statusColors.Normal;

            return (
              <div
                key={report._id}
                style={{
                  background: '#fff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '18px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px' }}>
                      {report.category}
                    </span>
                    <span style={{
                      background: currentBadge.bg,
                      color: currentBadge.text,
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '4px 8px',
                      borderRadius: '12px'
                    }}>
                      {report.status}
                    </span>
                  </div>

                  <h4 style={{ margin: '0 0 6px', fontSize: '16px', color: '#0f172a', fontWeight: 600 }}>
                    {report.title}
                  </h4>

                  <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#94a3b8' }}>
                    Date: {new Date(report.testDate).toLocaleDateString()}
                    {report.doctor?.name && ` • Dr. ${report.doctor.name}`}
                  </p>

                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', color: '#334155', marginBottom: '10px' }}>
                    <strong>Findings:</strong> {report.resultsSummary}
                  </div>

                  {report.notes && (
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                      Notes: {report.notes}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                  <button
                    onClick={() => handleDelete(report._id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <FaTrash size={12} /> Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Report Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '520px',
            padding: '28px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '18px', color: '#0f172a' }}>Add Diagnostic Lab Report</h3>
            <form onSubmit={handleAddReport}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Test Title</label>
                <input
                  type="text"
                  placeholder="e.g. Complete Blood Count (CBC)"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', boxSizing: 'border-box' }}
                  >
                    <option value="Blood Test">Blood Test</option>
                    <option value="Radiology / X-Ray">Radiology / X-Ray</option>
                    <option value="Pathology">Pathology</option>
                    <option value="Cardiology / ECG">Cardiology / ECG</option>
                    <option value="Urine Analysis">Urine Analysis</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Status / Result</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', boxSizing: 'border-box' }}
                  >
                    <option value="Normal">Normal</option>
                    <option value="Abnormal">Abnormal</option>
                    <option value="Critical">Critical</option>
                    <option value="Pending Review">Pending Review</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Findings / Summary</label>
                <textarea
                  rows="3"
                  placeholder="Summary of findings (e.g. Hemoglobin: 14.2 g/dL, Platelets normal, WBC within reference range)"
                  required
                  value={formData.resultsSummary}
                  onChange={(e) => setFormData({ ...formData, resultsSummary: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', background: '#0d9488', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                >
                  Save Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabReportsView;
