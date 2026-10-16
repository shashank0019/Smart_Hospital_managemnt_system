const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const { auth, checkRole } = require('../middleware/auth');

// Helper to generate invoice number
const generateInvoiceNumber = () => {
  const prefix = 'INV';
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${random}`;
};

// Get current patient's invoices
router.get('/my-invoices', auth, async (req, res) => {
  try {
    const invoices = await Invoice.find({ patient: req.user.id })
      .populate('doctor', 'name specialization')
      .populate('appointment', 'date reason')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching patient invoices:', error);
    res.status(500).json({ message: 'Error fetching invoices' });
  }
});

// Get all invoices with financial stats (management only)
router.get('/', auth, checkRole(['management']), async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('patient', 'name email mobileNumber')
      .populate('doctor', 'name specialization')
      .sort({ createdAt: -1 });

    const totalRevenue = invoices
      .filter(inv => inv.paymentStatus === 'Paid')
      .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

    const pendingRevenue = invoices
      .filter(inv => inv.paymentStatus === 'Pending')
      .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

    const paidCount = invoices.filter(inv => inv.paymentStatus === 'Paid').length;
    const pendingCount = invoices.filter(inv => inv.paymentStatus === 'Pending').length;

    res.json({
      stats: {
        totalInvoices: invoices.length,
        totalRevenue,
        pendingRevenue,
        paidCount,
        pendingCount
      },
      invoices
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ message: 'Error fetching invoices' });
  }
});

// Create new invoice (management or doctor)
router.post('/', auth, checkRole(['management', 'doctor']), async (req, res) => {
  try {
    const { patientId, patientName, doctorId, appointmentId, items, tax, discount, paymentMethod, notes } = req.body;

    if (!patientId || !patientName || !items || !items.length) {
      return res.status(400).json({ message: 'Patient and billable items are required' });
    }

    const subtotal = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const taxAmount = Number(tax || 0);
    const discountAmount = Number(discount || 0);
    const totalAmount = Math.max(0, subtotal + taxAmount - discountAmount);

    const invoice = new Invoice({
      invoiceNumber: generateInvoiceNumber(),
      patient: patientId,
      patientName,
      doctor: doctorId || (req.user.role === 'doctor' ? req.user.id : undefined),
      appointment: appointmentId || undefined,
      items,
      subtotal,
      tax: taxAmount,
      discount: discountAmount,
      totalAmount,
      paymentStatus: 'Pending',
      paymentMethod: paymentMethod || 'UPI / Online'
    });

    await invoice.save();
    res.status(201).json(invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ message: 'Error creating invoice', error: error.message });
  }
});

// Pay invoice (patient online checkout or management cash collection)
router.put('/:id/pay', auth, async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    invoice.paymentStatus = 'Paid';
    invoice.paidAt = new Date();
    if (paymentMethod) invoice.paymentMethod = paymentMethod;

    await invoice.save();
    res.json({ message: 'Invoice marked as paid successfully', invoice });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ message: 'Error processing payment' });
  }
});

module.exports = router;
