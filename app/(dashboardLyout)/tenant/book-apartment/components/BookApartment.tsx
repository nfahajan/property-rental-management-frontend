"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { Grid, List, Heart, Building2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGetAllApartmentsQuery } from "@/redux/features/apartmentApi";
import { useGetMyApplicationsQuery } from "@/redux/features/applicationApi";
import PropertyCard from "./PropertyCard";
import PropertySearchFilters from "./PropertySearchFilters";
import PropertyDetailsDialog from "./PropertyDetailsDialog";
import { Apartment } from "@/redux/features/apartmentApi";
import { PropertySearchData } from "@/lib/validations/application";
import BookApartmentDialog from "./BookApartmentDialog";

export default function BookApartment() {
  // Simple state management
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(
    null
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [searchFilters, setSearchFilters] = useState<PropertySearchData>({});

  // API queries
  const {
    data: apartmentsResponse,
    isLoading: isLoadingApartments,
    error: apartmentsError,
    refetch: refetchApartments,
  } = useGetAllApartmentsQuery({});

  const { data: applicationsResponse } = useGetMyApplicationsQuery(undefined);

  // Stable data extraction - handle nested apartments array
  const apartments = useMemo(() => {
    if (!apartmentsResponse?.data) return [];

    // Handle both direct array and nested apartments structure
    if (Array.isArray(apartmentsResponse.data)) {
      return apartmentsResponse.data;
    }

    // Handle nested structure: data.apartments
    if (
      apartmentsResponse.data.apartments &&
      Array.isArray(apartmentsResponse.data.apartments)
    ) {
      return apartmentsResponse.data.apartments;
    }

    return [];
  }, [apartmentsResponse?.data]);

  const applications = useMemo(() => {
    if (!applicationsResponse?.data) return [];

    // Handle both direct array and any nested structure
    if (Array.isArray(applicationsResponse.data)) {
      return applicationsResponse.data;
    }

    // If data is an object, return empty array
    return [];
  }, [applicationsResponse?.data]);

  // Filter apartments - memoized to prevent infinite loops
  const filteredApartments = useMemo(() => {
    if (!apartments.length) return [];

    let filtered = [...apartments];

    // Text search
    if (searchFilters.search) {
      const searchTerm = searchFilters.search.toLowerCase();
      filtered = filtered.filter(
        (apartment) =>
          apartment.title.toLowerCase().includes(searchTerm) ||
          apartment.description.toLowerCase().includes(searchTerm) ||
          apartment.address.street.toLowerCase().includes(searchTerm) ||
          apartment.address.city.toLowerCase().includes(searchTerm) ||
          apartment.address.state.toLowerCase().includes(searchTerm)
      );
    }

    // Price range
    if (searchFilters.minRent) {
      filtered = filtered.filter(
        (apartment) => apartment.rent.amount >= searchFilters.minRent!
      );
    }
    if (searchFilters.maxRent) {
      filtered = filtered.filter(
        (apartment) => apartment.rent.amount <= searchFilters.maxRent!
      );
    }

    // Bedrooms
    if (searchFilters.bedrooms) {
      filtered = filtered.filter(
        (apartment) =>
          apartment.propertyDetails.bedrooms >= searchFilters.bedrooms!
      );
    }

    // Bathrooms
    if (searchFilters.bathrooms) {
      filtered = filtered.filter(
        (apartment) =>
          apartment.propertyDetails.bathrooms >= searchFilters.bathrooms!
      );
    }

    // Location
    if (searchFilters.city) {
      filtered = filtered.filter((apartment) =>
        apartment.address.city
          .toLowerCase()
          .includes(searchFilters.city!.toLowerCase())
      );
    }
    if (searchFilters.state) {
      filtered = filtered.filter((apartment) =>
        apartment.address.state
          .toLowerCase()
          .includes(searchFilters.state!.toLowerCase())
      );
    }

    // Amenities
    if (searchFilters.amenities && searchFilters.amenities.length > 0) {
      filtered = filtered.filter((apartment) =>
        searchFilters.amenities!.every(
          (amenity) =>
            apartment.amenities.some((aptAmenity: string) =>
              aptAmenity.toLowerCase().includes(amenity.toLowerCase())
            ) ||
            apartment.utilities.included.some((utility: string) =>
              utility.toLowerCase().includes(amenity.toLowerCase())
            )
        )
      );
    }

    // Sorting
    if (searchFilters.sortBy) {
      switch (searchFilters.sortBy) {
        case "rent_asc":
          filtered.sort((a, b) => a.rent.amount - b.rent.amount);
          break;
        case "rent_desc":
          filtered.sort((a, b) => b.rent.amount - a.rent.amount);
          break;
        case "newest":
          filtered.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
        case "oldest":
          filtered.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          break;
        case "bedrooms":
          filtered.sort(
            (a, b) => b.propertyDetails.bedrooms - a.propertyDetails.bedrooms
          );
          break;
        case "bathrooms":
          filtered.sort(
            (a, b) => b.propertyDetails.bathrooms - a.propertyDetails.bathrooms
          );
          break;
      }
    }

    // Only show available apartments
    return filtered.filter(
      (apartment) =>
        apartment.availability.status === "available" &&
        apartment.status === "active"
    );
  }, [apartments, searchFilters]);

  // Stable callback functions
  const hasAppliedForApartment = useCallback(
    (apartmentId: string) => {
      return applications.some((app) => app.apartment._id === apartmentId);
    },
    [applications]
  );

  const handleSearch = useCallback((filters: PropertySearchData) => {
    setSearchFilters(filters);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchFilters({});
  }, []);

  const handleViewDetails = useCallback((apartment: Apartment) => {
    setSelectedApartment(apartment);
    setIsDetailsOpen(true);
  }, []);

  const handleBookNow = useCallback(
    (apartment: Apartment) => {
      if (hasAppliedForApartment(apartment._id)) {
        toast.warning("Already Applied", {
          description:
            "You have already submitted an application for this property.",
        });
        return;
      }
      setSelectedApartment(apartment);
      setIsBookingOpen(true);
    },
    [hasAppliedForApartment]
  );

  const handleToggleFavorite = useCallback((apartmentId: string) => {
    setFavorites((prev) => {
      if (prev.includes(apartmentId)) {
        toast.success("Removed from favorites");
        return prev.filter((id) => id !== apartmentId);
      } else {
        toast.success("Added to favorites");
        return [...prev, apartmentId];
      }
    });
  }, []);

  const handleBookingSuccess = useCallback(() => {
    toast.success("Application Submitted!", {
      description: "Your rental application has been submitted successfully.",
    });
  }, []);

  const closeDialogs = useCallback(() => {
    setIsDetailsOpen(false);
    setIsBookingOpen(false);
    setSelectedApartment(null);
  }, []);

  // Loading skeleton
  const PropertySkeleton = useCallback(
    () => (
      <Card>
        <Skeleton className="h-48 w-full" />
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
        </CardContent>
      </Card>
    ),
    []
  );

  if (apartmentsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load properties. Please try again later.
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetchApartments()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Find Your Perfect Home
          </h1>
          <p className="text-gray-600 mt-2">
            Browse available properties and submit your rental applications
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <PropertySearchFilters
        onSearch={handleSearch}
        onClear={handleClearSearch}
        isLoading={isLoadingApartments}
      />

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">
            Available Properties
            {filteredApartments.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {filteredApartments.length}
              </Badge>
            )}
          </h2>
          {favorites.length > 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Heart className="h-3 w-3 fill-red-500 text-red-500" />
              {favorites.length} favorites
            </Badge>
          )}
        </div>
      </div>

      {/* Properties Grid */}
      {isLoadingApartments ? (
        <div
          className={`grid gap-6 ${
            viewMode === "grid"
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1"
          }`}
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <PropertySkeleton key={index} />
          ))}
        </div>
      ) : filteredApartments.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No properties found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or clear the filters to see all
              available properties.
            </p>
            <Button onClick={handleClearSearch} variant="outline">
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div
          className={`grid gap-6 ${
            viewMode === "grid"
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1"
          }`}
        >
          {filteredApartments.map((apartment) => (
            <PropertyCard
              key={apartment._id}
              apartment={apartment}
              onViewDetails={handleViewDetails}
              onBookNow={handleBookNow}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={favorites.includes(apartment._id)}
              className={viewMode === "list" ? "flex flex-row h-64" : ""}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <PropertyDetailsDialog
        apartment={selectedApartment}
        isOpen={isDetailsOpen}
        onClose={closeDialogs}
        onBookNow={handleBookNow}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={
          selectedApartment ? favorites.includes(selectedApartment._id) : false
        }
      />

      <BookApartmentDialog
        apartment={selectedApartment}
        isOpen={isBookingOpen}
        onClose={closeDialogs}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
}
