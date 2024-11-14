import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const DEV_SUPABASE_URL = 'https://rrvoniemqbvppzndotna.supabase.co'
const DEV_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJydm9uaWVtcWJ2cHB6bmRvdG5hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDQ4NDQxNCwiZXhwIjoyMDQ2MDYwNDE0fQ.HH9x6Xk_DlERDNjzxT0NnQJMjMbaSuWEWEFtUPeymmI'

const supabase = createClient(DEV_SUPABASE_URL, DEV_SUPABASE_SERVICE_KEY)

async function setupExecSql() {
  try {
    // Create the exec_sql function
    const { error } = await supabase.rpc('exec', {
      sql: `
        CREATE OR REPLACE FUNCTION exec_sql(sql text)
        RETURNS SETOF json
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          RETURN QUERY EXECUTE sql;
        END;
        $$;

        GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;
      `
    })

    if (error) throw error
    console.log('Successfully created exec_sql function')
  } catch (error) {
    console.error('Error setting up exec_sql function:', error)
    process.exit(1)
  }
}

setupExecSql()
