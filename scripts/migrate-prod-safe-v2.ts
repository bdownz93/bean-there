const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')
const fs = require('fs')
const path = require('path')

// Load environment variables
dotenv.config({ path: '.env.production' })

const MIGRATIONS_DIR = path.join(process.cwd(), 'supabase', 'migrations')
const BACKUP_DIR = path.join(process.cwd(), 'backups')

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR)
}

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

async function createBackup(): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.sql`)
  
  console.log('Creating database backup...')
  
  try {
    const { data, error } = await supabase.rpc('dump_schema')
    if (error) throw error
    
    fs.writeFileSync(backupFile, data as string)
    console.log(`Backup created: ${backupFile}`)
    return backupFile
  } catch (error) {
    console.error('Error creating backup:', error)
    throw error
  }
}

async function checkMigrationTable(): Promise<void> {
  try {
    // Check if migrations table exists
    const { data: existingTable } = await supabase
      .from('schema_migrations')
      .select('version')
      .limit(1)

    if (!existingTable) {
      // Create migrations table if it doesn't exist
      await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS schema_migrations (
            version TEXT PRIMARY KEY,
            applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      })
    }
  } catch (error) {
    // Table doesn't exist, create it
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version TEXT PRIMARY KEY,
          applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
  }
}

async function getAppliedMigrations(): Promise<string[]> {
  const { data, error } = await supabase
    .from('schema_migrations')
    .select('version')
  
  if (error) throw error
  return (data as MigrationRow[] || []).map(row => row.version)
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
      await supabase.rpc('exec_sql', { sql: statement })
    }

    // Record the migration
    await recordMigration(migrationFile)
    
    // Commit transaction
    await supabase.rpc('exec_sql', { sql: 'COMMIT;' })
    
    console.log(`Successfully applied migration: ${migrationFile}`)
  } catch (error) {
    // Rollback on error
    await supabase.rpc('exec_sql', { sql: 'ROLLBACK;' })
    console.error(`Error applying migration ${migrationFile}:`, error)
    throw error
  }
}

async function main(): Promise<void> {
  try {
    // Create backup first
    const backupFile = await createBackup()
    console.log(`Backup created at: ${backupFile}`)

    // Ensure migration tracking table exists
    await checkMigrationTable()

    // Get list of applied migrations
    const appliedMigrations = await getAppliedMigrations()

    // Get all migration files
    const migrations = fs.readdirSync(MIGRATIONS_DIR)
      .filter((file: string) => file.endsWith('.sql'))
      .sort()

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
