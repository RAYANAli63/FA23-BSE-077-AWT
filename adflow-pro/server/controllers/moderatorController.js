const { supabase } = require('../db/connect');

// @desc    Get all ads under review
// @route   GET /api/moderator/queue
// @access  Private (Moderator)
const getReviewQueue = async (req, res) => {
  try {
    const { data: ads, error } = await supabase
      .from('ads')
      .select(`
        id, title, description, package_type, status, user_id, created_at,
        category:categories(id, name, slug),
        city:cities(id, name, province)
      `)
      .eq('status', 'under_review')
      .order('created_at', { ascending: true });

    if (error) {
      return res.status(500).json({ message: 'Failed to load review queue' });
    }

    res.json(ads);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Review Ad (Approve or Reject)
// @route   PUT /api/moderator/:id/review
// @access  Private (Moderator)
const reviewAd = async (req, res) => {
  try {
    const { action, reject_reason } = req.body; // action: 'approve' or 'reject'
    
    const { data: ad, error: fetchError } = await supabase
      .from('ads')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !ad) {
      return res.status(404).json({ message: 'Ad not found' });
    }

    if (ad.status !== 'under_review') {
      return res.status(400).json({ message: 'Ad is not under review' });
    }

    let updateData = {};

    if (action === 'approve') {
      updateData = { status: 'payment_pending', reject_reason: null };
    } else if (action === 'reject') {
      if (!reject_reason) {
        return res.status(400).json({ message: 'Reject reason is required' });
      }
      updateData = { status: 'rejected', reject_reason };
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const { data: updatedAd, error: updateError } = await supabase
      .from('ads')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ message: 'Failed to review ad' });
    }

    res.json(updatedAd);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getReviewQueue,
  reviewAd
};
