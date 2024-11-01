"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Bean } from "@/lib/types"

interface BeanListProps {
  beans: (Bean & { tried?: boolean })[]
}

export function BeanList({ beans }: BeanListProps) {
  if (!beans || beans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No beans found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No coffee beans available at the moment.</p>
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
              {bean.image && (
                <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={bean.image}
                    alt={bean.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{bean.name}</h3>
                    {bean.tried && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Tried
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    by {bean.roaster}
                  </div>
                </div>
                {bean.rating && (
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
                    <div className="font-medium">{bean.origin}</div>
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="text-sm text-muted-foreground">Roast Level</div>
                    <div className="font-medium">{bean.roastLevel}</div>
                  </div>
                </div>
                {bean.tastingNotes && bean.tastingNotes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {bean.tastingNotes.map((note) => (
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