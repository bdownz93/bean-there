"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Review } from "@/lib/hooks/useReviews"

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
              <AvatarImage src={review.users?.avatar_url} alt={review.users?.name} />
              <AvatarFallback>{review.users?.name?.[0]}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-medium">{review.users?.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex items-center shrink-0">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 font-medium">{review.rating}</span>
                </div>
              </div>
              
              <p className="mt-2">{review.content}</p>

              {review.photo_url && (
                <img 
                  src={review.photo_url} 
                  alt="Coffee review" 
                  className="mt-4 rounded-lg max-h-48 object-cover"
                />
              )}
              
              {(review.aroma_rating || review.body_rating || review.acidity_rating || 
                review.sweetness_rating || review.aftertaste_rating) && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                  {review.aroma_rating && (
                    <div className="text-sm">
                      <div className="font-medium">Aroma</div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.aroma_rating! ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Repeat for other ratings */}
                </div>
              )}
              
              {review.brew_method && (
                <div className="mt-4 space-y-2">
                  <div className="text-sm font-medium">Brew Details</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Method:</span> {review.brew_method}
                    </div>
                    {review.grind_size && (
                      <div>
                        <span className="text-muted-foreground">Grind:</span> {review.grind_size}
                      </div>
                    )}
                    {review.water_temp && (
                      <div>
                        <span className="text-muted-foreground">Temperature:</span> {review.water_temp}°C
                      </div>
                    )}
                    {review.brew_time && (
                      <div>
                        <span className="text-muted-foreground">Time:</span> {review.brew_time}
                      </div>
                    )}
                    {review.dose_grams && (
                      <div>
                        <span className="text-muted-foreground">Dose:</span> {review.dose_grams}g
                      </div>
                    )}
                    {review.yield_grams && (
                      <div>
                        <span className="text-muted-foreground">Yield:</span> {review.yield_grams}g
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {review.flavor_notes && review.flavor_notes.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">Flavor Notes</div>
                  <div className="flex flex-wrap gap-2">
                    {review.flavor_notes.map((note) => (
                      <Badge key={note} variant="secondary">
                        {note}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}