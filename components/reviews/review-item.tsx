"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, ThumbsUp, MessageCircle, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useReviewInteractions } from "@/lib/hooks/useReviewInteractions"

interface ReviewItemProps {
  review: any
}

export function ReviewItem({ review }: ReviewItemProps) {
  const { user } = useAuth()
  const [showComments, setShowComments] = useState(false)
  const [commentInput, setCommentInput] = useState("")
  const { likes, comments, isLiked, toggleLike, addComment } = useReviewInteractions(review.id)

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={review.user?.avatar_url} alt={review.user?.name} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold">{review.user?.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="mt-2">{review.content}</p>

              {review.photo_url && (
                <div className="mt-4">
                  <img
                    src={review.photo_url}
                    alt="Review"
                    className="rounded-lg max-h-96 object-cover"
                  />
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-4">
                {review.brew_method && (
                  <div>
                    <span className="text-sm font-medium">Brew Method:</span>
                    <p className="text-sm text-muted-foreground">{review.brew_method}</p>
                  </div>
                )}
                {review.grind_size && (
                  <div>
                    <span className="text-sm font-medium">Grind Size:</span>
                    <p className="text-sm text-muted-foreground">{review.grind_size}</p>
                  </div>
                )}
              </div>

              {review.flavor_notes && review.flavor_notes.length > 0 && (
                <div className="mt-4">
                  <span className="text-sm font-medium">Flavor Notes:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {review.flavor_notes.slice(0, 3).map((note: string) => (
                      <Badge key={note} variant="secondary">
                        {note}
                      </Badge>
                    ))}
                    {review.flavor_notes.length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="px-2 h-6"
                      >
                        +{review.flavor_notes.length - 3} more
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 pt-4 border-t mt-4">
                <Button
                  variant={isLiked ? "default" : "ghost"}
                  size="sm"
                  onClick={() => toggleLike.mutate()}
                  disabled={!user || toggleLike.isPending}
                >
                  <ThumbsUp className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                  {likes.length > 0 && likes.length}
                </Button>
                <Button
                  variant={showComments ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setShowComments(!showComments)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {comments.length > 0 && comments.length}
                </Button>
              </div>

              {showComments && (
                <div className="mt-4 space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.users?.avatar_url} alt={comment.users?.name} />
                        <AvatarFallback>
                          <User className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 bg-accent rounded-lg p-3">
                        <p className="font-medium text-sm">{comment.users?.name}</p>
                        <p className="text-sm">{comment.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}

                  {user && (
                    <div className="flex gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                          alt={user.email || ""} 
                        />
                        <AvatarFallback>
                          <User className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex gap-2">
                        <Textarea
                          placeholder="Add a comment..."
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          className="min-h-0 h-8 resize-none"
                        />
                        <Button
                          size="sm"
                          disabled={!commentInput.trim()}
                          onClick={() => {
                            addComment.mutate(commentInput)
                            setCommentInput("")
                          }}
                        >
                          Post
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}