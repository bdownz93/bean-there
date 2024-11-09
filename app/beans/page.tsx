import { BeansClient } from "@/components/bean/beans-client"
import { getAllBeans, getAllRoasters } from "@/lib/supabase"

export default async function BeansPage() {
  try {
    const [beans, roasters] = await Promise.all([
      getAllBeans(),
      getAllRoasters()
    ])

    return <BeansClient initialBeans={beans} roasters={roasters} />
  } catch (error) {
    console.error("Error loading beans page:", error)
    return <div>Error loading beans. Please try again later.</div>
  }
}