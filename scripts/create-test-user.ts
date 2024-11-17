import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTestUser() {
  try {
    // Create user
    const { data: user, error: createError } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'password123',
      user_metadata: {
        name: 'Test User',
        username: 'testuser'
      },
      email_confirm: true
    })

    if (createError) {
      console.error('Error creating user:', createError)
      return
    }

    console.log('User created successfully:', user)

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

createTestUser()
