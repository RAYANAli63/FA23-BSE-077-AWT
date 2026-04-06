const express = require('express');
const router = express.Router();
const { createAd, getPublishedAds, getMyAds, submitAd, payForAd } = require('../controllers/adController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { createAdSchema } = require('../validators/adValidator');

router.route('/')
  .get(getPublishedAds)
  .post(protect, authorize('Client'), validate(createAdSchema), createAd);

router.get('/me', protect, authorize('Client'), getMyAds);
router.put('/:id/submit', protect, authorize('Client'), submitAd);
router.put('/:id/pay', protect, authorize('Client'), payForAd);

// Add routes for categories and cities
router.get('/categories', async (req, res) => {
  try {
    const { data, error } = await require('../db/connect').supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load categories' });
  }
});

router.get('/cities', async (req, res) => {
  try {
    const { data, error } = await require('../db/connect').supabase
      .from('cities')
      .select('*')
      .order('name');
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load cities' });
  }
});

module.exports = router;
