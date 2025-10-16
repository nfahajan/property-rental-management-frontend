export type UserRole = "admin" | "seller" | "buyer"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  phone?: string
  createdAt: string
}

export interface Property {
  id: string
  sellerId: string
  title: string
  description: string
  location: string
  city: string
  price: number
  type: "apartment" | "house" | "villa" | "condo"
  bedrooms: number
  bathrooms: number
  area: number
  images: string[]
  amenities: string[]
  status: "available" | "rented" | "pending"
  createdAt: string
}

export interface Booking {
  id: string
  propertyId: string
  buyerId: string
  sellerId: string
  startDate: string
  endDate: string
  totalPrice: number
  status: "pending" | "confirmed" | "cancelled" | "completed"
  message?: string
  createdAt: string
}

export interface SavedProperty {
  userId: string
  propertyId: string
  savedAt: string
}
