"use client"

import { useStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { Coffee, Edit2, MapPin, Star, Users } from "lucide-react"

export default function ProfilePage() {
  const { currentUser, updateUserProfile } = useStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: currentUser.name,
    bio: currentUser.bio || "",
    favoriteCoffeeStyles: currentUser.favoriteCoffeeStyles.join(", ")
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateUserProfile({
      name: editForm.name,
      bio: editForm.bio,
      favoriteCoffeeStyles: editForm.favoriteCoffeeStyles
        .split(",")
        .map(style => style.trim())
        .filter(Boolean)
    })
    setIsEditing(false)
  }

  return (
    <div className="container max-w-4xl py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{currentUser.name}</CardTitle>
                <div className="text-muted-foreground">@{currentUser.username}</div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{currentUser.followers.length} followers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Coffee className="h-4 w-4" />
                    <span>{currentUser.reviewCount} reviews</span>
                  </div>
                </div>
              </div>
            </div>
            {!isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="badges">Badges</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
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
                  <div className="flex gap-2">
                    <Button type="submit">Save Changes</Button>
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">About</h3>
                    <p className="text-muted-foreground">{currentUser.bio || "No bio yet"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Favorite Coffee Styles</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentUser.favoriteCoffeeStyles.map(style => (
                        <Badge key={style} variant="secondary">{style}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Member Since</h3>
                    <p className="text-muted-foreground">
                      {new Date(currentUser.joinedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="badges">
              <div className="grid gap-4 md:grid-cols-2">
                {currentUser.badges.map(badge => (
                  <Card key={badge.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{badge.icon}</div>
                        <div>
                          <h3 className="font-medium">{badge.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {badge.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Unlocked {new Date(badge.earnedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="activity">
              <div className="space-y-4">
                <h3 className="font-medium">Recent Activity</h3>
                <p className="text-muted-foreground">Activity feed coming soon...</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}