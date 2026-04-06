const { supabase } = require('../db/connect');

// @desc    Get all payments awaiting verification
// @route   GET /api/admin/payments
// @access  Private (Admin)
const getPaymentsQueue = async (req, res) => {
  try {
    const { data: payments, error } = await supabase
      .from('payments')
      .select('id, user_id, ad_id, amount, status, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      return res.status(500).json({ message: 'Failed to load payments' });
    }

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Verify or Reject Payment
// @route   PUT /api/admin/payments/:id/verify
// @access  Private (Admin)
const verifyPayment = async (req, res) => {
  try {
    const { action } = req.body; // 'verify' or 'reject'
    
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ message: 'Payment is already processed' });
    }

    const { data: ad, error: adFetchError } = await supabase
      .from('ads')
      .select('*')
      .eq('id', payment.ad_id)
      .single();

    if (adFetchError || !ad) {
      return res.status(404).json({ message: 'Associated Ad not found' });
    }

    let updateData = {};
    if (action === 'verify') {
      updateData = { status: 'verified' };
    } else if (action === 'reject') {
      updateData = { status: 'rejected' };
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const { data: updatedPayment, error: updateError } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ message: 'Failed to verify payment' });
    }

    // Update ad status based on payment action
    if (action === 'verify') {
      await supabase
        .from('ads')
        .update({ status: 'payment_verified' })
        .eq('id', payment.ad_id);
    }

    res.json({ payment: updatedPayment, ad });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get ads ready to publish
// @route   GET /api/admin/publish-queue
// @access  Private (Admin)
const getPublishQueue = async (req, res) => {
  try {
    const { data: ads, error } = await supabase
      .from('ads')
      .select(`
        id, title, description, package_type, status, user_id, created_at,
        category:categories(id, name, slug),
        city:cities(id, name, province)
      `)
      .eq('status', 'payment_verified')
      .order('created_at', { ascending: true });

    if (error) {
      return res.status(500).json({ message: 'Failed to load publish queue' });
    }

    res.json(ads);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Publish or schedule an ad
// @route   PUT /api/admin/publish/:id
// @access  Private (Admin)
const publishAd = async (req, res) => {
  try {
    const { publish_at, expire_at } = req.body; // Can be modified by Admin
    
    const { data: ad, error: fetchError } = await supabase
      .from('ads')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !ad) {
      return res.status(404).json({ message: 'Ad not found' });
    }

    if (ad.status !== 'payment_verified') {
      return res.status(400).json({ message: 'Ad is not ready to publish' });
    }

    // Set publish dates
    const now = new Date();
    let adPublishAt = publish_at ? new Date(publish_at) : now;
    let adExpireAt = expire_at ? new Date(expire_at) : new Date(adPublishAt.getTime() + (30 * 24 * 60 * 60 * 1000)); // Default 30 days

    let updateData = {
      publish_at: adPublishAt.toISOString(),
      expire_at: adExpireAt.toISOString()
    };

    if (adPublishAt <= now) {
      updateData.status = 'published';
    }

    const { data: updatedAd, error: updateError } = await supabase
      .from('ads')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ message: 'Failed to publish ad' });
    }

    res.json(updatedAd);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getPaymentsQueue,
  verifyPayment,
  getPublishQueue,
  publishAd
};
