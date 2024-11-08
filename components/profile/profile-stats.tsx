"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Coffee, MapPin, Star, Users, Award } from "lucide-react"

interface ProfileStatsProps {
  stats: {
    beansCount: number
    roastersCount: number
    reviewsCount: number
    level: number
    experiencePoints: number
    uniqueOrigins: number
  }
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Stats & Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Coffee className="h-4 w-4" />
              <span className="text-sm">Beans Tried</span>
            </div>
            <p className="text-2xl font-bold">{stats.beansCount}</p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">Roasters Visited</span>
            </div>
            <p className="text-2xl font-bold">{stats.roastersCount}</p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Star className="h-4 w-4" />
              <span className="text-sm">Reviews Written</span>
            </div>
            <p className="text-2xl font-bold">{stats.reviewsCount}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Award className="h-4 w-4" />
              <span className="text-sm">Level</span>
            </div>
            <p className="text-2xl font-bold">{stats.level}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-sm">Origins Tried</span>
            </div>
            <p className="text-2xl font-bold">{stats.uniqueOrigins}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Star className="h-4 w-4" />
              <span className="text-sm">XP Points</span>
            </div>
            <p className="text-2xl font-bold">{stats.experiencePoints}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}