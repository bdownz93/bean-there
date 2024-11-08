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
      roaster:roasters(name)
    `)
    .order('rating', { ascending: false })
    .limit(3)

  if (error) {
    console.error('Error fetching featured beans:', error)
    return []
  }
  return data || []
}

export async function getBeans() {
  const { data, error } = await supabase
    .from('beans')
    .select(`
      *,
      roaster:roasters(name)
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
      roaster:roasters(*)
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
      beans(*)
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
      users (
        id,
        name,
        username,
        avatar_url
      ),
      beans (
        id,
        name,
        roaster:roasters (
          id,
          name
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