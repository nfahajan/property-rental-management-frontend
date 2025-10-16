import { ApiResponse } from "@/types";
import { api } from "../api/api";
import { tagTypes } from "../tabTypesList";

// Tenant types
export interface TenantProfile {
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
  user: {
    _id: string;
    email: string;
    roles: string[];
    status: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateTenantProfileData {
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
export const tenantApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all tenants (admin only)
    getAllTenants: builder.query<
      ApiResponse<{ tenants: TenantProfile[]; pagination: any }>,
      { page?: number; limit?: number; status?: string; search?: string } | void
    >({
      query: (params) => ({
        url: "/tenants",
        method: "GET",
        params: params || {},
      }),
      providesTags: [tagTypes.tenant],
    }),

    // Get tenant profile
    getTenantProfile: builder.query<ApiResponse<TenantProfile>, void>({
      query: () => ({
        url: "/tenants/profile",
        method: "GET",
      }),
      providesTags: [tagTypes.tenant],
    }),

    // Update tenant profile
    updateTenantProfile: builder.mutation<
      ApiResponse<TenantProfile>,
      UpdateTenantProfileData | FormData
    >({
      query: (data) => {
        // Check if data is FormData
        const isFormData = data instanceof FormData;

        return {
          url: "/tenants/profile",
          method: "PUT",
          body: data,
          // Don't set Content-Type for FormData, let the browser set it with boundary
          ...(isFormData && {
            formData: true,
          }),
        };
      },
      invalidatesTags: [tagTypes.tenant, tagTypes.user],
    }),

    // Update tenant status (admin only)
    updateTenantStatus: builder.mutation<
      ApiResponse<TenantProfile>,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/tenants/${id}`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: [tagTypes.tenant],
    }),

    // Change password
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
  useGetAllTenantsQuery,
  useGetTenantProfileQuery,
  useUpdateTenantProfileMutation,
  useUpdateTenantStatusMutation,
  useChangePasswordMutation,
} = tenantApi;
