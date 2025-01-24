"use client"

import { MapPin, Star, Coffee, Globe, Phone } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
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
            <div className="relative flex items-center justify-center w-24 h-24 rounded-lg bg-primary/10 overflow-hidden">
              {roaster.logo_url ? (
                <Image
                  src={roaster.logo_url}
                  alt={`${roaster.name} logo`}
                  fill
                  className="object-cover"
                />
              ) : (
                <Coffee className="h-12 w-12 text-primary" />
              )}
            </div>
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
          <div className="flex items-center">
            <Star className="h-5 w-5 fill-current text-yellow-400" />
            <span className="ml-1 font-semibold">{roaster.rating?.toFixed(1) || "N/A"}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground">{roaster.description}</p>
          {roaster.specialties && roaster.specialties.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {roaster.specialties.map((specialty) => (
                  <Badge key={specialty} variant="secondary">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}