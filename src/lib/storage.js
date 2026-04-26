import { supabase } from '../supabase'

export async function uploadAvatar(userId, file) {
  const ext = file.name.split('.').pop()
  const path = `${userId}/avatar.${ext}`
  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}

export async function uploadEventImage(userId, file) {
  const ext = file.name.split('.').pop()
  const path = `${userId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage
    .from('event-images')
    .upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from('event-images').getPublicUrl(path)
  return data.publicUrl
}
