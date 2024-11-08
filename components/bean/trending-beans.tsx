"use client"

import { Card, CardContent } from "@/components/ui/card"
import { BeanCard } from "./bean-card"

interface TrendingBeansProps {
  beans: any[]
  reviews: any[]
}

export function TrendingBeans({ beans, reviews }: TrendingBeansProps) {
  // Sort beans by number of reviews
  const trendingBeans = beans
    .map(bean => ({
      ...bean,
      reviewCount: reviews.filter(r => r.bean_id === bean.id).length
    }))
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 3)

  if (trendingBeans.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No beans found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6">
      {trendingBeans.map((bean) => (
        <BeanCard 
          key={bean.id} 
          bean={{
            ...bean,
            roaster: bean.roasters?.name || "Unknown Roaster"
          }} 
        />
      ))}
    </div>
  )
}