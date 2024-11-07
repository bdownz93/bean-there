import { roasters } from "./data"
import type { Bean } from "./types"

export function getAllBeans(): Bean[] {
  return roasters.flatMap(roaster => 
    roaster.beans.map(bean => ({
      ...bean,
      roaster: roaster.name,
      roasterId: roaster.id
    }))
  )
}

export function getBeanById(id: string): Bean | undefined {
  return getAllBeans().find(bean => bean.id === id)
}

export function getBeansByRoaster(roasterId: string): Bean[] {
  return getAllBeans().filter(bean => bean.roasterId === roasterId)
}

export function searchBeans(query: string): Bean[] {
  const searchTerm = query.toLowerCase()
  return getAllBeans().filter(bean => 
    bean.name.toLowerCase().includes(searchTerm) ||
    bean.roaster?.toLowerCase().includes(searchTerm) ||
    bean.origin.toLowerCase().includes(searchTerm) ||
    bean.tastingNotes.some(note => note.toLowerCase().includes(searchTerm))
  )
}