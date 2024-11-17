import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/app/auth"
import { ProfileTabs } from "@/components/profile/profile-tabs"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProfilePage() {
  try {
    const supabase = createClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()

    if (process.env.NODE_ENV === 'development') {
      console.log('Profile Page:', {
        hasUser: !!user,
        error: error?.message,
        userId: user?.id
      })
    }

    if (error) {
      console.error('Profile page error:', error)
      return redirect('/login')
    }

    if (!user) {
      if (process.env.NODE_ENV === 'development') {
        console.log('No user, redirecting to login')
      }
      return redirect('/login')
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) {
      // Create profile if it doesn't exist
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
        return redirect('/login')
      }

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

    return (
      <div className="container max-w-4xl py-8 px-4">
        <ProfileTabs userId={user.id} />
      </div>
    )
  } catch (error) {
    console.error('Profile page error:', error)
    return redirect('/login')
  }
}