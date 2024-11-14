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

  const { data: comments = [], isLoading: isLoadingComments } = useQuery({
    queryKey: ['review-comments', reviewId],
    queryFn: async () => {
      console.log('Fetching comments for review:', reviewId)
      const { data: comments, error } = await supabase
        .from('review_comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          review_id
        `)
        .eq('review_id', reviewId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching comments:', error)
        return []
      }

      // Fetch user data separately
      const commentsWithUsers = await Promise.all(
        (comments || []).map(async (comment) => {
          const { data: userData } = await supabase
            .from('users')
            .select('id, name, avatar_url')
            .eq('id', comment.user_id)
            .single()

          return {
            ...comment,
            users: userData || {
              id: comment.user_id,
              name: 'Unknown User',
              avatar_url: null
            }
          }
        })
      )

      console.log('Fetched comments with users:', commentsWithUsers)
      return commentsWithUsers || []
    },
    staleTime: 1000, // Consider data stale after 1 second
    refetchOnWindowFocus: true
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
      
      console.log('Submitting comment:', {
        reviewId,
        userId: user.id,
        content
      })

      // First, insert the comment
      const { data: newComment, error: insertError } = await supabase
        .from('review_comments')
        .insert({ 
          review_id: reviewId,
          user_id: user.id,
          content,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error inserting comment:', insertError)
        throw insertError
      }

      console.log('Comment inserted:', newComment)

      // Fetch the user data
      const { data: userData } = await supabase
        .from('users')
        .select('id, name, avatar_url')
        .eq('id', user.id)
        .single()

      return {
        ...newComment,
        users: userData || {
          id: user.id,
          name: 'Unknown User',
          avatar_url: null
        }
      }
    },
    onSuccess: (data) => {
      console.log('Comment added successfully:', data)
      queryClient.invalidateQueries({ queryKey: ['review-comments', reviewId] })
      toast({
        title: "Success",
        description: "Comment added successfully"
      })
    },
    onError: (error: any) => {
      console.error('Comment submission error:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive"
      })
    }
  })

  return {
    likes,
    comments,
    isLiked,
    isLoadingComments,
    toggleLike,
    addComment
  }
}