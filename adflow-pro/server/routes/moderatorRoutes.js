const express = require('express');
const router = express.Router();
const { getReviewQueue, reviewAd } = require('../controllers/moderatorController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect, authorize('Moderator', 'Admin')); // Admins can also moderate if needed

router.get('/queue', getReviewQueue);
router.put('/:id/review', reviewAd);

module.exports = router;
