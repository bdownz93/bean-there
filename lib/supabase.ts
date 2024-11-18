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