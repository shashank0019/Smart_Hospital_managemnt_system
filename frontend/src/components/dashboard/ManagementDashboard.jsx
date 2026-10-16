import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import MedicineInventory from './MedicineInventory';
import BedManagement from '../beds/BedManagement';
import BillingView from '../billing/BillingView';
import './Dashboard.css';
import {
  FaUserMd,
  FaPlusCircle,
  FaBed,
  FaPills,
  FaFileInvoiceDollar,
  FaSignOutAlt,
  FaTrash,
  FaEnvelope,
  FaPhone
} from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';

const ManagementDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('doctors');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [stats, setStats] = useState({
    doctors: 0,
    beds: 0,
    medicines: 0,
    revenue: 0
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    experience: '',
    contactNumber: '',
    consultationFee: 500,
    roomNumber: 'Room 101'
  });
  const { showToast } = useToast();

  const fetchDashboardStats = useCallback(async () => {
    try {
      const [docRes, bedRes, medRes, invRes] = await Promise.allSettled([
        client.get('/api/doctors'),
        client.get('/api/beds'),
        client.get('/api/medicines'),
        client.get('/api/invoices')
      ]);

      const docList = docRes.status === 'fulfilled' ? docRes.value.data : [];
      setDoctors(docList);

      const bedCount = bedRes.status === 'fulfilled' ? (bedRes.value.data?.stats?.total || 0) : 0;
      const medCount = medRes.status === 'fulfilled' ? (medRes.value.data || []).length : 0;
      const totalRev = invRes.status === 'fulfilled' ? (invRes.value.data?.stats?.totalRevenue || 0) : 0;

      setStats({
        doctors: docList.length,
        beds: bedCount,
        medicines: medCount,
        revenue: totalRev
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching management stats:', err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await client.post('/api/doctors', formData);
      showToast(`Dr. ${formData.name} added! Welcome credentials email sent.`, 'success');
      setShowAddForm(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        specialization: '',
        experience: '',
        contactNumber: '',
        consultationFee: 500,
        roomNumber: 'Room 101'
      });
      fetchDashboardStats();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error adding doctor', 'error');
    }
  };

  const handleDelete = async (doctorId) => {
    if (!window.confirm('Are you sure you want to delete this doctor from the hospital staff?')) return;
    try {
      await client.delete(`/api/doctors/${doctorId}`);
      showToast('Doctor removed successfully', 'info');
      fetchDashboardStats();
    } catch (err) {
      showToast('Error removing doctor', 'error');
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
          <h1 style={{ margin: 0, fontSize: '28px', color: '#0f172a' }}>Hospital Administration Portal</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>
            Comprehensive management of doctors, hospital wards, pharmacy inventory, and billing.
          </p>
        </div>
        <button
          className="logout-button"
          onClick={handleLogout}
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

      {/* Hospital Overview KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '32px' }}>
        <div className="summary-card" style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ background: '#f0f9ff', color: '#0284c7', padding: '10px', borderRadius: '10px' }}>
              <FaUserMd size={20} />
            </span>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Active Doctors</span>
          </div>
          <h3 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>{stats.doctors}</h3>
        </div>

        <div className="summary-card" style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ background: '#ecfdf5', color: '#059669', padding: '10px', borderRadius: '10px' }}>
              <FaBed size={20} />
            </span>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Ward Beds Tracked</span>
          </div>
          <h3 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>{stats.beds}</h3>
        </div>

        <div className="summary-card" style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ background: '#fdf2f8', color: '#db2777', padding: '10px', borderRadius: '10px' }}>
              <FaPills size={20} />
            </span>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Medicine Inventory</span>
          </div>
          <h3 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>{stats.medicines}</h3>
        </div>

        <div className="summary-card" style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '10px', borderRadius: '10px' }}>
              <FaFileInvoiceDollar size={20} />
            </span>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Collected Revenue</span>
          </div>
          <h3 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>₹{stats.revenue?.toLocaleString() || 0}</h3>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          className={`tab-button ${activeTab === 'doctors' ? 'active' : ''}`}
          onClick={() => setActiveTab('doctors')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FaUserMd /> Medical Staff & Doctors
        </button>
        <button
          className={`tab-button ${activeTab === 'beds' ? 'active' : ''}`}
          onClick={() => setActiveTab('beds')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FaBed /> Ward & Bed Management
        </button>
        <button
          className={`tab-button ${activeTab === 'pharmacy' ? 'active' : ''}`}
          onClick={() => setActiveTab('pharmacy')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FaPills /> Pharmacy Stock & Medicines
        </button>
        <button
          className={`tab-button ${activeTab === 'billing' ? 'active' : ''}`}
          onClick={() => setActiveTab('billing')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FaFileInvoiceDollar /> Billing & Invoicing
        </button>
      </div>

      {/* Content */}
      <div className="dashboard-content">
        {activeTab === 'doctors' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>Doctor Staff Directory</h2>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
                  Manage hospital specialists and register new doctor credentials.
                </p>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
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
                <FaPlusCircle /> Onboard New Doctor
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading doctor staff...</div>
            ) : doctors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '12px', color: '#64748b' }}>
                No doctors registered yet.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
                {doctors.map((doctor) => (
                  <div
                    key={doctor._id}
                    style={{
                      background: '#fff',
                      borderRadius: '14px',
                      border: '1px solid #e2e8f0',
                      padding: '20px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Dr. {doctor.name}</h3>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#0d9488' }}>
                            {doctor.specialization}
                          </span>
                        </div>
                        <span style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                          {doctor.experience || 5} yrs exp
                        </span>
                      </div>

                      <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, marginBottom: '14px' }}>
                        <p style={{ margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FaEnvelope color="#94a3b8" /> {doctor.email}
                        </p>
                        <p style={{ margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FaPhone color="#94a3b8" /> {doctor.contactNumber}
                        </p>
                        <p style={{ margin: 0 }}>
                          Consultation Fee: <strong>₹{doctor.consultationFee || 500}</strong> • {doctor.roomNumber || 'Room 101'}
                        </p>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleDelete(doctor._id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'transparent',
                          color: '#ef4444',
                          border: '1px solid #fecaca',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <FaTrash /> Remove Doctor
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'beds' && (
          <BedManagement />
        )}

        {activeTab === 'pharmacy' && (
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px' }}>
            <MedicineInventory />
          </div>
        )}

        {activeTab === 'billing' && (
          <BillingView isManagement={true} />
        )}
      </div>

      {/* Add Doctor Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px', borderRadius: '16px', padding: '28px' }}>
            <button className="close-button" onClick={() => setShowAddForm(false)}>
              ×
            </button>
            <h2 style={{ margin: '0 0 16px', fontSize: '20px', color: '#0f172a' }}>Register New Hospital Doctor</h2>
            <form onSubmit={handleSubmit} className="doctor-form">
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label htmlFor="name" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Doctor Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="e.g. Dr. Rajesh Sharma"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div className="form-group">
                  <label htmlFor="email" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="doctor@hospital.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Temporary Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div className="form-group">
                  <label htmlFor="specialization" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Specialization</label>
                  <input
                    type="text"
                    id="specialization"
                    name="specialization"
                    placeholder="e.g. Cardiologist"
                    value={formData.specialization}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="experience" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Experience (years)</label>
                  <input
                    type="number"
                    id="experience"
                    name="experience"
                    placeholder="e.g. 8"
                    value={formData.experience}
                    onChange={handleChange}
                    required
                    min="0"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                <div className="form-group">
                  <label htmlFor="contactNumber" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Contact Number</label>
                  <input
                    type="tel"
                    id="contactNumber"
                    name="contactNumber"
                    placeholder="10-digit number"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="consultationFee" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Consultation Fee (₹)</label>
                  <input
                    type="number"
                    id="consultationFee"
                    name="consultationFee"
                    value={formData.consultationFee}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
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
                  Register Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagementDashboard;