import { BeanList } from "@/components/bean/bean-list"
import { BeanHeader } from "@/components/bean/bean-header"
import { AddBeanForm } from "@/components/forms/add-bean-form"
import { BeansClient } from "@/components/bean/beans-client"
import { roasters } from "@/lib/data"

export default function BeansPage() {
  const allBeans = roasters.flatMap(roaster => 
    roaster.beans.map(bean => ({
      ...bean,
      roaster: roaster.name
    }))
  )

  return <BeansClient initialBeans={allBeans} />
}