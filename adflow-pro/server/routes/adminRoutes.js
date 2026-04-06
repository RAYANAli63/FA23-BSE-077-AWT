const express = require('express');
const router = express.Router();
const { getPaymentsQueue, verifyPayment, getPublishQueue, publishAd } = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect, authorize('Admin'));

router.get('/payments', getPaymentsQueue);
router.put('/payments/:id/verify', verifyPayment);
router.get('/publish-queue', getPublishQueue);
router.put('/publish/:id', publishAd);

module.exports = router;
