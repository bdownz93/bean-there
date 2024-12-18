"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Check, Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import type { Roaster } from "@/lib/types"

interface RoasterCardProps {
  roaster: Roaster
}

export function RoasterCard({ roaster }: RoasterCardProps) {
  const { visitedRoasters = [], toggleVisited } = useStore((state) => ({
    visitedRoasters: state.visitedRoasters || [],
    toggleVisited: state.toggleVisited
  }))
  
  const isVisited = visitedRoasters.includes(roaster.id)
  const roasterUrl = `/roasters/${roaster.slug || roaster.id}`

  return (
    <Card className="hover:bg-accent hover:text-accent-foreground transition-colors">
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10">
            <Coffee className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <Link href={roasterUrl} className="min-w-0">
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
                onClick={(e) => {
                  e.preventDefault()
                  toggleVisited(roaster.id)
                }}
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