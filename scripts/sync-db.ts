import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

// Use service key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function cleanDatabase() {
  console.log('Cleaning database...')
  
  try {
    // Delete all data in reverse order of dependencies
    await supabase.from('reviews').delete().neq('id', '')
    await supabase.from('beans').delete().neq('id', '')
    await supabase.from('roasters').delete().neq('id', '')
    
    console.log('Database cleaned successfully!')
  } catch (error) {
    console.error('Error cleaning database:', error)
    throw error
  }
}

async function main() {
  try {
    await cleanDatabase()
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()