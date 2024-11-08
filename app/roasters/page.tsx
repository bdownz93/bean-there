import { RoastersClient } from "@/components/roaster/roasters-client"
import { getAllRoasters } from "@/lib/supabase"

export default async function RoastersPage() {
  const roasters = await getAllRoasters()
  return <RoastersClient initialRoasters={roasters} />
}