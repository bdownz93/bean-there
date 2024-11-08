import { RoastersClient } from "@/components/roaster/roasters-client"
import { getAllRoasters } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"

export default async function RoastersPage() {
  try {
    const roasters = await getAllRoasters()
    return <RoastersClient initialRoasters={roasters || []} />
  } catch (error) {
    console.error("Error loading roasters:", error)
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Unable to load roasters. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }
}