import { BeanProfile } from "@/components/bean/bean-profile"
import { BeanReviews } from "@/components/bean/bean-reviews"
import { getBeanById } from "@/lib/supabase"
import { notFound } from "next/navigation"

interface BeanPageProps {
  params: {
    slug: string
  }
}

export default async function BeanPage({ params }: BeanPageProps) {
  try {
    const bean = await getBeanById(params.slug)

    if (!bean) {
      return notFound()
    }

    return (
      <div className="container mx-auto py-8 space-y-8">
        <BeanProfile bean={bean} />
        <BeanReviews bean={bean} />
      </div>
    )
  } catch (error) {
    console.error("Error loading bean:", error)
    return notFound()
  }
}