"use client"

import { useState } from "react"
import { MapHeader } from "@/components/map/map-header"
import { MapSidebar } from "@/components/map/map-sidebar"
import { MapView } from "@/components/map/map-view"
import { useStore } from "@/lib/store"
import { roasters } from "@/lib/data"
import type { Roaster } from "@/lib/types"

export default function MapPage() {
  const [filteredRoasters, setFilteredRoasters] = useState<Roaster[]>(roasters)
  const visitedRoasters = useStore((state) => state.visitedRoasters)

  return (
    <div className="h-[calc(100vh-3.5rem)]">
      <div className="container h-full px-4 py-8 mx-auto">
        <MapHeader onFilter={setFilteredRoasters} />
        <div className="grid h-[calc(100%-5rem)] gap-6 mt-6 md:grid-cols-[350px,1fr]">
          <MapSidebar roasters={filteredRoasters} />
          <MapView roasters={filteredRoasters} visitedRoasters={visitedRoasters} />
        </div>
      </div>
    </div>
  )
}