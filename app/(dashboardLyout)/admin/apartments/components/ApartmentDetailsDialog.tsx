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
  Home,
  MapPin,
  Bed,
  Bath,
  Maximize,
  DollarSign,
  Calendar,
  Building2,
  CheckCircle2,
  Lightbulb,
  User,
} from "lucide-react";
import { Apartment } from "@/redux/features/apartmentApi";
import { formatCurrency } from "@/lib/utils";

interface ApartmentDetailsDialogProps {
  apartment: Apartment | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ApartmentDetailsDialog({
  apartment,
  isOpen,
  onClose,
}: ApartmentDetailsDialogProps) {
  if (!apartment) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "sold":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "rented":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "unavailable":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-2xl">{apartment.title}</span>
            <div className="flex gap-2">
              <Badge className={getStatusColor(apartment.status)}>
                {apartment.status.toUpperCase()}
              </Badge>
              <Badge
                className={getAvailabilityColor(apartment.availability.status)}
              >
                {apartment.availability.status.toUpperCase()}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Home className="w-5 h-5" />
                Property Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-start gap-2">
                  <Bed className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Bedrooms</p>
                    <p className="font-medium">
                      {apartment.propertyDetails.bedrooms}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Bath className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Bathrooms</p>
                    <p className="font-medium">
                      {apartment.propertyDetails.bathrooms}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Maximize className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Square Feet</p>
                    <p className="font-medium">
                      {apartment.propertyDetails.squareFeet.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Rent</p>
                    <p className="font-medium">
                      {formatCurrency(
                        apartment.rent.amount,
                        apartment.rent.currency
                      )}
                      /{apartment.rent.period}
                    </p>
                  </div>
                </div>
              </div>

              {apartment.propertyDetails.floorNumber && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Floor Number
                    </p>
                    <p className="font-medium">
                      {apartment.propertyDetails.floorNumber}
                    </p>
                  </div>
                  {apartment.propertyDetails.totalFloors && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Floors
                      </p>
                      <p className="font-medium">
                        {apartment.propertyDetails.totalFloors}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {apartment.propertyDetails.yearBuilt && (
                <div>
                  <p className="text-sm text-muted-foreground">Year Built</p>
                  <p className="font-medium">
                    {apartment.propertyDetails.yearBuilt}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="w-5 h-5" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">
                {apartment.address.street}
                <br />
                {apartment.address.city}, {apartment.address.state}{" "}
                {apartment.address.zipCode}
                <br />
                {apartment.address.country}
              </p>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="w-5 h-5" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{apartment.description}</p>
            </CardContent>
          </Card>

          {/* Amenities */}
          {apartment.amenities && apartment.amenities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle2 className="w-5 h-5" />
                  Amenities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {apartment.amenities.map((amenity, index) => (
                    <Badge key={index} variant="secondary">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Utilities */}
          {apartment.utilities?.included &&
            apartment.utilities.included.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Lightbulb className="w-5 h-5" />
                    Utilities Included
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {apartment.utilities.included.map((utility, index) => (
                      <Badge key={index} variant="outline">
                        {utility}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Owner Information */}
          {apartment.owner && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5" />
                  Owner Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">
                      {apartment.owner.firstName} {apartment.owner.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{apartment.owner.email}</p>
                  </div>
                  {apartment.owner.phone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{apartment.owner.phone}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Listed on:</span>
                <span className="font-medium">
                  {format(new Date(apartment.createdAt), "MMMM dd, yyyy")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last updated:</span>
                <span className="font-medium">
                  {format(new Date(apartment.updatedAt), "MMMM dd, yyyy")}
                </span>
              </div>
              {apartment.availability.availableFrom && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Available from:</span>
                  <span className="font-medium">
                    {format(
                      new Date(apartment.availability.availableFrom),
                      "MMMM dd, yyyy"
                    )}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
