"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"
import Link from "next/link"
import { Review } from "@/lib/types"
import { useStore } from "@/lib/store"

interface RecentReviewsProps {
  reviews: Review[]
}

export function RecentReviews({ reviews }: RecentReviewsProps) {
  const { users } = useStore()

  if (!reviews || reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No reviews yet
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {reviews.map((review) => {
        const user = users[review.userId] || {
          name: review.userName,
          avatar: review.userImage
        }

        return (
          <Link key={review.id} href={`/beans/${review.beanId}`}>
            <Card className="h-full hover:bg-accent hover:text-accent-foreground transition-colors">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{user.name}</div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="ml-1 text-sm">{review.rating}</span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {review.bean} by {review.roaster}
                    </div>
                    <p className="text-sm line-clamp-2">{review.content}</p>
                    <div className="text-xs text-muted-foreground">
                      {new Date(review.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}