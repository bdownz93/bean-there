import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: '.env.local' })

const MIGRATIONS_DIR = path.join(process.cwd(), 'supabase', 'migrations')

// Production database
const PROD_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const PROD_SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!PROD_SUPABASE_URL || !PROD_SUPABASE_SERVICE_KEY) {
  throw new Error('Missing production Supabase environment variables')
}

// Create Supabase client with service key for admin operations
const supabase = createClient(PROD_SUPABASE_URL, PROD_SUPABASE_SERVICE_KEY)

async function applyMigration(migrationFile: string) {
  console.log(`Applying migration: ${migrationFile}`)
  const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, migrationFile), 'utf8')
  
  try {
    // Split the SQL file into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)
    
    // Execute each statement
    for (const statement of statements) {
      await supabase.rpc('exec_sql', { sql: statement })
    }
    
    console.log(`Successfully applied migration: ${migrationFile}`)
  } catch (error) {
    console.error(`Error applying migration ${migrationFile}:`, error)
    throw error
  }
}

async function main() {
  try {
    // Get all migration files
    const migrations = fs.readdirSync(MIGRATIONS_DIR)
      .filter(file => file.endsWith('.sql'))
      .sort()
    
    // Apply each migration
    for (const migration of migrations) {
      await applyMigration(migration)
    }
    
    console.log('All migrations completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

main()
