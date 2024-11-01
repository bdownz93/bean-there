import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Helper functions for database operations
export async function getRoasters() {
  const { data, error } = await supabase
    .from('roasters')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data
}

export async function getBeans() {
  const { data, error } = await supabase
    .from('beans')
    .select(`
      *,
      roasters (
        name,
        slug
      )
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getReviews() {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      users (
        name,
        username,
        avatar_url
      ),
      beans (
        name,
        roasters (
          name
        )
      )
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function addReview(review: {
  bean_id: string
  rating: number
  content: string
  user_id: string
}) {
  const { data, error } = await supabase
    .from('reviews')
    .insert([review])
    .select()
  
  if (error) throw error
  return data[0]
}

export async function updateReview(
  id: string,
  updates: { rating?: number; content?: string }
) {
  const { data, error } = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

export async function deleteReview(id: string) {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function updateUserProfile(
  userId: string,
  updates: { name?: string; bio?: string; avatar_url?: string }
) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
  
  if (error) throw error
  return data[0]
}