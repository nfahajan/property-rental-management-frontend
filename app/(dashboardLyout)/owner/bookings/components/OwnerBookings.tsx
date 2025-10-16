"use client";

import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  TrendingUp,
  Users,
  Home,
  Filter,
} from "lucide-react";
import {
  Application,
  useGetApplicationsByOwnerQuery,
} from "@/redux/features/applicationApi";
import { formatCurrency } from "@/lib/utils";
import ApplicationDetailsDialog from "./ApplicationDetailsDialog";
import ReviewApplicationDialog from "./ReviewApplicationDialog";

export default function OwnerBookings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  const {
    data: applicationsResponse,
    isLoading,
    error,
    refetch,
  } = useGetApplicationsByOwnerQuery();

  // Extract applications from response
  const applications = useMemo(() => {
    if (!applicationsResponse?.data) return [];

    // Handle if data is an array directly or nested in applications property
    const data = applicationsResponse.data as any;
    if (Array.isArray(data)) {
      return data as Application[];
    }
    if (data.applications && Array.isArray(data.applications)) {
      return data.applications as Application[];
    }
    return [];
  }, [applicationsResponse]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter(
      (app: Application) => app.status === "pending"
    ).length;
    const underReview = applications.filter(
      (app: Application) => app.status === "under_review"
    ).length;
    const approved = applications.filter(
      (app: Application) => app.status === "approved"
    ).length;
    const rejected = applications.filter(
      (app: Application) => app.status === "rejected"
    ).length;

    return {
      total,
      pending,
      underReview,
      approved,
      rejected,
      activeApplications: pending + underReview,
    };
  }, [applications]);

  // Filter and search applications
  const filteredApplications = useMemo(() => {
    let filtered = [...applications];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    // Search by tenant name, email, or property title
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.tenant.firstName.toLowerCase().includes(search) ||
          app.tenant.lastName.toLowerCase().includes(search) ||
          app.tenant.email.toLowerCase().includes(search) ||
          app.apartment.title.toLowerCase().includes(search) ||
          app.apartment.address.city.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [applications, statusFilter, searchTerm]);

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setIsDetailsDialogOpen(true);
  };

  const handleReview = (application: Application) => {
    setSelectedApplication(application);
    setIsReviewDialogOpen(true);
  };

  const handleReviewSuccess = () => {
    refetch();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
        label: "Pending",
      },
      under_review: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: AlertCircle,
        label: "Under Review",
      },
      approved: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle2,
        label: "Approved",
      },
      rejected: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
        label: "Rejected",
      },
      withdrawn: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: XCircle,
        label: "Withdrawn",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load applications. Please try again later.
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetch()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Rental Applications</h1>
            <p className="text-muted-foreground">
              Manage applications for your properties
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Applications
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All time applications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Applications
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.activeApplications}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pending} pending, {stats.underReview} under review
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
              {stats.approved}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.total > 0
                ? `${((stats.approved / stats.total) * 100).toFixed(0)}%`
                : "0%"}{" "}
              approval rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.rejected}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.total > 0
                ? `${((stats.rejected / stats.total) * 100).toFixed(0)}%`
                : "0%"}{" "}
              rejection rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Applications
          </CardTitle>
          <CardDescription>
            Search and filter applications by status or tenant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by tenant name, email, or property..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applications ({filteredApplications.length})</CardTitle>
          <CardDescription>
            {filteredApplications.length === 0
              ? "No applications found"
              : "Review and manage rental applications"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Applications Found
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "You don't have any applications yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Move-in Date</TableHead>
                    <TableHead>Income</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((application) => (
                    <TableRow key={application._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {application.tenant.firstName}{" "}
                            {application.tenant.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {application.tenant.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {application.apartment.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {application.apartment.address.city},{" "}
                            {application.apartment.address.state}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(
                          new Date(application.applicationDetails.moveInDate),
                          "MMM dd, yyyy"
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {formatCurrency(
                              application.applicationDetails.monthlyIncome
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Ratio:{" "}
                            {(
                              application.applicationDetails.monthlyIncome /
                              application.apartment.rent.amount
                            ).toFixed(1)}
                            x
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(application.status)}
                      </TableCell>
                      <TableCell>
                        {format(
                          new Date(application.createdAt),
                          "MMM dd, yyyy"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(application)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          {(application.status === "pending" ||
                            application.status === "under_review") && (
                            <Button
                              size="sm"
                              onClick={() => handleReview(application)}
                            >
                              Review
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ApplicationDetailsDialog
        application={selectedApplication}
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
      />

      <ReviewApplicationDialog
        application={selectedApplication}
        isOpen={isReviewDialogOpen}
        onClose={() => setIsReviewDialogOpen(false)}
        onSuccess={handleReviewSuccess}
      />
    </div>
  );
}
