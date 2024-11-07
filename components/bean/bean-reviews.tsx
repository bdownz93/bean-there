"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useReviews } from "@/lib/hooks/useReviews"
import type { Bean } from "@/lib/types"

interface BeanReviewsProps {
  bean: Bean
}

export function BeanReviews({ bean }: BeanReviewsProps) {
  const { user } = useAuth()
  const [newReview, setNewReview] = useState("")
  const [rating, setRating] = useState(5)
  const { reviews, isLoading, addReview } = useReviews(bean.id)

  const handleSubmitReview = async () => {
    if (!user || !newReview.trim()) return

    try {
      await addReview.mutateAsync({
        rating,
        content: newReview
      })
      
      setNewReview("")
      setRating(5)
    } catch (error) {
      console.error("Error submitting review:", error)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reviews</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {user && (
            <div className="space-y-4">
              <Textarea
                placeholder="Write your review..."
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className="text-yellow-400"
                    >
                      <Star
                        className={`h-5 w-5 ${
                          value <= rating ? "fill-current" : "fill-none"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <Button 
                  onClick={handleSubmitReview} 
                  disabled={addReview.isPending || !newReview.trim()}
                >
                  {addReview.isPending ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-center text-muted-foreground">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{review.users?.name || "Anonymous"}</div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="ml-1 text-sm">{review.rating}</span>
                    </div>
                  </div>
                  <p className="mt-2">{review.content}</p>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}