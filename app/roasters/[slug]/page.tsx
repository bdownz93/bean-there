import { RoasterProfile } from "@/components/roasters/roaster-profile"
import { BeanGrid } from "@/components/beans/grid"
import { getRoasterBySlug } from "@/lib/supabase"
import { notFound } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface RoasterPageProps {
  params: {
    slug: string
  }
}

export default async function RoasterPage({ params }: RoasterPageProps) {
  console.log(' Roaster page params:', params)

  if (!params.slug) {
    console.error(' No slug provided to RoasterPage')
    return notFound()
  }

  try {
    console.log(' Fetching roaster with slug:', params.slug)
    const roaster = await getRoasterBySlug(params.slug)
    console.log(' Roaster data:', roaster)

    if (!roaster) {
      console.log(' Roaster not found:', params.slug)
      return (
        <div className="container mx-auto py-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                Sorry, we couldn't find that roaster. It may have been removed or the URL might be incorrect.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }

    console.log(' Rendering roaster page for:', roaster.name)
    return (
      <div className="container mx-auto py-8 space-y-8">
        <RoasterProfile roaster={roaster} />
        {roaster.beans && roaster.beans.length > 0 && (
          <BeanGrid beans={roaster.beans} />
        )}
      </div>
    )
  } catch (error) {
    console.error(" Error loading roaster:", error)
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Sorry, there was an error loading this roaster. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }
}