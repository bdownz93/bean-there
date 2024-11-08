"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Check } from "lucide-react"
import { RoasterRating } from "@/components/roaster/roaster-rating"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import { useAuth } from "@/components/auth/auth-provider"
import { toggleVisitedRoaster } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import type { Roaster } from "@/lib/types"

interface RoasterCardProps {
  roaster: Roaster
}

export function RoasterCard({ roaster }: RoasterCardProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const visitedRoasters = useStore((state) => state.visitedRoasters || [])
  const isVisited = visitedRoasters.includes(roaster.id)

  const handleToggleVisited = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to mark roasters as visited",
        variant: "destructive"
      })
      return
    }

    try {
      await toggleVisitedRoaster(user.id, roaster.id)
      
      // Update local state through store
      useStore.setState((state) => ({
        visitedRoasters: isVisited
          ? state.visitedRoasters.filter(id => id !== roaster.id)
          : [...(state.visitedRoasters || []), roaster.id]
      }))

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })

      toast({
        title: isVisited ? "Roaster unmarked" : "Roaster marked as visited",
        description: isVisited 
          ? `Removed ${roaster.name} from your visited roasters`
          : `Added ${roaster.name} to your visited roasters`
      })
    } catch (error) {
      console.error('Error toggling visited status:', error)
      toast({
        title: "Error",
        description: "Failed to update visited status",
        variant: "destructive"
      })
    }
  }

  return (
    <Card className="hover:bg-accent hover:text-accent-foreground transition-colors">
      <CardHeader>
        <div className="flex items-start gap-4">
          {roaster.logo_url && (
            <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
              <Image
                src={roaster.logo_url}
                alt={roaster.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <Link href={`/roasters/${roaster.slug}`} className="min-w-0">
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg truncate">{roaster.name}</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-3 w-3 shrink-0" />
                    <span className="truncate">{roaster.location}</span>
                  </div>
                </div>
              </Link>
              <Button
                variant={isVisited ? "default" : "outline"}
                size="sm"
                className="shrink-0"
                onClick={handleToggleVisited}
              >
                <Check className={`h-4 w-4 ${isVisited ? "text-white" : ""}`} />
                <span className="ml-1">
                  {isVisited ? "Visited" : "Mark Visited"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {roaster.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {roaster.specialties?.map((specialty) => (
            <Badge key={specialty} variant="secondary">
              {specialty}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}