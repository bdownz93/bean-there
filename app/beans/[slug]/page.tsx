import { BeanProfile } from "@/components/bean/bean-profile"
import { BeanReviews } from "@/components/bean/bean-reviews"
import { roasters } from "@/lib/data"
import { notFound } from "next/navigation"
import { getBeanById } from "@/lib/beans"

interface BeanPageProps {
  params: {
    slug: string
  }
}

export function generateStaticParams() {
  return roasters.flatMap(roaster => 
    roaster.beans.map(bean => ({
      slug: bean.id
    }))
  )
}

export default function BeanPage({ params }: BeanPageProps) {
  const bean = getBeanById(params.slug)

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