import { RoastersClient } from "@/components/roaster/roasters-client"
import { roasters } from "@/lib/data"

export default function RoastersPage() {
  return <RoastersClient initialRoasters={roasters} />
}