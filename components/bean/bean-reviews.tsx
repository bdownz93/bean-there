"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider"
import { useReviews } from "@/lib/hooks/useReviews"
import { ReviewForm } from "@/components/reviews/review-form"
import { ReviewList } from "@/components/reviews/review-list"
import type { Bean } from "@/lib/types"

interface BeanReviewsProps {
  bean: Bean
}

export function BeanReviews({ bean }: BeanReviewsProps) {
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const { reviews, isLoading, addReview } = useReviews(bean.id)

  const handleSubmitReview = async (data: any) => {
    try {
      await addReview.mutateAsync(data)
      setShowForm(false)
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Reviews</CardTitle>
        {user && !showForm && (
          <Button onClick={() => setShowForm(true)}>Write a Review</Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {user && showForm && (
            <ReviewForm 
              onSubmit={handleSubmitReview}
              onCancel={() => setShowForm(false)}
              isLoading={addReview.isPending}
            />
          )}
          
          {!user && (
            <p className="text-center text-muted-foreground">
              Please sign in to leave a review
            </p>
          )}
          
          <ReviewList reviews={reviews} />
        </div>
      </CardContent>
    </Card>
  )
}