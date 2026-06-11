const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  doctorProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  clinic: {
    name: String,
    address: String,
    city: String,
  },
  appointmentDate: {
    type: Date,
    required: true,
  },
  timeSlot: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'payment_pending', 'payment_uploaded', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  },
  symptoms: { type: String },
  notes: { type: String },
  fee: { type: Number, default: 0 },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  verifiedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
