"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Card } from "@/components/ui/card"
import type { Roaster } from "@/lib/types"

const MapClient = dynamic(() => import("./map-client"), {
  ssr: false,
  loading: () => (
    <Card className="h-full flex items-center justify-center">
      Loading map...
    </Card>
  )
})

interface MapViewProps {
  roasters: Roaster[]
  visitedRoasters?: string[]
}

export function MapView({ roasters, visitedRoasters = [] }: MapViewProps) {
  return <MapClient roasters={roasters} visitedRoasters={visitedRoasters} />
}