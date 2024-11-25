'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ReviewForm } from "@/components/reviews/review-form"
import { BeanDetails } from "@/components/beans/bean-details"
import { Plus } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

interface BeanDetailsClientProps {
  bean: any
  reviews: any[]
}

export function BeanDetailsClient({ bean, reviews }: BeanDetailsClientProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [addReviewOpen, setAddReviewOpen] = useState(false)

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        {user && (
          <Dialog open={addReviewOpen} onOpenChange={setAddReviewOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Review
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogTitle>Add Review</DialogTitle>
              <DialogDescription>
                Share your thoughts about {bean.name}
              </DialogDescription>
              <ReviewForm 
                beanId={bean.id}
                onSuccess={() => {
                  setAddReviewOpen(false)
                  router.refresh()
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <BeanDetails bean={bean} reviews={reviews} />
    </div>
  )
}
