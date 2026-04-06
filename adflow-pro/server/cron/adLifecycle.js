const cron = require('node-cron');
const { supabase } = require('../db/connect');

const runAdLifecycleCron = () => {
  // Run every minute (or change to '0 * * * *' for hourly in production)
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();

      // 1. Publish Scheduled Ads
      const { data: readyToPublish, error: publishError } = await supabase
        .from('ads')
        .select('*')
        .eq('status', 'payment_verified')
        .lte('publish_at', now.toISOString());
      
      if (!publishError && readyToPublish) {
        for (let ad of readyToPublish) {
          await supabase
            .from('ads')
            .update({ status: 'published' })
            .eq('id', ad.id);
          console.log(`Cron: Ad ${ad.id} automatically published.`);
        }
      }

      // 2. Expire Ads
      const { data: readyToExpire, error: expireError } = await supabase
        .from('ads')
        .select('*')
        .eq('status', 'published')
        .lte('expire_at', now.toISOString());

      if (!expireError && readyToExpire) {
        for (let ad of readyToExpire) {
          await supabase
            .from('ads')
            .update({ status: 'expired' })
            .eq('id', ad.id);
          console.log(`Cron: Ad ${ad.id} automatically expired.`);
        }
      }

    } catch (error) {
      console.error('Cron job error:', error.message);
    }
  });

  console.log('Ad Lifecycle Cron Jobs started.');
};

module.exports = runAdLifecycleCron;
