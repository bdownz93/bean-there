"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import Image from "next/image"
import type { Bean } from "@/lib/types"

interface BeanProfileProps {
  bean: Bean
}

export function BeanProfile({ bean }: BeanProfileProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-6">
          {bean.image_url && (
            <div className="relative w-48 h-48 rounded-lg overflow-hidden">
              <Image
                src={bean.image_url}
                alt={bean.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{bean.name}</CardTitle>
                <div className="flex items-center mt-2 text-muted-foreground">
                  <span>{typeof bean.roaster === 'string' ? bean.roaster : bean.roaster?.name}</span>
                </div>
              </div>
              {bean.rating != null && (
                <div className="flex items-center">
                  <Star className="h-5 w-5 fill-current text-yellow-400" />
                  <span className="ml-1 font-semibold">{bean.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            {bean.description && (
              <div className="mt-4">
                <p>{bean.description}</p>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bean.tasting_notes && bean.tasting_notes.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Tasting Notes</h4>
              <div className="flex flex-wrap gap-2">
                {bean.tasting_notes.map((note) => (
                  <Badge key={note} variant="secondary">
                    {note}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">Origin</h4>
              <p className="text-muted-foreground">{bean.origin || 'Not specified'}</p>
            </div>
            <div>
              <h4 className="font-semibold">Process</h4>
              <p className="text-muted-foreground">{bean.process || 'Not specified'}</p>
            </div>
            <div>
              <h4 className="font-semibold">Roast Level</h4>
              <p className="text-muted-foreground">{bean.roast_level || 'Not specified'}</p>
            </div>
            <div>
              <h4 className="font-semibold">Altitude</h4>
              <p className="text-muted-foreground">{bean.altitude || 'Not specified'}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}