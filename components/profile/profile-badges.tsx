"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProfileBadgesProps {
  badges: Array<{
    id: string
    name: string
    description: string
    icon: string
    category: string
    earnedAt: string
  }>
}

export function ProfileBadges({ badges }: ProfileBadgesProps) {
  const categoryColors = {
    milestone: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    achievement: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    level: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    special: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    community: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    expertise: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    contribution: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Badges & Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <div className="text-3xl">{badge.icon}</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{badge.name}</h4>
                  <Badge 
                    variant="secondary"
                    className={cn("text-xs", categoryColors[badge.category as keyof typeof categoryColors])}
                  >
                    {badge.category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {badge.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  Earned {new Date(badge.earnedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}