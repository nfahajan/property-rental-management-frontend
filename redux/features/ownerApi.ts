import { ApiResponse } from "@/types";
import { api } from "../api/api";
import { tagTypes } from "../tabTypesList";

// Owner types
export interface OwnerProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage?: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  businessInfo?: {
    businessName?: string;
    businessType?: string;
    taxId?: string;
    licenseNumber?: string;
  };
  user: {
    _id: string;
    email: string;
    roles: string[];
    status: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOwnerProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  profileImage?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// API endpoints
export const ownerApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all owners (admin only)
    getAllOwners: builder.query<
      ApiResponse<{ owners: OwnerProfile[]; pagination: any }>,
      { page?: number; limit?: number; status?: string; search?: string } | void
    >({
      query: (params) => ({
        url: "/owners",
        method: "GET",
        params: params || {},
      }),
      providesTags: [tagTypes.owner],
    }),

    // Get owner profile
    getOwnerProfile: builder.query<ApiResponse<OwnerProfile>, void>({
      query: () => ({
        url: "/owners/profile",
        method: "GET",
      }),
      providesTags: [tagTypes.owner],
    }),

    // Update owner profile
    updateOwnerProfile: builder.mutation<
      ApiResponse<OwnerProfile>,
      UpdateOwnerProfileData | FormData
    >({
      query: (data) => {
        // Check if data is FormData
        const isFormData = data instanceof FormData;

        return {
          url: "/owners/profile",
          method: "PATCH",
          body: data,
          // Don't set Content-Type for FormData, let the browser set it with boundary
          ...(isFormData && {
            formData: true,
          }),
        };
      },
      invalidatesTags: [tagTypes.owner, tagTypes.user],
    }),

    // Update owner status (admin only)
    updateOwnerStatus: builder.mutation<
      ApiResponse<OwnerProfile>,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/owners/${id}`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: [tagTypes.owner],
    }),

    // Change password (reuses auth endpoint)
    changePassword: builder.mutation<ApiResponse<null>, ChangePasswordData>({
      query: (data) => ({
        url: "/auth/change-password",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetAllOwnersQuery,
  useGetOwnerProfileQuery,
  useUpdateOwnerProfileMutation,
  useUpdateOwnerStatusMutation,
  useChangePasswordMutation,
} = ownerApi;
