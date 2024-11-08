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

  if (error) throw error
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

  if (error) throw error
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

  if (error) throw error
  return data || []
}

export async function getBeansByRoaster(roasterId: string) {
  const { data, error } = await supabase
    .from('beans')
    .select('*')
    .eq('roaster_id', roasterId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Roaster-related functions
export async function getAllRoasters() {
  const { data, error } = await supabase
    .from('roasters')
    .select(`
      *,
      created_by (
        id,
        name,
        username
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getRoasterById(id: string) {
  const { data, error } = await supabase
    .from('roasters')
    .select(`
      *,
      beans(*),
      created_by (
        id,
        name,
        username
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data || []
}

export async function getRoasterBySlug(slug: string) {
  const { data, error } = await supabase
    .from('roasters')
    .select(`
      *,
      beans(*),
      created_by (
        id,
        name,
        username
      )
    `)
    .eq('slug', slug)
    .single()

  if (error) throw error
  return data || []
}

// Visited roasters functions
export async function toggleVisitedRoaster(userId: string, roasterId: string) {
  // First check if the roaster is already visited
  const { data: existing } = await supabase
    .from('visited_roasters')
    .select('*')
    .eq('user_id', userId)
    .eq('roaster_id', roasterId)
    .single()

  if (existing) {
    // Remove from visited
    const { error } = await supabase
      .from('visited_roasters')
      .delete()
      .eq('user_id', userId)
      .eq('roaster_id', roasterId)

    if (error) throw error
  } else {
    // Add to visited
    const { error } = await supabase
      .from('visited_roasters')
      .insert({ user_id: userId, roaster_id: roasterId })

    if (error) throw error
  }
}

export async function getVisitedRoasters(userId: string) {
  const { data, error } = await supabase
    .from('visited_roasters')
    .select('roaster_id')
    .eq('user_id', userId)

  if (error) throw error
  return (data || []).map(visit => visit.roaster_id)
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

  if (error) throw error
  return data || []
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

  if (error) throw error
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
      stats:user_stats(*)
    `)
    .eq('id', userId)
    .single()

  if (userError) throw userError

  const { data: followers, error: followersError } = await supabase
    .from('followers')
    .select('follower_id')
    .eq('following_id', userId)

  if (followersError) throw followersError

  const { data: following, error: followingError } = await supabase
    .from('followers')
    .select('following_id')
    .eq('follower_id', userId)

  if (followingError) throw followingError

  return {
    ...user,
    followers_count: followers.length,
    following_count: following.length
  }
}

export async function updateUserProfile(userId: string, data: any) {
  const { error } = await supabase
    .from('users')
    .update(data)
    .eq('id', userId)

  if (error) throw error
}

export async function followUser(followerId: string, followingId: string) {
  const { error } = await supabase
    .from('followers')
    .insert({ follower_id: followerId, following_id: followingId })

  if (error) throw error
}

export async function unfollowUser(followerId: string, followingId: string) {
  const { error } = await supabase
    .from('followers')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId)

  if (error) throw error
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

  if (error) throw error
  return data || []
}