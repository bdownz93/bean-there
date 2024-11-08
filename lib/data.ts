// Mock data for development
export const roasters = [
  {
    id: "1",
    name: "Pilot Coffee Roasters",
    location: "Toronto, ON",
    description: "Specialty coffee roaster focused on quality and sustainability",
    logo_url: "https://images.unsplash.com/photo-1559122143-f4e9bf761285?w=800&auto=format&fit=crop&q=60",
    rating: 4.5,
    coordinates: { lat: 43.6534817, lng: -79.3839347 },
    specialties: ["Single Origin", "Espresso", "Cold Brew"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: null,
    beans: []
  },
  {
    id: "2", 
    name: "De Mello Coffee",
    location: "Toronto, ON",
    description: "Artisanal coffee roaster with a focus on direct trade relationships",
    logo_url: "https://images.unsplash.com/photo-1559122143-f4e9bf761285?w=800&auto=format&fit=crop&q=60",
    rating: 4.3,
    coordinates: { lat: 43.6505229, lng: -79.3978256 },
    specialties: ["Light Roast", "Pour Over", "Seasonal Blends"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: null,
    beans: []
  }
]