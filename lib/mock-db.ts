import type { User, Property, Booking, SavedProperty } from "./types"

// Mock Users
export const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@rentals.com",
    name: "Admin User",
    role: "admin",
    avatar: "/admin-interface.png",
    phone: "+1234567890",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    email: "seller@rentals.com",
    name: "John Seller",
    role: "seller",
    avatar: "/market-seller.png",
    phone: "+1234567891",
    createdAt: "2024-01-02T00:00:00Z",
  },
  {
    id: "3",
    email: "buyer@rentals.com",
    name: "Jane Buyer",
    role: "buyer",
    avatar: "/buyer-at-market.png",
    phone: "+1234567892",
    createdAt: "2024-01-03T00:00:00Z",
  },
]

// Mock Properties
export const mockProperties: Property[] = [
  {
    id: "1",
    sellerId: "2",
    title: "Modern Downtown Apartment",
    description: "Beautiful modern apartment in the heart of downtown with stunning city views.",
    location: "123 Main St",
    city: "New York",
    price: 2500,
    type: "apartment",
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    images: ["/modern-apartment-living.png", "/cozy-apartment-living-room.png", "/cozy-apartment-bedroom.png"],
    amenities: ["WiFi", "Parking", "Gym", "Pool", "Security"],
    status: "available",
    createdAt: "2024-02-01T00:00:00Z",
  },
  {
    id: "2",
    sellerId: "2",
    title: "Luxury Beach Villa",
    description: "Stunning beachfront villa with private pool and ocean views.",
    location: "456 Ocean Drive",
    city: "Miami",
    price: 5000,
    type: "villa",
    bedrooms: 4,
    bathrooms: 3,
    area: 3000,
    images: ["/tropical-beach-villa.png", "/luxury-villa-pool.png", "/luxurious-villa-interior.png"],
    amenities: ["WiFi", "Parking", "Pool", "Beach Access", "Garden"],
    status: "available",
    createdAt: "2024-02-05T00:00:00Z",
  },
  {
    id: "3",
    sellerId: "2",
    title: "Cozy Suburban House",
    description: "Perfect family home in quiet neighborhood with large backyard.",
    location: "789 Elm Street",
    city: "Los Angeles",
    price: 3200,
    type: "house",
    bedrooms: 3,
    bathrooms: 2,
    area: 2000,
    images: ["/suburban-house.png", "/cozy-backyard.png", "/cozy-kitchen.png"],
    amenities: ["WiFi", "Parking", "Garden", "Pet Friendly"],
    status: "rented",
    createdAt: "2024-02-10T00:00:00Z",
  },
]

// Mock Bookings
export const mockBookings: Booking[] = [
  {
    id: "1",
    propertyId: "1",
    buyerId: "3",
    sellerId: "2",
    startDate: "2024-03-01",
    endDate: "2024-03-31",
    totalPrice: 2500,
    status: "confirmed",
    message: "Looking forward to staying here!",
    createdAt: "2024-02-15T00:00:00Z",
  },
]

// Mock Saved Properties
export const mockSavedProperties: SavedProperty[] = [
  {
    userId: "3",
    propertyId: "2",
    savedAt: "2024-02-20T00:00:00Z",
  },
]

// LocalStorage keys
const STORAGE_KEYS = {
  USERS: "rental_users",
  PROPERTIES: "rental_properties",
  BOOKINGS: "rental_bookings",
  SAVED: "rental_saved",
  CURRENT_USER: "rental_current_user",
}

// Initialize localStorage with mock data
export function initializeMockData() {
  if (typeof window === "undefined") return

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockUsers))
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROPERTIES)) {
    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(mockProperties))
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(mockBookings))
  }
  if (!localStorage.getItem(STORAGE_KEYS.SAVED)) {
    localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(mockSavedProperties))
  }
}

