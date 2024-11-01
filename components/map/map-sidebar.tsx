"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { RoasterCard } from "@/components/roaster/roaster-card"
import type { Roaster } from "@/lib/types"

interface MapSidebarProps {
  roasters: Roaster[]
}

export function MapSidebar({ roasters }: MapSidebarProps) {
  return (
    <Card className="h-full">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          {roasters.map((roaster) => (
            <div key={roaster.id}>
              <RoasterCard roaster={roaster} />
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
}