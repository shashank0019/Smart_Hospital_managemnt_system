import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { FaFileInvoiceDollar, FaPlus, FaCheck, FaCreditCard, FaReceipt, FaMoneyBillWave } from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';

const BillingView = ({ isManagement }) => {
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({ totalInvoices: 0, totalRevenue: 0, pendingRevenue: 0, paidCount: 0, pendingCount: 0 });
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [newInvoice, setNewInvoice] = useState({
    patientName: '',
    patientId: '',
    items: [{ description: 'Doctor Consultation Fee', category: 'Consultation', amount: 500 }],
    tax: 0,
    discount: 0,
    paymentMethod: 'UPI / Online'
  });
  const { showToast } = useToast();

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line
  }, [isManagement]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const url = isManagement ? '/api/invoices' : '/api/invoices/my-invoices';
      const res = await client.get(url);
      if (isManagement) {
        setInvoices(res.data.invoices || []);
        setStats(res.data.stats || { totalInvoices: 0, totalRevenue: 0, pendingRevenue: 0 });
      } else {
        setInvoices(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
      showToast('Error loading billing data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePayInvoice = async (invoiceId) => {
    try {
      await client.put(`/api/invoices/${invoiceId}/pay`, { paymentMethod: 'UPI / Online' });
      showToast('Payment successful! Receipt generated.', 'success');
      fetchInvoices();
    } catch (err) {
      showToast('Error processing payment', 'error');
    }
  };

  const handleAddItem = () => {
    setNewInvoice({
      ...newInvoice,
      items: [...newInvoice.items, { description: '', category: 'Pharmacy / Medicine', amount: 0 }]
    });
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...newInvoice.items];
    updated[index][field] = field === 'amount' ? Number(value) : value;
    setNewInvoice({ ...newInvoice, items: updated });
  };

  const handleRemoveItem = (index) => {
    const updated = newInvoice.items.filter((_, i) => i !== index);
    setNewInvoice({ ...newInvoice, items: updated });
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!newInvoice.patientName) {
      showToast('Patient name is required', 'warning');
      return;
    }

    try {
      // Find a dummy or active patient user id if empty
      const patientId = newInvoice.patientId || localStorage.getItem('userId') || '671000000000000000000001';
      await client.post('/api/invoices', {
        ...newInvoice,
        patientId
      });
      showToast('Invoice generated successfully!', 'success');
      setShowCreateModal(false);
      setNewInvoice({
        patientName: '',
        patientId: '',
        items: [{ description: 'Doctor Consultation Fee', category: 'Consultation', amount: 500 }],
        tax: 0,
        discount: 0,
        paymentMethod: 'UPI / Online'
      });
      fetchInvoices();
    } catch (err) {
      showToast('Error generating invoice', 'error');
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      {/* Financial Overview (Management only) */}
      {isManagement && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#fff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '13px', color: '#059669', fontWeight: 600 }}>Total Collected Revenue</span>
            <p style={{ margin: '6px 0 0', fontSize: '26px', fontWeight: 700, color: '#059669' }}>₹{stats.totalRevenue?.toLocaleString() || 0}</p>
          </div>
          <div style={{ background: '#fff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '13px', color: '#d97706', fontWeight: 600 }}>Pending Collections</span>
            <p style={{ margin: '6px 0 0', fontSize: '26px', fontWeight: 700, color: '#d97706' }}>₹{stats.pendingRevenue?.toLocaleString() || 0}</p>
          </div>
          <div style={{ background: '#fff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Total Invoices Issued</span>
            <p style={{ margin: '6px 0 0', fontSize: '26px', fontWeight: 700, color: '#0f172a' }}>{stats.totalInvoices || invoices.length}</p>
          </div>
        </div>
      )}

      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '10px', borderRadius: '10px' }}>
            <FaFileInvoiceDollar size={20} />
          </span>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>
              {isManagement ? 'Hospital Billing & Invoices' : 'My Medical Bills & Receipts'}
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
              Consultations, diagnostic lab work, and pharmacy receipts.
            </p>
          </div>
        </div>

        {isManagement && (
          <button
            onClick={() => setShowCreateModal(true)}
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
            <FaPlus size={12} /> Generate Invoice
          </button>
        )}
      </div>

      {/* Invoices List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading billing statements...</div>
      ) : invoices.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
          No billing statements found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {invoices.map((inv) => {
            const isPaid = inv.paymentStatus === 'Paid';

            return (
              <div
                key={inv._id}
                style={{
                  background: '#fff',
                  borderRadius: '12px',
                  border: isPaid ? '1px solid #e2e8f0' : '1.5px solid #fed7aa',
                  padding: '18px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
                  flexWrap: 'wrap',
                  gap: '14px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>
                      {inv.invoiceNumber}
                    </span>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: isPaid ? '#ecfdf5' : '#fff7ed',
                      color: isPaid ? '#059669' : '#ea580c'
                    }}>
                      {inv.paymentStatus}
                    </span>
                  </div>

                  <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#475569' }}>
                    Patient: <strong>{inv.patientName}</strong>
                    {inv.doctor?.name && ` • Dr. ${inv.doctor.name}`}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                    Date: {new Date(inv.createdAt).toLocaleDateString()} • Items: {inv.items?.length || 1}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Total Due</span>
                    <p style={{ margin: '2px 0 0', fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                      ₹{inv.totalAmount?.toLocaleString() || 0}
                    </p>
                  </div>

                  {!isPaid && !isManagement && (
                    <button
                      onClick={() => handlePayInvoice(inv._id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'linear-gradient(135deg, #059669, #10b981)',
                        color: '#fff',
                        border: 'none',
                        padding: '9px 18px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <FaCreditCard /> Pay Now
                    </button>
                  )}

                  {isPaid && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontSize: '13px', fontWeight: 600 }}>
                      <FaCheck /> Paid via {inv.paymentMethod}
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedInvoice(inv)}
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      color: '#334155'
                    }}
                  >
                    View Receipt
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invoice Details / Printable Receipt Modal */}
      {selectedInvoice && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
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
            maxWidth: '560px',
            padding: '28px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ borderBottom: '2px solid #0d9488', paddingBottom: '14px', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>Smart Hospital System</h2>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>Official Hospital Billing Receipt</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0d9488' }}>{selectedInvoice.invoiceNumber}</span>
                <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#94a3b8' }}>
                  {new Date(selectedInvoice.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '18px', fontSize: '13px', color: '#334155', lineHeight: 1.6 }}>
              <p style={{ margin: 0 }}><strong>Patient Name:</strong> {selectedInvoice.patientName}</p>
              <p style={{ margin: 0 }}><strong>Payment Status:</strong> <span style={{ color: selectedInvoice.paymentStatus === 'Paid' ? '#059669' : '#ea580c', fontWeight: 700 }}>{selectedInvoice.paymentStatus}</span></p>
              <p style={{ margin: 0 }}><strong>Payment Method:</strong> {selectedInvoice.paymentMethod || 'UPI / Online'}</p>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '18px', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>Description</th>
                  <th style={{ padding: '8px' }}>Category</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {(selectedInvoice.items || []).map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px' }}>{item.description}</td>
                    <td style={{ padding: '8px', color: '#64748b' }}>{item.category}</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>₹{item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '12px', marginBottom: '20px', textAlign: 'right' }}>
              <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#64748b' }}>Subtotal: ₹{selectedInvoice.subtotal}</p>
              {selectedInvoice.tax > 0 && <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#64748b' }}>Tax / GST: ₹{selectedInvoice.tax}</p>}
              <p style={{ margin: '6px 0 0', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                Total Paid: ₹{selectedInvoice.totalAmount}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => window.print()}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Print Receipt
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                style={{
                  background: '#0d9488',
                  color: '#fff',
                  border: 'none',
                  padding: '9px 20px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Invoice Modal (Management) */}
      {showCreateModal && (
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
            maxWidth: '540px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '18px', color: '#0f172a' }}>Generate Hospital Invoice</h3>
            <form onSubmit={handleCreateInvoice}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Patient Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  required
                  value={newInvoice.patientName}
                  onChange={(e) => setNewInvoice({ ...newInvoice, patientName: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600 }}>Billable Items</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    style={{ background: '#f1f5f9', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', color: '#0d9488', fontWeight: 600 }}
                  >
                    + Add Item
                  </button>
                </div>

                {newInvoice.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 130px 90px 30px', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Item description"
                      required
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                    <select
                      value={item.category}
                      onChange={(e) => handleItemChange(idx, 'category', e.target.value)}
                      style={{ padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', background: '#fff' }}
                    >
                      <option value="Consultation">Consultation</option>
                      <option value="Pharmacy / Medicine">Pharmacy</option>
                      <option value="Lab Test">Lab Test</option>
                      <option value="Room / Bed Charge">Bed Charge</option>
                      <option value="Procedure">Procedure</option>
                    </select>
                    <input
                      type="number"
                      placeholder="₹"
                      required
                      value={item.amount}
                      onChange={(e) => handleItemChange(idx, 'amount', e.target.value)}
                      style={{ padding: '7px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                    {newInvoice.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 700 }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Tax / GST (₹)</label>
                  <input
                    type="number"
                    value={newInvoice.tax}
                    onChange={(e) => setNewInvoice({ ...newInvoice, tax: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Discount (₹)</label>
                  <input
                    type="number"
                    value={newInvoice.discount}
                    onChange={(e) => setNewInvoice({ ...newInvoice, discount: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', background: '#0d9488', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingView;
