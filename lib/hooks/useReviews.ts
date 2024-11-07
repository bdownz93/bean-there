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
  brew_method?: string
  brew_time?: string
  water_temp?: string
  grind_size?: string
  dose_grams?: number
  yield_grams?: number
  flavor_notes?: string[]
  photo_url?: string
  aroma_rating?: number
  body_rating?: number
  acidity_rating?: number
  sweetness_rating?: number
  aftertaste_rating?: number
  created_at: string
  updated_at: string
  users?: {
    name: string
    username: string
    avatar_url: string
  }
}

interface AddReviewData {
  rating: number
  content: string
  brewMethod?: string
  brewTime?: string
  waterTemp?: string
  grindSize?: string
  doseGrams?: number
  yieldGrams?: number
  flavorNotes?: string[]
  photoUrl?: string
  aromaRating?: number
  bodyRating?: number
  acidityRating?: number
  sweetnessRating?: number
  aftertasteRating?: number
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
    mutationFn: async ({
      rating,
      content,
      brewMethod,
      brewTime,
      waterTemp,
      grindSize,
      doseGrams,
      yieldGrams,
      flavorNotes,
      photoUrl,
      aromaRating,
      bodyRating,
      acidityRating,
      sweetnessRating,
      aftertasteRating
    }: AddReviewData) => {
      if (!user) throw new Error("Must be logged in to review")
      if (!rating) throw new Error("Rating is required")

      const { data, error } = await supabase
        .from("reviews")
        .insert([
          {
            user_id: user.id,
            bean_id: beanId,
            rating,
            content,
            brew_method: brewMethod,
            brew_time: brewTime,
            water_temp: waterTemp,
            grind_size: grindSize,
            dose_grams: doseGrams,
            yield_grams: yieldGrams,
            flavor_notes: flavorNotes,
            photo_url: photoUrl,
            aroma_rating: aromaRating,
            body_rating: bodyRating,
            acidity_rating: acidityRating,
            sweetness_rating: sweetnessRating,
            aftertaste_rating: aftertasteRating
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

  return {
    reviews,
    isLoading,
    error,
    addReview
  }
}