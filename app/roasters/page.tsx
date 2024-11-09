import { RoastersClient } from "@/components/roaster/roasters-client"
import { AddRoasterForm } from "@/components/forms/add-roaster-form"
import { getAllRoasters } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"

export default async function RoastersPage() {
  try {
    const roasters = await getAllRoasters()
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Coffee Roasters</h1>
            <p className="text-muted-foreground">
              Discover and add artisanal coffee roasters
            </p>
          </div>
          <AddRoasterForm />
        </div>
        <RoastersClient initialRoasters={roasters || []} />
      </div>
    )
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