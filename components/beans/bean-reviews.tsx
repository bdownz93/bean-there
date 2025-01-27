"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query"
import { supabase, uploadReviewPhoto } from "@/lib/supabase"
import { Star, Plus } from "lucide-react"
import { ReviewForm } from "@/components/reviews/review-form"
import { ReviewList } from "@/components/reviews/review-list"
import type { Bean } from "@/lib/types"

interface BeanReviewsProps {
  bean: Bean
}

export function BeanReviews({ bean }: BeanReviewsProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [showReviewForm, setShowReviewForm] = useState(false)

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews', bean.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          content,
          brew_method,
          grind_size,
          flavor_notes,
          photo_url,
          created_at,
          aroma,
          body,
          acidity,
          sweetness,
          aftertaste,
          user_id
        `)
        .eq('bean_id', bean.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Fetch user details for each review
      const reviewsWithUsers = await Promise.all(
        data.map(async (review) => {
          const { data: userData } = await supabase
            .from('users')
            .select('name, username, avatar_url')
            .eq('id', review.user_id)
            .single()

          return {
            ...review,
            user: {
              name: userData?.name || 'Anonymous',
              username: userData?.username,
              avatar_url: userData?.avatar_url
            }
          }
        })
      )

      return reviewsWithUsers
    }
  })

  const addReview = useMutation({
    mutationFn: async (data: any) => {
      if (!user) throw new Error('Must be logged in to review')

      let photoUrl = null
      if (data.photo) {
        try {
          photoUrl = await uploadReviewPhoto(data.photo, user.id)
        } catch (error) {
          console.error('Error uploading photo:', error)
          throw new Error('Failed to upload photo')
        }
      }

      const { error } = await supabase
        .from('reviews')
        .insert([{
          user_id: user.id,
          bean_id: bean.id,
          rating: data.rating,
          content: data.content,
          brew_method: data.brewMethod,
          grind_size: data.grindSize,
          flavor_notes: data.selectedFlavors,
          photo_url: photoUrl,
          aroma: data.aroma,
          body: data.body,
          acidity: data.acidity,
          sweetness: data.sweetness,
          aftertaste: data.aftertaste
        }])

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', bean.id] })
      setShowReviewForm(false)
      toast({
        title: "Review submitted",
        description: "Your review has been added successfully."
      })
    },
    onError: (error) => {
      console.error('Review submission error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit review",
        variant: "destructive"
      })
    }
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div>Reviews ({reviews.length})</div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-normal text-muted-foreground">
                  {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length || 0).toFixed(1)}
                </span>
              </div>
              {user && !showReviewForm && (
                <Button 
                  onClick={() => setShowReviewForm(true)}
                  className="ml-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Write a Review
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        {(showReviewForm && user) && (
          <CardContent>
            <ReviewForm 
              onSubmit={(data) => addReview.mutate(data)}
              isSubmitting={addReview.isPending}
              onCancel={() => setShowReviewForm(false)}
            />
          </CardContent>
        )}
      </Card>

      <ReviewList reviews={reviews} />
    </div>
  )
}