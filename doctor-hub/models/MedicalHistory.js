const mongoose = require('mongoose');

const medicalHistorySchema = new mongoose.Schema({
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
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  },
  diagnosis: {
    type: String,
    required: true,
  },
  symptoms: [String],
  notes: { type: String },
  reportFiles: [String], // uploaded file paths
  // Records are IMMUTABLE — no update allowed after creation
}, {
  timestamps: true,
  // Override toJSON to prevent accidental mutation hints
});

module.exports = mongoose.model('MedicalHistory', medicalHistorySchema);
