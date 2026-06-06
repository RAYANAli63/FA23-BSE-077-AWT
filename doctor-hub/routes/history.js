const express = require('express');
const router = express.Router();
const {
  addMedicalHistory,
  getMedicalHistory,
  addPrescription,
  getPrescriptions,
} = require('../controllers/historyController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, authorize('doctor'), upload.array('reportFiles', 5), addMedicalHistory);
router.get('/', protect, authorize('patient', 'doctor', 'admin', 'super_admin'), getMedicalHistory);
router.post('/prescription', protect, authorize('doctor'), addPrescription);
router.get('/prescriptions', protect, authorize('patient', 'doctor', 'admin', 'super_admin'), getPrescriptions);

module.exports = router;
