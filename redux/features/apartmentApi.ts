import { ApiResponse } from "@/types";
import { api } from "../api/api";
import { tagTypes } from "../tabTypesList";

// Apartment types
export interface Apartment {
  _id: string;
  title: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  propertyDetails: {
    bedrooms: number;
    bathrooms: number;
    squareFeet: number;
    floorNumber?: number;
    totalFloors?: number;
    yearBuilt?: number;
  };
  amenities: string[];
  rent: {
    amount: number;
    currency: string;
    period: "monthly" | "weekly" | "daily";
  };
  utilities: {
    included: string[];
  };
  availability: {
    status: "available" | "rented" | "maintenance" | "unavailable";
    availableFrom?: string;
    leaseTerm?: string;
  };
  images: string[];
  owner: any;
  status: "active" | "inactive" | "pending" | "sold";
  createdAt: string;
  updatedAt: string;
}

export interface CreateApartmentData {
  title: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  propertyDetails: {
    bedrooms: number;
    bathrooms: number;
    squareFeet: number;
    floorNumber?: number;
    totalFloors?: number;
    yearBuilt?: number;
  };
  amenities: string[];
  rent: {
    amount: number;
    currency: string;
    period: "monthly" | "weekly" | "daily";
  };
  utilities: {
    included: string[];
  };
  availability: {
    status: "available" | "rented" | "maintenance" | "unavailable";
    availableFrom?: string;
    leaseTerm?: string;
  };
}

export interface ApartmentFilters {
  page?: number;
  limit?: number;
  status?: string;
  availability?: string;
  city?: string;
  state?: string;
  minRent?: number;
  maxRent?: number;
  bedrooms?: number;
  bathrooms?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface ApartmentResponse {
  apartments: Apartment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const apartmentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Create apartment
    createApartment: builder.mutation<
      ApiResponse<Apartment>,
      CreateApartmentData | FormData
    >({
      query: (data) => {
        // Check if data is FormData
        const isFormData = data instanceof FormData;

        return {
          url: "/apartments",
          method: "POST",
          body: data,
          // Don't set Content-Type for FormData, let the browser set it with boundary
          ...(isFormData && {
            formData: true,
          }),
        };
      },
      invalidatesTags: [{ type: tagTypes.apartment, id: "LIST" }],
    }),

    // Get all apartments
    getAllApartments: builder.query<
      ApiResponse<ApartmentResponse>,
      ApartmentFilters
    >({
      query: (params) => ({
        url: "/apartments",
        params,
      }),
      providesTags: [{ type: tagTypes.apartment, id: "LIST" }],
    }),

    // Get apartment by ID
    getApartmentById: builder.query<ApiResponse<Apartment>, string>({
      query: (id) => `/apartments/${id}`,
      providesTags: [{ type: tagTypes.apartment, id: "DETAIL" }],
    }),

    // Get owner's apartments
    getMyApartments: builder.query<
      ApiResponse<ApartmentResponse>,
      { page?: number; limit?: number; status?: string }
    >({
      query: (params) => ({
        url: "/apartments/owner/my-apartments",
        params,
      }),
      providesTags: [{ type: tagTypes.apartment, id: "MY_LIST" }],
    }),

    // Update apartment
    updateApartment: builder.mutation<
      ApiResponse<Apartment>,
      | { id: string; data: Partial<CreateApartmentData> & { status?: string } }
      | { id: string; data: FormData }
    >({
      query: ({ id, data }) => {
        // Check if data is FormData
        const isFormData = data instanceof FormData;

        return {
          url: `/apartments/${id}`,
          method: "PATCH",
          body: data,
          // Don't set Content-Type for FormData, let the browser set it with boundary
          ...(isFormData && {
            formData: true,
          }),
        };
      },
      invalidatesTags: [
        { type: tagTypes.apartment, id: "LIST" },
        { type: tagTypes.apartment, id: "MY_LIST" },
        { type: tagTypes.apartment, id: "DETAIL" },
      ],
    }),

    // Remove apartment image
    removeApartmentImage: builder.mutation<
      ApiResponse<Apartment>,
      { id: string; imageUrl: string }
    >({
      query: ({ id, imageUrl }) => ({
        url: `/apartments/${id}/remove-image`,
        method: "PATCH",
        body: { imageUrl },
      }),
      invalidatesTags: [
        { type: tagTypes.apartment, id: "LIST" },
        { type: tagTypes.apartment, id: "MY_LIST" },
        { type: tagTypes.apartment, id: "DETAIL" },
      ],
    }),

    // Delete apartment
    deleteApartment: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/apartments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: tagTypes.apartment, id: "LIST" },
        { type: tagTypes.apartment, id: "MY_LIST" },
      ],
    }),
  }),
});

export const {
  useCreateApartmentMutation,
  useGetAllApartmentsQuery,
  useGetApartmentByIdQuery,
  useGetMyApartmentsQuery,
  useUpdateApartmentMutation,
  useDeleteApartmentMutation,
  useRemoveApartmentImageMutation,
} = apartmentApi;
