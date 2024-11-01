import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Roaster } from "@/lib/types"

interface RoasterLocationProps {
  roaster: Roaster
}

export function RoasterLocation({ roaster }: RoasterLocationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Location</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-[16/9] bg-muted rounded-lg">
          {/* Map implementation will go here */}
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Map View
          </div>
        </div>
      </CardContent>
    </Card>
  )
}