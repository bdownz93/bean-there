import { BeanProfile } from "@/components/bean/bean-profile"
import { BeanReviews } from "@/components/bean/bean-reviews"
import { roasters } from "@/lib/data"
import { notFound } from "next/navigation"

interface BeanPageProps {
  params: {
    slug: string
  }
}

export function generateStaticParams() {
  // Get all possible bean IDs
  const beanIds = roasters.flatMap(roaster => 
    roaster.beans.map(bean => ({
      slug: bean.id.toString()
    }))
  )
  return beanIds
}

export default function BeanPage({ params }: BeanPageProps) {
  const bean = roasters.flatMap(roaster => 
    roaster.beans.map(bean => ({
      ...bean,
      roaster: roaster.name
    }))
  ).find(b => b.id.toString() === params.slug)

  if (!bean) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <BeanProfile bean={bean} />
      <BeanReviews bean={bean} />
    </div>
  )
}