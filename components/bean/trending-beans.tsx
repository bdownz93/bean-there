"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useStore } from "@/lib/store"
import { roasters } from "@/lib/data"
import { BeanCard } from "./bean-card"

export function TrendingBeans() {
  const { reviews } = useStore()
  
  // Get all beans
  const allBeans = roasters.flatMap(roaster => 
    roaster.beans.map(bean => ({
      ...bean,
      roaster: roaster.name
    }))
  )

  // Sort beans by number of reviews
  const trendingBeans = allBeans
    .map(bean => ({
      ...bean,
      reviewCount: (reviews || []).filter(r => r.beanId === bean.id).length
    }))
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 3)

  return (
    <div className="grid gap-6">
      {trendingBeans.map((bean) => (
        <BeanCard key={bean.id} bean={bean} />
      ))}
    </div>
  )
}