"use client";

import React from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  FileText,
  Clock,
} from "lucide-react";
import { Application } from "@/redux/features/applicationApi";
import { formatCurrency } from "@/lib/utils";

interface ApplicationDetailsDialogProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ApplicationDetailsDialog({
  application,
  isOpen,
  onClose,
}: ApplicationDetailsDialogProps) {
  if (!application) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "under_review":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "withdrawn":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").toUpperCase();
  };

  const incomeToRentRatio =
    application.applicationDetails.monthlyIncome /
    application.apartment.rent.amount;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-2xl">Application Details</span>
            <Badge className={getStatusColor(application.status)}>
              {formatStatus(application.status)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tenant Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5" />
                Tenant Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">
                      {application.tenant.firstName}{" "}
                      {application.tenant.lastName}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{application.tenant.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{application.tenant.phone}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="w-5 h-5" />
                Property Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <Building2 className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Property</p>
                    <p className="font-medium">{application.apartment.title}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">
                      {application.apartment.address.street},{" "}
                      {application.apartment.address.city},{" "}
                      {application.apartment.address.state}{" "}
                      {application.apartment.address.zipCode}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Rent</p>
                    <p className="font-medium">
                      {formatCurrency(
                        application.apartment.rent.amount,
                        application.apartment.rent.currency
                      )}
                      /{application.apartment.rent.period}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5" />
                Application Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Desired Move-in Date
                    </p>
                    <p className="font-medium">
                      {format(
                        new Date(application.applicationDetails.moveInDate),
                        "MMMM dd, yyyy"
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Lease Term</p>
                    <p className="font-medium">
                      {application.applicationDetails.leaseTerm}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Monthly Income
                    </p>
                    <p className="font-medium">
                      {formatCurrency(
                        application.applicationDetails.monthlyIncome
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Income-to-Rent Ratio: {incomeToRentRatio.toFixed(2)}x
                      {incomeToRentRatio >= 3 && (
                        <span className="text-green-600 ml-1">✓ Good</span>
                      )}
                      {incomeToRentRatio < 3 && incomeToRentRatio >= 2.5 && (
                        <span className="text-yellow-600 ml-1">⚠ Fair</span>
                      )}
                      {incomeToRentRatio < 2.5 && (
                        <span className="text-red-600 ml-1">✗ Low</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Briefcase className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Employment Status
                    </p>
                    <p className="font-medium capitalize">
                      {application.applicationDetails.employmentStatus.replace(
                        /-/g,
                        " "
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {application.applicationDetails.employerName && (
                <>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <Building2 className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Employer Name
                        </p>
                        <p className="font-medium">
                          {application.applicationDetails.employerName}
                        </p>
                      </div>
                    </div>
                    {application.applicationDetails.employerPhone && (
                      <div className="flex items-start gap-2">
                        <Phone className="w-4 h-4 mt-1 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Employer Phone
                          </p>
                          <p className="font-medium">
                            {application.applicationDetails.employerPhone}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {application.applicationDetails.additionalInfo && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Additional Information
                    </p>
                    <p className="text-sm bg-muted p-3 rounded-md">
                      {application.applicationDetails.additionalInfo}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Review Information */}
          {application.reviewNotes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5" />
                  Review Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm bg-muted p-3 rounded-md">
                  {application.reviewNotes}
                </p>
                {application.reviewedAt && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Reviewed on{" "}
                    {format(new Date(application.reviewedAt), "MMMM dd, yyyy")}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Application Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Applied on:</span>
                <span className="font-medium">
                  {format(new Date(application.createdAt), "MMMM dd, yyyy")}
                </span>
              </div>
              {application.reviewedAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reviewed on:</span>
                  <span className="font-medium">
                    {format(new Date(application.reviewedAt), "MMMM dd, yyyy")}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last updated:</span>
                <span className="font-medium">
                  {format(new Date(application.updatedAt), "MMMM dd, yyyy")}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
