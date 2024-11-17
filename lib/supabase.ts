import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Default to empty strings to prevent URL constructor errors
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Debug: Log connection details (remove in production)
if (process.env.NODE_ENV === 'development') {
  console.log('Initializing Supabase client with:', {
    url: supabaseUrl,
    hasAnonKey: !!supabaseAnonKey
  })
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  }
})

// Add error handling to test connection
export async function testConnection() {
  if (process.env.NODE_ENV === 'development') {
    console.log('Testing Supabase connection...')
  }
  try {
    const { data, error } = await supabase
      .from('roasters')
      .select('count')
      .single()
    
    if (error) {
      console.error('Supabase connection error:', {
        error,
        message: error.message,
        hint: error.hint,
        details: error.details
      })
      return false
    }
    if (process.env.NODE_ENV === 'development') {
      console.log('Supabase connected successfully:', data)
    }
    return true
  } catch (err) {
    console.error('Unexpected error during connection test:', err)
    return false
  }
}

// Bean-related functions
export async function getFeaturedBeans() {
  const { data, error } = await supabase
    .from('beans')
    .select('*')
    .eq('featured', true)
    .limit(4)

  if (error) {
    console.error('Error fetching featured beans:', error)
    return []
  }

  return data
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
      ),
      stats:bean_stats!bean_stats_id_fkey (
        average_rating,
        review_count
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all beans:', error)
    return []
  }

  return data.map(bean => ({
    ...bean,
    rating: bean.stats?.average_rating || null,
    review_count: bean.stats?.review_count || 0
  }))
}

export async function getBeanById(id: string) {
  const { data, error } = await supabase
    .from('beans')
    .select(`
      *,
      roaster:roaster_id (
        id,
        name,
        slug
      ),
      stats:bean_stats!bean_stats_id_fkey (
        average_rating,
        review_count
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching bean by id:', error)
    return null
  }

  return {
    ...data,
    rating: data.stats?.average_rating || null,
    review_count: data.stats?.review_count || 0
  }
}

// Roaster-related functions
export async function getAllRoasters() {
  const { data, error } = await supabase
    .from('roasters')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all roasters:', error)
    return []
  }

  return data
}

export async function getRoasterBySlug(slug: string) {
  const { data, error } = await supabase
    .from('roasters')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching roaster by slug:', error)
    return null
  }

  return data
}

// Review-related functions
export async function getReviews(beanId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('bean_id', beanId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching reviews:', error)
    return []
  }

  return data
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
    .insert([review])
    .select()
    .single()

  if (error) {
    console.error('Error creating review:', error)
    return null
  }

  return data
}

// Helper function for uploading review photos
export async function uploadReviewPhoto(file: File, userId: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('review-photos')
    .upload(`${userId}/${Date.now()}-${file.name}`, file)

  if (error) {
    console.error('Error uploading review photo:', error)
    throw error
  }

  const { data: { publicUrl } } = supabase.storage
    .from('review-photos')
    .getPublicUrl(data.path)

  return publicUrl
}

// Helper function for uploading roaster logos
export async function uploadRoasterLogo(file: File, userId: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('roaster-logos')
    .upload(`${userId}/${Date.now()}-${file.name}`, file)

  if (error) {
    console.error('Error uploading roaster logo:', error)
    throw error
  }

  const { data: { publicUrl } } = supabase.storage
    .from('roaster-logos')
    .getPublicUrl(data.path)

  return publicUrl
}

// Helper function for uploading bean photos
export async function uploadBeanPhoto(file: File, userId: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('bean-photos')
    .upload(`${userId}/${Date.now()}-${file.name}`, file)

  if (error) {
    console.error('Error uploading bean photo:', error)
    throw error
  }

  const { data: { publicUrl } } = supabase.storage
    .from('bean-photos')
    .getPublicUrl(data.path)

  return publicUrl
}