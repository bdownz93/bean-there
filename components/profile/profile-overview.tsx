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

      return {
        ...user,
        stats: statsError ? {
          beans_tried: 0,
          roasters_visited: 0,
          total_reviews: 0,
          unique_origins: 0,
          level: 1,
          experience_points: 0
        } : stats
      }
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
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Profile not found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatar_url} alt={profile.name} />
            <AvatarFallback>
              <UserIcon className="h-10 w-10" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">{profile.name}</h2>
              <p className="text-muted-foreground">@{profile.username}</p>
            </div>

            <p className="mt-2">{profile.bio || "No bio yet"}</p>

            <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Coffee className="h-4 w-4" />
                <span>Level {profile.stats.level}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{profile.stats.total_reviews}</div>
                <div className="text-xs text-muted-foreground">Reviews</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{profile.stats.beans_tried}</div>
                <div className="text-xs text-muted-foreground">Beans Tried</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{profile.stats.roasters_visited}</div>
                <div className="text-xs text-muted-foreground">Roasters</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{profile.stats.unique_origins}</div>
                <div className="text-xs text-muted-foreground">Origins</div>
              </div>
            </div>

            {profile.favorite_coffee_styles?.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Favorite Coffee Styles</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.favorite_coffee_styles.map((style) => (
                    <Badge key={style} variant="secondary">
                      {style}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}