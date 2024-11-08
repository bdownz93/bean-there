"use client"

import { useState } from "react"
import { RoasterList } from "@/components/roaster/roaster-list"
import { RoasterHeader } from "@/components/roaster/roaster-header"
import { AddRoasterForm } from "@/components/forms/add-roaster-form"
import { MapView } from "@/components/map/map-view"
import { useStore } from "@/lib/store"
import { useQuery } from "@tanstack/react-query"
import { getAllRoasters } from "@/lib/supabase"
import type { Roaster } from "@/lib/types"

interface RoastersClientProps {
  initialRoasters: Roaster[]
}

export function RoastersClient({ initialRoasters }: RoastersClientProps) {
  const [showMap, setShowMap] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const visitedRoasters = useStore((state) => state.visitedRoasters)

  // Use React Query to fetch and cache roasters
  const { data: roasters = initialRoasters } = useQuery({
    queryKey: ['roasters'],
    queryFn: getAllRoasters,
    initialData: initialRoasters,
    staleTime: 1000 * 60 * 5 // Consider data fresh for 5 minutes
  })

  const filteredRoasters = roasters.filter(roaster => 
    roaster.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    roaster.location?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <RoasterHeader 
          showMap={showMap} 
          onToggleMap={() => setShowMap(!showMap)}
          onSearch={setSearchQuery}
        />
        <AddRoasterForm />
      </div>
      
      {showMap && (
        <div className="mt-8 h-[300px] sm:h-[400px] rounded-lg overflow-hidden">
          <MapView 
            roasters={filteredRoasters}
            visitedRoasters={visitedRoasters} 
          />
        </div>
      )}

      <div className={showMap ? "mt-8" : ""}>
        <RoasterList roasters={filteredRoasters} />
      </div>
    </div>
  )
}