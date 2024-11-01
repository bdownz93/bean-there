"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Coffee } from "lucide-react"
import { BasicInfo } from "./coffee/basic-info"
import { FlavorProfile } from "./coffee/flavor-profile"
import { OriginProcess } from "./coffee/origin-process"
import { BrewingInfo } from "./coffee/brewing-info"

export function AddBeanForm() {
  const router = useRouter()
  const roasters = useStore((state) => state.roasters)
  const addBean = useStore((state) => state.addBean)
  const [open, setOpen] = useState(false)
  const [selectedRoaster, setSelectedRoaster] = useState("")
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([])
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([])
  const [selectedBrewMethods, setSelectedBrewMethods] = useState<string[]>([])
  const [isLimitedEdition, setIsLimitedEdition] = useState(false)
  const [isDecaf, setIsDecaf] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const bean = {
      name: formData.get("name") as string,
      origin: formData.get("origin") as string,
      roastLevel: formData.get("roastLevel") as string,
      process: formData.get("process") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      rating: 0,
      tastingNotes: selectedFlavors,
      altitude: formData.get("altitude") as string,
      variety: formData.get("variety") as string,
      harvest: formData.get("harvest") as string,
      image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=60",
      flavorProfile: [
        { name: "Aroma", intensity: parseInt(formData.get("aromaIntensity") as string) },
        { name: "Body", intensity: parseInt(formData.get("bodyIntensity") as string) },
        { name: "Acidity", intensity: parseInt(formData.get("acidityIntensity") as string) },
        { name: "Sweetness", intensity: parseInt(formData.get("sweetnessIntensity") as string) },
        { name: "Aftertaste", intensity: parseInt(formData.get("aftertasteIntensity") as string) }
      ],
      roastDate: formData.get("roastDate") as string,
      farm: formData.get("farm") as string,
      certifications: selectedCertifications,
      brewMethods: selectedBrewMethods,
      grindSize: formData.get("grindSize") as string,
      waterTemp: formData.get("waterTemp") as string,
      brewTime: formData.get("brewTime") as string,
      bagSizes: Array.from(formData.getAll("bagSizes")),
      isLimitedEdition,
      isDecaf,
      caffeineContent: formData.get("caffeineContent") as string,
      type: formData.get("type") as string
    }

    addBean(selectedRoaster, bean)
    setOpen(false)
    router.refresh()
  }

  const toggleFlavor = (flavor: string) => {
    setSelectedFlavors(prev =>
      prev.includes(flavor)
        ? prev.filter(f => f !== flavor)
        : [...prev, flavor]
    )
  }

  const toggleCertification = (cert: string) => {
    setSelectedCertifications(prev =>
      prev.includes(cert)
        ? prev.filter(c => c !== cert)
        : [...prev, cert]
    )
  }

  const toggleBrewMethod = (method: string) => {
    setSelectedBrewMethods(prev =>
      prev.includes(method)
        ? prev.filter(m => m !== method)
        : [...prev, method]
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Coffee className="mr-2 h-4 w-4" />
          Add Coffee Bean
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Coffee Bean</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="flavor">Flavor Profile</TabsTrigger>
              <TabsTrigger value="origin">Origin & Process</TabsTrigger>
              <TabsTrigger value="brewing">Brewing Info</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <BasicInfo
                roasters={roasters}
                selectedRoaster={selectedRoaster}
                setSelectedRoaster={setSelectedRoaster}
                selectedCertifications={selectedCertifications}
                toggleCertification={toggleCertification}
                isLimitedEdition={isLimitedEdition}
                setIsLimitedEdition={setIsLimitedEdition}
                isDecaf={isDecaf}
                setIsDecaf={setIsDecaf}
              />
            </TabsContent>

            <TabsContent value="flavor">
              <FlavorProfile
                selectedFlavors={selectedFlavors}
                toggleFlavor={toggleFlavor}
                isDecaf={isDecaf}
              />
            </TabsContent>

            <TabsContent value="origin">
              <OriginProcess />
            </TabsContent>

            <TabsContent value="brewing">
              <BrewingInfo
                selectedBrewMethods={selectedBrewMethods}
                toggleBrewMethod={toggleBrewMethod}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button type="submit">Add Coffee Bean</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}