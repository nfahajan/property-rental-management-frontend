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
  Home,
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Eye,
  ArrowUpRight,
  Building2,
} from "lucide-react";
import { useGetMyApartmentsQuery } from "@/redux/features/apartmentApi";
import { useGetApplicationsByOwnerQuery } from "@/redux/features/applicationApi";
import { formatCurrency } from "@/lib/utils";

export default function OwnerDashboard() {
  const router = useRouter();

  const {
    data: apartmentsResponse,
    isLoading: isLoadingApartments,
    error: apartmentsError,
  } = useGetMyApartmentsQuery({});

  const {
    data: applicationsResponse,
    isLoading: isLoadingApplications,
    error: applicationsError,
  } = useGetApplicationsByOwnerQuery();

  // Extract apartments data
  const apartments = useMemo(() => {
    if (!apartmentsResponse?.data) return [];
    const data = apartmentsResponse.data as any;
    if (Array.isArray(data)) {
      return data;
    }
    if (data.apartments && Array.isArray(data.apartments)) {
      return data.apartments;
    }
    return [];
  }, [apartmentsResponse]);

  // Extract applications data
  const applications = useMemo(() => {
    if (!applicationsResponse?.data) return [];
    const data = applicationsResponse.data as any;
    if (Array.isArray(data)) {
      return data;
    }
    if (data.applications && Array.isArray(data.applications)) {
      return data.applications;
    }
    return [];
  }, [applicationsResponse]);

  // Calculate statistics
  const stats = useMemo(() => {
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

    const totalApplications = applications.length;
    const pendingApplications = applications.filter(
      (app: any) => app.status === "pending"
    ).length;
    const underReviewApplications = applications.filter(
      (app: any) => app.status === "under_review"
    ).length;
    const approvedApplications = applications.filter(
      (app: any) => app.status === "approved"
    ).length;

    // Calculate total monthly revenue from rented properties
    const monthlyRevenue = apartments
      .filter((apt: any) => apt.availability?.status === "rented")
      .reduce((sum: number, apt: any) => sum + (apt.rent?.amount || 0), 0);

    // Calculate potential revenue from all active properties
    const potentialRevenue = apartments
      .filter((apt: any) => apt.status === "active")
      .reduce((sum: number, apt: any) => sum + (apt.rent?.amount || 0), 0);

    const occupancyRate =
      totalProperties > 0
        ? ((rentedProperties / totalProperties) * 100).toFixed(1)
        : "0";

    return {
      totalProperties,
      activeProperties,
      availableProperties,
      rentedProperties,
      totalApplications,
      pendingApplications,
      underReviewApplications,
      approvedApplications,
      monthlyRevenue,
      potentialRevenue,
      occupancyRate,
    };
  }, [apartments, applications]);

  // Get recent applications (last 5)
  const recentApplications = useMemo(() => {
    return [...applications]
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [applications]);

  // Get top properties by rent
  const topProperties = useMemo(() => {
    return [...apartments]
      .filter((apt: any) => apt.status === "active")
      .sort((a: any, b: any) => (b.rent?.amount || 0) - (a.rent?.amount || 0))
      .slice(0, 5);
  }, [apartments]);

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
      },
      under_review: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: AlertCircle,
      },
      approved: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle2,
      },
      rejected: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace(/_/g, " ").toUpperCase()}
      </Badge>
    );
  };

  const isLoading = isLoadingApartments || isLoadingApplications;
  const error = apartmentsError || applicationsError;

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
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
            <Home className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's your property overview
            </p>
          </div>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Properties */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Properties
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProperties}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeProperties} active
            </p>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.monthlyRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From {stats.rentedProperties} rented properties
            </p>
          </CardContent>
        </Card>

        {/* Occupancy Rate */}
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

        {/* Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Applications
            </CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.pendingApplications + stats.underReviewApplications}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingApplications} pending review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Available Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.availableProperties}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ready for new tenants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Potential Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.potentialRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              If all properties rented
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Approved Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.approvedApplications}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total approved tenants
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>Latest rental applications</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/owner/bookings")}
              >
                View All
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentApplications.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No applications yet
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentApplications.map((application: any) => (
                  <div
                    key={application._id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">
                        {application.tenant?.firstName}{" "}
                        {application.tenant?.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {application.apartment?.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(
                          new Date(application.createdAt),
                          "MMM dd, yyyy"
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(application.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Properties */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Top Properties</CardTitle>
                <CardDescription>Highest value properties</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/owner/apartments")}
              >
                View All
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {topProperties.length === 0 ? (
              <div className="text-center py-8">
                <Home className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No properties yet
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => router.push("/owner/apartments/create")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Property
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {topProperties.map((apartment: any) => (
                  <div
                    key={apartment._id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{apartment.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {apartment.address?.city}, {apartment.address?.state}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={
                            apartment.availability?.status === "available"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {apartment.availability?.status || "N/A"}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {formatCurrency(apartment.rent?.amount || 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        /{apartment.rent?.period || "month"}
                      </p>
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
          <CardDescription>
            Manage your properties and applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => router.push("/owner/apartments/create")}
            >
              <Plus className="w-5 h-5 mb-2" />
              <span className="font-semibold">Add New Property</span>
              <span className="text-xs text-muted-foreground">
                List a new apartment
              </span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => router.push("/owner/bookings")}
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
              onClick={() => router.push("/owner/apartments")}
            >
              <Eye className="w-5 h-5 mb-2" />
              <span className="font-semibold">View Properties</span>
              <span className="text-xs text-muted-foreground">
                Manage {stats.totalProperties} properties
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
