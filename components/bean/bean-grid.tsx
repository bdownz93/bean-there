'use client'

import { BeanCard } from "@/components/beans/bean-card"
import type { Bean } from "@/lib/types"

interface BeanGridProps {
  beans: Bean[]
  title?: string
}

export function BeanGrid({ beans, title }: BeanGridProps) {
  return (
    <div className="space-y-4">
      {title && <h2 className="text-2xl font-semibold">{title}</h2>}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {beans.map((bean) => (
          <BeanCard key={bean.id} bean={bean} />
        ))}
      </div>
    </div>
  )
}