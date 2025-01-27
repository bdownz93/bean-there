import { RoastersClient } from "@/components/roasters/roasters-client"
import { AddRoasterForm } from "@/components/forms/add-roaster-form"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getServerSupabaseClient } from "@/lib/supabase-server"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function RoastersPage() {
  try {
    const supabase = getServerSupabaseClient()
    
    const { data: roasters, error } = await supabase
      .from('roasters')
      .select(`
        id,
        name,
        slug,
        location,
        description,
        logo_url,
        hero_image_url,
        created_at,
        updated_at,
        beans (
          id,
          name,
          slug,
          description,
          origin,
          roast_level,
          image_url,
          bean_ratings (
            rating
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Error loading roasters:", error)
      throw error
    }

    // Calculate average rating and total beans for each roaster
    const roastersWithStats = roasters?.map(roaster => {
      // Calculate average rating for each bean
      const beansWithRatings = roaster.beans?.map(bean => ({
        ...bean,
        average_rating: bean.bean_ratings ? 
          Number((bean.bean_ratings.reduce((acc: number, curr: any) => acc + curr.rating, 0) / bean.bean_ratings.length).toFixed(2)) : 
          null,
        total_ratings: bean.bean_ratings?.length || 0
      })) || []

      // Calculate roaster's average rating from bean ratings
      const validBeanRatings = beansWithRatings.filter(bean => bean.average_rating !== null)
      const roasterRating = validBeanRatings.length > 0
        ? Number((validBeanRatings.reduce((acc, bean) => acc + (bean.average_rating || 0), 0) / validBeanRatings.length).toFixed(2))
        : null

      return {
        ...roaster,
        beans: beansWithRatings,
        total_beans: roaster.beans?.length || 0,
        average_rating: roasterRating
      }
    }) || []

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
        <RoastersClient initialRoasters={roastersWithStats} />
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