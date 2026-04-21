import { supabase } from '../supabase'

export async function getRsvps(userId) {
  const { data, error } = await supabase
    .from('rsvps')
    .select('event_id, user_id, status, user_name')

  if (error) throw error

  const statuses = {}
  const attendees = {}

  for (const row of data) {
    const name = row.user_name || 'Someone'
    if (!attendees[row.event_id]) attendees[row.event_id] = { going: [], maybe: [], cant: [] }
    attendees[row.event_id][row.status].push(name)
    if (row.user_id === userId) statuses[row.event_id] = row.status
  }

  return { statuses, attendees }
}

export async function upsertRsvp(userId, eventId, status, userName) {
  const { error } = await supabase
    .from('rsvps')
    .upsert(
      { user_id: userId, event_id: eventId, status, user_name: userName, updated_at: new Date().toISOString() },
      { onConflict: 'event_id,user_id' }
    )

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
