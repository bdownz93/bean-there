import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Default to empty strings to prevent URL constructor errors
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Bean-related functions
export async function getFeaturedBeans() {
  const { data, error } = await supabase
    .from('beans')
    .select(`
      *,
      roaster:roaster_id (
        id,
        name,
        slug
      )
    `)
    .order('rating', { ascending: false })
    .limit(3)

  if (error) {
    console.error('Error fetching featured beans:', error)
    return []
  }
  return data || []
}

export async function getAllBeans() {
  const { data, error } = await supabase
    .from('beans')
    .select(`
      *,
      roaster:roaster_id (
        id,
        name,
        slug
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching beans:', error)
    return []
  }
  return data || []
}

export async function getBeanById(id: string) {
  const { data, error } = await supabase
    .from('beans')
    .select(`
      *,
      roaster:roaster_id (
        id,
        name,
        slug,
        location,
        description
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching bean:', error)
    return null
  }
  return data
}

// Roaster-related functions
export async function getAllRoasters() {
  const { data, error } = await supabase
    .from('roasters')
    .select(`
      *,
      beans (
        id,
        name,
        origin,
        roast_level,
        price,
        rating
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching roasters:', error)
    return []
  }
  return data || []
}

// Review-related functions
export async function getReviews(beanId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      user:user_id (
        id,
        name,
        username,
        avatar_url
      )
    `)
    .eq('bean_id', beanId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching reviews:', error)
    return []
  }
  return data || []
}

export async function createReview(review: {
  bean_id: string
  rating: number
  content: string
  brew_method?: string
  flavor_notes?: string[]
  photo_url?: string
  aroma?: number
  body?: number
  acidity?: number
  sweetness?: number
  aftertaste?: number
}) {
  const { data, error } = await supabase
    .from('reviews')
    .insert([{
      ...review,
      user_id: (await supabase.auth.getUser()).data.user?.id
    }])
    .select()

  if (error) {
    console.error('Error creating review:', error)
    throw error
  }

  return data[0]
}

// Helper function for uploading review photos
export async function uploadReviewPhoto(file: File, userId: string): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Math.random()}.${fileExt}`

    const { error: uploadError, data } = await supabase.storage
      .from('review-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('review-photos')
      .getPublicUrl(fileName)

    return publicUrl
  } catch (error) {
    console.error('Error uploading review photo:', error)
    throw error
  }
}