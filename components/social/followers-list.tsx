'use client'

import { useState, useEffect } from 'react'
import { getFollowers } from '@/lib/supabase'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

interface FollowersListProps {
  userId: string
  limit?: number
}

interface Follower {
  follower_id: string
  users: {
    id: string
    username: string | null
    name: string | null
    avatar_url: string | null
  }
}

export function FollowersList({ userId, limit }: FollowersListProps) {
  const [followers, setFollowers] = useState<Follower[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFollowers = async () => {
      try {
        const data = await getFollowers(userId)
        setFollowers(limit ? data.slice(0, limit) : data)
      } catch (error) {
        console.error('Error loading followers:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFollowers()
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

  if (followers.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No followers yet
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {followers.map((follower) => (
        <Link
          key={follower.follower_id}
          href={`/profile/${follower.users.username}`}
          className="flex items-center space-x-4 p-2 rounded-lg hover:bg-accent/50 transition-colors"
        >
          <Avatar>
            <AvatarImage src={follower.users.avatar_url || undefined} />
            <AvatarFallback>
              {follower.users.name?.[0] || follower.users.username?.[0] || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">
              {follower.users.name || follower.users.username}
            </span>
            {follower.users.username && (
              <span className="text-sm text-muted-foreground">
                @{follower.users.username}
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
