"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { useStore } from "@/lib/store"
import Link from "next/link"
import type { Review } from "@/lib/types"

export function ActivityFeed() {
  const [activities, setActivities] = useState<Review[]>([])
  const reviews = useStore((state) => state.reviews)

  useEffect(() => {
    if (!Array.isArray(reviews)) {
      setActivities([])
      return
    }

    const sortedReviews = [...reviews].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    setActivities(sortedReviews)
  }, [reviews])

  if (!activities || activities.length === 0) {
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
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-4">
              <Avatar>
                <AvatarImage src={activity.userImage} alt={activity.userName} />
                <AvatarFallback>{activity.userName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm">
                  <Link href={`/profile/${activity.userId}`} className="font-medium hover:underline">
                    {activity.userName}
                  </Link>{' '}
                  reviewed{' '}
                  <Link href={`/beans/${activity.beanId}`} className="font-medium hover:underline">
                    {activity.bean}
                  </Link>
                </p>
                <p className="text-sm text-muted-foreground">{activity.content}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}