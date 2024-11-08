"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { User } from "lucide-react"

interface ActivityFeedProps {
  reviews: any[]
}

export function ActivityFeed({ reviews }: ActivityFeedProps) {
  if (!reviews || reviews.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No recent activity</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-8">
          {reviews.map((review) => (
            <div key={review.id} className="flex gap-4">
              <Avatar>
                <AvatarImage src={review.users?.avatar_url} alt={review.users?.name} />
                <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm">
                  <Link href={`/profile/${review.users?.username}`} className="font-medium hover:underline">
                    {review.users?.name}
                  </Link>{' '}
                  reviewed{' '}
                  <Link href={`/beans/${review.beans?.id}`} className="font-medium hover:underline">
                    {review.beans?.name}
                  </Link>
                  {review.beans?.roasters && (
                    <span className="text-muted-foreground">
                      {' '}by {review.beans.roasters.name}
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">{review.content}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}