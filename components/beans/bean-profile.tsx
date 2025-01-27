'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BeanImage } from '@/components/images/bean-image'
import { RoasterLogo } from '@/components/images/roaster-logo'
import { Badge } from '@/components/ui/badge'
import { Star, Coffee, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/components/auth/auth-provider'
import { useState } from 'react'
import { createComment, getComments } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'
import type { Bean } from '@/lib/types'

interface BeanProfileProps {
  bean: Bean & {
    average_rating?: number
    total_ratings?: number
  }
}

export function BeanProfile({ bean }: BeanProfileProps) {
  const { user } = useAuth()
  const [comment, setComment] = useState("")

  // Fetch comments
  const { data: comments = [], refetch: refetchComments } = useQuery({
    queryKey: ['bean-comments', bean.id],
    queryFn: () => getComments({ beanId: bean.id }),
    staleTime: 1000 * 60 // Consider data fresh for 1 minute
  })

  // Handle comment submission
  const handleSubmitComment = async () => {
    if (!comment.trim()) return

    try {
      await createComment({
        content: comment,
        beanId: bean.id
      })
      setComment("")
      refetchComments()
    } catch (error) {
      console.error("Error creating comment:", error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              <BeanImage 
                src={bean.image_url || null} 
                alt={bean.name} 
                size="lg"
                className="h-24 w-24 rounded-lg" 
              />
              <div>
                <CardTitle className="text-2xl">{bean.name}</CardTitle>
                {bean.roaster && (
                  <Link 
                    href={`/roasters/${bean.roaster.slug}`}
                    className="flex items-center mt-2 text-muted-foreground hover:text-primary"
                  >
                    <RoasterLogo 
                      src={bean.roaster.logo_url || null} 
                      alt={bean.roaster.name} 
                      size="sm"
                      className="mr-2" 
                    />
                    <span>{bean.roaster.name}</span>
                  </Link>
                )}
              </div>
            </div>
            {bean.average_rating && (
              <div className="flex items-center">
                <Star className="h-5 w-5 fill-primary text-primary mr-1" />
                <span className="text-lg font-medium">{bean.average_rating.toFixed(1)}</span>
                {bean.total_ratings && (
                  <span className="text-muted-foreground ml-1">({bean.total_ratings})</span>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {bean.description && (
            <p className="text-muted-foreground mb-4">{bean.description}</p>
          )}
          <div className="flex flex-wrap gap-4">
            {bean.roast_level && (
              <div className="flex items-center gap-2">
                <Coffee className="h-4 w-4 text-muted-foreground" />
                <span>{bean.roast_level} Roast</span>
              </div>
            )}
            {bean.origin && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span>{bean.origin}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-4">
              <div className="flex gap-4">
                <Textarea
                  placeholder="Share your thoughts about this coffee..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <Button onClick={handleSubmitComment}>Post</Button>
              </div>
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-b pb-4">
                    <div className="flex justify-between items-start">
                      <div className="font-medium">{comment.user.username}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <p className="mt-1 text-sm">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              Please sign in to leave a comment
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
