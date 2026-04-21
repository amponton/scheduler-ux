import { supabase } from '../supabase'

export async function getEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true })

  if (error) throw error
  return data
}

export async function createEvent(userId, hostName, eventData) {
  const { data, error } = await supabase
    .from('events')
    .insert({
      title: eventData.title,
      date: eventData.date,
      time: eventData.time,
      location: eventData.location,
      description: eventData.description,
      attendees: eventData.attendees,
      host_id: userId,
      host_name: hostName,
      responses: { going: [], maybe: [], cant: [] },
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateEvent(eventId, eventData) {
  const { data, error } = await supabase
    .from('events')
    .update({
      title: eventData.title,
      date: eventData.date,
      time: eventData.time,
      location: eventData.location,
      description: eventData.description,
      attendees: eventData.attendees,
    })
    .eq('id', eventId)
    .select()
    .single()

  if (error) throw error
  return data
}
