"use client"

import { useState, useEffect } from "react"
import { BeanList } from "@/components/bean/bean-list"
import { BeanHeader } from "@/components/bean/bean-header"
import { AddBeanForm } from "@/components/forms/add-bean-form"
import { useStore } from "@/lib/store"
import type { Bean } from "@/lib/types"

interface BeansClientProps {
  initialBeans: Bean[]
}

export function BeansClient({ initialBeans }: BeansClientProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const { roasters } = useStore()
  const { triedBeans = [] } = useStore((state) => ({
    triedBeans: state.currentUser?.triedBeans || []
  }))

  const allBeans = (roasters || []).flatMap(roaster => 
    roaster.beans.map(bean => ({
      ...bean,
      roaster: roaster.name,
      tried: triedBeans.includes(bean.id)
    }))
  )

  const filteredBeans = searchTerm
    ? allBeans.filter(bean => 
        bean.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bean.roaster.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bean.origin.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allBeans

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex justify-between items-center">
        <BeanHeader onSearch={setSearchTerm} />
        <AddBeanForm />
      </div>
      <div className="mt-8">
        <BeanList beans={filteredBeans} />
      </div>
    </div>
  )
}