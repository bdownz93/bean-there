"use client"

import { useStore } from "@/lib/store"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User as UserIcon, Calendar, Coffee } from "lucide-react"
import type { User } from "@/lib/types"

interface UserProfileProps {
  user: User
}

export function UserProfile({ user }: UserProfileProps) {
  const currentUser = useStore((state) => state.currentUser)
  const followUser = useStore((state) => state.followUser)
  const unfollowUser = useStore((state) => state.unfollowUser)

  const isCurrentUser = currentUser.id === user.id
  const isFollowing = currentUser.following.includes(user.id)
  const joinDate = new Date(user.joinedDate).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })

  const handleFollowToggle = () => {
    if (isFollowing) {
      unfollowUser(user.id)
    } else {
      followUser(user.id)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>
              <UserIcon className="h-10 w-10" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-muted-foreground">@{user.username}</p>
              </div>
              {!isCurrentUser && (
                <Button
                  variant={isFollowing ? "outline" : "default"}
                  onClick={handleFollowToggle}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              )}
            </div>
            <p className="mt-2">{user.bio}</p>
            <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Coffee className="h-4 w-4" />
                <span>Level {user.level} Coffee Explorer</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Joined {joinDate}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div>
            <h3 className="font-semibold mb-2">Stats</h3>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{user.reviewCount}</div>
                <div className="text-xs text-muted-foreground">Reviews</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{user.following.length}</div>
                <div className="text-xs text-muted-foreground">Following</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{user.followers.length}</div>
                <div className="text-xs text-muted-foreground">Followers</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{user.badges.length}</div>
                <div className="text-xs text-muted-foreground">Badges</div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Favorite Coffee Styles</h3>
            <div className="flex flex-wrap gap-2">
              {user.favoriteCoffeeStyles?.map((style) => (
                <Badge key={style} variant="secondary">
                  {style}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Badges</h3>
            <div className="flex flex-wrap gap-4">
              {user.badges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-2 rounded-lg border p-2"
                >
                  <span className="text-2xl">{badge.icon}</span>
                  <div>
                    <div className="font-medium">{badge.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {badge.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}