"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Building2,
  Eye,
  Trash2,
  MapPin,
  Calendar,
  DollarSign,
  Loader2,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useGetMyApplicationsQuery,
  useDeleteApplicationMutation,
  Application,
} from "@/redux/features/applicationApi";
import { format } from "date-fns";
import ApplicationDetailsDialog from "./ApplicationDetailsDialog";

export default function MyBooking() {
  const router = useRouter();
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<string | null>(
    null
  );

  const {
    data: applicationsResponse,
    isLoading,
    error,
    refetch,
  } = useGetMyApplicationsQuery(undefined);

  const [deleteApplication, { isLoading: isDeleting }] =
    useDeleteApplicationMutation();

  // Handle nested applications array from API response
  const applications =
    (applicationsResponse?.data?.applications as any[]) || [];

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setIsDetailsOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setApplicationToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!applicationToDelete) return;

    try {
      const response = await deleteApplication(applicationToDelete).unwrap();

      if (response.success) {
        toast.success("Application Withdrawn", {
          description: "Your application has been withdrawn successfully.",
        });
        refetch();
      }
    } catch (error: any) {
      toast.error("Delete Failed", {
        description:
          error?.data?.message ||
          "Failed to withdraw application. Please try again.",
      });
    } finally {
      setApplicationToDelete(null);
    }
  };

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
      rejected: {
        variant: "destructive",
        label: "Rejected",
        icon: XCircle,
      },
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

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return "N/A";
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load your applications. Please try again later.
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetch()} variant="outline">
          Retry
        </Button>
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
            <h1 className="text-3xl font-bold">My Rental Applications</h1>
            <p className="text-muted-foreground">
              Track and manage your property rental applications
            </p>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Application History</CardTitle>
          <CardDescription>
            View and manage all your submitted rental applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Applications Yet
              </h3>
              <p className="text-muted-foreground mb-4">
                You haven't submitted any rental applications yet
              </p>
              <Button onClick={() => router.push("/tenant/book-apartment")}>
                Browse Properties
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
                      <TableHead>Rent</TableHead>
                      <TableHead>Move-In Date</TableHead>
                      <TableHead>Lease Term</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied On</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow key={application._id}>
                        <TableCell>
                          <div className="font-medium">
                            {application.apartment.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-1">
                            <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                            <div className="text-sm">
                              <div>{application.apartment.address.city}</div>
                              <div className="text-muted-foreground">
                                {application.apartment.address.state}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <div className="font-semibold">
                                {formatCurrency(
                                  application.apartment.rent.amount,
                                  application.apartment.rent.currency
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                per {application.apartment.rent.period}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">
                              {formatDate(
                                application.applicationDetails.moveInDate
                              )}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {application.applicationDetails.leaseTerm}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(application.status)}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(application.createdAt)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetails(application)}
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {application.status === "pending" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleDeleteClick(application._id)
                                }
                                title="Withdraw Application"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Application Details Dialog */}
      <ApplicationDetailsDialog
        application={selectedApplication}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedApplication(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!applicationToDelete}
        onOpenChange={() => setApplicationToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw Application?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to withdraw this application? This action
              cannot be undone.
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
                  Withdrawing...
                </>
              ) : (
                "Withdraw Application"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
