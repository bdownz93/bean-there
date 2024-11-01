"use client"

import { useStore } from "@/lib/store"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface UserListProps {
  userIds: string[]
  emptyMessage?: string
}

export function UserList({ userIds, emptyMessage = "No users found" }: UserListProps) {
  const { users, currentUser, toggleFollow } = useStore()

  if (userIds.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-muted-foreground">
          {emptyMessage}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {userIds.map((userId) => {
        const user = users[userId]
        const isFollowing = currentUser.following.includes(userId)
        const isCurrentUser = userId === currentUser.id

        return (
          <Card key={userId}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Link href={`/profile/${user.username}`}>
                      <h3 className="font-semibold hover:underline">{user.name}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                    <p className="mt-1 text-sm">{user.bio}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {user.badges.map((badge) => (
                        <Badge key={badge.id} variant="secondary">
                          {badge.icon} {badge.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                {!isCurrentUser && (
                  <Button
                    variant={isFollowing ? "outline" : "default"}
                    onClick={() => toggleFollow(userId)}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}