import { supabase } from './supabase'

export async function uploadAvatar(file: File, userId: string) {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Math.random()}.${fileExt}`
    
    const { error: uploadError, data } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        upsert: true
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    return publicUrl
  } catch (error) {
    console.error('Error uploading avatar:', error)
    throw error
  }
}

export async function deleteAvatar(url: string) {
  try {
    const fileName = url.split('/').pop()
    if (!fileName) return

    const { error } = await supabase.storage
      .from('avatars')
      .remove([fileName])

    if (error) throw error
  } catch (error) {
    console.error('Error deleting avatar:', error)
    throw error
  }
}