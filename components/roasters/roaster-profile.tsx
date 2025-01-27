"use client"

import { MapPin, Star, Coffee, Globe, Phone } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RoasterLogo } from "@/components/images/roaster-logo"
import { HeroImage } from "@/components/images/hero-image"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/components/auth/auth-provider"
import { useState } from "react"
import { createComment, getComments } from "@/lib/supabase"
import { useQuery } from "@tanstack/react-query"
import type { Roaster } from "@/lib/types"

interface RoasterProfileProps {
  roaster: Roaster
}

export function RoasterProfile({ roaster }: RoasterProfileProps) {
  const { user } = useAuth()
  const [comment, setComment] = useState("")

  // Fetch comments
  const { data: comments = [], refetch: refetchComments } = useQuery({
    queryKey: ['roaster-comments', roaster.id],
    queryFn: () => getComments({ roasterId: roaster.id }),
    staleTime: 1000 * 60 // Consider data fresh for 1 minute
  })

  // Handle comment submission
  const handleSubmitComment = async () => {
    if (!comment.trim()) return

    try {
      await createComment({
        content: comment,
        roasterId: roaster.id
      })
      setComment("")
      refetchComments()
    } catch (error) {
      console.error("Error creating comment:", error)
    }
  }

  return (
    <div className="space-y-6">
      <HeroImage 
        src={roaster.hero_image_url} 
        alt={`${roaster.name} banner`}
        priority
      />
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              <RoasterLogo 
                src={roaster.logo_url} 
                alt={roaster.name}
                size="lg"
                className="h-24 w-24"
              />
              <div>
                <CardTitle className="text-2xl">{roaster.name}</CardTitle>
                <div className="flex items-center mt-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{roaster.location}</span>
                </div>
                {roaster.website_url && (
                  <div className="flex items-center mt-1 text-muted-foreground">
                    <Globe className="h-4 w-4 mr-1" />
                    <a 
                      href={roaster.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-primary"
                    >
                      {roaster.website_url.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                {roaster.phone && (
                  <div className="flex items-center mt-1 text-muted-foreground">
                    <Phone className="h-4 w-4 mr-1" />
                    <span>{roaster.phone}</span>
                  </div>
                )}
              </div>
            </div>
            {roaster.rating && (
              <div className="flex items-center">
                <Star className="h-5 w-5 fill-primary text-primary mr-1" />
                <span className="text-lg font-medium">{roaster.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {roaster.description && (
            <p className="text-muted-foreground">{roaster.description}</p>
          )}
          {roaster.specialties && roaster.specialties.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Specialties</h4>
              <div className="flex flex-wrap gap-2">
                {roaster.specialties.map((specialty) => (
                  <Badge key={specialty} variant="secondary">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          )}
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
                  placeholder="Share your thoughts about this roaster..."
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