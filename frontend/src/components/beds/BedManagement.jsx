import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { FaBed, FaPlus, FaCheckCircle, FaUserCheck, FaBroom, FaTrash, FaHospital } from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';

const BedManagement = () => {
  const [beds, setBeds] = useState([]);
  const [stats, setStats] = useState({ total: 0, available: 0, occupied: 0, maintenance: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedWard, setSelectedWard] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);
  const [admitPatientName, setAdmitPatientName] = useState('');
  const [newBed, setNewBed] = useState({
    bedNumber: '',
    ward: 'General Ward',
    floor: '1st Floor',
    dailyRate: 1500,
    notes: ''
  });
  const { showToast } = useToast();

  useEffect(() => {
    fetchBeds();
    // eslint-disable-next-line
  }, [selectedWard]);

  const fetchBeds = async () => {
    setLoading(true);
    try {
      const url = selectedWard !== 'All' ? `/api/beds?ward=${selectedWard}` : '/api/beds';
      const res = await client.get(url);
      setBeds(res.data.beds || []);
      setStats(res.data.stats || { total: 0, available: 0, occupied: 0, maintenance: 0 });
    } catch (err) {
      console.error('Error fetching beds:', err);
      showToast('Error loading bed inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBed = async (e) => {
    e.preventDefault();
    if (!newBed.bedNumber) return;

    try {
      await client.post('/api/beds', newBed);
      showToast(`Bed ${newBed.bedNumber} added successfully!`, 'success');
      setShowAddModal(false);
      setNewBed({ bedNumber: '', ward: 'General Ward', floor: '1st Floor', dailyRate: 1500, notes: '' });
      fetchBeds();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error adding bed', 'error');
    }
  };

  const handleAdmit = async (e) => {
    e.preventDefault();
    if (!selectedBed || !admitPatientName) return;

    try {
      await client.put(`/api/beds/${selectedBed._id}/admit`, {
        patientName: admitPatientName
      });
      showToast(`Patient admitted to ${selectedBed.bedNumber}`, 'success');
      setShowAdmitModal(false);
      setSelectedBed(null);
      setAdmitPatientName('');
      fetchBeds();
    } catch (err) {
      showToast('Error admitting patient', 'error');
    }
  };

  const handleDischarge = async (bedId) => {
    if (!window.confirm('Discharge patient from this bed?')) return;
    try {
      await client.put(`/api/beds/${bedId}/discharge`);
      showToast('Patient discharged. Bed placed in Cleaning mode.', 'info');
      fetchBeds();
    } catch (err) {
      showToast('Error discharging patient', 'error');
    }
  };

  const handleSetAvailable = async (bedId) => {
    try {
      await client.put(`/api/beds/${bedId}/status`, { status: 'Available' });
      showToast('Bed marked as Available and ready for admission', 'success');
      fetchBeds();
    } catch (err) {
      showToast('Error updating status', 'error');
    }
  };

  const handleDeleteBed = async (bedId) => {
    if (!window.confirm('Delete this bed entry?')) return;
    try {
      await client.delete(`/api/beds/${bedId}`);
      showToast('Bed removed', 'info');
      fetchBeds();
    } catch (err) {
      showToast('Error removing bed', 'error');
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Total Ward Beds</span>
          <p style={{ margin: '6px 0 0', fontSize: '26px', fontWeight: 700, color: '#0f172a' }}>{stats.total}</p>
        </div>
        <div style={{ background: '#fff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '13px', color: '#059669', fontWeight: 600 }}>Available Beds</span>
          <p style={{ margin: '6px 0 0', fontSize: '26px', fontWeight: 700, color: '#059669' }}>{stats.available}</p>
        </div>
        <div style={{ background: '#fff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '13px', color: '#0284c7', fontWeight: 600 }}>Occupied Beds</span>
          <p style={{ margin: '6px 0 0', fontSize: '26px', fontWeight: 700, color: '#0284c7' }}>{stats.occupied}</p>
        </div>
        <div style={{ background: '#fff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '13px', color: '#d97706', fontWeight: 600 }}>Cleaning / Maintenance</span>
          <p style={{ margin: '6px 0 0', fontSize: '26px', fontWeight: 700, color: '#d97706' }}>{stats.maintenance}</p>
        </div>
      </div>

      {/* Control Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['All', 'ICU', 'General Ward', 'Emergency Care', 'Maternity', 'Pediatric', 'Surgical Ward'].map((w) => (
            <button
              key={w}
              onClick={() => setSelectedWard(w)}
              style={{
                padding: '7px 14px',
                borderRadius: '20px',
                border: selectedWard === w ? '1px solid #0d9488' : '1px solid #cbd5e1',
                background: selectedWard === w ? '#0d9488' : '#fff',
                color: selectedWard === w ? '#fff' : '#334155',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              {w}
            </button>
          ))}
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
            padding: '9px 18px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <FaPlus size={12} /> Add New Bed
        </button>
      </div>

      {/* Bed Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading hospital beds...</div>
      ) : beds.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '12px', color: '#64748b' }}>
          No beds found for the selected ward.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {beds.map((bed) => {
            const isAvail = bed.status === 'Available';
            const isOccupied = bed.status === 'Occupied';

            return (
              <div
                key={bed._id}
                style={{
                  background: '#fff',
                  borderRadius: '12px',
                  border: isOccupied ? '1.5px solid #bfdbfe' : isAvail ? '1.5px solid #bbf7d0' : '1.5px solid #fde68a',
                  padding: '16px',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                      {bed.ward} • {bed.floor}
                    </span>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: isAvail ? '#ecfdf5' : isOccupied ? '#eff6ff' : '#fffbeb',
                      color: isAvail ? '#059669' : isOccupied ? '#1d4ed8' : '#b45309'
                    }}>
                      {bed.status}
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 6px', fontSize: '18px', color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaBed color={isAvail ? '#10b981' : isOccupied ? '#3b82f6' : '#f59e0b'} />
                    {bed.bedNumber}
                  </h3>

                  {isOccupied ? (
                    <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', fontSize: '13px', margin: '8px 0' }}>
                      <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#1e293b' }}>
                        Patient: {bed.patientName || 'Admitted Patient'}
                      </p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                        Admitted: {bed.admissionDate ? new Date(bed.admissionDate).toLocaleDateString() : 'Active'}
                      </p>
                    </div>
                  ) : (
                    <p style={{ margin: '8px 0', fontSize: '13px', color: '#64748b' }}>
                      Rate: ₹{bed.dailyRate || 1500}/day
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                  {isAvail && (
                    <button
                      onClick={() => {
                        setSelectedBed(bed);
                        setShowAdmitModal(true);
                      }}
                      style={{
                        flex: 1,
                        background: '#0d9488',
                        color: '#fff',
                        border: 'none',
                        padding: '7px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Admit Patient
                    </button>
                  )}

                  {isOccupied && (
                    <button
                      onClick={() => handleDischarge(bed._id)}
                      style={{
                        flex: 1,
                        background: '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        padding: '7px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Discharge
                    </button>
                  )}

                  {!isAvail && !isOccupied && (
                    <button
                      onClick={() => handleSetAvailable(bed._id)}
                      style={{
                        flex: 1,
                        background: '#10b981',
                        color: '#fff',
                        border: 'none',
                        padding: '7px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Mark Available
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteBed(bed._id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: '4px 8px'
                    }}
                    title="Delete Bed"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Bed Modal */}
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
            maxWidth: '460px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '18px', color: '#0f172a' }}>Add Hospital Bed</h3>
            <form onSubmit={handleAddBed}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Bed Number</label>
                <input
                  type="text"
                  placeholder="e.g. ICU-05 or GEN-201"
                  required
                  value={newBed.bedNumber}
                  onChange={(e) => setNewBed({ ...newBed, bedNumber: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Ward</label>
                  <select
                    value={newBed.ward}
                    onChange={(e) => setNewBed({ ...newBed, ward: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', boxSizing: 'border-box' }}
                  >
                    <option value="General Ward">General Ward</option>
                    <option value="ICU">ICU</option>
                    <option value="Emergency Care">Emergency Care</option>
                    <option value="Maternity">Maternity</option>
                    <option value="Pediatric">Pediatric</option>
                    <option value="Surgical Ward">Surgical Ward</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Floor</label>
                  <input
                    type="text"
                    value={newBed.floor}
                    onChange={(e) => setNewBed({ ...newBed, floor: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Daily Rate (₹)</label>
                <input
                  type="number"
                  value={newBed.dailyRate}
                  onChange={(e) => setNewBed({ ...newBed, dailyRate: Number(e.target.value) })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#0d9488', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                >
                  Create Bed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admit Patient Modal */}
      {showAdmitModal && selectedBed && (
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
            maxWidth: '420px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#0f172a' }}>
              Admit Patient to Bed {selectedBed.bedNumber}
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>
              Ward: {selectedBed.ward} ({selectedBed.floor})
            </p>
            <form onSubmit={handleAdmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Patient Full Name</label>
                <input
                  type="text"
                  placeholder="Enter patient full name"
                  required
                  value={admitPatientName}
                  onChange={(e) => setAdmitPatientName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAdmitModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#0d9488', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                >
                  Confirm Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BedManagement;
