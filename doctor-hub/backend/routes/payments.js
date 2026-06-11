const express = require('express');
const router = express.Router();
const { uploadPayment, getPendingPayments, verifyPayment, getMyPayments } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, authorize('patient'), upload.single('screenshot'), uploadPayment);
router.get('/pending', protect, authorize('assistant'), getPendingPayments);
router.get('/my', protect, authorize('patient'), getMyPayments);
router.put('/:id/verify', protect, authorize('assistant'), verifyPayment);

module.exports = router;
