import { ApiResponse } from "@/types";
import { api } from "../api/api";
import { tagTypes } from "../tabTypesList";
import { User } from "@/types/user";

interface ChangePasswordData {
  oldpassword: string;
  newpassword: string;
}

interface UpdateUserData {
  email?: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
}

interface CurrentUserResponse {
  user: User;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: "owner" | "tenant";
}

interface RegisterResponse {
  message: string;
  data: any;
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get current user info
    getCurrentUser: builder.query<ApiResponse<CurrentUserResponse>, void>({
      query: () => "/auth/me",
      providesTags: [{ type: tagTypes.user, id: "CURRENT" }],
    }),

    // Update current user profile
    updateCurrentUser: builder.mutation<ApiResponse<User>, UpdateUserData>({
      query: (data) => ({
        url: "/auth/me",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [
        { type: tagTypes.user, id: "CURRENT" },
        { type: tagTypes.user, id: "LIST" },
      ],
    }),

    // Change password
    changePassword: builder.mutation<
      ApiResponse<{ message: string }>,
      ChangePasswordData
    >({
      query: (data) => ({
        url: "/auth/change-password",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: tagTypes.user, id: "CURRENT" }],
    }),

    // Register new user (owner or tenant)
    register: builder.mutation<ApiResponse<RegisterResponse>, RegisterData>({
      query: ({ role, ...data }) => ({
        url: role === "owner" ? "/owners/register" : "/tenants/register",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        { type: tagTypes.user, id: "LIST" },
        { type: tagTypes.user, id: "STATS" },
      ],
    }),
  }),
});

export const {
  useGetCurrentUserQuery,
  useUpdateCurrentUserMutation,
  useChangePasswordMutation,
  useRegisterMutation,
} = authApi;
