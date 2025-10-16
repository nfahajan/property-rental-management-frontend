"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  DollarSign,
  Eye,
  Heart,
} from "lucide-react";
import { Apartment } from "@/redux/features/apartmentApi";
import { formatCurrency } from "@/lib/utils";

interface PropertyCardProps {
  apartment: Apartment;
  onViewDetails: (apartment: Apartment) => void;
  onBookNow: (apartment: Apartment) => void;
  onToggleFavorite?: (apartmentId: string) => void;
  isFavorite?: boolean;
  className?: string;
}

export default function PropertyCard({
  apartment,
  onViewDetails,
  onBookNow,
  onToggleFavorite,
  isFavorite = false,
  className = "",
}: PropertyCardProps) {
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

  const getMainImage = () => {
    if (apartment.images && apartment.images.length > 0) {
      return apartment.images[0];
    }
    return "/placeholder.jpg";
  };

  const isAvailable =
    apartment.availability.status === "available" &&
    apartment.status === "active";

  return (
    <Card
      className={`group overflow-hidden hover:shadow-lg transition-all duration-300 ${className}`}
    >
      {/* Image Section */}
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={getMainImage()}
          alt={apartment.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Overlay with badges and actions */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <div className="flex flex-col gap-2">
            {getAvailabilityBadge()}
            {apartment.amenities.length > 0 && (
              <Badge variant="outline" className="bg-white/90 text-gray-700">
                {apartment.amenities.length} amenities
              </Badge>
            )}
          </div>

          <div className="flex gap-2">
            {onToggleFavorite && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(apartment._id);
                }}
              >
                <Heart
                  className={`h-4 w-4 ${
                    isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
                  }`}
                />
              </Button>
            )}
          </div>
        </div>

        {/* Price overlay */}
        <div className="absolute bottom-3 left-3">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2">
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-lg font-bold text-gray-900">
                {formatRent()}
              </span>
              <span className="text-sm text-gray-600">
                /{apartment.rent.period}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="p-4 space-y-3">
        {/* Title and Location */}
        <div>
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1 mb-1">
            {apartment.title}
          </h3>
          <div className="flex items-center gap-1 text-gray-600">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm line-clamp-1">{formatAddress()}</span>
          </div>
        </div>

        {/* Property Details */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            <span>{apartment.propertyDetails.bedrooms} bed</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            <span>{apartment.propertyDetails.bathrooms} bath</span>
          </div>
          <div className="flex items-center gap-1">
            <Square className="h-4 w-4" />
            <span>
              {apartment.propertyDetails.squareFeet.toLocaleString()} sqft
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2">
          {apartment.description}
        </p>

        {/* Utilities */}
        {apartment.utilities.included.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {apartment.utilities.included.slice(0, 3).map((utility, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {utility}
              </Badge>
            ))}
            {apartment.utilities.included.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{apartment.utilities.included.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Available From */}
        {apartment.availability.availableFrom && (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>
              Available from{" "}
              {new Date(
                apartment.availability.availableFrom
              ).toLocaleDateString()}
            </span>
          </div>
        )}
      </CardContent>

      {/* Footer Actions */}
      <CardFooter className="p-4 pt-0">
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onViewDetails(apartment)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>

          <Button
            size="sm"
            className="flex-1"
            onClick={() => onBookNow(apartment)}
            disabled={!isAvailable}
          >
            {isAvailable ? "Book Now" : "Not Available"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
