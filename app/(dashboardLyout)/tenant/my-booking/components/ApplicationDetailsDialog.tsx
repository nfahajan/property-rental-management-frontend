"use client";

import React from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  Building,
  Phone,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Application } from "@/redux/features/applicationApi";

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
        className={`flex items-center gap-1 ${config.className || ""}`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Application Details</DialogTitle>
          <DialogDescription>
            View your rental application information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Application Status</h3>
            {getStatusBadge(application.status)}
          </div>

          <Separator />

          {/* Property Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {application.apartment.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  {application.apartment.address.street},{" "}
                  {application.apartment.address.city},{" "}
                  {application.apartment.address.state}{" "}
                  {application.apartment.address.zipCode}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-green-600">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: application.apartment.rent.currency,
                    minimumFractionDigits: 0,
                  }).format(application.apartment.rent.amount)}{" "}
                  / {application.apartment.rent.period}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Application Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Application Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Move-in Date
                  </label>
                  <p className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    {format(
                      new Date(application.applicationDetails.moveInDate),
                      "PPP"
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Lease Term
                  </label>
                  <p className="mt-1">
                    {application.applicationDetails.leaseTerm}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Monthly Income
                  </label>
                  <p className="mt-1">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0,
                    }).format(application.applicationDetails.monthlyIncome)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Employment Status
                  </label>
                  <p className="mt-1 capitalize">
                    {application.applicationDetails.employmentStatus}
                  </p>
                </div>
                {application.applicationDetails.employerName && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Employer
                    </label>
                    <p className="flex items-center gap-2 mt-1">
                      <Building className="h-4 w-4" />
                      {application.applicationDetails.employerName}
                    </p>
                  </div>
                )}
                {application.applicationDetails.employerPhone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Employer Phone
                    </label>
                    <p className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4" />
                      {application.applicationDetails.employerPhone}
                    </p>
                  </div>
                )}
              </div>
              {application.applicationDetails.additionalInfo && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Additional Information
                  </label>
                  <p className="mt-1 text-sm">
                    {application.applicationDetails.additionalInfo}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Review Information */}
          {application.reviewNotes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Review Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{application.reviewNotes}</p>
                {application.reviewedAt && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Reviewed on{" "}
                    {format(new Date(application.reviewedAt), "PPP")}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Application Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Submitted:</span>
                <span className="font-medium">
                  {format(new Date(application.createdAt), "PPP")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Updated:</span>
                <span className="font-medium">
                  {format(new Date(application.updatedAt), "PPP")}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
