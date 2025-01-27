'use client'

import { useState, useEffect } from 'react'
import { getFollowing } from '@/lib/supabase'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { FollowButton } from './follow-button'
import Link from 'next/link'

interface FollowingListProps {
  userId: string
  limit?: number
  showFollowButton?: boolean
}

interface Following {
  following_id: string
  users: {
    id: string
    username: string | null
    name: string | null
    avatar_url: string | null
  }
}

export function FollowingList({
  userId,
  limit,
  showFollowButton = false
}: FollowingListProps) {
  const [following, setFollowing] = useState<Following[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFollowing = async () => {
      try {
        const data = await getFollowing(userId)
        setFollowing(limit ? data.slice(0, limit) : data)
      } catch (error) {
        console.error('Error loading following:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFollowing()
  }, [userId, limit])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(limit || 3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (following.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Not following anyone yet
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {following.map((follow) => (
        <div
          key={follow.following_id}
          className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors"
        >
          <Link
            href={`/profile/${follow.users.username}`}
            className="flex items-center space-x-4"
          >
            <Avatar>
              <AvatarImage src={follow.users.avatar_url || undefined} />
              <AvatarFallback>
                {follow.users.name?.[0] || follow.users.username?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">
                {follow.users.name || follow.users.username}
              </span>
              {follow.users.username && (
                <span className="text-sm text-muted-foreground">
                  @{follow.users.username}
                </span>
              )}
            </div>
          </Link>
          {showFollowButton && (
            <FollowButton
              userId={follow.following_id}
              variant="outline"
              size="sm"
            />
          )}
        </div>
      ))}
    </div>
  )
}
