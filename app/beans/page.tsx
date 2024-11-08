import { BeansClient } from "@/components/bean/beans-client"
import { getAllBeans } from "@/lib/beans"

export default async function BeansPage() {
  const beans = await getAllBeans()
  return <BeansClient initialBeans={beans} />
}