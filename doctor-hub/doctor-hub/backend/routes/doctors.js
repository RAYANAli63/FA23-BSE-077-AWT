const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorById,
  updateDoctorProfile,
  getMyDoctorProfile,
  addClinic,
  verifyDoctor,
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getDoctors);
router.get('/me', protect, authorize('doctor'), getMyDoctorProfile);
router.get('/:id', getDoctorById);
router.put('/profile', protect, authorize('doctor'), updateDoctorProfile);
router.post('/clinic', protect, authorize('doctor'), addClinic);
router.put('/:id/verify', protect, authorize('admin', 'super_admin'), verifyDoctor);

module.exports = router;
