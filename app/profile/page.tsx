import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/app/auth"
import { ProfileTabs } from "@/components/profile/profile-tabs"
import { redirect } from "next/navigation"
import { supabaseServer } from "@/lib/supabase-server"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProfilePage() {
  // Use server client for better session handling
  const { data: { session }, error: sessionError } = await supabaseServer.auth.getSession()

  if (sessionError || !session?.user) {
    console.error('Profile page session error:', sessionError)
    return redirect('/login')
  }

  // Get user profile and stats in a single query
  const { data: profile, error: profileError } = await supabaseServer
    .from('users')
    .select(`
      *,
      user_stats (*)
    `)
    .eq('id', session.user.id)
    .single()

  if (profileError) {
    console.error('Error fetching profile:', profileError)
    return redirect('/login')
  }

  // If profile doesn't exist, create it
  if (!profile) {
    const { error: createError } = await supabaseServer
      .from('users')
      .insert([
        {
          id: session.user.id,
          username: session.user.email?.split('@')[0] || 'user',
          name: session.user.user_metadata.name || session.user.email?.split('@')[0] || 'User',
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`,
        }
      ])

    if (createError) {
      console.error('Error creating profile:', createError)
      return redirect('/login')
    }

    // Create initial user stats
    await supabaseServer
      .from('user_stats')
      .insert([
        {
          user_id: session.user.id,
          beans_tried: 0,
          roasters_visited: 0,
          total_reviews: 0,
          unique_origins: 0,
          roasters_created: 0,
          experience_points: 0,
          level: 1
        }
      ])

    // Redirect to refresh the page and get the new profile
    return redirect('/profile')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileTabs user={profile} stats={profile.user_stats} />
    </div>
  )
}