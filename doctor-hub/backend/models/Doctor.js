const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  timings: { type: String }, // e.g., "Mon-Fri 9AM-5PM"
  fee: { type: Number, default: 0 },
});

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  specialization: {
    type: String,
    required: true,
    trim: true,
  },
  treatmentType: {
    type: String,
    enum: ['allopathic', 'homeopathic', 'herbal'],
    required: true,
  },
  diseases: [{ type: String, trim: true }], // list of diseases treated
  experience: { type: Number, default: 0 }, // years
  qualification: { type: String },
  bio: { type: String },
  clinics: [clinicSchema],
  assistants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isVerified: { type: Boolean, default: false },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  availableDays: [{ type: String }], // ['Monday', 'Tuesday', ...]
  consultationFee: { type: Number, default: 0 },
}, { timestamps: true });

// Text index for search
doctorSchema.index({ specialization: 'text', diseases: 'text' });

module.exports = mongoose.model('Doctor', doctorSchema);
