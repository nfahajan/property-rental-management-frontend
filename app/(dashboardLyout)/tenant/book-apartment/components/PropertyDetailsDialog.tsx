"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  DollarSign,
  Building,
  Heart,
  Share2,
  X,
  ChevronLeft,
  ChevronRight,
  Car,
  Wifi,
  Shield,
  TreePine,
  Waves,
  Dumbbell,
  Shirt,
  Home,
  UtensilsCrossed,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Apartment } from "@/redux/features/apartmentApi";
import { formatCurrency } from "@/lib/utils";

interface PropertyDetailsDialogProps {
  apartment: Apartment | null;
  isOpen: boolean;
  onClose: () => void;
  onBookNow: (apartment: Apartment) => void;
  onToggleFavorite?: (apartmentId: string) => void;
  isFavorite?: boolean;
}

const AMENITY_ICONS: Record<string, React.ComponentType<any>> = {
  Parking: Car,
  Internet: Wifi,
  Security: Shield,
  Garden: TreePine,
  Pool: Waves,
  Gym: Dumbbell,
  Laundry: Shirt,
  Balcony: Home,
  Kitchen: UtensilsCrossed,
};

export default function PropertyDetailsDialog({
  apartment,
  isOpen,
  onClose,
  onBookNow,
  onToggleFavorite,
  isFavorite = false,
}: PropertyDetailsDialogProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!apartment) return null;

  const formatAddress = () => {
    const { street, city, state, zipCode } = apartment.address;
    return `${street}, ${city}, ${state} ${zipCode}`;
  };

  const formatRent = () => {
    return formatCurrency(apartment.rent.amount, apartment.rent.currency);
  };

  const getAvailabilityBadge = () => {
    switch (apartment.availability.status) {
      case "available":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Available
          </Badge>
        );
      case "rented":
        return <Badge variant="secondary">Rented</Badge>;
      case "maintenance":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Maintenance
          </Badge>
        );
      case "unavailable":
        return <Badge variant="destructive">Unavailable</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getAmenityIcon = (amenity: string) => {
    const IconComponent = AMENITY_ICONS[amenity] || Home;
    return <IconComponent className="h-4 w-4" />;
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === apartment.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? apartment.images.length - 1 : prev - 1
    );
  };

  const isAvailable =
    apartment.availability.status === "available" &&
    apartment.status === "active";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{apartment.title}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-2">
                <MapPin className="h-4 w-4" />
                {formatAddress()}
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              {onToggleFavorite && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onToggleFavorite(apartment._id)}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      isFavorite ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                </Button>
              )}
              <Button size="sm" variant="outline">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Images Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative h-64 lg:h-80 w-full overflow-hidden rounded-lg">
              {apartment.images.length > 0 ? (
                <>
                  <Image
                    src={apartment.images[currentImageIndex]}
                    alt={`${apartment.title} - Image ${currentImageIndex + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />

                  {/* Image Navigation */}
                  {apartment.images.length > 1 && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>

                      {/* Image Counter */}
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-sm">
                        {currentImageIndex + 1} / {apartment.images.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                  <Building className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {apartment.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {apartment.images.slice(0, 4).map((image, index) => (
                  <button
                    key={index}
                    className={`relative h-16 w-full overflow-hidden rounded-lg ${
                      index === currentImageIndex ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <Image
                      src={image}
                      alt={`${apartment.title} - Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="25vw"
                    />
                  </button>
                ))}
                {apartment.images.length > 4 && (
                  <div className="relative h-16 w-full overflow-hidden rounded-lg bg-gray-200 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      +{apartment.images.length - 4}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Property Details */}
          <div className="space-y-6">
            {/* Price and Status */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-6 w-6 text-green-600" />
                      <span className="text-3xl font-bold text-green-600">
                        {formatRent()}
                      </span>
                      <span className="text-lg text-gray-600">
                        /{apartment.rent.period}
                      </span>
                    </div>
                  </div>
                  {getAvailabilityBadge()}
                </div>

                {/* Property Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <Bed className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium">
                      {apartment.propertyDetails.bedrooms}
                    </span>
                    <span className="text-xs text-gray-500">Bedrooms</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Bath className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium">
                      {apartment.propertyDetails.bathrooms}
                    </span>
                    <span className="text-xs text-gray-500">Bathrooms</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Square className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium">
                      {apartment.propertyDetails.squareFeet.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500">Sq Ft</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {apartment.description}
                </p>
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Property Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Floor:</span>
                    <span className="ml-2 font-medium">
                      {apartment.propertyDetails.floorNumber || "Ground"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Total Floors:</span>
                    <span className="ml-2 font-medium">
                      {apartment.propertyDetails.totalFloors || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Year Built:</span>
                    <span className="ml-2 font-medium">
                      {apartment.propertyDetails.yearBuilt || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className="ml-2 font-medium capitalize">
                      {apartment.status}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Utilities Included */}
            {apartment.utilities.included.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Utilities Included</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {apartment.utilities.included.map((utility, index) => (
                      <div key={index} className="flex items-center gap-2">
                        {getAmenityIcon(utility)}
                        <span className="text-sm">{utility}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Amenities */}
            {apartment.amenities.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Amenities</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {apartment.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2">
                        {getAmenityIcon(amenity)}
                        <span className="text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Availability */}
            {apartment.availability.availableFrom && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Availability
                  </h3>
                  <p className="text-sm text-gray-600">
                    Available from{" "}
                    {new Date(
                      apartment.availability.availableFrom
                    ).toLocaleDateString()}
                  </p>
                  {apartment.availability.leaseTerm && (
                    <p className="text-sm text-gray-600 mt-1">
                      Preferred lease term: {apartment.availability.leaseTerm}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => onBookNow(apartment)}
                disabled={!isAvailable}
                className="flex-1"
              >
                {isAvailable ? "Book Now" : "Not Available"}
              </Button>
              <Button variant="outline" onClick={onClose} className="px-6">
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
