"use client"

import { useStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, User } from "lucide-react"
import Link from "next/link"

interface UserReviewsProps {
  userId: string
}

export function UserReviews({ userId }: UserReviewsProps) {
  const reviews = useStore((state) => state.reviews.filter(review => review.userId === userId))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reviews</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <p className="text-muted-foreground">No reviews yet.</p>
          ) : (
            reviews.map((review) => (
              <Link key={review.id} href={`/beans/${review.beanId}`}>
                <div className="flex gap-4 p-4 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors">
                  <Avatar>
                    <AvatarImage src={review.userImage} alt={review.userName} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{review.userName}</div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="ml-1 text-sm">{review.rating}</span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(review.date).toLocaleDateString()}
                    </div>
                    <p className="mt-2">{review.content}</p>
                    {review.brewMethod && (
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Brew Method:</span> {review.brewMethod}
                      </div>
                    )}
                    {review.flavorNotes && review.flavorNotes.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {review.flavorNotes.map((note) => (
                          <span
                            key={note}
                            className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          >
                            {note}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}