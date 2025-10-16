"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
  FileText,
  Calendar,
  Building2,
  Search,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Eye,
  Heart,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useGetMyApplicationsQuery } from "@/redux/features/applicationApi";
import { useGetAllApartmentsQuery } from "@/redux/features/apartmentApi";
import { format } from "date-fns";

export default function TenantDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  // API queries
  const {
    data: applicationsResponse,
    isLoading: isLoadingApplications,
    error: applicationsError,
  } = useGetMyApplicationsQuery(undefined);

  const { data: apartmentsResponse, isLoading: isLoadingApartments } =
    useGetAllApartmentsQuery({});

  // Extract data
  const applications = applicationsResponse?.data?.applications || [];
  const apartments = apartmentsResponse?.data?.apartments || [];

  // Calculate stats
  const stats = useMemo(() => {
    const pendingCount = applications.filter(
      (app: any) => app.status === "pending"
    ).length;
    const approvedCount = applications.filter(
      (app: any) => app.status === "approved"
    ).length;
    const rejectedCount = applications.filter(
      (app: any) => app.status === "rejected"
    ).length;
    const underReviewCount = applications.filter(
      (app: any) => app.status === "under_review"
    ).length;
    const availableProperties = apartments.filter(
      (apt: any) =>
        apt.availability.status === "available" && apt.status === "active"
    ).length;

    return {
      totalApplications: applications.length,
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount,
      underReview: underReviewCount,
      availableProperties,
    };
  }, [applications, apartments]);

  // Get recent applications (last 3)
  const recentApplications = useMemo(() => {
    return [...applications]
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 3);
  }, [applications]);

  // Get featured available properties (first 3)
  const featuredProperties = useMemo(() => {
    return apartments
      .filter(
        (apt: any) =>
          apt.availability.status === "available" && apt.status === "active"
      )
      .slice(0, 3);
  }, [apartments]);

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      { variant: any; label: string; icon: any; className?: string }
    > = {
      pending: {
        variant: "outline",
        label: "Pending",
        icon: Clock,
        className: "border-yellow-500 text-yellow-700",
      },
      under_review: {
        variant: "secondary",
        label: "Under Review",
        icon: AlertCircle,
        className: "bg-blue-100 text-blue-700",
      },
      approved: {
        variant: "default",
        label: "Approved",
        icon: CheckCircle,
        className: "bg-green-100 text-green-700 border-green-200",
      },
      rejected: { variant: "destructive", label: "Rejected", icon: XCircle },
      withdrawn: {
        variant: "secondary",
        label: "Withdrawn",
        icon: XCircle,
        className: "bg-gray-100 text-gray-700",
      },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge
        variant={config.variant}
        className={`flex items-center gap-1 w-fit ${config.className || ""}`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const statCards = [
    {
      title: "Total Applications",
      value: stats.totalApplications,
      icon: FileText,
      description: "All submitted applications",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      href: "/tenant/my-booking",
    },
    {
      title: "Pending Review",
      value: stats.pending + stats.underReview,
      icon: Clock,
      description: "Awaiting response",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      href: "/tenant/my-booking",
    },
    {
      title: "Approved",
      value: stats.approved,
      icon: CheckCircle,
      description: "Accepted applications",
      color: "text-green-600",
      bgColor: "bg-green-100",
      href: "/tenant/my-booking",
    },
    {
      title: "Available Properties",
      value: stats.availableProperties,
      icon: Building2,
      description: "Ready to book",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      href: "/tenant/book-apartment",
    },
  ];

  if (applicationsError) {
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

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back{user?.name ? `, ${user.name}` : ""}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Find and book your perfect property
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/tenant/book-apartment">
            <Search className="h-4 w-4 mr-2" />
            Browse Properties
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-lg transition-all cursor-pointer group">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div
                  className={`h-10 w-10 ${stat.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Applications
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/tenant/my-booking">View All</Link>
              </Button>
            </div>
            <CardDescription>Your latest rental applications</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingApplications ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : recentApplications.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  No applications yet
                </p>
                <Button asChild size="sm">
                  <Link href="/tenant/book-apartment">Browse Properties</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentApplications.map((application: any) => (
                  <div
                    key={application._id}
                    className="flex items-start justify-between border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => router.push("/tenant/my-booking")}
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">
                          {application.apartment.title}
                        </p>
                        {getStatusBadge(application.status)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {application.apartment.address.city},{" "}
                          {application.apartment.address.state}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Move-in:{" "}
                            {format(
                              new Date(
                                application.applicationDetails.moveInDate
                              ),
                              "MMM dd, yyyy"
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <span>
                            {formatCurrency(
                              application.apartment.rent.amount,
                              application.apartment.rent.currency
                            )}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Applied{" "}
                        {format(
                          new Date(application.createdAt),
                          "MMM dd, yyyy"
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Properties */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Available Properties
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/tenant/book-apartment">View All</Link>
              </Button>
            </div>
            <CardDescription>
              Featured properties you can book now
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingApartments ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : featuredProperties.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No properties available at the moment
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {featuredProperties.map((property: any) => (
                  <div
                    key={property._id}
                    className="flex items-start gap-3 border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => router.push("/tenant/book-apartment")}
                  >
                    <div className="relative h-20 w-20 rounded-lg overflow-hidden flex-shrink-0">
                      {property.images && property.images.length > 0 ? (
                        <Image
                          src={`${
                            process.env.NEXT_PUBLIC_API_URL ||
                            "http://localhost:5000"
                          }/uploads/${property.images[0]}`}
                          alt={property.title}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.jpg";
                          }}
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                          <Building2 className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <p className="font-medium truncate">{property.title}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">
                            {property.address.city}, {property.address.state}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Bed className="h-3 w-3" />
                          <span>{property.propertyDetails.bedrooms} bed</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="h-3 w-3" />
                          <span>{property.propertyDetails.bathrooms} bath</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-green-600">
                          {formatCurrency(
                            property.rent.amount,
                            property.rent.currency
                          )}
                          /{property.rent.period}
                        </p>
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Available
                        </Badge>
                      </div>
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
          <CardDescription>Common tasks you might want to do</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-center gap-3"
              asChild
            >
              <Link href="/tenant/book-apartment">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-center">
                  <p className="font-semibold">Browse Properties</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Find your perfect home
                  </p>
                </div>
              </Link>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-center gap-3"
              asChild
            >
              <Link href="/tenant/my-booking">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-center">
                  <p className="font-semibold">My Applications</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Track your submissions
                  </p>
                </div>
              </Link>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-center gap-3"
              asChild
            >
              <Link href="/tenant/profile">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-center">
                  <p className="font-semibold">My Profile</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Update your information
                  </p>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
