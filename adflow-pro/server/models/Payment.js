const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ad: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ad',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    default: 'PENDING'
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
