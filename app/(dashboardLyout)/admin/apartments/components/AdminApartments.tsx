"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  Building2,
  Search,
  Eye,
  Settings2,
  Trash2,
  Home,
  CheckCircle2,
  XCircle,
  Clock,
  Wrench,
  AlertCircle,
  Filter,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import {
  Apartment,
  useGetAllApartmentsQuery,
  useDeleteApartmentMutation,
} from "@/redux/features/apartmentApi";
import { formatCurrency } from "@/lib/utils";
import ApartmentDetailsDialog from "./ApartmentDetailsDialog";
import UpdateApartmentStatusDialog from "./UpdateApartmentStatusDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminApartments() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(
    null
  );
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [apartmentToDelete, setApartmentToDelete] = useState<Apartment | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    data: apartmentsResponse,
    isLoading,
    error,
    refetch,
  } = useGetAllApartmentsQuery({});

  const [deleteApartment, { isLoading: isDeleting }] =
    useDeleteApartmentMutation();

  // Extract apartments data
  const apartments = useMemo(() => {
    if (!apartmentsResponse?.data) return [];
    const data = apartmentsResponse.data as any;
    if (data.apartments && Array.isArray(data.apartments)) {
      return data.apartments as Apartment[];
    }
    if (Array.isArray(data)) {
      return data as Apartment[];
    }
    return [];
  }, [apartmentsResponse]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = apartments.length;
    const active = apartments.filter((apt) => apt.status === "active").length;
    const available = apartments.filter(
      (apt) => apt.availability?.status === "available"
    ).length;
    const rented = apartments.filter(
      (apt) => apt.availability?.status === "rented"
    ).length;
    const maintenance = apartments.filter(
      (apt) => apt.availability?.status === "maintenance"
    ).length;

    const totalRevenue = apartments
      .filter((apt) => apt.availability?.status === "rented")
      .reduce((sum, apt) => sum + (apt.rent?.amount || 0), 0);

    const occupancyRate = total > 0 ? ((rented / total) * 100).toFixed(1) : "0";

    return {
      total,
      active,
      available,
      rented,
      maintenance,
      totalRevenue,
      occupancyRate,
    };
  }, [apartments]);

  // Filter apartments
  const filteredApartments = useMemo(() => {
    let filtered = [...apartments];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((apt) => apt.status === statusFilter);
    }

    // Filter by availability
    if (availabilityFilter !== "all") {
      filtered = filtered.filter(
        (apt) => apt.availability?.status === availabilityFilter
      );
    }

    // Search by title, city, or address
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (apt) =>
          apt.title.toLowerCase().includes(search) ||
          apt.address?.city.toLowerCase().includes(search) ||
          apt.address?.state.toLowerCase().includes(search) ||
          apt.address?.street.toLowerCase().includes(search)
      );
    }

    // Sort by creation date (newest first)
    return filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [apartments, statusFilter, availabilityFilter, searchTerm]);

  const handleViewDetails = (apartment: Apartment) => {
    setSelectedApartment(apartment);
    setIsDetailsDialogOpen(true);
  };

  const handleUpdateStatus = (apartment: Apartment) => {
    setSelectedApartment(apartment);
    setIsStatusDialogOpen(true);
  };

  const handleDeleteClick = (apartment: Apartment) => {
    setApartmentToDelete(apartment);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!apartmentToDelete) return;

    try {
      const response = await deleteApartment(apartmentToDelete._id).unwrap();

      if (response.success) {
        toast.success("Apartment Deleted!", {
          description: "The apartment has been deleted successfully.",
        });
        setIsDeleteDialogOpen(false);
        setApartmentToDelete(null);
        refetch();
      } else {
        toast.error("Delete Failed", {
          description: response.message || "Failed to delete apartment.",
        });
      }
    } catch (error: any) {
      console.error("Delete apartment error:", error);
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to delete apartment. Please try again.";
      toast.error("Delete Failed", {
        description: errorMessage,
      });
    }
  };

  const handleStatusUpdateSuccess = () => {
    refetch();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      active: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle2,
        label: "Active",
      },
      inactive: {
        color: "bg-gray-100 text-gray-800",
        icon: XCircle,
        label: "Inactive",
      },
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
        label: "Pending",
      },
      sold: {
        color: "bg-red-100 text-red-800",
        icon: Home,
        label: "Sold",
      },
    };

    const config = statusConfig[status] || statusConfig.active;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getAvailabilityBadge = (status: string) => {
    const statusConfig: any = {
      available: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle2,
        label: "Available",
      },
      rented: {
        color: "bg-blue-100 text-blue-800",
        icon: Home,
        label: "Rented",
      },
      maintenance: {
        color: "bg-yellow-100 text-yellow-800",
        icon: Wrench,
        label: "Maintenance",
      },
      unavailable: {
        color: "bg-red-100 text-red-800",
        icon: XCircle,
        label: "Unavailable",
      },
    };

    const config = statusConfig[status] || statusConfig.available;
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
            Failed to load apartments. Please try again later.
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
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
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
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Property Management</h1>
            <p className="text-muted-foreground">
              Manage all properties on the platform
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Properties
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.active} active
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
              From {stats.rented} rented
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
              {stats.rented} / {stats.total} rented
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Now</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.available}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ready for tenants
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Properties
          </CardTitle>
          <CardDescription>
            Search and filter properties by status or availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by title, city, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={availabilityFilter}
              onValueChange={setAvailabilityFilter}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Availability</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="rented">Rented</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Apartments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Properties ({filteredApartments.length})</CardTitle>
          <CardDescription>
            {filteredApartments.length === 0
              ? "No properties found"
              : "View and manage all properties"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredApartments.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Properties Found
              </h3>
              <p className="text-muted-foreground">
                {searchTerm ||
                statusFilter !== "all" ||
                availabilityFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No properties listed yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Rent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>Listed</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApartments.map((apartment) => (
                    <TableRow key={apartment._id}>
                      <TableCell>
                        <p className="font-medium">{apartment.title}</p>
                        {apartment.owner && (
                          <p className="text-xs text-muted-foreground">
                            Owner: {apartment.owner.firstName}{" "}
                            {apartment.owner.lastName}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">
                          {apartment.address?.city}, {apartment.address?.state}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {apartment.address?.zipCode}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <span>{apartment.propertyDetails.bedrooms} bed</span>
                          <span>•</span>
                          <span>
                            {apartment.propertyDetails.bathrooms} bath
                          </span>
                          <span>•</span>
                          <span>
                            {apartment.propertyDetails.squareFeet.toLocaleString()}{" "}
                            ft²
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">
                          {formatCurrency(
                            apartment.rent?.amount || 0,
                            apartment.rent?.currency
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          /{apartment.rent?.period}
                        </p>
                      </TableCell>
                      <TableCell>{getStatusBadge(apartment.status)}</TableCell>
                      <TableCell>
                        {getAvailabilityBadge(
                          apartment.availability?.status || "available"
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(apartment.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(apartment)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus(apartment)}
                          >
                            <Settings2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(apartment)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
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
      <ApartmentDetailsDialog
        apartment={selectedApartment}
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
      />

      <UpdateApartmentStatusDialog
        apartment={selectedApartment}
        isOpen={isStatusDialogOpen}
        onClose={() => setIsStatusDialogOpen(false)}
        onSuccess={handleStatusUpdateSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the apartment "
              {apartmentToDelete?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
