"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useGetMyApartmentsQuery,
  useDeleteApartmentMutation,
  Apartment,
} from "@/redux/features/apartmentApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  Plus,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Bed,
  Bath,
  Maximize,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function Apartments() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(
    null
  );
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [apartmentToDelete, setApartmentToDelete] = useState<string | null>(
    null
  );

  const { data, isLoading, error, refetch } = useGetMyApartmentsQuery({
    page,
    limit: 10,
  });
  const [deleteApartment, { isLoading: isDeleting }] =
    useDeleteApartmentMutation();

  const apartments = data?.data?.apartments || [];
  const pagination = data?.data?.pagination;

  const handleViewApartment = (apartment: Apartment) => {
    setSelectedApartment(apartment);
    setIsViewDialogOpen(true);
  };

  const handleEditApartment = (id: string) => {
    router.push(`/owner/apartments/${id}`);
  };

  const handleDeleteClick = (id: string) => {
    setApartmentToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!apartmentToDelete) return;

    try {
      const response = await deleteApartment(apartmentToDelete).unwrap();

      if (response.success) {
        toast.success("Apartment Deleted", {
          description: "The apartment has been deleted successfully.",
        });
        refetch();
      }
    } catch (error: any) {
      toast.error("Delete Failed", {
        description:
          error?.data?.message ||
          "Failed to delete apartment. Please try again.",
      });
    } finally {
      setApartmentToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      active: { variant: "default", label: "Active" },
      inactive: { variant: "secondary", label: "Inactive" },
      pending: { variant: "outline", label: "Pending" },
      sold: { variant: "destructive", label: "Sold" },
    };

    const config = variants[status] || variants.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getAvailabilityBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; icon: any }> =
      {
        available: {
          variant: "default",
          label: "Available",
          icon: CheckCircle2,
        },
        rented: { variant: "secondary", label: "Rented", icon: XCircle },
        maintenance: {
          variant: "outline",
          label: "Maintenance",
          icon: XCircle,
        },
        unavailable: {
          variant: "destructive",
          label: "Unavailable",
          icon: XCircle,
        },
      };

    const config = variants[status] || variants.available;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p>Failed to load apartments. Please try again.</p>
              <Button onClick={() => refetch()} className="mt-4">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">My Apartments</h1>
            <p className="text-muted-foreground">
              Manage your property listings
            </p>
          </div>
        </div>
        <Button onClick={() => router.push("/owner/apartments/create")}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Apartment
        </Button>
      </div>

      {/* Stats Cards */}
      {pagination && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Apartments</CardDescription>
              <CardTitle className="text-3xl">{pagination.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Available</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {
                  apartments.filter(
                    (a: Apartment) => a.availability.status === "available"
                  ).length
                }
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Rented</CardDescription>
              <CardTitle className="text-3xl text-blue-600">
                {
                  apartments.filter(
                    (a: Apartment) => a.availability.status === "rented"
                  ).length
                }
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Inactive</CardDescription>
              <CardTitle className="text-3xl text-gray-600">
                {
                  apartments.filter((a: Apartment) => a.status === "inactive")
                    .length
                }
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Apartments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Apartment Listings</CardTitle>
          <CardDescription>
            View and manage all your property listings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : apartments.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Apartments Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding your first apartment listing
              </p>
              <Button onClick={() => router.push("/owner/apartments/create")}>
                <Plus className="w-4 h-4 mr-2" />
                Add Apartment
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Rent</TableHead>
                      <TableHead>Availability</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apartments.map((apartment: Apartment) => (
                      <TableRow key={apartment._id}>
                        <TableCell>
                          <div className="font-medium">{apartment.title}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-1">
                            <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                            <div className="text-sm">
                              <div>{apartment.address.city}</div>
                              <div className="text-muted-foreground">
                                {apartment.address.state}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 text-sm">
                            <div className="flex items-center gap-1">
                              <Bed className="w-4 h-4 text-muted-foreground" />
                              {apartment.propertyDetails.bedrooms} Beds
                            </div>
                            <div className="flex items-center gap-1">
                              <Bath className="w-4 h-4 text-muted-foreground" />
                              {apartment.propertyDetails.bathrooms} Baths
                            </div>
                            <div className="flex items-center gap-1">
                              <Maximize className="w-4 h-4 text-muted-foreground" />
                              {apartment.propertyDetails.squareFeet} sq ft
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <div className="font-semibold">
                                {apartment.rent.currency}{" "}
                                {apartment.rent.amount.toLocaleString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                per {apartment.rent.period}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getAvailabilityBadge(apartment.availability.status)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(apartment.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewApartment(apartment)}
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditApartment(apartment._id)}
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(apartment._id)}
                              title="Delete"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing page {pagination.page} of {pagination.pages} (
                    {pagination.total} total apartments)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              {selectedApartment?.title}
            </DialogTitle>
            <DialogDescription>
              Detailed information about this apartment
            </DialogDescription>
          </DialogHeader>

          {selectedApartment && (
            <div className="space-y-6 mt-4">
              {/* Status Badges */}
              <div className="flex flex-wrap gap-2">
                {getStatusBadge(selectedApartment.status)}
                {getAvailabilityBadge(selectedApartment.availability.status)}
              </div>

              {/* Featured Image */}
              {selectedApartment.images &&
                selectedApartment.images.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Featured Image</h3>
                    <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-muted">
                      <img
                        src={selectedApartment.images[0]}
                        alt={selectedApartment.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.jpg";
                        }}
                      />
                      {selectedApartment.images.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                          +{selectedApartment.images.length - 1} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedApartment.description}
                </p>
              </div>

              {/* Location */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </h3>
                <div className="text-sm space-y-1">
                  <p>{selectedApartment.address.street}</p>
                  <p>
                    {selectedApartment.address.city},{" "}
                    {selectedApartment.address.state}{" "}
                    {selectedApartment.address.zipCode}
                  </p>
                  <p>{selectedApartment.address.country}</p>
                </div>
              </div>

              {/* Property Details */}
              <div>
                <h3 className="font-semibold mb-3">Property Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Bed className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">
                        {selectedApartment.propertyDetails.bedrooms}
                      </p>
                      <p className="text-xs text-muted-foreground">Bedrooms</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">
                        {selectedApartment.propertyDetails.bathrooms}
                      </p>
                      <p className="text-xs text-muted-foreground">Bathrooms</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Maximize className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">
                        {selectedApartment.propertyDetails.squareFeet}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Square Feet
                      </p>
                    </div>
                  </div>
                  {selectedApartment.propertyDetails.floorNumber !==
                    undefined && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">
                          Floor {selectedApartment.propertyDetails.floorNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Floor Number
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedApartment.propertyDetails.totalFloors && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">
                          {selectedApartment.propertyDetails.totalFloors}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Total Floors
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedApartment.propertyDetails.yearBuilt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">
                          {selectedApartment.propertyDetails.yearBuilt}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Year Built
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Rent Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Rent Information
                </h3>
                <div className="bg-primary/5 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {selectedApartment.rent.currency}{" "}
                    {selectedApartment.rent.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    per {selectedApartment.rent.period}
                  </p>
                </div>
              </div>

              {/* Amenities */}
              {selectedApartment.amenities.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedApartment.amenities.map((amenity, index) => (
                      <Badge key={index} variant="secondary">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Utilities */}
              {selectedApartment.utilities.included.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Utilities Included</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedApartment.utilities.included.map(
                      (utility, index) => (
                        <Badge key={index} variant="default">
                          {utility}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Availability Details */}
              <div>
                <h3 className="font-semibold mb-3">Availability Details</h3>
                <div className="space-y-2 text-sm">
                  {selectedApartment.availability.availableFrom && (
                    <p>
                      <span className="font-medium">Available From:</span>{" "}
                      {new Date(
                        selectedApartment.availability.availableFrom
                      ).toLocaleDateString()}
                    </p>
                  )}
                  {selectedApartment.availability.leaseTerm && (
                    <p>
                      <span className="font-medium">Lease Term:</span>{" "}
                      {selectedApartment.availability.leaseTerm}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    handleEditApartment(selectedApartment._id);
                  }}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Apartment
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!apartmentToDelete}
        onOpenChange={() => setApartmentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              apartment listing and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
