const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

// @desc    Book appointment
// @route   POST /api/appointments
// @access  Private (patient)
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, timeSlot, symptoms, clinicIndex } = req.body;

    const doctorProfile = await Doctor.findById(doctorId).populate('user');
    if (!doctorProfile) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    const clinic = doctorProfile.clinics[clinicIndex || 0] || {};

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorProfile.user._id,
      doctorProfile: doctorProfile._id,
      clinic: { name: clinic.name, address: clinic.address, city: clinic.city },
      appointmentDate,
      timeSlot,
      symptoms,
      fee: clinic.fee || doctorProfile.consultationFee,
      status: 'payment_pending',
    });

    res.status(201).json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get patient's appointments
// @route   GET /api/appointments/my
// @access  Private (patient)
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate('doctor', 'name email phone avatar')
      .populate('doctorProfile', 'specialization treatmentType')
      .sort({ createdAt: -1 });

    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get doctor's appointments
// @route   GET /api/appointments/doctor
// @access  Private (doctor)
const getDoctorAppointments = async (req, res) => {
  try {
    const { status } = req.query;
    let query = { doctor: req.user._id };
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone avatar')
      .sort({ appointmentDate: 1 });

    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get pending appointments for assistant
// @route   GET /api/appointments/pending
// @access  Private (assistant)
const getPendingAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ status: 'payment_uploaded' })
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Confirm appointment (by assistant after payment verified)
// @route   PUT /api/appointments/:id/confirm
// @access  Private (assistant)
const confirmAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'confirmed', verifiedBy: req.user._id, verifiedAt: new Date() },
      { new: true }
    );

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });

    res.json({ success: true, message: 'Appointment confirmed.', appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private (patient, doctor, admin)
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });

    // Patient can only cancel their own
    if (req.user.role === 'patient' && appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ success: true, message: 'Appointment cancelled.', appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark appointment as completed (doctor)
// @route   PUT /api/appointments/:id/complete
// @access  Private (doctor)
const completeAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctor: req.user._id, status: 'confirmed' },
      { status: 'completed' },
      { new: true }
    );

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found or not eligible.' });

    res.json({ success: true, message: 'Appointment marked as completed.', appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all appointments (admin)
// @route   GET /api/appointments
// @access  Private (admin, super_admin)
const getAllAppointments = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = {};
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email')
      .populate('doctor', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(query);

    res.json({ success: true, appointments, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  getPendingAppointments,
  confirmAppointment,
  cancelAppointment,
  completeAppointment,
  getAllAppointments,
};
