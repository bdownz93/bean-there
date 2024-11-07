"use client"

import { useState } from "react"
import { BeanList } from "@/components/bean/bean-list"
import { BeanHeader } from "@/components/bean/bean-header"
import { searchBeans } from "@/lib/beans"
import type { Bean } from "@/lib/types"

interface BeansClientProps {
  initialBeans: Bean[]
}

export function BeansClient({ initialBeans }: BeansClientProps) {
  const [beans, setBeans] = useState(initialBeans)

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setBeans(initialBeans)
      return
    }
    const results = searchBeans(query)
    setBeans(results)
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <BeanHeader onSearch={handleSearch} />
      <div className="mt-8">
        <BeanList beans={beans} />
      </div>
    </div>
  )
}