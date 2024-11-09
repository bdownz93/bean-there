import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || ''
)

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
        description,
        logo_url,
        rating,
        coordinates,
        specialties
      ),
      reviews (
        id,
        rating,
        content,
        brew_method,
        flavor_notes,
        created_at,
        user:user_id (
          id,
          name,
          username,
          avatar_url
        )
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

export async function getRoasterBySlug(slug: string) {
  const { data, error } = await supabase
    .from('roasters')
    .select(`
      *,
      beans (*)
    `)
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching roaster:', error)
    return null
  }
  return data
}

// Review-related functions
export async function getReviews() {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      user:user_id (
        id,
        name,
        username,
        avatar_url
      ),
      bean:bean_id (
        id,
        name,
        roaster:roaster_id (
          id,
          name,
          slug
        )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching reviews:', error)
    return []
  }
  return data || []
}

export async function createReview(review: {
  bean_id: string
  rating: number
  content?: string
  brew_method?: string
  flavor_notes?: string[]
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