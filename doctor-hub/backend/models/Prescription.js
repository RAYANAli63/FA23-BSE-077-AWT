const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String }, // e.g., "500mg"
  frequency: { type: String }, // e.g., "twice daily"
  duration: { type: String }, // e.g., "7 days"
  instructions: { type: String },
});

const prescriptionSchema = new mongoose.Schema({
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
  medicines: [medicineSchema],
  advice: { type: String },
  followUpDate: { type: Date },
  treatmentType: {
    type: String,
    enum: ['allopathic', 'homeopathic', 'herbal'],
  },
  // IMMUTABLE — prescriptions cannot be edited after creation
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
