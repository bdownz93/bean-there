"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"
import Link from "next/link"
import { Review } from "@/lib/types"
import { RoasterLogo } from "@/components/images/roaster-logo"

interface RecentReviewsProps {
  reviews: Review[]
}

export function RecentReviews({ reviews }: RecentReviewsProps) {
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
      {reviews.map((review) => (
        <Card key={review.id} className="h-full hover:bg-accent hover:text-accent-foreground transition-colors">
          <Link href={`/beans/${review.bean.slug}`} className="block">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Avatar>
                  <AvatarImage src={review.user.avatar_url} alt={review.user.username} />
                  <AvatarFallback>{review.user.username?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{review.user.username}</div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="ml-1 text-sm">{review.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div 
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        window.location.href = `/roasters/${review.bean.roaster.slug}`
                      }}
                    >
                      <RoasterLogo 
                        src={review.bean.roaster.logo_url} 
                        alt={review.bean.roaster.name}
                        size="sm"
                        className="inline-block"
                      />
                    </div>
                    <span>{review.bean.roaster.name} • {review.bean.name}</span>
                  </div>
                  {review.review && (
                    <p className="text-sm line-clamp-2">{review.review}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  )
}