"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { useQuery, useQueryClient } from "@tanstack/react-query"

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  bio: z.string().optional(),
  favorite_coffee_styles: z.string().optional()
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface ProfileSettingsProps {
  userId: string
}

export function ProfileSettings({ userId }: ProfileSettingsProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)

  const { data: profile } = useQuery({
    queryKey: ['profile-settings', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data
    }
  })

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || "",
      username: profile?.username || "",
      bio: profile?.bio || "",
      favorite_coffee_styles: profile?.favorite_coffee_styles?.join(", ") || ""
    }
  })

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsLoading(true)

      const updateData: any = {
        name: data.name
      }

      // Only include optional fields if they have values
      if (data.username) updateData.username = data.username
      if (data.bio) updateData.bio = data.bio
      if (data.favorite_coffee_styles) {
        updateData.favorite_coffee_styles = data.favorite_coffee_styles
          .split(",")
          .map(s => s.trim())
          .filter(Boolean)
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)

      if (error) throw error

      await queryClient.invalidateQueries({ queryKey: ['profile-settings'] })
      await queryClient.invalidateQueries({ queryKey: ['profile-overview'] })

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name *</label>
            <Input {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Username (optional)</label>
            <Input {...register("username")} />
            {errors.username && (
              <p className="text-sm text-destructive">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Bio (optional)</label>
            <Textarea {...register("bio")} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Favorite Coffee Styles (optional)</label>
            <Input 
              {...register("favorite_coffee_styles")} 
              placeholder="Light Roast, Pour Over, etc. (comma-separated)"
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}