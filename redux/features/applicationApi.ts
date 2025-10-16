import { ApiResponse } from "@/types";
import { api } from "../api/api";
import { tagTypes } from "../tabTypesList";

// Application types
export interface ApplicationDetails {
  moveInDate: string;
  leaseTerm: "6 months" | "1 year" | "18 months" | "2 years" | "month-to-month";
  monthlyIncome: number;
  employmentStatus:
    | "employed"
    | "self-employed"
    | "unemployed"
    | "student"
    | "retired";
  employerName?: string;
  employerPhone?: string;
  additionalInfo?: string;
}

export interface Application {
  _id: string;
  tenant: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  apartment: {
    _id: string;
    title: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    rent: {
      amount: number;
      currency: string;
      period: string;
    };
    images: string[];
  };
  applicationDetails: ApplicationDetails;
  status: "pending" | "under_review" | "approved" | "rejected" | "withdrawn";
  reviewNotes?: string;
  reviewedBy?: {
    _id: string;
    email: string;
  };
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApplicationData {
  apartmentId: string;
  applicationDetails: ApplicationDetails;
}

export interface UpdateApplicationData {
  applicationDetails?: Partial<ApplicationDetails>;
  status?: "pending" | "under_review" | "approved" | "rejected" | "withdrawn";
  reviewNotes?: string;
}

export interface ApplicationStats {
  total: number;
  pending: number;
  underReview: number;
  approved: number;
  rejected: number;
  withdrawn: number;
}

// API endpoints
export const applicationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all applications (admin only)
    getAllApplications: builder.query<ApiResponse<Application[]>, void>({
      query: () => ({
        url: "/applications",
        method: "GET",
      }),
      providesTags: [tagTypes.application],
    }),

    // Get applications by tenant
    getMyApplications: builder.query<
      ApiResponse<{ applications: Application[] }>,
      void
    >({
      query: () => ({
        url: "/applications/my-applications",
        method: "GET",
      }),
      providesTags: [tagTypes.application],
    }),

    // Get applications by owner (for their apartments)
    getApplicationsByOwner: builder.query<ApiResponse<Application[]>, void>({
      query: () => ({
        url: "/applications/owner/my-apartments-applications",
        method: "GET",
      }),
      providesTags: [tagTypes.application],
    }),

    // Get single application
    getApplicationById: builder.query<ApiResponse<Application>, string>({
      query: (id) => ({
        url: `/applications/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: tagTypes.application, id }],
    }),

    // Create application
    createApplication: builder.mutation<
      ApiResponse<Application>,
      CreateApplicationData
    >({
      query: (data) => ({
        url: "/applications",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [tagTypes.application],
    }),

    // Update application
    updateApplication: builder.mutation<
      ApiResponse<Application>,
      { id: string; data: UpdateApplicationData }
    >({
      query: ({ id, data }) => ({
        url: `/applications/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: tagTypes.application, id },
        tagTypes.application,
      ],
    }),

    // Review application (owner/admin)
    reviewApplication: builder.mutation<
      ApiResponse<Application>,
      {
        id: string;
        data: {
          status: "under_review" | "approved" | "rejected";
          reviewNotes?: string;
        };
      }
    >({
      query: ({ id, data }) => ({
        url: `/applications/${id}/review`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: tagTypes.application, id },
        tagTypes.application,
      ],
    }),

    // Admin review application
    adminReviewApplication: builder.mutation<
      ApiResponse<Application>,
      {
        id: string;
        data: {
          status: "under_review" | "approved" | "rejected";
          reviewNotes?: string;
        };
      }
    >({
      query: ({ id, data }) => ({
        url: `/applications/admin/${id}/review`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: tagTypes.application, id },
        tagTypes.application,
      ],
    }),

    // Delete application
    deleteApplication: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/applications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.application],
    }),

    // Admin delete application
    adminDeleteApplication: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/applications/admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.application],
    }),

    // Get application stats
    getApplicationStats: builder.query<ApiResponse<ApplicationStats>, void>({
      query: () => ({
        url: "/applications/admin/stats",
        method: "GET",
      }),
      providesTags: [tagTypes.application],
    }),
  }),
});

export const {
  useGetAllApplicationsQuery,
  useGetMyApplicationsQuery,
  useGetApplicationsByOwnerQuery,
  useGetApplicationByIdQuery,
  useCreateApplicationMutation,
  useUpdateApplicationMutation,
  useReviewApplicationMutation,
  useAdminReviewApplicationMutation,
  useDeleteApplicationMutation,
  useAdminDeleteApplicationMutation,
  useGetApplicationStatsQuery,
} = applicationApi;
