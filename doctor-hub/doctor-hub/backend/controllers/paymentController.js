const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');

// @desc    Upload payment screenshot
// @route   POST /api/payments
// @access  Private (patient)
const uploadPayment = async (req, res) => {
  try {
    const { appointmentId, method, transactionId, amount } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    if (appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    if (appointment.status === 'confirmed') {
      return res.status(400).json({ success: false, message: 'Appointment already confirmed.' });
    }

    // Remove any old pending payment for this appointment
    await Payment.deleteMany({ appointment: appointmentId, status: 'pending' });

    const screenshotPath = req.file ? req.file.path.replace(/\\/g, '/') : null;

    const payment = await Payment.create({
      appointment: appointmentId,
      patient: req.user._id,
      amount: Number(amount) || appointment.fee || 0,
      method: method || 'jazzcash',
      transactionId: transactionId || '',
      screenshot: screenshotPath,
      status: 'pending',
    });

    // Update appointment status to payment_uploaded
    await Appointment.findByIdAndUpdate(appointmentId, { status: 'payment_uploaded' });

    res.status(201).json({ success: true, message: 'Payment uploaded successfully.', payment });
  } catch (error) {
    console.error('uploadPayment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get payments pending verification
// @route   GET /api/payments/pending
// @access  Private (assistant)
const getPendingPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ status: 'pending' })
      .populate('patient', 'name email phone')
      .populate({
        path: 'appointment',
        populate: [
          { path: 'doctor', select: 'name email' },
          { path: 'doctorProfile', select: 'specialization' },
        ],
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify or reject payment
// @route   PUT /api/payments/:id/verify
// @access  Private (assistant)
const verifyPayment = async (req, res) => {
  try {
    const { action, rejectionReason } = req.body;

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found.' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Payment already ${payment.status}.` });
    }

    if (action === 'verify') {
      payment.status = 'verified';
      payment.verifiedBy = req.user._id;
      payment.verifiedAt = new Date();

      await Appointment.findByIdAndUpdate(payment.appointment, {
        status: 'confirmed',
        verifiedBy: req.user._id,
        verifiedAt: new Date(),
      });

    } else if (action === 'reject') {
      payment.status = 'rejected';
      payment.rejectionReason = rejectionReason || 'Rejected by assistant';

      await Appointment.findByIdAndUpdate(payment.appointment, {
        status: 'payment_pending',
      });

    } else {
      return res.status(400).json({ success: false, message: 'Action must be "verify" or "reject".' });
    }

    await payment.save();

    res.json({ success: true, message: `Payment ${action === 'verify' ? 'verified' : 'rejected'}.`, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get patient's payment history
// @route   GET /api/payments/my
// @access  Private (patient)
const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ patient: req.user._id })
      .populate({
        path: 'appointment',
        populate: { path: 'doctor', select: 'name email' },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { uploadPayment, getPendingPayments, verifyPayment, getMyPayments };
