import { createClient } from '@supabase/supabase-js'
import { roasters } from '../lib/data'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

// Use service key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function syncBeansToSupabase() {
  console.log('Starting sync...')
  
  // First sync roasters
  for (const roaster of roasters) {
    console.log(`Syncing roaster: ${roaster.name}`)
    
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
        specialties: roaster.specialties,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (roasterError) {
      console.error(`Error syncing roaster ${roaster.name}:`, roasterError)
      throw roasterError
    }

    // Then sync beans for each roaster
    for (const bean of roaster.beans) {
      console.log(`Syncing bean: ${bean.name}`)
      
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
          harvest: bean.harvest,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (beanError) {
        console.error(`Error syncing bean ${bean.name}:`, beanError)
        throw beanError
      }
    }
  }
  
  console.log('Sync completed successfully!')
}

async function main() {
  try {
    await syncBeansToSupabase()
  } catch (error) {
    console.error('Error syncing database:', error)
    process.exit(1)
  }
}

main()