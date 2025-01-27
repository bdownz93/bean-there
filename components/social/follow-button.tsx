'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { followUser, unfollowUser, isFollowing } from '@/lib/supabase'
import { useToast } from '@/components/ui/use-toast'

interface FollowButtonProps {
  userId: string
  onFollowChange?: (isFollowing: boolean) => void
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

export function FollowButton({
  userId,
  onFollowChange,
  variant = 'default',
  size = 'default'
}: FollowButtonProps) {
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        const status = await isFollowing(userId)
        setFollowing(status)
      } catch (error) {
        console.error('Error checking follow status:', error)
      } finally {
        setLoading(false)
      }
    }

    checkFollowStatus()
  }, [userId])

  const handleClick = async () => {
    try {
      setLoading(true)
      if (following) {
        await unfollowUser(userId)
        toast({
          title: 'Unfollowed',
          description: 'You are no longer following this user',
        })
      } else {
        await followUser(userId)
        toast({
          title: 'Following',
          description: 'You are now following this user',
        })
      }
      setFollowing(!following)
      onFollowChange?.(!following)
    } catch (error) {
      console.error('Error toggling follow:', error)
      toast({
        title: 'Error',
        description: 'Failed to update follow status. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Button
        variant={variant}
        size={size}
        disabled
        className="min-w-[100px]"
      >
        <span className="animate-pulse">Loading...</span>
      </Button>
    )
  }

  return (
    <Button
      variant={following ? 'outline' : variant}
      size={size}
      onClick={handleClick}
      className="min-w-[100px]"
    >
      {following ? 'Following' : 'Follow'}
    </Button>
  )
}
