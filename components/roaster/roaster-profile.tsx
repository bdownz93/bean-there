"use client"

import { MapPin, Star, Coffee, Globe, Phone } from "lucide-react"
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
          <div className="flex items-start gap-6">
            <div className="flex items-center justify-center w-24 h-24 rounded-lg bg-primary/10">
              <Coffee className="h-12 w-12 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">{roaster.name}</CardTitle>
              <div className="flex items-center mt-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{roaster.location}</span>
              </div>
              {roaster.website && (
                <div className="flex items-center mt-1 text-muted-foreground">
                  <Globe className="h-4 w-4 mr-1" />
                  <a 
                    href={roaster.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-primary"
                  >
                    {roaster.website.replace(/^https?:\/\//, '')}
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
          <div className="flex items-center">
            <Star className="h-5 w-5 fill-current text-yellow-400" />
            <span className="ml-1 font-semibold">{roaster.rating?.toFixed(1) || "N/A"}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{roaster.description}</p>
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