"use client"

import { ProfileOverview } from "@/components/profile/profile-overview"

interface UserProfileProps {
  userId: string
}

export function UserProfile({ userId }: UserProfileProps) {
  const { data: userData, isLoading } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      const { data: user, error } = await supabase
        .from('users')
        .select(`
          *,
          user_stats (*)
        `)
        .eq('id', userId)
        .single()

      if (error) throw error
      return user
    }
  })

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-20 w-20 rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-4 bg-muted rounded w-1/3" />
          </div>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="space-y-8">
        <p className="text-center text-muted-foreground">User not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <ProfileOverview userId={userData.id} isOwnProfile={false} />
    </div>
  )
}