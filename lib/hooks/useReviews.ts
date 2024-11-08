"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/components/ui/use-toast"

export interface Review {
  id: string
  user_id: string
  bean_id: string
  rating: number
  content: string
  created_at: string
  updated_at: string
}

export function useReviews(beanId: string) {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: reviews = [], isLoading, error } = useQuery({
    queryKey: ["reviews", beanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          users (
            name,
            username,
            avatar_url
          )
        `)
        .eq("bean_id", beanId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching reviews:", error)
        throw error
      }

      return data || []
    }
  })

  const addReview = useMutation({
    mutationFn: async ({ rating, content }: { rating: number, content: string }) => {
      if (!user) throw new Error("Must be logged in to review")

      const { data, error } = await supabase
        .from("reviews")
        .insert([
          {
            user_id: user.id,
            bean_id: beanId,
            rating,
            content
          }
        ])
        .select()

      if (error) {
        console.error("Error adding review:", error)
        throw error
      }

      return data[0]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", beanId] })
      toast({
        title: "Review submitted",
        description: "Your review has been added successfully."
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  const updateReview = useMutation({
    mutationFn: async ({ id, rating, content }: { id: string, rating: number, content: string }) => {
      const { data, error } = await supabase
        .from("reviews")
        .update({ rating, content })
        .eq("id", id)
        .select()

      if (error) throw error
      return data[0]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", beanId] })
      toast({
        title: "Review updated",
        description: "Your review has been updated successfully."
      })
    }
  })

  const deleteReview = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", beanId] })
      toast({
        title: "Review deleted",
        description: "Your review has been deleted successfully."
      })
    }
  })

  return {
    reviews,
    isLoading,
    error,
    addReview,
    updateReview,
    deleteReview
  }
}