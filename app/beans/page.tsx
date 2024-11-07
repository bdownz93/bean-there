import { BeansClient } from "@/components/bean/beans-client"
import { getAllBeans } from "@/lib/beans"

export default function BeansPage() {
  const allBeans = getAllBeans()
  return <BeansClient initialBeans={allBeans} />
}