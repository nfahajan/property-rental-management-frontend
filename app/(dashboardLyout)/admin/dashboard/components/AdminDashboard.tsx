"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  Building2,
  FileText,
  Home,
  UserCheck,
  UserPlus,
  TrendingUp,
  AlertCircle,
  Activity,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  Shield,
} from "lucide-react";
import { useGetAllApartmentsQuery } from "@/redux/features/apartmentApi";
import { useGetApplicationStatsQuery } from "@/redux/features/applicationApi";
import { useGetAllTenantsQuery } from "@/redux/features/tenantApi";
import { useGetAllOwnersQuery } from "@/redux/features/ownerApi";
import { formatCurrency } from "@/lib/utils";

export default function AdminDashboard() {
  const router = useRouter();

  const {
    data: tenantsResponse,
    isLoading: isLoadingTenants,
    error: tenantsError,
  } = useGetAllTenantsQuery({ page: 1, limit: 1000 });

  const {
    data: ownersResponse,
    isLoading: isLoadingOwners,
    error: ownersError,
  } = useGetAllOwnersQuery({ page: 1, limit: 1000 });

  const {
    data: apartmentsResponse,
    isLoading: isLoadingApartments,
    error: apartmentsError,
  } = useGetAllApartmentsQuery({});

  const {
    data: applicationStatsResponse,
    isLoading: isLoadingAppStats,
    error: appStatsError,
  } = useGetApplicationStatsQuery();

  // Extract tenants data
  const tenants = useMemo(() => {
    if (!tenantsResponse?.data) return [];
    const data = tenantsResponse.data as any;
    if (data.tenants && Array.isArray(data.tenants)) {
      return data.tenants;
    }
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  }, [tenantsResponse]);

  // Extract owners data
  const owners = useMemo(() => {
    if (!ownersResponse?.data) return [];
    const data = ownersResponse.data as any;
    if (data.owners && Array.isArray(data.owners)) {
      return data.owners;
    }
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  }, [ownersResponse]);

  // Combine all users
  const allUsers = useMemo(() => {
    return [...tenants, ...owners];
  }, [tenants, owners]);

  // Extract apartments data
  const apartments = useMemo(() => {
    if (!apartmentsResponse?.data) return [];
    const data = apartmentsResponse.data as any;
    if (data.apartments && Array.isArray(data.apartments)) {
      return data.apartments;
    }
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  }, [apartmentsResponse]);

  // Extract application stats
  const applicationStats = useMemo(() => {
    if (!applicationStatsResponse?.data) return null;
    return applicationStatsResponse.data as any;
  }, [applicationStatsResponse]);

  // Calculate comprehensive statistics
  const stats = useMemo(() => {
    // User statistics
    const totalUsers = allUsers.length;
    const ownersCount = owners.length;
    const tenantsCount = tenants.length;
    const admins = 0; // Would need separate admin endpoint

    // Count users by status
    const activeUsers = allUsers.filter(
      (user: any) => user.user?.status === "approved"
    ).length;
    const pendingUsers = allUsers.filter(
      (user: any) => user.user?.status === "pending"
    ).length;
    const blockedUsers = allUsers.filter(
      (user: any) => user.user?.status === "blocked"
    ).length;

    // Property statistics
    const totalProperties = apartments.length;
    const activeProperties = apartments.filter(
      (apt: any) => apt.status === "active"
    ).length;
    const availableProperties = apartments.filter(
      (apt: any) => apt.availability?.status === "available"
    ).length;
    const rentedProperties = apartments.filter(
      (apt: any) => apt.availability?.status === "rented"
    ).length;
    const maintenanceProperties = apartments.filter(
      (apt: any) => apt.availability?.status === "under_maintenance"
    ).length;

    // Revenue calculations
    const totalRevenue = apartments
      .filter((apt: any) => apt.availability?.status === "rented")
      .reduce((sum: number, apt: any) => sum + (apt.rent?.amount || 0), 0);

    const potentialRevenue = apartments
      .filter((apt: any) => apt.status === "active")
      .reduce((sum: number, apt: any) => sum + (apt.rent?.amount || 0), 0);

    const occupancyRate =
      totalProperties > 0
        ? ((rentedProperties / totalProperties) * 100).toFixed(1)
        : "0";

    // Application statistics
    const totalApplications = applicationStats?.total || 0;
    const pendingApplications = applicationStats?.pending || 0;
    const underReviewApplications = applicationStats?.underReview || 0;
    const approvedApplications = applicationStats?.approved || 0;
    const rejectedApplications = applicationStats?.rejected || 0;

    const approvalRate =
      totalApplications > 0
        ? ((approvedApplications / totalApplications) * 100).toFixed(1)
        : "0";

    return {
      // Users
      totalUsers,
      owners: ownersCount,
      tenants: tenantsCount,
      admins,
      activeUsers,
      pendingUsers,
      blockedUsers,

      // Properties
      totalProperties,
      activeProperties,
      availableProperties,
      rentedProperties,
      maintenanceProperties,

      // Revenue
      totalRevenue,
      potentialRevenue,
      occupancyRate,

      // Applications
      totalApplications,
      pendingApplications,
      underReviewApplications,
      approvedApplications,
      rejectedApplications,
      approvalRate,
    };
  }, [allUsers, apartments, applicationStats, owners, tenants]);

  // Get recent users (last 5) - combined tenants and owners
  const recentUsers = useMemo(() => {
    return [...allUsers]
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [allUsers]);

  // Get recent properties (last 5)
  const recentProperties = useMemo(() => {
    return [...apartments]
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [apartments]);

  const getRoleBadge = (user: any) => {
    const roles = user.user?.roles || [];
    if (!roles || roles.length === 0) return null;
    const role = roles[0];
    const roleConfig: any = {
      admin: { color: "bg-red-100 text-red-800 border-red-200" },
      owner: { color: "bg-blue-100 text-blue-800 border-blue-200" },
      tenant: { color: "bg-green-100 text-green-800 border-green-200" },
      staff: { color: "bg-purple-100 text-purple-800 border-purple-200" },
    };

    const config = roleConfig[role] || {
      color: "bg-gray-100 text-gray-800 border-gray-200",
    };

    return <Badge className={config.color}>{role.toUpperCase()}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      approved: { color: "bg-green-100 text-green-800", icon: CheckCircle2 },
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      blocked: { color: "bg-red-100 text-red-800", icon: XCircle },
      declined: { color: "bg-gray-100 text-gray-800", icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.toUpperCase()}
      </Badge>
    );
  };

  const isLoading =
    isLoadingTenants ||
    isLoadingOwners ||
    isLoadingApartments ||
    isLoadingAppStats;
  const error = tenantsError || ownersError || apartmentsError || appStatsError;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Platform overview and system management
            </p>
          </div>
        </div>
      </div>

      {/* User Statistics */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          User Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.activeUsers} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Property Owners
              </CardTitle>
              <UserCheck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.owners}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Managing properties
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tenants</CardTitle>
              <UserPlus className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.tenants}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Seeking properties
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Users
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pendingUsers}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting approval
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Property Statistics */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Property Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Properties
              </CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProperties}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.activeProperties} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                From rented properties
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Occupancy Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.occupancyRate}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.rentedProperties} / {stats.totalProperties} rented
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Available Now
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.availableProperties}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Ready for tenants
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Application Statistics */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Application Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Applications
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalApplications}
              </div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pendingApplications}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.approvedApplications}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Success rate: {stats.approvalRate}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Under Review
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.underReviewApplications}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Being processed
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Latest registered users</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/admin/users")}
              >
                View All
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No users yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentUsers.map((user: any) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Registered{" "}
                        {format(new Date(user.createdAt), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getRoleBadge(user)}
                      {getStatusBadge(user.user?.status || "pending")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Properties</CardTitle>
                <CardDescription>Latest listed properties</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/admin/apartments")}
              >
                View All
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentProperties.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No properties yet
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentProperties.map((property: any) => (
                  <div
                    key={property._id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{property.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {property.address?.city}, {property.address?.state}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Listed{" "}
                        {format(new Date(property.createdAt), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {formatCurrency(property.rent?.amount || 0)}
                      </p>
                      <Badge
                        variant={
                          property.availability?.status === "available"
                            ? "default"
                            : "secondary"
                        }
                        className="mt-1"
                      >
                        {property.availability?.status || "N/A"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Platform management tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => router.push("/admin/users")}
            >
              <Users className="w-5 h-5 mb-2" />
              <span className="font-semibold">Manage Users</span>
              <span className="text-xs text-muted-foreground">
                {stats.totalUsers} total
              </span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => router.push("/admin/apartments")}
            >
              <Building2 className="w-5 h-5 mb-2" />
              <span className="font-semibold">Manage Properties</span>
              <span className="text-xs text-muted-foreground">
                {stats.totalProperties} total
              </span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => router.push("/admin/applications")}
            >
              <FileText className="w-5 h-5 mb-2" />
              <span className="font-semibold">Review Applications</span>
              <span className="text-xs text-muted-foreground">
                {stats.pendingApplications} pending
              </span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => router.push("/admin/settings")}
            >
              <Activity className="w-5 h-5 mb-2" />
              <span className="font-semibold">System Settings</span>
              <span className="text-xs text-muted-foreground">
                Configuration
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
