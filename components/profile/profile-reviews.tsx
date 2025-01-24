'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

interface Review {
  id: string
  created_at: string
  bean_id: string
  rating: number
  content: string
  brew_method?: string
  flavor_notes?: string[]
  photo_url?: string
  aroma?: number
  body?: number
  acidity?: number
  sweetness?: number
  aftertaste?: number
}

interface ProfileReviewsProps {
  userId: string
}

export function ProfileReviews({ userId }: ProfileReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function loadReviews() {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error

        setReviews(data || [])
      } catch (error) {
        console.error('Error loading reviews:', error)
        toast({
          title: "Error",
          description: "Failed to load your reviews. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadReviews()
  }, [userId, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Reviews</CardTitle>
          <CardDescription>
            You haven&apos;t written any reviews yet.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {reviews.map(review => (
        <Card key={review.id}>
          <CardHeader>
            <CardTitle>Bean Review</CardTitle>
            <CardDescription>
              {new Date(review.created_at).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="font-medium">Rating</div>
                <div>{review.rating} / 5</div>
              </div>
              {review.content && (
                <div>
                  <div className="font-medium">Review</div>
                  <div>{review.content}</div>
                </div>
              )}
              {review.brew_method && (
                <div>
                  <div className="font-medium">Brew Method</div>
                  <div>{review.brew_method}</div>
                </div>
              )}
              {review.flavor_notes && review.flavor_notes.length > 0 && (
                <div>
                  <div className="font-medium">Flavor Notes</div>
                  <div>{review.flavor_notes.join(', ')}</div>
                </div>
              )}
              {review.aroma && (
                <div>
                  <div className="font-medium">Aroma</div>
                  <div>{review.aroma} / 5</div>
                </div>
              )}
              {review.body && (
                <div>
                  <div className="font-medium">Body</div>
                  <div>{review.body} / 5</div>
                </div>
              )}
              {review.acidity && (
                <div>
                  <div className="font-medium">Acidity</div>
                  <div>{review.acidity} / 5</div>
                </div>
              )}
              {review.sweetness && (
                <div>
                  <div className="font-medium">Sweetness</div>
                  <div>{review.sweetness} / 5</div>
                </div>
              )}
              {review.aftertaste && (
                <div>
                  <div className="font-medium">Aftertaste</div>
                  <div>{review.aftertaste} / 5</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}