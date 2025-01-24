'use client'

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface BeanListProps {
  initialBeans: any[]
  roasters: any[]
}

export function BeanList({ initialBeans, roasters }: BeanListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {initialBeans.map((bean) => {
        const roaster = roasters.find(r => r.id === bean.roaster_id)
        return (
          <Link key={bean.id} href={`/beans/${bean.id}`}>
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{bean.name}</CardTitle>
                <CardDescription>
                  by {roaster?.name || 'Unknown Roaster'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    {bean.origin && (
                      <Badge variant="secondary">
                        {bean.origin}
                      </Badge>
                    )}
                    {bean.process && (
                      <Badge variant="outline">
                        {bean.process}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {bean.description}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
