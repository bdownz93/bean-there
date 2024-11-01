import { Roaster } from "./types"

export const roasters: Roaster[] = [
  {
    id: "1",
    slug: "stumptown-coffee",
    name: "Stumptown Coffee Roasters",
    location: "Portland, OR",
    description: "Pioneering direct trade coffee since 1999.",
    rating: 4.8,
    logo: "https://images.unsplash.com/photo-1559122143-f4e9bf761285?w=800&auto=format&fit=crop&q=60",
    specialties: ["Single Origin", "Espresso Blends", "Cold Brew"],
    coordinates: {
      lat: 45.5155,
      lng: -122.6789
    },
    beans: [
      {
        id: "1",
        name: "Hair Bender Espresso",
        origin: "Multi-Region Blend",
        price: 16.00,
        rating: 4.9,
        process: "Washed",
        altitude: "Various",
        variety: "Various",
        harvest: "2023",
        roastLevel: "Medium",
        image: "https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=800&auto=format&fit=crop&q=60",
        description: "Our flagship espresso blend featuring complex layers of sweet and savory flavors.",
        tastingNotes: ["Dark Chocolate", "Caramel", "Citrus"],
        flavorProfile: [
          { name: "Sweetness", intensity: 85 },
          { name: "Acidity", intensity: 70 },
          { name: "Body", intensity: 80 },
        ],
        reviews: [
          {
            id: "1",
            userId: "user1",
            userName: "Coffee Lover",
            userImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
            rating: 5,
            content: "The perfect morning espresso. Rich and complex with a beautiful crema.",
            date: "2024-03-20T08:00:00.000Z"
          }
        ]
      }
    ]
  },
  {
    id: "2",
    slug: "blue-bottle",
    name: "Blue Bottle Coffee",
    location: "Oakland, CA",
    description: "Delicious, sustainable coffee.",
    rating: 4.7,
    logo: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&auto=format&fit=crop&q=60",
    specialties: ["Single Origin", "Blends", "Pour Over"],
    coordinates: {
      lat: 37.8044,
      lng: -122.2711
    },
    beans: [
      {
        id: "2",
        name: "Three Africas",
        origin: "Africa Blend",
        price: 19.00,
        rating: 4.8,
        process: "Washed/Natural",
        altitude: "1,700-2,000m",
        variety: "Various",
        harvest: "2023",
        roastLevel: "Medium",
        image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=60",
        description: "A blend of Ethiopian, Ugandan, and other African beans creating a fruit-forward cup.",
        tastingNotes: ["Blueberry", "Citrus", "Dark Chocolate"],
        flavorProfile: [
          { name: "Sweetness", intensity: 80 },
          { name: "Acidity", intensity: 75 },
          { name: "Body", intensity: 70 },
        ],
        reviews: []
      }
    ]
  }
]