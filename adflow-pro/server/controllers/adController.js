const { supabase } = require('../db/connect');

// @desc    Create a draft ad
// @route   POST /api/ads
// @access  Private (Client)
const createAd = async (req, res) => {
  try {
    console.log('[AD CREATE] Request user:', req.user);
    console.log('[AD CREATE] Request body:', req.body);
    
    const { title, description, category, city, package: packageType = 'Basic' } = req.body;

    if (!title || !description || !category || !city) {
      return res.status(400).json({ errors: ['Title, description, category, and city are required'] });
    }

    const normalizedPackage = ['Basic', 'Standard', 'Premium'].includes(packageType)
      ? packageType
      : 'Basic';

    // Look up category_id from categories table
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', category)
      .single();

    if (categoryError || !categoryData) {
      console.log('[AD CREATE] Category lookup failed:', categoryError);
      return res.status(400).json({ message: 'Invalid category' });
    }

    // Look up city_id from cities table
    const { data: cityData, error: cityError } = await supabase
      .from('cities')
      .select('id')
      .eq('name', city)
      .single();

    if (cityError || !cityData) {
      console.log('[AD CREATE] City lookup failed:', cityError);
      return res.status(400).json({ message: 'Invalid city' });
    }

    console.log('[AD CREATE] Inserting with data:', {
      user_id: req.user.id,
      title,
      description,
      category_id: categoryData.id,
      city_id: cityData.id,
      package_type: normalizedPackage,
      status: 'draft',
    });

    const { data: ad, error } = await supabase
      .from('ads')
      .insert({
        user_id: req.user.id,
        title,
        description,
        category_id: categoryData.id,
        city_id: cityData.id,
        package_type: normalizedPackage,
        status: 'draft',
      })
      .select()
      .single();

    if (error) {
      console.error('[AD CREATE] Supabase error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        fullError: JSON.stringify(error, null, 2)
      });
      return res.status(500).json({ 
        message: 'Failed to create ad', 
        details: error.message,
        error: error.details || error.code 
      });
    }

    console.log('[AD CREATE] Success:', ad);
    res.status(201).json(ad);
  } catch (error) {
    console.error('[AD CREATE] Exception:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all published ads (Explore page)
// @route   GET /api/ads
// @access  Public
const getPublishedAds = async (req, res) => {
  try {
    const { data: ads, error } = await supabase
      .from('ads')
      .select(`
        id, title, description, package_type, status, user_id, created_at,
        category:categories(id, name, slug),
        city:cities(id, name, province)
      `)
      .eq('status', 'published');

    if (error) {
      return res.status(500).json({ message: 'Failed to load published ads' });
    }

    res.json(ads);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get client's own ads
// @route   GET /api/ads/me
// @access  Private (Client)
const getMyAds = async (req, res) => {
  try {
    const { data: ads, error } = await supabase
      .from('ads')
      .select(`
        id, title, description, package_type, status, reject_reason, created_at,
        category:categories(id, name, slug),
        city:cities(id, name, province)
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ message: 'Failed to load your ads' });
    }

    res.json(ads);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update Ad Status (Client specifically pushing to review)
// @route   PUT /api/ads/:id/submit
// @access  Private (Client)
const submitAd = async (req, res) => {
  try {
    const { data: existingAd, error: fetchError } = await supabase
      .from('ads')
      .select('id, user_id, status')
      .eq('id', req.params.id)
      .single();

    if (fetchError) {
      return res.status(404).json({ message: 'Ad not found' });
    }

    if (existingAd.user_id !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!['draft', 'rejected'].includes(existingAd.status)) {
      return res.status(400).json({ message: 'Invalid status for submission' });
    }

    const { data: ad, error } = await supabase
      .from('ads')
      .update({ status: 'under_review', reject_reason: null })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: 'Failed to submit ad' });
    }

    res.json(ad);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Client Mock Payment
// @route   PUT /api/ads/:id/pay
// @access  Private (Client)
const payForAd = async (req, res) => {
  try {
    const { data: existingAd, error: fetchError } = await supabase
      .from('ads')
      .select('id, user_id, status')
      .eq('id', req.params.id)
      .single();

    if (fetchError) {
      return res.status(404).json({ message: 'Ad not found' });
    }

    if (existingAd.user_id !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (existingAd.status !== 'payment_pending') {
      return res.status(400).json({ message: 'Ad is not pending payment' });
    }

    const { error } = await supabase
      .from('ads')
      .update({ status: 'payment_submitted' })
      .eq('id', req.params.id);

    if (error) {
      return res.status(500).json({ message: 'Failed to update payment status' });
    }

    res.json({ message: 'Payment successfully submitted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createAd,
  getPublishedAds,
  getMyAds,
  submitAd,
  payForAd
};
