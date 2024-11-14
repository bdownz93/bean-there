"use client"

import { useState } from "react"
import { Heart, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useReviewInteractions } from "@/lib/hooks/useReviewInteractions"
import { useAuth } from "@/components/auth/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"

interface ReviewActionsProps {
  reviewId: string
}

export function ReviewActions({ reviewId }: ReviewActionsProps) {
  const { user } = useAuth()
  const [newComment, setNewComment] = useState("")
  const { likes, comments, isLiked, toggleLike, addComment } = useReviewInteractions(reviewId)

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    await addComment.mutateAsync(newComment)
    setNewComment("")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => toggleLike.mutate()}
          disabled={!user}
        >
          <Heart className={isLiked ? "fill-red-500 text-red-500" : "text-gray-500"} size={20} />
          <span>{likes.length}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
          disabled={!user}
        >
          <MessageCircle className="text-gray-500" size={20} />
          <span>{comments.length}</span>
        </Button>
      </div>

      {user && (
        <div className="space-y-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button 
            size="sm"
            onClick={handleAddComment}
            disabled={!newComment.trim() || addComment.isPending}
          >
            {addComment.isPending ? "Adding..." : "Add Comment"}
          </Button>
        </div>
      )}

      {comments.length > 0 && (
        <div className="space-y-4 mt-4">
          {comments.map((comment: any) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.users?.avatar_url} />
                <AvatarFallback>{comment.users?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{comment.users?.name}</span>
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
