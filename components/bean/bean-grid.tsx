import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Star } from "lucide-react"
import Link from "next/link"
import type { Bean } from "@/lib/types"

interface BeanGridProps {
  beans: Bean[]
}

export function BeanGrid({ beans }: BeanGridProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Available Beans</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {beans.map((bean) => (
          <Link key={bean.id} href={`/beans/${bean.id}`}>
            <Card className="h-full hover:bg-accent hover:text-accent-foreground transition-colors">
              <CardHeader>
                <h3 className="text-lg font-semibold">{bean.name}</h3>
                <p className="text-sm text-muted-foreground">{bean.origin}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-current text-yellow-400" />
                    <span className="ml-1 font-medium">{bean.rating.toFixed(1)}</span>
                  </div>
                  <span className="font-medium">${bean.price}</span>
                </div>
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {bean.tastingNotes.slice(0, 3).map((note) => (
                      <span
                        key={note}
                        className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}