"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, Pencil, Trash2 } from "lucide-react"
import { useStore } from "@/lib/store"
import type { Bean } from "@/lib/types"

interface BeanReviewsProps {
  bean: Bean
}

export function BeanReviews({ bean }: BeanReviewsProps) {
  const { currentUser, users, addReview, reviews, updateReview, deleteReview } = useStore()
  const [newReview, setNewReview] = useState("")
  const [rating, setRating] = useState(5)
  const [editingReviewId, setEditingReviewId] = useState<string | number | null>(null)
  const [editContent, setEditContent] = useState("")

  const beanReviews = reviews.filter(review => review.beanId === bean.id)

  const handleSubmitReview = () => {
    if (!newReview.trim()) return

    addReview({
      userId: currentUser.id,
      userName: currentUser.name,
      userImage: currentUser.avatar,
      rating,
      content: newReview,
      beanId: bean.id,
      bean: bean.name,
      roaster: bean.roaster || ""
    })

    setNewReview("")
    setRating(5)
  }

  const handleUpdateReview = (reviewId: string | number) => {
    if (!editContent.trim()) return
    updateReview(reviewId, editContent, rating)
    setEditingReviewId(null)
    setEditContent("")
  }

  const startEditing = (reviewId: string | number, content: string) => {
    setEditingReviewId(reviewId)
    setEditContent(content)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reviews</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
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
          
          <div className="space-y-4">
            {beanReviews.map((review) => {
              const user = users[review.userId]
              const isCurrentUser = review.userId === currentUser.id
              const isEditing = editingReviewId === review.id

              return (
                <div key={review.id} className="flex space-x-4">
                  <Avatar>
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback>{user?.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold">{user?.name}</h4>
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
                            onClick={() => startEditing(review.id, review.content)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteReview(review.id)}
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
                          {new Date(review.date).toLocaleDateString()}
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