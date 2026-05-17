import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
})

/** Log an audit entry */
export async function logAudit(actorId, actorName, action, entityType, entityId, details = {}) {
  try {
    await supabase.from('audit_logs').insert({
      actor_id: actorId, actor_name: actorName,
      action, entity_type: entityType, entity_id: entityId, details
    })
  } catch (e) { console.warn('Audit log error:', e) }
}

/** Create a notification for a user */
export async function createNotification(userId, title, message, type = 'info') {
  try {
    await supabase.from('notifications').insert({ user_id: userId, title, message, type })
  } catch (e) { console.warn('Notification error:', e) }
}

/** Format session user ID from UUID */
export function formatSessionId(uuid) {
  if (!uuid) return null
  return `VS-${uuid.slice(0, 8).toUpperCase()}`
}
