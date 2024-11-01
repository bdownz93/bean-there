"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, Pencil, Trash2, User } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase"
import type { Bean } from "@/lib/types"

interface Review {
  id: string
  content: string
  rating: number
  created_at: string
  user: {
    name: string
    username: string
    avatar_url: string
  }
}

interface BeanReviewsProps {
  bean: Bean
}

export function BeanReviews({ bean }: BeanReviewsProps) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [newReview, setNewReview] = useState("")
  const [rating, setRating] = useState(5)
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")

  useEffect(() => {
    fetchReviews()
  }, [bean.id])

  async function fetchReviews() {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id,
        content,
        rating,
        created_at,
        users (
          name,
          username,
          avatar_url
        )
      `)
      .eq('bean_id', bean.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching reviews:', error)
      return
    }

    setReviews(data)
  }

  const handleSubmitReview = async () => {
    if (!user || !newReview.trim()) return

    const { error } = await supabase
      .from('reviews')
      .insert({
        bean_id: bean.id,
        user_id: user.id,
        rating,
        content: newReview
      })

    if (error) {
      console.error('Error adding review:', error)
      return
    }

    setNewReview("")
    setRating(5)
    fetchReviews()
  }

  const handleUpdateReview = async (reviewId: string) => {
    if (!editContent.trim()) return

    const { error } = await supabase
      .from('reviews')
      .update({
        content: editContent,
        rating
      })
      .eq('id', reviewId)

    if (error) {
      console.error('Error updating review:', error)
      return
    }

    setEditingReviewId(null)
    setEditContent("")
    fetchReviews()
  }

  const handleDeleteReview = async (reviewId: string) => {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)

    if (error) {
      console.error('Error deleting review:', error)
      return
    }

    fetchReviews()
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
                    <Star
                      key={value}
                      className={`h-5 w-5 cursor-pointer ${
                        value <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                      onClick={() => setRating(value)}
                    />
                  ))}
                </div>
                <Button onClick={handleSubmitReview}>Submit Review</Button>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            {reviews.map((review) => {
              const isCurrentUser = user?.id === review.user.id
              const isEditing = editingReviewId === review.id

              return (
                <div key={review.id} className="flex space-x-4">
                  <Avatar>
                    <AvatarImage src={review.user.avatar_url} alt={review.user.name} />
                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold">{review.user.name}</h4>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="ml-1 text-sm">{review.rating}</span>
                        </div>
                      </div>
                      {isCurrentUser && (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingReviewId(review.id)
                              setEditContent(review.content)
                              setRating(review.rating)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteReview(review.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    {isEditing ? (
                      <div className="mt-2 space-y-2">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                        />
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateReview(review.id)}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingReviewId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="mt-1 text-muted-foreground">{review.content}</p>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(review.created_at).toLocaleDateString()}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}