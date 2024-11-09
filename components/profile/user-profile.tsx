"use client"

import { useQuery } from "@tanstack/react-query"
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

interface UserProfileProps {
  userId: string
}

export function UserProfile({ userId }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  const { data: userData, isLoading, refetch } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      const { data: user, error } = await supabase
        .from('users')
        .select(`
          *,
          user_stats (*)
        `)
        .eq('id', userId)
        .single()

      if (error) throw error
      return user
    }
  })

  const [editForm, setEditForm] = useState({
    name: userData?.name || "",
    bio: userData?.bio || "",
    favoriteCoffeeStyles: userData?.favorite_coffee_styles?.join(", ") || ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: editForm.name,
          bio: editForm.bio,
          favorite_coffee_styles: editForm.favoriteCoffeeStyles
            .split(",")
            .map(style => style.trim())
            .filter(Boolean)
        })
        .eq('id', userId)

      if (error) throw error

      await refetch()
      setIsEditing(false)
      
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
    }
  }

  if (isLoading) {
    return (
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
                  <Button type="submit">
                    Save Changes
                  </Button>
                </form>
              ) : (
                <>
                  <p className="mt-2">{userData.bio || "No bio yet"}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {userData.favorite_coffee_styles?.map((style: string) => (
                      <Badge key={style} variant="secondary">{style}</Badge>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Coffee className="h-4 w-4" />
                      <span>Level {userData.user_stats?.level || 1}</span>
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

      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">Stats</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{userData.user_stats?.total_reviews || 0}</div>
              <div className="text-sm text-muted-foreground">Reviews</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{userData.user_stats?.beans_tried || 0}</div>
              <div className="text-sm text-muted-foreground">Beans Tried</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{userData.user_stats?.roasters_visited || 0}</div>
              <div className="text-sm text-muted-foreground">Roasters Visited</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{userData.user_stats?.unique_origins || 0}</div>
              <div className="text-sm text-muted-foreground">Origins Explored</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}