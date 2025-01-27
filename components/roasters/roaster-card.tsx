'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { RoasterLogo } from '@/components/images/roaster-logo'

interface RoasterCardProps {
  roaster: {
    id: string
    name: string
    slug: string
    location: string | null
    logo_url: string | null
    description: string | null
  }
}

export function RoasterCard({ roaster }: RoasterCardProps) {
  return (
    <Link href={`/roasters/${roaster.slug}`}>
      <Card className="h-full transition-colors hover:bg-muted/50">
        <CardHeader className="flex flex-row items-center gap-4">
          <RoasterLogo src={roaster.logo_url} alt={roaster.name} size="lg" />
          <div>
            <h3 className="text-lg font-semibold">{roaster.name}</h3>
            {roaster.location && (
              <p className="text-sm text-muted-foreground">{roaster.location}</p>
            )}
          </div>
        </CardHeader>
        {roaster.description && (
          <CardContent>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {roaster.description}
            </p>
          </CardContent>
        )}
      </Card>
    </Link>
  )
}
