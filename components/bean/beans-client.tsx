"use client"

import { useState } from "react"
import { BeanList } from "@/components/bean/bean-list"
import { BeanHeader } from "@/components/bean/bean-header"
import { AddBeanForm } from "@/components/forms/add-bean-form"
import { useQuery } from "@tanstack/react-query"
import { getAllBeans } from "@/lib/supabase"
import type { Bean, Roaster } from "@/lib/types"

interface BeansClientProps {
  initialBeans: Bean[]
  roasters: Roaster[]
}

export function BeansClient({ initialBeans, roasters }: BeansClientProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const { data: beans = initialBeans } = useQuery({
    queryKey: ["beans"],
    queryFn: getAllBeans,
    initialData: initialBeans,
    staleTime: 1000 * 60 // 1 minute
  })

  const filteredBeans = searchQuery
    ? beans.filter(bean =>
        bean.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bean.roaster.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bean.origin?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : beans

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
        <BeanHeader onSearch={setSearchQuery} />
        <AddBeanForm roasters={roasters} />
      </div>
      <div className="mt-8">
        <BeanList beans={filteredBeans} />
      </div>
    </div>
  )
}