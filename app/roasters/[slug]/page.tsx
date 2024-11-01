import { RoasterProfile } from "@/components/roaster/roaster-profile"
import { BeanGrid } from "@/components/bean/bean-grid"
import { roasters } from "@/lib/data"
import { notFound } from "next/navigation"

interface RoasterPageProps {
  params: {
    slug: string
  }
}

export function generateStaticParams() {
  return roasters.map((roaster) => ({
    slug: roaster.slug,
  }))
}

export default function RoasterPage({ params }: RoasterPageProps) {
  const roaster = roasters.find((r) => r.slug === params.slug)

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