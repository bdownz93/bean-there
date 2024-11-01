import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a dummy client when environment variables are not set
const dummyClient = {
  auth: {
    signUp: async () => ({ data: null, error: new Error('Auth not configured') }),
    signInWithPassword: async () => ({ data: null, error: new Error('Auth not configured') }),
    signInWithOAuth: async () => ({ data: null, error: new Error('Auth not configured') }),
    signOut: async () => ({ error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  },
  from: () => ({
    insert: async () => ({ error: new Error('Auth not configured') })
  })
}

// Only create the real client if environment variables are set
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'implicit'
      }
    })
  : dummyClient