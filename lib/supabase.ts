import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create a single instance of the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'bean-there-auth-token',
    storage: {
      getItem: (key) => {
        if (typeof window === 'undefined') return null
        return window.localStorage.getItem(key)
      },
      setItem: (key, value) => {
        if (typeof window === 'undefined') return
        window.localStorage.setItem(key, value)
      },
      removeItem: (key) => {
        if (typeof window === 'undefined') return
        window.localStorage.removeItem(key)
      },
    },
  },
})

// Test connection in development
if (process.env.NODE_ENV === 'development') {
  const testConnection = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      console.log('🔌 Supabase Connection Test:', {
        connected: !error,
        url: supabaseUrl,
        hasSession: !!session,
        userId: session?.user?.id,
        error: error?.message
      })
    } catch (error) {
      console.error('❌ Supabase Connection Error:', error)
    }
  }
  testConnection()
}

// Auth helpers
export async function signIn(email: string, password: string) {
  const { data: { session }, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) throw error
  return session
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

// Follow System
export async function followUser(followingId: string) {
  const { data: session } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('follows')
    .insert({
      follower_id: session.user.id,
      following_id: followingId
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function unfollowUser(followingId: string) {
  const { data: session } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('follows')
    .delete()
    .match({ follower_id: session.user.id, following_id: followingId })

  if (error) throw error
}

export async function getFollowers(userId: string) {
  const { data, error } = await supabase
    .from('follows')
    .select('follower_id, users!follows_follower_id_fkey(*)')
    .eq('following_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getFollowing(userId: string) {
  const { data, error } = await supabase
    .from('follows')
    .select('following_id, users!follows_following_id_fkey(*)')
    .eq('follower_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function isFollowing(followingId: string) {
  const { data: session } = await supabase.auth.getSession()
  if (!session?.user) return false

  const { data, error } = await supabase
    .from('follows')
    .select('id')
    .match({ follower_id: session.user.id, following_id: followingId })
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 is "No results found"
  return !!data
}

// Comments System
export async function createComment({ content, parentId, reviewId, roasterId }: {
  content: string
  parentId?: string
  reviewId?: string
  roasterId?: string
}) {
  const { data: session } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('comments')
    .insert({
      user_id: session.user.id,
      content,
      parent_id: parentId,
      review_id: reviewId,
      roaster_id: roasterId
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getComments(params: {
  reviewId?: string
  roasterId?: string
  parentId?: string | null
}) {
  const { reviewId, roasterId, parentId } = params
  let query = supabase
    .from('comments')
    .select(`
      *,
      users (
        id,
        username,
        name,
        avatar_url
      ),
      comment_likes (
        id,
        user_id
      ),
      replies:comments (
        id
      )
    `)
    .order('created_at', { ascending: true })

  if (reviewId) query = query.eq('review_id', reviewId)
  if (roasterId) query = query.eq('roaster_id', roasterId)
  if (parentId !== undefined) query = query.eq('parent_id', parentId)

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function likeComment(commentId: string) {
  const { data: session } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('comment_likes')
    .insert({
      user_id: session.user.id,
      comment_id: commentId
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function unlikeComment(commentId: string) {
  const { data: session } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('comment_likes')
    .delete()
    .match({ user_id: session.user.id, comment_id: commentId })

  if (error) throw error
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
  try {
    // First, get the beans with roaster info
    const { data: beans, error: beansError } = await supabase
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

    if (beansError) {
      console.error('Error fetching beans:', beansError)
      return []
    }

    // Then, get the ratings separately
    const { data: ratings, error: ratingsError } = await supabase
      .from('reviews')
      .select('bean_id, rating')

    if (ratingsError) {
      console.error('Error fetching ratings:', ratingsError)
      return beans
    }

    // Calculate average ratings
    const ratingsByBean = ratings.reduce((acc: { [key: string]: { sum: number; count: number } }, review) => {
      if (!acc[review.bean_id]) {
        acc[review.bean_id] = { sum: 0, count: 0 }
      }
      acc[review.bean_id].sum += review.rating
      acc[review.bean_id].count++
      return acc
    }, {})

    // Combine beans with their ratings
    return beans.map(bean => ({
      ...bean,
      rating: ratingsByBean[bean.id] 
        ? Number((ratingsByBean[bean.id].sum / ratingsByBean[bean.id].count).toFixed(1))
        : null,
      review_count: ratingsByBean[bean.id]?.count || 0
    }))
  } catch (error) {
    console.error('Error in getAllBeans:', error)
    return []
  }
}

export async function getBeanById(id: string) {
  try {
    // Get the bean with roaster info
    const { data: bean, error: beanError } = await supabase
      .from('beans')
      .select(`
        *,
        roaster:roaster_id (
          id,
          name,
          slug
        )
      `)
      .eq('id', id)
      .single()

    if (beanError) {
      console.error('Error fetching bean:', beanError)
      return null
    }

    // Get the ratings for this bean
    const { data: ratings, error: ratingsError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('bean_id', id)

    if (ratingsError) {
      console.error('Error fetching ratings:', ratingsError)
      return bean
    }

    // Calculate average rating
    if (ratings.length === 0) {
      return {
        ...bean,
        rating: null,
        review_count: 0
      }
    }

    const sum = ratings.reduce((acc, review) => acc + review.rating, 0)
    const average = Number((sum / ratings.length).toFixed(1))

    return {
      ...bean,
      rating: average,
      review_count: ratings.length
    }
  } catch (error) {
    console.error('Error in getBeanById:', error)
    return null
  }
}

export async function getBeanBySlug(slug: string) {
  if (!slug) {
    console.error('No slug provided to getBeanBySlug')
    return null
  }

  try {
    const { data, error } = await supabase
      .from('beans')
      .select(`
        id,
        name,
        slug,
        description,
        origin,
        roast_level,
        image_url,
        created_at,
        updated_at,
        roaster:roasters (
          id,
          name,
          slug,
          logo_url,
          location
        ),
        bean_ratings (
          id,
          rating,
          user_id,
          created_at
        )
      `)
      .eq('slug', slug)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('No bean found with slug:', slug)
        return null
      }
      console.error('Error fetching bean by slug:', error)
      throw error
    }

    if (!data) {
      console.log('No data returned for slug:', slug)
      return null
    }

    // Calculate average rating and total ratings
    const processedBean = {
      ...data,
      average_rating: data.bean_ratings?.length ? 
        Number((data.bean_ratings.reduce((acc: number, curr: any) => acc + curr.rating, 0) / data.bean_ratings.length).toFixed(2)) : 
        null,
      total_ratings: data.bean_ratings?.length || 0
    }

    return processedBean
  } catch (error) {
    console.error('Unexpected error in getBeanBySlug:', error)
    throw error
  }
}

export async function updateBeanSlug(beanId: string, name: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  const { data, error } = await supabase
    .from('beans')
    .update({ slug })
    .eq('id', beanId)
    .select()
    .single()

  if (error) {
    console.error('Error updating bean slug:', error)
    throw error
  }

  return data
}

export async function getBeanByName(name: string) {
  const { data, error } = await supabase
    .from('beans')
    .select(`
      id,
      name,
      slug,
      description,
      origin,
      roast_level,
      image_url,
      created_at,
      updated_at,
      roaster:roasters (
        id,
        name,
        slug,
        logo_url,
        location
      ),
      bean_ratings (
        id,
        rating,
        user_id,
        created_at
      )
    `)
    .ilike('name', name)
    .single()

  if (error) {
    console.error('Error finding bean by name:', error)
    return null
  }

  return data
}

export async function fixBeanSlug(name: string) {
  // First try to find the bean
  const bean = await getBeanByName(name)
  
  if (!bean) {
    console.error('Could not find bean with name:', name)
    return null
  }

  // Generate the correct slug
  const correctSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  // Update the bean with the correct slug
  const { data, error } = await supabase
    .from('beans')
    .update({ slug: correctSlug })
    .eq('id', bean.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating bean slug:', error)
    return null
  }

  return data
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
    .select(`
      *,
      beans (
        id,
        name,
        slug,
        description,
        origin,
        roast_level,
        image_url,
        created_at,
        updated_at,
        bean_ratings (
          rating
        )
      )
    `)
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching roaster by slug:', error)
    return null
  }

  // Calculate average rating and total ratings for each bean
  if (data?.beans) {
    data.beans = data.beans.map(bean => ({
      ...bean,
      average_rating: bean.bean_ratings ? 
        Number((bean.bean_ratings.reduce((acc: number, curr: any) => acc + curr.rating, 0) / bean.bean_ratings.length).toFixed(2)) : 
        null,
      total_ratings: bean.bean_ratings?.length || 0
    }))
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
export async function uploadRoasterLogo(file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase.storage
    .from('roaster-logos')
    .upload(`${user.id}/${Date.now()}-${file.name}`, file)

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

// Notifications
export async function getNotifications() {
  const { data: session } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      actor:users!notifications_actor_id_fkey (
        id,
        username,
        name,
        avatar_url
      )
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data
}

export async function markNotificationAsRead(notificationId: string) {
  const { data: session } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .match({ id: notificationId, user_id: session.user.id })

  if (error) throw error
}

export async function markAllNotificationsAsRead() {
  const { data: session } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .match({ user_id: session.user.id, read: false })

  if (error) throw error
}

// Saved Items
export async function saveItem(params: {
  beanId?: string
  roasterId?: string
  reviewId?: string
  collectionName?: string
}) {
  const { data: session } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('saved_items')
    .insert({
      user_id: session.user.id,
      ...params
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function unsaveItem(params: {
  beanId?: string
  roasterId?: string
  reviewId?: string
}) {
  const { data: session } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('saved_items')
    .delete()
    .match({ user_id: session.user.id, ...params })

  if (error) throw error
}

export async function getSavedItems(collectionName?: string) {
  const { data: session } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Not authenticated')

  let query = supabase
    .from('saved_items')
    .select(`
      *,
      beans (
        id,
        name,
        slug,
        image_url,
        roaster:roasters (
          id,
          name,
          slug
        )
      ),
      roasters (
        id,
        name,
        slug,
        logo_url
      ),
      reviews (
        id,
        content,
        rating,
        bean:beans (
          id,
          name,
          slug
        )
      )
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (collectionName) {
    query = query.eq('collection_name', collectionName)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

// Real-time subscriptions
export function subscribeToNotifications(callback: (notification: any) => void) {
  const { data: { subscription } } = supabase
    .from('notifications')
    .on('INSERT', (payload) => {
      callback(payload.new)
    })
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}

export function subscribeToComments(params: {
  reviewId?: string
  roasterId?: string
  callback: (comment: any) => void
}) {
  const { reviewId, roasterId, callback } = params
  let query = supabase
    .from('comments')

  if (reviewId) query = query.eq('review_id', reviewId)
  if (roasterId) query = query.eq('roaster_id', roasterId)

  const { data: { subscription } } = query
    .on('INSERT', (payload) => {
      callback(payload.new)
    })
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}