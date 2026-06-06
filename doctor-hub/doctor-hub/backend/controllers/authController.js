const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const { generateToken } = require('../middleware/auth');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, specialization, treatmentType } = req.body;

    // Allow all roles for dev/demo — in production restrict to 'patient'
    const allowedRoles = ['patient', 'doctor', 'assistant', 'admin', 'super_admin'];
    const assignedRole = allowedRoles.includes(role) ? role : 'patient';

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const user = await User.create({ name, email, password, role: assignedRole, phone });

    // Auto-create role profile
    if (assignedRole === 'patient') {
      await Patient.create({ user: user._id });
    } else if (assignedRole === 'doctor') {
      await Doctor.create({
        user: user._id,
        specialization: specialization || 'General',
        treatmentType: treatmentType || 'allopathic',
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated.' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create doctor/assistant/admin (by admin/super_admin)
// @route   POST /api/auth/create-staff
// @access  Private (admin, super_admin)
const createStaff = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    const allowedRoles = ['doctor', 'assistant', 'admin'];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid staff role.' });
    }

    // Only super_admin can create admin
    if (role === 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Only Super Admin can create admins.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const user = await User.create({ name, email, password, role, phone });

    // Auto-create doctor profile if role is doctor
    if (role === 'doctor') {
      const { specialization, treatmentType } = req.body;
      await Doctor.create({
        user: user._id,
        specialization: specialization || 'General',
        treatmentType: treatmentType || 'allopathic',
      });
    }

    res.status(201).json({
      success: true,
      message: `${role} created successfully.`,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe, createStaff };
