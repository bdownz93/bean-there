"use client"

import { MapPin, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Roaster } from "@/lib/types"

interface RoasterProfileProps {
  roaster: Roaster
}

export function RoasterProfile({ roaster }: RoasterProfileProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">{roaster.name}</CardTitle>
            <div className="flex items-center mt-2 text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{roaster.location}</span>
            </div>
          </div>
          <div className="flex items-center">
            <Star className="h-5 w-5 fill-current text-yellow-400" />
            <span className="ml-1 font-semibold">{roaster.rating.toFixed(1)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{roaster.description}</p>
        <div className="flex flex-wrap gap-2">
          {roaster.specialties.map((specialty) => (
            <Badge key={specialty} variant="secondary">
              {specialty}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}