import { z } from "zod";

// Application form validation schema
export const applicationSchema = z.object({
  moveInDate: z
    .string()
    .min(1, "Move-in date is required")
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, "Move-in date must be today or in the future"),

  leaseTerm: z.enum(
    ["6 months", "1 year", "18 months", "2 years", "month-to-month"],
    {
      message: "Please select a lease term",
    }
  ),

  monthlyIncome: z
    .number()
    .min(1, "Monthly income is required")
    .min(0, "Monthly income cannot be negative"),
  employmentStatus: z.enum(
    ["employed", "self-employed", "unemployed", "student", "retired"],
    {
      message: "Please select your employment status",
    }
  ),

  employerName: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim().length === 0) return true;
      return val.trim().length >= 2;
    }, "Employer name must be at least 2 characters if provided"),

  employerPhone: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim().length === 0) return true;
      // Basic phone validation - at least 10 digits
      const phoneRegex = /^\d{10,}$/;
      const cleanPhone = val.replace(/\D/g, "");
      return phoneRegex.test(cleanPhone);
    }, "Please enter a valid phone number if provided"),

  additionalInfo: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim().length === 0) return true;
      return val.trim().length <= 1000;
    }, "Additional information cannot exceed 1000 characters"),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;

// Search and filter validation schema
export const propertySearchSchema = z.object({
  search: z.string().optional(),
  minRent: z.number().min(0).optional(),
  maxRent: z.number().min(0).optional(),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  sortBy: z
    .enum([
      "rent_asc",
      "rent_desc",
      "newest",
      "oldest",
      "bedrooms",
      "bathrooms",
    ])
    .optional(),
});

export type PropertySearchData = z.infer<typeof propertySearchSchema>;
