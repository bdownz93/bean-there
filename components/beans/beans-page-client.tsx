'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { BeanForm } from "@/components/beans/bean-form"
import { RoasterForm } from "@/components/roasters/roaster-form"
import { BeanList } from "@/components/beans/bean-list"
import { Plus } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

interface BeansPageClientProps {
  initialBeans: any[]
  roasters: any[]
}

export function BeansPageClient({ initialBeans, roasters }: BeansPageClientProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [addBeanOpen, setAddBeanOpen] = useState(false)
  const [addRoasterOpen, setAddRoasterOpen] = useState(false)

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Coffee Beans</h1>
        {user && (
          <div className="flex gap-4">
            <Dialog open={addBeanOpen} onOpenChange={setAddBeanOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bean
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <BeanForm onSuccess={() => {
                  setAddBeanOpen(false)
                  router.refresh()
                }} />
              </DialogContent>
            </Dialog>

            <Dialog open={addRoasterOpen} onOpenChange={setAddRoasterOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Roaster
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <RoasterForm onSuccess={() => {
                  setAddRoasterOpen(false)
                  router.refresh()
                }} />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <BeanList initialBeans={initialBeans} roasters={roasters} />
    </div>
  )
}
