const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')
const fs = require('fs')
const path = require('path')

// Load environment variables
dotenv.config({ path: '.env.production' })

const MIGRATIONS_DIR = path.join(process.cwd(), 'supabase', 'migrations')

// Production database
const PROD_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const PROD_SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!PROD_SUPABASE_URL || !PROD_SUPABASE_SERVICE_KEY) {
  throw new Error('Missing production Supabase environment variables')
}

// Create Supabase client with service key for admin operations
const supabase = createClient(PROD_SUPABASE_URL, PROD_SUPABASE_SERVICE_KEY)

interface MigrationRow {
  version: string;
}

interface PostgresError {
  code: string;
  message: string;
  details?: string;
}

async function createMigrationTable(): Promise<void> {
  console.log('Creating migration tracking table...')
  try {
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.schema_migrations (
          version TEXT PRIMARY KEY,
          applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    console.log('Migration table created successfully')
  } catch (error) {
    console.error('Error creating migration table:', error)
    throw error
  }
}

async function getAppliedMigrations(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('schema_migrations')
      .select('version')
    
    if (error) {
      const pgError = error as PostgresError
      if (pgError.code === '42P01') { // Table doesn't exist
        await createMigrationTable()
        return []
      }
      throw error
    }
    return (data as MigrationRow[] || []).map(row => row.version)
  } catch (error) {
    const pgError = error as PostgresError
    if (pgError.code === '42P01') { // Table doesn't exist
      await createMigrationTable()
      return []
    }
    throw error
  }
}

async function recordMigration(version: string): Promise<void> {
  const { error } = await supabase
    .from('schema_migrations')
    .insert([{ version }])
  
  if (error) throw error
}

async function applyMigration(migrationFile: string): Promise<void> {
  console.log(`Applying migration: ${migrationFile}`)
  const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, migrationFile), 'utf8')
  
  try {
    // Start transaction
    await supabase.rpc('exec_sql', { sql: 'BEGIN;' })

    // Split the SQL file into individual statements
    const statements = sql
      .split(';')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0)
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.length > 0) {
        console.log(`Executing statement: ${statement.substring(0, 100)}...`)
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        if (error) throw error
      }
    }

    // Record the migration
    await recordMigration(migrationFile)
    
    // Commit transaction
    await supabase.rpc('exec_sql', { sql: 'COMMIT;' })
    
    console.log(`Successfully applied migration: ${migrationFile}`)
  } catch (error) {
    // Rollback on error
    console.error(`Error applying migration ${migrationFile}:`, error)
    await supabase.rpc('exec_sql', { sql: 'ROLLBACK;' })
    throw error
  }
}

async function main(): Promise<void> {
  try {
    console.log('Starting migration to production...')

    // Get list of applied migrations
    const appliedMigrations = await getAppliedMigrations()

    // Get all migration files
    const migrations = fs.readdirSync(MIGRATIONS_DIR)
      .filter((file: string) => file.endsWith('.sql'))
      .sort()

    console.log('Found migrations:', migrations)
    console.log('Previously applied migrations:', appliedMigrations)

    // Apply only new migrations
    for (const migration of migrations) {
      if (!appliedMigrations.includes(migration)) {
        await applyMigration(migration)
      } else {
        console.log(`Skipping already applied migration: ${migration}`)
      }
    }

    console.log('All migrations completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

main()
