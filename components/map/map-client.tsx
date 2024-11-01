"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import { Card } from "@/components/ui/card"
import type { Roaster } from "@/lib/types"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

interface MapClientProps {
  roasters: Roaster[]
  visitedRoasters?: string[]
}

export default function MapClient({ roasters, visitedRoasters = [] }: MapClientProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Card className="h-full flex items-center justify-center">
        Loading map...
      </Card>
    )
  }

  // Create custom icons for visited and unvisited roasters
  const defaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  })

  const visitedIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  })

  // Center of USA as default
  const center: [number, number] = [39.8283, -98.5795]

  return (
    <Card className="h-full">
      <MapContainer
        center={center}
        zoom={4}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {roasters.map((roaster) => (
          <Marker
            key={roaster.id}
            position={[roaster.coordinates.lat, roaster.coordinates.lng]}
            icon={visitedRoasters.includes(roaster.id) ? visitedIcon : defaultIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{roaster.name}</h3>
                <p className="text-sm text-muted-foreground">{roaster.location}</p>
                {visitedRoasters.includes(roaster.id) && (
                  <p className="text-sm text-green-600 mt-1">✓ Visited</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Card>
  )
}