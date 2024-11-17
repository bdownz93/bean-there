import { createClient } from '@/app/auth'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient()
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=${encodeURIComponent('Failed to sign in')}`
        )
      }

      // Get the user to ensure session was created
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('Auth callback user error:', userError)
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=${encodeURIComponent('Failed to get user')}`
        )
      }

      // Create user profile if it doesn't exist
      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!profile) {
        const { error: createError } = await supabase
          .from('users')
          .insert([
            {
              id: user.id,
              username: user.email?.split('@')[0],
              name: user.user_metadata.name || user.email?.split('@')[0],
              avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ])

        if (createError) {
          console.error('Error creating profile:', createError)
        } else {
          // Create initial user stats
          await supabase
            .from('user_stats')
            .insert([
              {
                user_id: user.id,
                beans_tried: 0,
                roasters_visited: 0,
                total_reviews: 0,
                unique_origins: 0,
                roasters_created: 0,
                experience_points: 0,
                level: 1,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ])
        }
      }

      // Redirect to home page
      return NextResponse.redirect(requestUrl.origin)
    } catch (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent('Failed to sign in')}`
      )
    }
  }

  // If no code, redirect to login
  return NextResponse.redirect(
    `${requestUrl.origin}/login?error=${encodeURIComponent('No auth code')}`
  )
}