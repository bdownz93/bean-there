'use client'

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BeanImage } from "@/components/images/bean-image"
import { RoasterLogo } from "@/components/images/roaster-logo"
import { Star } from "lucide-react"
import type { Bean } from "@/lib/types"

interface BeanListProps {
  initialBeans: (Bean & {
    average_rating?: number
    total_ratings?: number
  })[]
  roasters: any[]
}

export function BeanList({ initialBeans, roasters }: BeanListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {initialBeans.map((bean) => (
        <Card key={bean.id} className="h-full overflow-hidden transition-colors hover:bg-muted/50">
          <Link href={`/beans/${bean.slug}`} className="block">
            <div className="relative">
              <BeanImage 
                src={bean.image_url || null} 
                alt={bean.name} 
                size="md" 
                className="w-full" 
              />
              {bean.roaster && (
                <div className="absolute bottom-2 left-2">
                  <div 
                    className="rounded-full cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      window.location.href = `/roasters/${bean.roaster.slug}`
                    }}
                  >
                    <RoasterLogo 
                      src={bean.roaster.logo_url || null} 
                      alt={bean.roaster.name} 
                      size="sm"
                      className="border-2 border-background" 
                    />
                  </div>
                </div>
              )}
            </div>
            <CardHeader>
              <div className="space-y-1">
                <CardTitle>{bean.name}</CardTitle>
                {bean.roaster && (
                  <CardDescription>
                    by {bean.roaster.name}
                  </CardDescription>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {bean.origin && (
                  <Badge variant="secondary">{bean.origin}</Badge>
                )}
                {bean.roast_level && (
                  <Badge variant="outline">{bean.roast_level} Roast</Badge>
                )}
              </div>
              {bean.description && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {bean.description}
                </p>
              )}
              {bean.average_rating && (
                <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span>{bean.average_rating.toFixed(1)}</span>
                  {bean.total_ratings && (
                    <span>({bean.total_ratings})</span>
                  )}
                </div>
              )}
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  )
}
