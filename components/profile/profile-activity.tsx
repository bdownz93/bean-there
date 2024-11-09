"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, User } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

interface ProfileActivityProps {
  userId: string
}

export function ProfileActivity({ userId }: ProfileActivityProps) {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['profile-activity', userId],
    queryFn: async () => {
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select(`
          *,
          beans (
            id,
            name,
            roaster:roasters (
              id,
              name
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      return reviews
    }
  })

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-12 w-12 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Recent Activity</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {activities?.length === 0 ? (
              <p className="text-center text-muted-foreground">No activity yet</p>
            ) : (
              activities?.map((activity) => (
                <Link 
                  key={activity.id} 
                  href={`/beans/${activity.bean_id}`}
                  className="block"
                >
                  <div className="flex gap-4 p-4 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors">
                    <Avatar>
                      <AvatarImage src={activity.photo_url} alt={activity.beans?.name} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{activity.beans?.name}</h4>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="ml-1 text-sm">{activity.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {activity.beans?.roaster?.name}
                      </p>
                      <p className="text-sm">{activity.content}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}