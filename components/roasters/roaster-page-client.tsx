"use client"

import { RoasterProfile } from "@/components/roasters/roaster-profile"
import { BeanGrid } from "@/components/beans/grid"
import type { Roaster } from "@/lib/types"

interface RoasterPageClientProps {
  roaster: Roaster
}

export function RoasterPageClient({ roaster }: RoasterPageClientProps) {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <RoasterProfile roaster={roaster} />
      <BeanGrid beans={roaster.beans} />
    </div>
  )
}