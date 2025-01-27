'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { BeanImage } from '@/components/images/bean-image'
import { RoasterLogo } from '@/components/images/roaster-logo'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'

interface BeanCardProps {
  bean: {
    id: string
    name: string
    slug: string
    image_url: string | null
    roast_level: string | null
    origin: string | null
    description: string | null
    roaster?: {
      name: string
      slug: string
      logo_url: string | null
    }
    average_rating?: number
    total_ratings?: number
  }
}

export function BeanCard({ bean }: BeanCardProps) {
  return (
    <Card className="h-full overflow-hidden transition-colors hover:bg-muted/50 relative">
      <Link href={`/beans/${bean.slug}`} className="block">
        <div className="relative">
          <BeanImage 
            src={bean.image_url} 
            alt={bean.name} 
            size="md" 
            className="w-full" 
          />
          {bean.roaster && (
            <div className="absolute bottom-2 left-2">
              <div 
                className="rounded-full"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  window.location.href = `/roasters/${bean.roaster.slug}`
                }}
              >
                <RoasterLogo 
                  src={bean.roaster.logo_url} 
                  alt={bean.roaster.name} 
                  size="sm"
                  className="border-2 border-background cursor-pointer" 
                />
              </div>
            </div>
          )}
        </div>
        <CardHeader>
          <div className="space-y-1">
            <h3 className="font-semibold">{bean.name}</h3>
            {bean.roaster && (
              <p className="text-sm text-muted-foreground">{bean.roaster.name}</p>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {bean.roast_level && (
              <Badge variant="secondary">{bean.roast_level} Roast</Badge>
            )}
            {bean.origin && (
              <Badge variant="secondary">{bean.origin}</Badge>
            )}
          </div>
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
  )
}
