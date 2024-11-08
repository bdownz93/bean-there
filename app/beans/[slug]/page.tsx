import { BeanProfile } from "@/components/bean/bean-profile"
import { BeanReviews } from "@/components/bean/bean-reviews"
import { getBeanById } from "@/lib/beans"
import { notFound } from "next/navigation"

interface BeanPageProps {
  params: {
    slug: string
  }
}

export default async function BeanPage({ params }: BeanPageProps) {
  const bean = await getBeanById(params.slug)

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