const MedicalHistory = require('../models/MedicalHistory');
const Prescription = require('../models/Prescription');

// @desc    Add medical history record (doctor only)
// @route   POST /api/history
// @access  Private (doctor)
const addMedicalHistory = async (req, res) => {
  try {
    const { patientId, appointmentId, diagnosis, symptoms, notes } = req.body;

    const reportFiles = req.files ? req.files.map(f => f.path) : [];

    // IMMUTABLE: Only creation allowed — no update/delete
    const record = await MedicalHistory.create({
      patient: patientId,
      doctor: req.user._id,
      appointment: appointmentId,
      diagnosis,
      symptoms: symptoms ? symptoms.split(',').map(s => s.trim()) : [],
      notes,
      reportFiles,
    });

    res.status(201).json({ success: true, record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get patient's medical history
// @route   GET /api/history
// @access  Private (patient - own, doctor - their patients, admin)
const getMedicalHistory = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      const { patientId } = req.query;
      if (!patientId) return res.status(400).json({ success: false, message: 'Patient ID required.' });
      query = { patient: patientId, doctor: req.user._id };
    }
    // admin/super_admin can pass patientId query param too
    else if (req.query.patientId) {
      query.patient = req.query.patientId;
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

// @desc    Add prescription (doctor only, immutable)
// @route   POST /api/history/prescription
// @access  Private (doctor)
const addPrescription = async (req, res) => {
  try {
    const { patientId, appointmentId, medicines, advice, followUpDate, treatmentType } = req.body;

    const prescription = await Prescription.create({
      patient: patientId,
      doctor: req.user._id,
      appointment: appointmentId,
      medicines: typeof medicines === 'string' ? JSON.parse(medicines) : medicines,
      advice,
      followUpDate,
      treatmentType,
    });

    res.status(201).json({ success: true, prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get prescriptions
// @route   GET /api/history/prescriptions
// @access  Private (patient - own, doctor - their patients)
const getPrescriptions = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      const { patientId } = req.query;
      query = patientId ? { patient: patientId, doctor: req.user._id } : { doctor: req.user._id };
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
