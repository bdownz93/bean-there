import { RoasterProfile } from "@/components/roaster/roaster-profile"
import { BeanGrid } from "@/components/bean/bean-grid"
import { getRoasterBySlug, getAllRoasters } from "@/lib/supabase"
import { notFound } from "next/navigation"

interface RoasterPageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  const roasters = await getAllRoasters()
  return roasters.map((roaster) => ({
    slug: roaster.slug || ""
  }))
}

export default async function RoasterPage({ params }: RoasterPageProps) {
  const roaster = await getRoasterBySlug(params.slug)

  if (!roaster) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <RoasterProfile roaster={roaster} />
      <BeanGrid beans={roaster.beans} />
    </div>
  )
}