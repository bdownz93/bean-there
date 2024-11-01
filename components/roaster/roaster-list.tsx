"use client"

import { RoasterCard } from "@/components/roaster/roaster-card"
import type { Roaster } from "@/lib/types"

interface RoasterListProps {
  roasters: Roaster[]
}

export function RoasterList({ roasters }: RoasterListProps) {
  return (
    <div className="grid gap-6 pt-8 md:grid-cols-2 lg:grid-cols-3">
      {roasters.map((roaster) => (
        <RoasterCard key={roaster.id} roaster={roaster} />
      ))}
    </div>
  )
}