import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import type { Bean } from "@/lib/types"

interface BeanDetailsProps {
  bean: Bean
}

export function BeanDetails({ bean }: BeanDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bean Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="profile">Flavor Profile</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <div className="text-sm text-muted-foreground">Origin</div>
                <div className="font-medium">{bean.origin}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Process</div>
                <div className="font-medium">{bean.process}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Altitude</div>
                <div className="font-medium">{bean.altitude}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Variety</div>
                <div className="font-medium">{bean.variety}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Harvest</div>
                <div className="font-medium">{bean.harvest}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Roast Level</div>
                <div className="font-medium">{bean.roastLevel}</div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="profile">
            <div className="space-y-4">
              {bean.flavorProfile?.map((flavor) => (
                <div key={flavor.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{flavor.name}</span>
                    <span className="font-medium">{flavor.intensity}%</span>
                  </div>
                  <Progress value={flavor.intensity} className="h-2" />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}