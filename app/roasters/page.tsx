import { RoastersClient } from "@/components/roaster/roasters-client"
import { AddRoasterForm } from "@/components/forms/add-roaster-form"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getServerSupabaseClient } from "@/lib/supabase-server"

export default async function RoastersPage() {
  try {
    const supabase = getServerSupabaseClient()
    
    const { data: roasters, error } = await supabase
      .from('roasters')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Error loading roasters:", error)
      throw error
    }

    if (!roasters) {
      throw new Error('Failed to load roasters')
    }

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
        <RoastersClient initialRoasters={roasters} />
      </div>
    )
  } catch (error) {
    console.error("Error loading roasters page:", error)
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