import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star } from "lucide-react"
import { useStore } from "@/lib/store"
import type { Bean } from "@/lib/types"

interface BeanCardProps {
  bean: Bean
}

export function BeanCard({ bean }: BeanCardProps) {
  const triedBeans = useStore((state) => state.triedBeans)
  const isTried = triedBeans.includes(bean.id)

  return (
    <Link href={`/beans/${bean.id}`}>
      <Card className="hover:bg-accent hover:text-accent-foreground transition-colors">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg truncate">{bean.name}</h3>
                {isTried && (
                  <Badge variant="secondary" className="shrink-0">
                    <Check className="h-3 w-3 mr-1" />
                    Tried
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground truncate">
                by {bean.roaster}
              </div>
            </div>
            <div className="flex items-center shrink-0 ml-2">
              <Star className="h-4 w-4 fill-current text-yellow-400" />
              <span className="ml-1 text-sm font-medium">{bean.rating.toFixed(1)}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1 min-w-0">
                <div className="text-sm text-muted-foreground">Origin</div>
                <div className="font-medium truncate">{bean.origin}</div>
              </div>
              <div className="space-y-1 text-right shrink-0 ml-2">
                <div className="text-sm text-muted-foreground">Roast Level</div>
                <div className="font-medium">{bean.roastLevel}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {bean.tastingNotes.map((note) => (
                <Badge key={note} variant="secondary">
                  {note}
                </Badge>
              ))}
            </div>
            <div className="text-lg font-semibold">${bean.price.toFixed(2)}</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}