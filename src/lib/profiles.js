import { supabase } from '../supabase'

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export async function saveProfile(userId, settings) {
  const { error } = await supabase
    .from('profiles')
    .update({
      name: settings.name,
      email: settings.email,
      phone: settings.phone,
      timezone: settings.timezone,
      notifications: settings.notifications,
      contacts: settings.contacts,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) throw error
}
