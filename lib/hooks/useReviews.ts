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
  grind_size?: string
  flavor_notes?: string[]
  aroma?: number
  body?: number
  acidity?: number
  sweetness?: number
  aftertaste?: number
  photo_url?: string
  created_at: string
  updated_at: string
  user?: {
    id: string
    name: string
    username: string
    avatar_url: string
  }
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
          user:user_id (
            id,
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
      grindSize,
      selectedFlavors,
      photo,
      aroma,
      body,
      acidity,
      sweetness,
      aftertaste
    }: { 
      rating: number;
      content: string;
      brewMethod?: string;
      grindSize?: string;
      selectedFlavors?: string[];
      photo?: File | null;
      aroma?: number;
      body?: number;
      acidity?: number;
      sweetness?: number;
      aftertaste?: number;
    }) => {
      if (!user) throw new Error("Must be logged in to review")

      try {
        const { data, error } = await supabase
          .from("reviews")
          .insert([
            {
              user_id: user.id,
              bean_id: beanId,
              rating: Math.min(5, Math.max(0, rating)), // Ensure rating is 0-5
              content,
              brew_method: brewMethod,
              grind_size: grindSize,
              flavor_notes: selectedFlavors,
              // Store raw 0-100 values
              aroma: aroma ? Math.min(100, Math.max(0, aroma)) : null,
              body: body ? Math.min(100, Math.max(0, body)) : null,
              acidity: acidity ? Math.min(100, Math.max(0, acidity)) : null,
              sweetness: sweetness ? Math.min(100, Math.max(0, sweetness)) : null,
              aftertaste: aftertaste ? Math.min(100, Math.max(0, aftertaste)) : null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ])
          .select('*')
          .single()

        if (error) {
          console.error("Error adding review:", error)
          throw error
        }

        // Handle photo upload if provided
        if (photo && data) {
          const photoPath = `reviews/${data.id}/${photo.name}`
          const { error: uploadError } = await supabase.storage
            .from("review-photos")
            .upload(photoPath, photo)

          if (uploadError) {
            console.error("Error uploading photo:", uploadError)
          } else {
            // Update review with photo URL
            const { error: updateError } = await supabase
              .from("reviews")
              .update({ photo_url: photoPath })
              .eq("id", data.id)

            if (updateError) {
              console.error("Error updating review with photo:", updateError)
            }
          }
        }

        return data
      } catch (error) {
        console.error("Error in review submission:", error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", beanId] })
      toast({
        title: "Review submitted",
        description: "Your review has been added successfully."
      })
    },
    onError: (error: any) => {
      console.error("Review submission error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit review. Please try again.",
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