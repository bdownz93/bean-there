import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Development database
const DEV_SUPABASE_URL = 'https://rrvoniemqbvppzndotna.supabase.co'
const DEV_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJydm9uaWVtcWJ2cHB6bmRvdG5hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDQ4NDQxNCwiZXhwIjoyMDQ2MDYwNDE0fQ.HH9x6Xk_DlERDNjzxT0NnQJMjMbaSuWEWEFtUPeymmI'

// Production database
const PROD_SUPABASE_URL = 'https://psvlhyxoblouolzjqnqd.supabase.co'
const PROD_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzdmxoeXhvYmxvdW9sempxbnFkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMTQzMTAxMywiZXhwIjoyMDQ3MDA3MDEzfQ.IZ0Nnf2uo1DqVrZy2lOgNoxd8-drbf348N8D_MpMKFs'

const devSupabase = createClient(DEV_SUPABASE_URL, DEV_SUPABASE_SERVICE_KEY)
const prodSupabase = createClient(PROD_SUPABASE_URL, PROD_SUPABASE_SERVICE_KEY)

async function copySchema() {
  try {
    // Get schema from development database
    const { data: tables, error: tablesError } = await devSupabase.rpc('exec', {
      sql: `
        SELECT table_name, column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position;
      `
    })

    if (tablesError) throw tablesError

    // Group columns by table
    const tableSchemas = tables.reduce((acc: any, col: any) => {
      if (!acc[col.table_name]) {
        acc[col.table_name] = []
      }
      acc[col.table_name].push(col)
      return acc
    }, {})

    // Create tables in production
    for (const [tableName, columns] of Object.entries(tableSchemas)) {
      const columnDefs = (columns as any[]).map(col => {
        let def = `${col.column_name} ${col.data_type}`
        if (col.column_default) {
          def += ` DEFAULT ${col.column_default}`
        }
        if (col.is_nullable === 'NO') {
          def += ' NOT NULL'
        }
        return def
      }).join(', ')

      // Create table if it doesn't exist
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS ${tableName} (
          ${columnDefs}
        );
      `

      console.log(`Creating/updating table ${tableName}...`)
      const { error: createError } = await prodSupabase.rpc('exec', {
        sql: createTableSQL
      })

      if (createError) {
        console.error(`Error creating table ${tableName}:`, createError)
        continue
      }

      // Add missing columns to existing table
      for (const col of columns as any[]) {
        const addColumnSQL = `
          DO $$
          BEGIN
            BEGIN
              ALTER TABLE ${tableName} 
              ADD COLUMN IF NOT EXISTS ${col.column_name} ${col.data_type}
              ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}
              ${col.column_default ? `DEFAULT ${col.column_default}` : ''};
            EXCEPTION
              WHEN duplicate_column THEN
                NULL;
            END;
          END $$;
        `

        const { error: alterError } = await prodSupabase.rpc('exec', {
          sql: addColumnSQL
        })

        if (alterError) {
          console.error(`Error adding column ${col.column_name} to ${tableName}:`, alterError)
        }
      }
    }

    // Copy RLS policies
    const { data: policies, error: policiesError } = await devSupabase.rpc('exec', {
      sql: `
        SELECT 
          schemaname,
          tablename,
          policyname,
          permissive,
          roles,
          cmd,
          qual,
          with_check
        FROM pg_policies 
        WHERE schemaname = 'public';
      `
    })

    if (policiesError) throw policiesError

    for (const policy of policies) {
      const enableRLS = `
        ALTER TABLE ${policy.tablename} ENABLE ROW LEVEL SECURITY;
      `

      const createPolicy = `
        CREATE POLICY IF NOT EXISTS "${policy.policyname}"
        ON ${policy.tablename}
        AS ${policy.permissive ? 'PERMISSIVE' : 'RESTRICTIVE'}
        FOR ${policy.cmd}
        TO ${policy.roles}
        ${policy.qual ? `USING (${policy.qual})` : ''}
        ${policy.with_check ? `WITH CHECK (${policy.with_check})` : ''};
      `

      console.log(`Creating policy ${policy.policyname} on ${policy.tablename}...`)
      
      const { error: rlsError } = await prodSupabase.rpc('exec', {
        sql: enableRLS
      })

      if (rlsError) {
        console.error(`Error enabling RLS on ${policy.tablename}:`, rlsError)
        continue
      }

      const { error: policyError } = await prodSupabase.rpc('exec', {
        sql: createPolicy
      })

      if (policyError) {
        console.error(`Error creating policy ${policy.policyname}:`, policyError)
      }
    }

    console.log('Schema copy completed successfully!')
  } catch (error) {
    console.error('Error copying schema:', error)
    process.exit(1)
  }
}

copySchema()
