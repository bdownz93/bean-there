"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User as UserIcon, Calendar, Coffee, Users } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { FollowButton, FollowersList, FollowingList } from "@/components/social"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProfileOverviewProps {
  userId: string
  isOwnProfile?: boolean
}

export function ProfileOverview({ userId, isOwnProfile = false }: ProfileOverviewProps) {
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

      if (statsError) throw statsError
      return { ...user, stats }
    }
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 rounded-full bg-muted animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Profile not found
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback>
                  {profile.name?.[0] || profile.username?.[0] || <UserIcon />}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{profile.name || profile.username}</h2>
                {profile.username && (
                  <p className="text-muted-foreground">@{profile.username}</p>
                )}
                {profile.bio && (
                  <p className="mt-2 text-sm">{profile.bio}</p>
                )}
                <div className="mt-2 flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Joined {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            {!isOwnProfile && (
              <FollowButton userId={userId} />
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{profile.stats.beans_tried}</div>
              <div className="text-sm text-muted-foreground">Beans Tried</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{profile.stats.total_reviews}</div>
              <div className="text-sm text-muted-foreground">Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{profile.stats.roasters_visited}</div>
              <div className="text-sm text-muted-foreground">Roasters</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{profile.stats.level}</div>
              <div className="text-sm text-muted-foreground">Level</div>
            </div>
          </div>

          {profile.favorite_coffee_styles && profile.favorite_coffee_styles.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Favorite Coffee Styles</h3>
              <div className="flex flex-wrap gap-2">
                {profile.favorite_coffee_styles.map((style: string) => (
                  <Badge key={style} variant="secondary">
                    <Coffee className="h-3 w-3 mr-1" />
                    {style}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Social</h3>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="followers">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="followers">Followers</TabsTrigger>
              <TabsTrigger value="following">Following</TabsTrigger>
            </TabsList>
            <TabsContent value="followers" className="mt-4">
              <FollowersList userId={userId} limit={5} />
            </TabsContent>
            <TabsContent value="following" className="mt-4">
              <FollowingList userId={userId} limit={5} showFollowButton={!isOwnProfile} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}