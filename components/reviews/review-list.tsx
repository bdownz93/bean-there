"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Star, User } from "lucide-react"
import type { Review } from "@/lib/types"

interface ReviewListProps {
  reviews: Review[]
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          No reviews yet. Be the first to review!
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id} className="p-4">
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={review.userAvatar} alt={review.userName} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-medium truncate">{review.userName}</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex items-center shrink-0">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <p className="mt-2 text-sm">{review.content}</p>
              
              {review.brewMethod && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Brewed using: {review.brewMethod}
                </p>
              )}
              
              {review.flavorNotes && review.flavorNotes.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {review.flavorNotes.map((note) => (
                    <span
                      key={note}
                      className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}