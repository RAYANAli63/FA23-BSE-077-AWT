import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true }
});

// Audit logger helper
export async function logAudit(actorId, actorName, action, entityType, entityId, details = {}) {
  try {
    await supabase.from('audit_logs').insert({
      actor_id: actorId, actor_name: actorName,
      action, entity_type: entityType, entity_id: entityId, details
    });
  } catch (e) { console.error('Audit log error:', e); }
}

// Notification helper
export async function createNotification(userId, title, message, type = 'info') {
  try {
    await supabase.from('notifications').insert({ user_id: userId, title, message, type });
  } catch (e) { console.error('Notification error:', e); }
}
