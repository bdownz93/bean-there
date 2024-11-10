"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import type { Bean } from "@/lib/types"

interface BeanCardProps {
  bean: Bean
}

export function BeanCard({ bean }: BeanCardProps) {
  return (
    <Link href={`/beans/${bean.id}`}>
      <Card className="h-full hover:bg-accent hover:text-accent-foreground transition-colors">
        <CardHeader className="space-y-2">
          {bean.image && (
            <div className="relative aspect-square rounded-md overflow-hidden">
              <Image
                src={bean.image}
                alt={bean.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          )}
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-lg leading-none">{bean.name}</h3>
              <div className="flex items-center shrink-0">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="ml-1 text-sm font-medium">
                  {bean.rating?.toFixed(1)}
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              by {bean.roasterName}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Origin</p>
                <p className="font-medium">{bean.origin}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Process</p>
                <p className="font-medium">{bean.process}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {bean.tastingNotes?.map((note) => (
                <Badge key={note} variant="secondary">
                  {note}
                </Badge>
              ))}
            </div>
            {bean.price && (
              <div className="text-lg font-semibold">
                ${bean.price.toFixed(2)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}