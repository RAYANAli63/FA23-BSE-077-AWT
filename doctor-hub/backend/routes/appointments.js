const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  getPendingAppointments,
  confirmAppointment,
  cancelAppointment,
  completeAppointment,
  getAllAppointments,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('patient'), bookAppointment);
router.get('/my', protect, authorize('patient'), getMyAppointments);
router.get('/doctor', protect, authorize('doctor'), getDoctorAppointments);
router.get('/pending', protect, authorize('assistant'), getPendingAppointments);
router.get('/', protect, authorize('admin', 'super_admin'), getAllAppointments);
router.put('/:id/confirm', protect, authorize('assistant'), confirmAppointment);
router.put('/:id/cancel', protect, authorize('patient', 'doctor', 'admin', 'super_admin'), cancelAppointment);
router.put('/:id/complete', protect, authorize('doctor'), completeAppointment);

module.exports = router;
