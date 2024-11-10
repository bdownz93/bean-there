"use client"

import { useEffect, useState, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth/auth-provider"

export function useReviewInteractions(reviewId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [isLiked, setIsLiked] = useState(false)

  const { data: likes = [] } = useQuery({
    queryKey: ['review-likes', reviewId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('review_likes')
        .select('*')
        .eq('review_id', reviewId)

      if (error) throw error
      return data || []
    }
  })

  const { data: comments = [] } = useQuery({
    queryKey: ['review-comments', reviewId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('review_comments')
        .select(`
          *,
          users (
            id,
            name,
            avatar_url
          )
        `)
        .eq('review_id', reviewId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data || []
    }
  })

  useEffect(() => {
    if (user && likes.length > 0) {
      const userLike = likes.find(like => like.user_id === user.id)
      setIsLiked(!!userLike)
    }
  }, [likes, user])

  const toggleLike = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in to like')

      if (isLiked) {
        const { error } = await supabase
          .from('review_likes')
          .delete()
          .eq('review_id', reviewId)
          .eq('user_id', user.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('review_likes')
          .insert({ 
            review_id: reviewId,
            user_id: user.id
          })

        if (error) throw error
      }
    },
    onSuccess: () => {
      setIsLiked(!isLiked)
      queryClient.invalidateQueries({ queryKey: ['review-likes', reviewId] })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update like status",
        variant: "destructive"
      })
    }
  })

  const addComment = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('Must be logged in to comment')

      const { error } = await supabase
        .from('review_comments')
        .insert({ 
          review_id: reviewId,
          user_id: user.id,
          content 
        })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-comments', reviewId] })
      toast({
        title: "Success",
        description: "Comment added successfully"
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add comment",
        variant: "destructive"
      })
    }
  })

  return {
    likes,
    comments,
    isLiked,
    toggleLike,
    addComment
  }
}