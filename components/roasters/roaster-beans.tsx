import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Roaster } from "@/lib/types"

interface RoasterBeansProps {
  roaster: Roaster
}

export function RoasterBeans({ roaster }: RoasterBeansProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Beans</CardTitle>
      </CardHeader>
      <CardContent>
        {roaster.beans.length === 0 ? (
          <p className="text-muted-foreground">No beans available at the moment.</p>
        ) : (
          <div className="space-y-4">
            {roaster.beans.map((bean) => (
              <div key={bean.id} className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{bean.name}</h3>
                  <p className="text-sm text-muted-foreground">{bean.origin}</p>
                </div>
                <span className="text-sm font-medium">${bean.price}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}