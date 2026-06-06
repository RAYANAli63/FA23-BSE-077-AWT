const MedicalHistory = require('../models/MedicalHistory');
const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');

// @desc    Add medical history record (doctor only) — IMMUTABLE
// @route   POST /api/history
// @access  Private (doctor)
const addMedicalHistory = async (req, res) => {
  try {
    const { patientId, appointmentId, diagnosis, symptoms, notes } = req.body;

    if (!patientId || !diagnosis) {
      return res.status(400).json({ success: false, message: 'patientId and diagnosis are required.' });
    }

    const reportFiles = req.files ? req.files.map(f => f.path.replace(/\\/g, '/')) : [];

    const symptomsArr = symptoms
      ? symptoms.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const record = await MedicalHistory.create({
      patient: patientId,
      doctor: req.user._id,
      appointment: appointmentId || undefined,
      diagnosis,
      symptoms: symptomsArr,
      notes: notes || '',
      reportFiles,
    });

    // Mark appointment as completed when history is added
    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, { status: 'completed' });
    }

    const populated = await MedicalHistory.findById(record._id)
      .populate('doctor', 'name email avatar')
      .populate('patient', 'name email');

    res.status(201).json({ success: true, record: populated });
  } catch (error) {
    console.error('addMedicalHistory error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get medical history
// @route   GET /api/history
// @access  Private
const getMedicalHistory = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      const { patientId } = req.query;
      if (!patientId) {
        // Return all history for this doctor's patients
        query.doctor = req.user._id;
      } else {
        query = { patient: patientId, doctor: req.user._id };
      }
    } else if (['admin', 'super_admin'].includes(req.user.role)) {
      if (req.query.patientId) query.patient = req.query.patientId;
    }

    const history = await MedicalHistory.find(query)
      .populate('doctor', 'name email avatar')
      .populate('patient', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add prescription (doctor only) — IMMUTABLE
// @route   POST /api/history/prescription
// @access  Private (doctor)
const addPrescription = async (req, res) => {
  try {
    const { patientId, appointmentId, medicines, advice, followUpDate, treatmentType } = req.body;

    if (!patientId) {
      return res.status(400).json({ success: false, message: 'patientId is required.' });
    }

    let parsedMedicines = medicines;
    if (typeof medicines === 'string') {
      try { parsedMedicines = JSON.parse(medicines); } catch { parsedMedicines = []; }
    }

    const prescription = await Prescription.create({
      patient: patientId,
      doctor: req.user._id,
      appointment: appointmentId || undefined,
      medicines: parsedMedicines || [],
      advice: advice || '',
      followUpDate: followUpDate || undefined,
      treatmentType: treatmentType || 'allopathic',
    });

    const populated = await Prescription.findById(prescription._id)
      .populate('doctor', 'name email avatar')
      .populate('patient', 'name email');

    res.status(201).json({ success: true, prescription: populated });
  } catch (error) {
    console.error('addPrescription error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get prescriptions
// @route   GET /api/history/prescriptions
// @access  Private
const getPrescriptions = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      const { patientId } = req.query;
      query = patientId
        ? { patient: patientId, doctor: req.user._id }
        : { doctor: req.user._id };
    } else if (['admin', 'super_admin'].includes(req.user.role)) {
      if (req.query.patientId) query.patient = req.query.patientId;
    }

    const prescriptions = await Prescription.find(query)
      .populate('doctor', 'name email avatar')
      .populate('patient', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, prescriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addMedicalHistory, getMedicalHistory, addPrescription, getPrescriptions };
