import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { FaPills, FaPlus, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';

const MedicineInventory = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', quantity: '', expiryDate: '' });
  const { showToast } = useToast();

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const res = await client.get('/api/medicines');
      setMedicines(res.data || []);
    } catch (err) {
      console.error('Error fetching medicines:', err);
      setError('Error fetching medicine inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.quantity || !form.expiryDate) {
      showToast('All fields are required', 'warning');
      return;
    }
    try {
      await client.post('/api/medicines', {
        name: form.name,
        quantity: Number(form.quantity),
        expiryDate: form.expiryDate
      });
      showToast(`Medicine "${form.name}" added to stock successfully!`, 'success');
      setForm({ name: '', quantity: '', expiryDate: '' });
      fetchMedicines();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error adding medicine', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
        <span style={{ background: '#fdf2f8', color: '#db2777', padding: '10px', borderRadius: '10px' }}>
          <FaPills size={20} />
        </span>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>Pharmacy & Medicine Stock</h2>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
            Monitor drug inventory levels, low stock warnings, and expiration dates.
          </p>
        </div>
      </div>

      {/* Add Medicine Form */}
      <form onSubmit={handleFormSubmit} style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'flex-end', flexWrap: 'wrap', background: '#f8fafc', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ flex: '1', minWidth: '180px' }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Medicine Name</label>
          <input
            type="text"
            name="name"
            placeholder="e.g. Amoxicillin 500mg"
            value={form.name}
            onChange={handleFormChange}
            required
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ width: '130px' }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Stock Units</label>
          <input
            type="number"
            name="quantity"
            placeholder="Units"
            value={form.quantity}
            onChange={handleFormChange}
            required
            min="1"
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ width: '160px' }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>Expiry Date</label>
          <input
            type="date"
            name="expiryDate"
            value={form.expiryDate}
            onChange={handleFormChange}
            required
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #0d9488, #10b981)',
            color: 'white',
            border: 'none',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <FaPlus size={11} /> Add to Stock
        </button>
      </form>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Loading medicine inventory...</div>
      ) : error ? (
        <div style={{ color: '#ef4444' }}>{error}</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                <th style={{ padding: '12px 14px' }}>Medicine Name</th>
                <th style={{ padding: '12px 14px' }}>Units in Stock</th>
                <th style={{ padding: '12px 14px' }}>Expiration Date</th>
                <th style={{ padding: '12px 14px' }}>Inventory Status</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((med) => {
                const isExpired = new Date(med.expiryDate) < new Date();
                const isLow = med.quantity < 15;

                return (
                  <tr
                    key={med._id}
                    style={{
                      borderBottom: '1px solid #e2e8f0',
                      background: isExpired ? '#fff1f2' : isLow ? '#fffbeb' : '#ffffff'
                    }}
                  >
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0f172a' }}>{med.name}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 700 }}>{med.quantity}</td>
                    <td style={{ padding: '12px 14px', color: '#475569' }}>
                      {new Date(med.expiryDate).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: isExpired ? '#fee2e2' : isLow ? '#fef3c7' : '#ecfdf5',
                        color: isExpired ? '#b91c1c' : isLow ? '#b45309' : '#047857'
                      }}>
                        {isExpired ? '⚠️ Expired' : isLow ? '⚡ Low Stock' : '✓ In Stock'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MedicineInventory;