// Database operations
export const db = {
  users: {
    getAll: (): User[] => {
      const data = localStorage.getItem(STORAGE_KEYS.USERS)
      return data ? JSON.parse(data) : []
    },
    getById: (id: string): User | undefined => {
      const users = db.users.getAll()
      return users.find((u) => u.id === id)
    },
    getByEmail: (email: string): User | undefined => {
      const users = db.users.getAll()
      return users.find((u) => u.email === email)
    },
    create: (user: User): User => {
      const users = db.users.getAll()
      users.push(user)
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
      return user
    },
    update: (id: string, updates: Partial<User>): User | undefined => {
      const users = db.users.getAll()
      const index = users.findIndex((u) => u.id === id)
      if (index === -1) return undefined
      users[index] = { ...users[index], ...updates }
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
      return users[index]
    },
    delete: (id: string): boolean => {
      const users = db.users.getAll()
      const filtered = users.filter((u) => u.id !== id)
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered))
      return filtered.length < users.length
    },
  },
  properties: {
    getAll: (): Property[] => {
      const data = localStorage.getItem(STORAGE_KEYS.PROPERTIES)
      return data ? JSON.parse(data) : []
    },
    getById: (id: string): Property | undefined => {
      const properties = db.properties.getAll()
      return properties.find((p) => p.id === id)
    },
    getBySeller: (sellerId: string): Property[] => {
      const properties = db.properties.getAll()
      return properties.filter((p) => p.sellerId === sellerId)
    },
    create: (property: Property): Property => {
      const properties = db.properties.getAll()
      properties.push(property)
      localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties))
      return property
    },
    update: (id: string, updates: Partial<Property>): Property | undefined => {
      const properties = db.properties.getAll()
      const index = properties.findIndex((p) => p.id === id)
      if (index === -1) return undefined
      properties[index] = { ...properties[index], ...updates }
      localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties))
      return properties[index]
    },
    delete: (id: string): boolean => {
      const properties = db.properties.getAll()
      const filtered = properties.filter((p) => p.id !== id)
      localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(filtered))
      return filtered.length < properties.length
    },
  },
  bookings: {
    getAll: (): Booking[] => {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKINGS)
      return data ? JSON.parse(data) : []
    },
    getById: (id: string): Booking | undefined => {
      const bookings = db.bookings.getAll()
      return bookings.find((b) => b.id === id)
    },
    getByBuyer: (buyerId: string): Booking[] => {
      const bookings = db.bookings.getAll()
      return bookings.filter((b) => b.buyerId === buyerId)
    },
    getBySeller: (sellerId: string): Booking[] => {
      const bookings = db.bookings.getAll()
      return bookings.filter((b) => b.sellerId === sellerId)
    },
    create: (booking: Booking): Booking => {
      const bookings = db.bookings.getAll()
      bookings.push(booking)
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings))
      return booking
    },
    update: (id: string, updates: Partial<Booking>): Booking | undefined => {
      const bookings = db.bookings.getAll()
      const index = bookings.findIndex((b) => b.id === id)
      if (index === -1) return undefined
      bookings[index] = { ...bookings[index], ...updates }
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings))
      return bookings[index]
    },
    delete: (id: string): boolean => {
      const bookings = db.bookings.getAll()
      const filtered = bookings.filter((b) => b.id !== id)
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(filtered))
      return filtered.length < bookings.length
    },
  },
  saved: {
    getAll: (): SavedProperty[] => {
      const data = localStorage.getItem(STORAGE_KEYS.SAVED)
      return data ? JSON.parse(data) : []
    },
    getByUser: (userId: string): SavedProperty[] => {
      const saved = db.saved.getAll()
      return saved.filter((s) => s.userId === userId)
    },
    add: (userId: string, propertyId: string): SavedProperty => {
      const saved = db.saved.getAll()
      const newSaved: SavedProperty = {
        userId,
        propertyId,
        savedAt: new Date().toISOString(),
      }
      saved.push(newSaved)
      localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(saved))
      return newSaved
    },
    remove: (userId: string, propertyId: string): boolean => {
      const saved = db.saved.getAll()
      const filtered = saved.filter((s) => !(s.userId === userId && s.propertyId === propertyId))
      localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(filtered))
      return filtered.length < saved.length
    },
  },
}
