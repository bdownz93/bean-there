"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Bean } from "@/lib/types"

interface BeanListProps {
  beans: Bean[]
}

export function BeanList({ beans }: BeanListProps) {
  if (!beans || beans.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No coffee beans available at the moment.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {beans.map((bean) => (
        <Link key={bean.id} href={`/beans/${bean.id}`}>
          <Card className="h-full hover:bg-accent hover:text-accent-foreground transition-colors">
            <CardHeader>
              {bean.image_url && (
                <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={bean.image_url}
                    alt={bean.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">{bean.name}</h3>
                  <div className="text-sm text-muted-foreground">
                    by {typeof bean.roaster === 'string' ? bean.roaster : bean.roaster?.name}
                  </div>
                </div>
                {bean.rating !== null && (
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-current text-yellow-400" />
                    <span className="ml-1 text-sm font-medium">
                      {bean.rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Origin</div>
                    <div className="font-medium">{bean.origin || 'Unknown'}</div>
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="text-sm text-muted-foreground">Roast Level</div>
                    <div className="font-medium">{bean.roast_level || 'Not specified'}</div>
                  </div>
                </div>
                {bean.tasting_notes && bean.tasting_notes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {bean.tasting_notes.map((note) => (
                      <Badge key={note} variant="secondary">
                        {note}
                      </Badge>
                    ))}
                  </div>
                )}
                {bean.price && (
                  <div className="text-lg font-semibold">
                    ${bean.price.toFixed(2)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}