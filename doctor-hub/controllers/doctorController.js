const Doctor = require('../models/Doctor');
const User = require('../models/User');

// @desc    Get all doctors with filtering & pagination
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res) => {
  try {
    const { treatmentType, disease, city, search, page = 1, limit = 10 } = req.query;

    let query = { isVerified: true };

    if (treatmentType) query.treatmentType = treatmentType;
    if (disease) query.diseases = { $in: [new RegExp(disease, 'i')] };

    const skip = (page - 1) * limit;

    let doctors = await Doctor.find(query)
      .populate('user', 'name email phone avatar')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ rating: -1 });

    // Filter by city (clinic-level)
    if (city) {
      doctors = doctors.filter(d =>
        d.clinics.some(c => c.city.toLowerCase().includes(city.toLowerCase()))
      );
    }

    // Search by name or specialization
    if (search) {
      const regex = new RegExp(search, 'i');
      doctors = doctors.filter(d =>
        regex.test(d.user?.name) || regex.test(d.specialization)
      );
    }

    const total = await Doctor.countDocuments(query);

    res.json({
      success: true,
      count: doctors.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      doctors,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single doctor details
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('user', 'name email phone avatar')
      .populate('assistants', 'name email phone');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    res.json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/profile
// @access  Private (doctor)
const updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'name email phone avatar');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    res.json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get doctor's own profile
// @route   GET /api/doctors/me
// @access  Private (doctor)
const getMyDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id })
      .populate('user', 'name email phone avatar')
      .populate('assistants', 'name email phone');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    res.json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add clinic to doctor
// @route   POST /api/doctors/clinic
// @access  Private (doctor)
const addClinic = async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { user: req.user._id },
      { $push: { clinics: req.body } },
      { new: true }
    );

    res.json({ success: true, message: 'Clinic added.', doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify doctor (admin only)
// @route   PUT /api/doctors/:id/verify
// @access  Private (admin, super_admin)
const verifyDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { isVerified: req.body.isVerified },
      { new: true }
    );

    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });

    res.json({ success: true, message: `Doctor ${doctor.isVerified ? 'verified' : 'unverified'}.`, doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDoctors, getDoctorById, updateDoctorProfile, getMyDoctorProfile, addClinic, verifyDoctor };
