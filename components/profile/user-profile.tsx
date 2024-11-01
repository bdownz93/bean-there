"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User as UserIcon, Calendar, Coffee } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface UserData {
  id: string
  username: string
  name: string
  avatar_url: string
  bio: string | null
  created_at: string
}

export function UserProfile() {
  const { user } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    bio: ""
  })

  useEffect(() => {
    async function fetchUserData() {
      if (!user?.id) return

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching user data:', error)
        return
      }

      setUserData(data)
      setEditForm({
        name: data.name || "",
        bio: data.bio || ""
      })
    }

    fetchUserData()
  }, [user?.id])

  if (!userData) {
    return <div>Loading...</div>
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { error } = await supabase
      .from('users')
      .update({
        name: editForm.name,
        bio: editForm.bio
      })
      .eq('id', user?.id)

    if (error) {
      console.error('Error updating profile:', error)
      return
    }

    setUserData(prev => prev ? {
      ...prev,
      name: editForm.name,
      bio: editForm.bio
    } : null)
    setIsEditing(false)
  }

  const joinDate = new Date(userData.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })

  return (
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
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </div>
            {isEditing ? (
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={e => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full p-2 border rounded"
                    rows={3}
                  />
                </div>
                <Button type="submit">Save Changes</Button>
              </form>
            ) : (
              <>
                <p className="mt-2">{userData.bio || "No bio yet"}</p>
                <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {joinDate}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}