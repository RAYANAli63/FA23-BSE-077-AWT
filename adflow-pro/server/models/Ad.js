const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  mediaURL: {
    type: String
  },
  package: {
    type: String,
    enum: ['Basic', 'Standard', 'Premium'],
    required: true
  },
  status: {
    type: String,
    enum: [
      'DRAFT', 
      'UNDER_REVIEW', 
      'PAYMENT_PENDING', 
      'PAYMENT_SUBMITTED', 
      'PAYMENT_VERIFIED', 
      'PUBLISHED', 
      'EXPIRED', 
      'REJECTED'
    ],
    default: 'DRAFT'
  },
  publish_at: {
    type: Date
  },
  expire_at: {
    type: Date
  },
  reject_reason: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Ad', adSchema);
