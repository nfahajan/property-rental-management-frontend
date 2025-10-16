import { z } from "zod";

export const apartmentSchema = z.object({
  // Basic Information
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title cannot exceed 100 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description cannot exceed 2000 characters"),

  // Address
  address: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(1, "Zip code is required"),
    country: z.string().min(1, "Country is required").default("USA"),
  }),

  // Property Details
  propertyDetails: z.object({
    bedrooms: z
      .number()
      .min(0, "Bedrooms cannot be negative")
      .max(20, "Bedrooms cannot exceed 20"),
    bathrooms: z
      .number()
      .min(0, "Bathrooms cannot be negative")
      .max(20, "Bathrooms cannot exceed 20"),
    squareFeet: z
      .number()
      .min(1, "Square feet must be at least 1")
      .max(100000, "Square feet cannot exceed 100,000"),
    floorNumber: z
      .number()
      .min(0, "Floor number cannot be negative")
      .optional(),
    totalFloors: z
      .number()
      .min(1, "Total floors must be at least 1")
      .optional(),
    yearBuilt: z
      .number()
      .min(1800, "Year built cannot be before 1800")
      .max(new Date().getFullYear() + 5, "Year built cannot be in the future")
      .optional(),
  }),

  // Amenities
  amenities: z.array(z.string()).default([]),

  // Rent Information
  rent: z.object({
    amount: z
      .number()
      .min(0, "Rent amount cannot be negative")
      .max(1000000, "Rent amount cannot exceed 1,000,000"),
    currency: z.enum(["USD", "EUR", "GBP", "CAD", "AUD"]).default("USD"),
    period: z.enum(["monthly", "weekly", "daily"]).default("monthly"),
  }),

  // Utilities
  utilities: z.object({
    included: z.array(z.string()).default([]),
  }),

  // Availability
  availability: z.object({
    status: z
      .enum(["available", "rented", "maintenance", "unavailable"])
      .default("available"),
    availableFrom: z.string().optional(),
    leaseTerm: z.string().optional(),
  }),
});

export type ApartmentFormData = z.infer<typeof apartmentSchema>;
