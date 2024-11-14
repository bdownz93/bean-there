import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: '.env.local' })

const DEV_SUPABASE_URL = 'https://rrvoniemqbvppzndotna.supabase.co'
const DEV_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJydm9uaWVtcWJ2cHB6bmRvdG5hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDQ4NDQxNCwiZXhwIjoyMDQ2MDYwNDE0fQ.HH9x6Xk_DlERDNjzxT0NnQJMjMbaSuWEWEFtUPeymmI'

const supabase = createClient(DEV_SUPABASE_URL, DEV_SUPABASE_SERVICE_KEY)

async function dumpSchema() {
  try {
    // Get all tables
    const { data: tables, error: tablesError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name != 'schema_migrations'
        ORDER BY table_name;
      `
    })

    if (tablesError) throw tablesError

    let schema = ''

    // Get table definitions
    for (const table of tables) {
      const { data: tableInfo, error: tableError } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT 
            'CREATE TABLE ' || quote_ident('${table.table_name}') || ' (' ||
            string_agg(
              quote_ident(column_name) || ' ' ||
              data_type ||
              CASE 
                WHEN character_maximum_length IS NOT NULL 
                THEN '(' || character_maximum_length || ')'
                ELSE ''
              END ||
              CASE 
                WHEN is_nullable = 'NO' THEN ' NOT NULL'
                ELSE ''
              END ||
              CASE 
                WHEN column_default IS NOT NULL 
                THEN ' DEFAULT ' || column_default
                ELSE ''
              END,
              ', '
            ) || ');' as create_table_sql
          FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = '${table.table_name}'
          GROUP BY table_name;
        `
      })

      if (tableError) throw tableError
      
      schema += `\\n-- Table: ${table.table_name}\\n`
      schema += `${tableInfo[0].create_table_sql}\\n`

      // Get foreign keys
      const { data: fks, error: fksError } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT
            format(
              'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES %I(%I);',
              kcu.table_name,
              tc.constraint_name,
              kcu.column_name,
              ccu.table_name,
              ccu.column_name
            ) as fk_sql
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
          JOIN information_schema.constraint_column_usage ccu
            ON ccu.constraint_name = tc.constraint_name
          WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = '${table.table_name}';
        `
      })

      if (fksError) throw fksError
      
      for (const fk of fks) {
        schema += `\\n${fk.fk_sql}\\n`
      }

      // Get indexes
      const { data: indexes, error: indexesError } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT indexdef
          FROM pg_indexes
          WHERE schemaname = 'public'
          AND tablename = '${table.table_name}'
          AND indexname NOT LIKE '%_pkey';
        `
      })

      if (indexesError) throw indexesError
      
      for (const idx of indexes) {
        schema += `\\n${idx.indexdef};\\n`
      }

      // Get RLS policies
      const { data: policies, error: policiesError } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT
            format(
              'CREATE POLICY %I ON %I FOR %s TO %s%s%s;',
              polname,
              relname,
              polcmd,
              CASE WHEN polroles = '{0}' THEN 'public' ELSE array_to_string(ARRAY(SELECT rolname FROM pg_roles WHERE oid = ANY(polroles)), ', ') END,
              CASE WHEN polqual IS NOT NULL THEN ' USING (' || pg_get_expr(polqual, polrelid, true) || ')' ELSE '' END,
              CASE WHEN polwithcheck IS NOT NULL THEN ' WITH CHECK (' || pg_get_expr(polwithcheck, polrelid, true) || ')' ELSE '' END
            ) as policy_sql,
            format(
              'ALTER TABLE %I ENABLE ROW LEVEL SECURITY;',
              relname
            ) as enable_rls_sql
          FROM pg_policy
          JOIN pg_class ON pg_class.oid = pg_policy.polrelid
          WHERE relnamespace = 'public'::regnamespace
          AND relname = '${table.table_name}';
        `
      })

      if (policiesError) throw policiesError
      
      if (policies.length > 0) {
        schema += `\\n${policies[0].enable_rls_sql}\\n`
        for (const policy of policies) {
          schema += `${policy.policy_sql}\\n`
        }
      }
    }

    // Write schema to migration file
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', `${timestamp}_schema_sync.sql`)
    fs.writeFileSync(migrationPath, schema)
    
    console.log(`Schema dumped to ${migrationPath}`)
  } catch (error) {
    console.error('Error dumping schema:', error)
    process.exit(1)
  }
}

dumpSchema()
