import { RoasterProfile } from "@/components/roaster/roaster-profile"
import { BeanGrid } from "@/components/bean/bean-grid"
import { getRoasterBySlug } from "@/lib/supabase"
import { notFound } from "next/navigation"

interface RoasterPageProps {
  params: {
    slug: string
  }
}

export default async function RoasterPage({ params }: RoasterPageProps) {
  try {
    const roaster = await getRoasterBySlug(params.slug)

    if (!roaster) {
      return notFound()
    }

    return (
      <div className="container mx-auto py-8 space-y-8">
        <RoasterProfile roaster={roaster} />
        {roaster.beans && roaster.beans.length > 0 && (
          <BeanGrid beans={roaster.beans} />
        )}
      </div>
    )
  } catch (error) {
    console.error("Error loading roaster:", error)
    return notFound()
  }
}