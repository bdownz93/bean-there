import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Reviews
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

  if (error) throw error
  return data
}

// Beans
export async function syncBeansToSupabase() {
  const { roasters } = await import('./data')
  
  // First sync roasters
  for (const roaster of roasters) {
    const { error: roasterError } = await supabase
      .from('roasters')
      .upsert({
        id: roaster.id,
        name: roaster.name,
        slug: roaster.slug,
        location: roaster.location,
        description: roaster.description,
        logo_url: roaster.logo,
        rating: roaster.rating,
        coordinates: roaster.coordinates,
        specialties: roaster.specialties
      })

    if (roasterError) throw roasterError

    // Then sync beans for each roaster
    for (const bean of roaster.beans) {
      const { error: beanError } = await supabase
        .from('beans')
        .upsert({
          id: bean.id,
          roaster_id: roaster.id,
          name: bean.name,
          slug: bean.id,
          origin: bean.origin,
          process: bean.process,
          roast_level: bean.roastLevel,
          description: bean.description,
          price: bean.price,
          rating: bean.rating,
          image_url: bean.image,
          tasting_notes: bean.tastingNotes,
          flavor_profile: bean.flavorProfile,
          altitude: bean.altitude,
          variety: bean.variety,
          harvest: bean.harvest
        })

      if (beanError) throw beanError
    }
  }
}