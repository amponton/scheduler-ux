import { supabase } from '../supabase'

export async function getRsvps(userId) {
  const { data, error } = await supabase
    .from('rsvps')
    .select('event_id, status')
    .eq('user_id', userId)

  if (error) throw error

  return Object.fromEntries(data.map(r => [r.event_id, r.status]))
}

export async function upsertRsvp(userId, eventId, status) {
  const { error } = await supabase
    .from('rsvps')
    .upsert({ user_id: userId, event_id: eventId, status, updated_at: new Date().toISOString() },
      { onConflict: 'event_id,user_id' })

  if (error) throw error
}

export async function deleteRsvp(userId, eventId) {
  const { error } = await supabase
    .from('rsvps')
    .delete()
    .eq('user_id', userId)
    .eq('event_id', eventId)

  if (error) throw error
}
