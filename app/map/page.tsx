"use client"

import { useState } from "react"
import { MapHeader } from "@/components/map/map-header"
import { MapSidebar } from "@/components/map/map-sidebar"
import { MapView } from "@/components/map/map-view"
import { useStore } from "@/lib/store"
import { useQuery } from "@tanstack/react-query"
import { getAllRoasters } from "@/lib/supabase"

export default function MapPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const visitedRoasters = useStore((state) => state.visitedRoasters)

  const { data: roasters = [] } = useQuery({
    queryKey: ['roasters'],
    queryFn: getAllRoasters
  })

  const filteredRoasters = roasters.filter(roaster => 
    roaster.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    roaster.location?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-[calc(100vh-3.5rem)]">
      <div className="container h-full px-4 py-8 mx-auto">
        <MapHeader onFilter={setSearchQuery} />
        <div className="grid h-[calc(100%-5rem)] gap-6 mt-6 md:grid-cols-[350px,1fr]">
          <MapSidebar roasters={filteredRoasters} />
          <MapView roasters={filteredRoasters} visitedRoasters={visitedRoasters} />
        </div>
      </div>
    </div>
  )
}