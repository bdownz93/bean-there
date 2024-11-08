"use client"

import { useState } from "react"
import { BeanList } from "@/components/bean/bean-list"
import { BeanHeader } from "@/components/bean/bean-header"
import { searchBeans } from "@/lib/beans"
import { useQuery } from "@tanstack/react-query"
import type { Bean } from "@/lib/types"

interface BeansClientProps {
  initialBeans: Bean[]
}

export function BeansClient({ initialBeans }: BeansClientProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const { data: beans = initialBeans } = useQuery({
    queryKey: ["beans", searchQuery],
    queryFn: () => searchQuery ? searchBeans(searchQuery) : Promise.resolve(initialBeans),
    initialData: initialBeans
  })

  return (
    <div className="container px-4 py-8 mx-auto">
      <BeanHeader onSearch={setSearchQuery} />
      <div className="mt-8">
        <BeanList beans={beans} />
      </div>
    </div>
  )
}