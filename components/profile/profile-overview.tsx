"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User as UserIcon, Calendar, Coffee } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface ProfileOverviewProps {
  userId: string
}

export function ProfileOverview({ userId }: ProfileOverviewProps) {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile-overview', userId],
    queryFn: async () => {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError) throw userError

      const { data: stats, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (!stats) {
        // Create initial user stats if they don't exist
        const { data: newStats, error: createError } = await supabase
          .from('user_stats')
          .insert([{
            user_id: userId,
            beans_tried: 0,
            roasters_visited: 0,
            total_reviews: 0,
            unique_origins: 0,
            roasters_created: 0,
            experience_points: 0,
            level: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single()

        if (createError) throw createError
        return { ...user, stats: newStats }
      }

      return { ...user, stats }
    }
  })

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-20 w-20 rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-4 bg-muted rounded w-1/3" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Unable to load profile. Please try again later.
          </p>
        </CardContent>
      </Card>
    )
  }

  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile.avatar_url} alt={profile.name} />
              <AvatarFallback>
                <UserIcon className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 flex-1">
              <h2 className="text-2xl font-bold">{profile.name}</h2>
              <p className="text-muted-foreground">@{profile.username}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Joined {joinDate}</span>
              </div>
            </div>
            <Button>Edit Profile</Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Coffee className="w-8 h-8" />
              <div>
                <div className="text-2xl font-bold">{profile.stats.beans_tried}</div>
                <div className="text-muted-foreground">Beans Tried</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <UserIcon className="w-8 h-8" />
              <div>
                <div className="text-2xl font-bold">{profile.stats.roasters_visited}</div>
                <div className="text-muted-foreground">Roasters Visited</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Coffee className="w-8 h-8" />
              <div>
                <div className="text-2xl font-bold">{profile.stats.total_reviews}</div>
                <div className="text-muted-foreground">Reviews Written</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Level {profile.stats.level}</h3>
              <p className="text-sm text-muted-foreground">
                {profile.stats.experience_points} XP
              </p>
            </div>
            <Badge variant="outline">Coffee Explorer</Badge>
          </div>
          <div className="w-full h-2 bg-muted rounded overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{
                width: `${(profile.stats.experience_points % 100)}%`
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}