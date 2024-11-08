"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User as UserIcon, Calendar, Coffee, Edit2 } from "lucide-react"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { ProfileStats } from "./profile-stats"
import { ProfileBadges } from "./profile-badges"

interface UserProfileProps {
  userId: string
}

export function UserProfile({ userId }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: userData, isLoading } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          badges:user_badges (
            badge:badges (
              id,
              name,
              description,
              icon,
              category
            ),
            earned_at
          )
        `)
        .eq('id', userId)
        .single()

      if (userError) throw userError

      // Get user stats
      const { data: stats, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (statsError) {
        // If stats don't exist yet, return default values
        return {
          ...user,
          stats: {
            beansCount: 0,
            roastersCount: 0,
            reviewsCount: 0,
            level: 1,
            experiencePoints: 0,
            uniqueOrigins: 0
          },
          badges: []
        }
      }

      return {
        ...user,
        stats: {
          beansCount: stats.beans_tried,
          roastersCount: stats.roasters_visited,
          reviewsCount: stats.total_reviews,
          level: user.level,
          experiencePoints: user.experience_points,
          uniqueOrigins: stats.unique_origins
        },
        badges: user.badges?.map((badge: any) => ({
          id: badge.badge.id,
          name: badge.badge.name,
          description: badge.badge.description,
          icon: badge.badge.icon,
          category: badge.badge.category,
          earnedAt: badge.earned_at
        })) || []
      }
    }
  })

  const updateProfile = useMutation({
    mutationFn: async (formData: {
      name: string
      bio: string | null
      favorite_coffee_styles: string[]
    }) => {
      const { error } = await supabase
        .from('users')
        .update(formData)
        .eq('id', userId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile', userId] })
      setIsEditing(false)
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      })
    }
  })

  const [editForm, setEditForm] = useState({
    name: "",
    bio: "",
    favoriteCoffeeStyles: ""
  })

  // Update form when user data is loaded
  if (userData && !editForm.name && !isEditing) {
    setEditForm({
      name: userData.name || "",
      bio: userData.bio || "",
      favoriteCoffeeStyles: userData.favorite_coffee_styles?.join(", ") || ""
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-20 w-20 rounded-full bg-muted" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/4" />
                <div className="h-4 bg-muted rounded w-1/3" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!userData) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">User not found</p>
        </CardContent>
      </Card>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    updateProfile.mutate({
      name: editForm.name,
      bio: editForm.bio,
      favorite_coffee_styles: editForm.favoriteCoffeeStyles
        .split(",")
        .map(style => style.trim())
        .filter(Boolean)
    })
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={userData.avatar_url} alt={userData.name} />
              <AvatarFallback>
                <UserIcon className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold">{userData.name}</h2>
                  <p className="text-muted-foreground">@{userData.username}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
              </div>
              {isEditing ? (
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={editForm.name}
                      onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bio</label>
                    <Textarea
                      value={editForm.bio}
                      onChange={e => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Favorite Coffee Styles</label>
                    <Input
                      value={editForm.favoriteCoffeeStyles}
                      onChange={e => setEditForm(prev => ({ ...prev, favoriteCoffeeStyles: e.target.value }))}
                      placeholder="Light Roast, Pour Over, etc. (comma-separated)"
                    />
                  </div>
                  <Button type="submit" disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              ) : (
                <>
                  <p className="mt-2">{userData.bio || "No bio yet"}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {userData.favorite_coffee_styles?.map((style) => (
                      <Badge key={style} variant="secondary">{style}</Badge>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Coffee className="h-4 w-4" />
                      <span>Level {userData.level}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {new Date(userData.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <ProfileStats stats={userData.stats} />
      <ProfileBadges badges={userData.badges} />
    </div>
  )
}