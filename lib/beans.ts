import type { Bean } from "./types"
import { supabase } from "./supabase"

export async function getAllBeans(): Promise<Bean[]> {
  const { data: beans, error } = await supabase
    .from('beans')
    .select(`
      *,
      roaster:roasters (
        id,
        name,
        slug
      )
    `)
    .order('name')

  if (error) {
    console.error('Error fetching beans:', error)
    return []
  }

  return beans.map(bean => ({
    id: bean.id,
    name: bean.name,
    roaster: bean.roaster.name,
    roasterId: bean.roaster.id,
    origin: bean.origin,
    roastLevel: bean.roast_level,
    process: bean.process,
    description: bean.description,
    price: bean.price,
    rating: bean.rating || 0,
    tastingNotes: bean.tasting_notes || [],
    altitude: bean.altitude,
    variety: bean.variety,
    harvest: bean.harvest,
    image: bean.image_url,
    flavorProfile: bean.flavor_profile || []
  }))
}

export async function getBeanById(id: string): Promise<Bean | null> {
  const { data: bean, error } = await supabase
    .from('beans')
    .select(`
      *,
      roaster:roasters (
        id,
        name,
        slug
      )
    `)
    .eq('id', id)
    .single()

  if (error || !bean) {
    console.error('Error fetching bean:', error)
    return null
  }

  return {
    id: bean.id,
    name: bean.name,
    roaster: bean.roaster.name,
    roasterId: bean.roaster.id,
    origin: bean.origin,
    roastLevel: bean.roast_level,
    process: bean.process,
    description: bean.description,
    price: bean.price,
    rating: bean.rating || 0,
    tastingNotes: bean.tasting_notes || [],
    altitude: bean.altitude,
    variety: bean.variety,
    harvest: bean.harvest,
    image: bean.image_url,
    flavorProfile: bean.flavor_profile || []
  }
}

export async function getBeansByRoaster(roasterId: string): Promise<Bean[]> {
  const { data: beans, error } = await supabase
    .from('beans')
    .select(`
      *,
      roaster:roasters (
        id,
        name,
        slug
      )
    `)
    .eq('roaster_id', roasterId)
    .order('name')

  if (error) {
    console.error('Error fetching beans:', error)
    return []
  }

  return beans.map(bean => ({
    id: bean.id,
    name: bean.name,
    roaster: bean.roaster.name,
    roasterId: bean.roaster.id,
    origin: bean.origin,
    roastLevel: bean.roast_level,
    process: bean.process,
    description: bean.description,
    price: bean.price,
    rating: bean.rating || 0,
    tastingNotes: bean.tasting_notes || [],
    altitude: bean.altitude,
    variety: bean.variety,
    harvest: bean.harvest,
    image: bean.image_url,
    flavorProfile: bean.flavor_profile || []
  }))
}

export async function searchBeans(query: string): Promise<Bean[]> {
  const { data: beans, error } = await supabase
    .from('beans')
    .select(`
      *,
      roaster:roasters (
        id,
        name,
        slug
      )
    `)
    .or(`
      name.ilike.%${query}%,
      origin.ilike.%${query}%,
      description.ilike.%${query}%
    `)
    .order('name')

  if (error) {
    console.error('Error searching beans:', error)
    return []
  }

  return beans.map(bean => ({
    id: bean.id,
    name: bean.name,
    roaster: bean.roaster.name,
    roasterId: bean.roaster.id,
    origin: bean.origin,
    roastLevel: bean.roast_level,
    process: bean.process,
    description: bean.description,
    price: bean.price,
    rating: bean.rating || 0,
    tastingNotes: bean.tasting_notes || [],
    altitude: bean.altitude,
    variety: bean.variety,
    harvest: bean.harvest,
    image: bean.image_url,
    flavorProfile: bean.flavor_profile || []
  }))
}