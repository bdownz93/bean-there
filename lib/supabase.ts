import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import type { Bean, Roaster } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

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

export async function getAllBeans() {
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

export async function getBeansByRoaster(roasterId: string) {
  const { data, error } = await supabase
    .from('beans')
    .select('*')
    .eq('roaster_id', roasterId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching roaster beans:', error)
    return []
  }
  return data || []
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

export async function getRoasterById(id: string) {
  const { data, error } = await supabase
    .from('roasters')
    .select(`
      *,
      beans(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching roaster:', error)
    return null
  }
  return data
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
export async function addReview(review: {
  bean_id: string
  user_id: string
  rating: number
  content: string
  brew_method?: string
  flavor_notes?: string[]
}) {
  const { data, error } = await supabase
    .from('reviews')
    .insert([{
      ...review,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single()

  if (error) {
    console.error('Error adding review:', error)
    throw error
  }
  return data
}

export async function getReviews(beanId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      users (
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

// User profile functions
export async function getUserProfile(userId: string) {
  const { data: user, error: userError } = await supabase
    .from('users')
    .select(`
      *,
      badges:user_badges(
        badge:badges(*)
      ),
      stats:reviews(count),
      roasters:roasters(count),
      beans:beans(count),
      journal:coffee_journal(
        *,
        bean:beans(*)
      )
    `)
    .eq('id', userId)
    .single()

  if (userError) {
    console.error('Error fetching user profile:', userError)
    return null
  }

  const { data: followers, error: followersError } = await supabase
    .from('followers')
    .select('follower_id')
    .eq('following_id', userId)

  if (followersError) {
    console.error('Error fetching followers:', followersError)
    return null
  }

  const { data: following, error: followingError } = await supabase
    .from('followers')
    .select('following_id')
    .eq('follower_id', userId)

  if (followingError) {
    console.error('Error fetching following:', followingError)
    return null
  }

  return {
    ...user,
    followers_count: followers?.length || 0,
    following_count: following?.length || 0
  }
}

export async function updateUserProfile(userId: string, data: Partial<User>) {
  const { error } = await supabase
    .from('users')
    .update(data)
    .eq('id', userId)

  if (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

export async function followUser(followerId: string, followingId: string) {
  const { error } = await supabase
    .from('followers')
    .insert({ follower_id: followerId, following_id: followingId })

  if (error) {
    console.error('Error following user:', error)
    throw error
  }
}

export async function unfollowUser(followerId: string, followingId: string) {
  const { error } = await supabase
    .from('followers')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId)

  if (error) {
    console.error('Error unfollowing user:', error)
    throw error
  }
}

export async function addJournalEntry(userId: string, beanId: string, notes: string, isPrivate: boolean) {
  const { error } = await supabase
    .from('coffee_journal')
    .insert({
      user_id: userId,
      bean_id: beanId,
      notes,
      private: isPrivate
    })

  if (error) {
    console.error('Error adding journal entry:', error)
    throw error
  }
}

export async function getUserBadges(userId: string) {
  const { data, error } = await supabase
    .from('user_badges')
    .select(`
      *,
      badge:badges(*)
    `)
    .eq('user_id', userId)
    .order('earned_at', { ascending: false })

  if (error) {
    console.error('Error fetching user badges:', error)
    return []
  }
  return data || []
}