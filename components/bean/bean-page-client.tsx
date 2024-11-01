"use client"

import { BeanProfile } from "@/components/bean/bean-profile"
import { BeanReviews } from "@/components/bean/bean-reviews"
import type { Bean } from "@/lib/types"

interface BeanPageClientProps {
  bean: Bean
}

export function BeanPageClient({ bean }: BeanPageClientProps) {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <BeanProfile bean={bean} />
      <BeanReviews bean={bean} />
    </div>
  )
}