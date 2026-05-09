const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// ===================== MONGODB MODELS =====================

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  cnic: { type: String },
  email: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const committeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  monthlyAmount: { type: Number, required: true },
  totalMembers: { type: Number, required: true },
  startDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' },
  members: [{
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
    memberName: String,
    turnMonth: Number, // which month this member gets the payout
    hasTaken: { type: Boolean, default: false }
  }],
  createdAt: { type: Date, default: Date.now }
});

const paymentSchema = new mongoose.Schema({
  committeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Committee', required: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  memberName: String,
  month: Number,
  year: Number,
  amount: Number,
  status: { type: String, enum: ['paid', 'pending', 'late'], default: 'pending' },
  paidDate: Date,
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

const payoutSchema = new mongoose.Schema({
  committeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Committee', required: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  memberName: String,
  turnMonth: Number,
  turnYear: Number,
  totalAmount: Number,
  status: { type: String, enum: ['given', 'pending'], default: 'pending' },
  givenDate: Date,
  createdAt: { type: Date, default: Date.now }
});

const Member = mongoose.model('Member', memberSchema);
const Committee = mongoose.model('Committee', committeeSchema);
const Payment = mongoose.model('Payment', paymentSchema);
const Payout = mongoose.model('Payout', payoutSchema);

// ===================== API ROUTES =====================

// --- MEMBERS ---
app.get('/api/members', async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    res.json(members);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/members', async (req, res) => {
  try {
    const member = new Member(req.body);
    await member.save();
    res.json(member);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/members/:id', async (req, res) => {
  try {
    await Member.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- COMMITTEES ---
app.get('/api/committees', async (req, res) => {
  try {
    const committees = await Committee.find().sort({ createdAt: -1 });
    res.json(committees);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/committees/:id', async (req, res) => {
  try {
    const committee = await Committee.findById(req.params.id);
    if (!committee) return res.status(404).json({ error: 'Not found' });
    res.json(committee);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/committees', async (req, res) => {
  try {
    const committee = new Committee(req.body);
    await committee.save();
    
    // Auto-generate payment records for all members for all months
    const payments = [];
    const startDate = new Date(committee.startDate);
    for (let monthOffset = 0; monthOffset < committee.totalMembers; monthOffset++) {
      const payDate = new Date(startDate);
      payDate.setMonth(payDate.getMonth() + monthOffset);
      for (const member of committee.members) {
        payments.push(new Payment({
          committeeId: committee._id,
          memberId: member.memberId,
          memberName: member.memberName,
          month: payDate.getMonth() + 1,
          year: payDate.getFullYear(),
          amount: committee.monthlyAmount,
          status: 'pending'
        }));
      }
    }
    await Payment.insertMany(payments);

    // Auto-generate payout records
    const payouts = [];
    for (const member of committee.members) {
      const payDate = new Date(startDate);
      payDate.setMonth(payDate.getMonth() + (member.turnMonth - 1));
      payouts.push(new Payout({
        committeeId: committee._id,
        memberId: member.memberId,
        memberName: member.memberName,
        turnMonth: payDate.getMonth() + 1,
        turnYear: payDate.getFullYear(),
        totalAmount: committee.monthlyAmount * committee.totalMembers,
        status: 'pending'
      }));
    }
    await Payout.insertMany(payouts);

    res.json(committee);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/committees/:id/status', async (req, res) => {
  try {
    const committee = await Committee.findByIdAndUpdate(
      req.params.id, { status: req.body.status }, { new: true }
    );
    res.json(committee);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- PAYMENTS ---
app.get('/api/payments/:committeeId', async (req, res) => {
  try {
    const payments = await Payment.find({ committeeId: req.params.committeeId })
      .sort({ year: 1, month: 1 });
    res.json(payments);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/payments/:id/mark-paid', async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: 'paid', paidDate: new Date(), notes: req.body.notes },
      { new: true }
    );
    res.json(payment);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- PAYOUTS ---
app.get('/api/payouts/:committeeId', async (req, res) => {
  try {
    const payouts = await Payout.find({ committeeId: req.params.committeeId });
    res.json(payouts);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/payouts/:id/mark-given', async (req, res) => {
  try {
    const payout = await Payout.findByIdAndUpdate(
      req.params.id,
      { status: 'given', givenDate: new Date() },
      { new: true }
    );
    // Also update committee member hasTaken
    if (payout) {
      await Committee.updateOne(
        { _id: payout.committeeId, 'members.memberId': payout.memberId },
        { $set: { 'members.$.hasTaken': true } }
      );
    }
    res.json(payout);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- DASHBOARD STATS ---
app.get('/api/dashboard', async (req, res) => {
  try {
    const totalMembers = await Member.countDocuments();
    const totalCommittees = await Committee.countDocuments();
    const activeCommittees = await Committee.countDocuments({ status: 'active' });
    const totalCollected = await Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const pendingPayments = await Payment.countDocuments({ status: 'pending' });
    const pendingPayouts = await Payout.countDocuments({ status: 'pending' });

    res.json({
      totalMembers,
      totalCommittees,
      activeCommittees,
      totalCollected: totalCollected[0]?.total || 0,
      pendingPayments,
      pendingPayouts
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/payments/recent', async (req, res) => {
  try {
    // Get recent payments
    const payments = await Payment.find().sort({ createdAt: -1 }).limit(10).populate('committeeId', 'name');
    res.json(payments);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ===================== SERVE FRONTEND =====================
app.use(express.static(path.join(__dirname, 'public')));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ===================== START SERVER =====================
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/committee_system';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.log('⚠️  MongoDB not connected, running in demo mode');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  });
