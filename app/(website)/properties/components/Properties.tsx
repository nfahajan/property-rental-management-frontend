"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useGetAllApartmentsQuery,
  Apartment,
} from "@/redux/features/apartmentApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Building2,
  MapPin,
  Bed,
  Bath,
  Maximize,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  XCircle,
  DollarSign,
  Filter,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// Common amenities list
const COMMON_AMENITIES = [
  "Air Conditioning",
  "Heating",
  "WiFi",
  "Parking",
  "Elevator",
  "Gym",
  "Pool",
  "Security",
  "Balcony",
  "Garden",
  "Pet Friendly",
  "Furnished",
  "Dishwasher",
  "Washer/Dryer",
  "Hardwood Floors",
];

export default function Properties() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter states
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [state, setState] = useState(searchParams.get("state") || "");
  const [bedrooms, setBedrooms] = useState<string>(
    searchParams.get("bedrooms") || "all"
  );
  const [bathrooms, setBathrooms] = useState<string>(
    searchParams.get("bathrooms") || "all"
  );
  const [minRent, setMinRent] = useState<number>(0);
  const [maxRent, setMaxRent] = useState<number>(100000);
  const [availability, setAvailability] = useState<string>("available");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState<number>(
    Number(searchParams.get("page")) || 1
  );
  const [showFilters, setShowFilters] = useState(false);

  // Temporary search values (for "Apply Filters" button)
  const [tempSearch, setTempSearch] = useState(search);
  const [tempCity, setTempCity] = useState(city);
  const [tempState, setTempState] = useState(state);

  // Build query parameters
  const queryParams = {
    page,
    limit: 12,
    ...(search && { search }),
    ...(city && { city }),
    ...(state && { state }),
    ...(bedrooms && bedrooms !== "all" && { bedrooms: Number(bedrooms) }),
    ...(bathrooms && bathrooms !== "all" && { bathrooms: Number(bathrooms) }),
    minRent: minRent,
    maxRent: maxRent,
    availability,
    status: "active", // Only show active apartments
    sortBy,
    sortOrder,
  };

  // Fetch apartments
  const { data, isLoading, error, refetch } =
    useGetAllApartmentsQuery(queryParams);

  const apartments = data?.data?.apartments || [];
  const pagination = data?.data?.pagination;

  // Handle filter application
  const applyFilters = () => {
    setSearch(tempSearch);
    setCity(tempCity);
    setState(tempState);
    setPage(1); // Reset to first page
  };

  // Clear all filters
  const clearFilters = () => {
    setTempSearch("");
    setTempCity("");
    setTempState("");
    setSearch("");
    setCity("");
    setState("");
    setBedrooms("all");
    setBathrooms("all");
    setMinRent(0);
    setMaxRent(100000);
    setAvailability("available");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    switch (value) {
      case "newest":
        setSortBy("createdAt");
        setSortOrder("desc");
        break;
      case "oldest":
        setSortBy("createdAt");
        setSortOrder("asc");
        break;
      case "price-low":
        setSortBy("rent.amount");
        setSortOrder("asc");
        break;
      case "price-high":
        setSortBy("rent.amount");
        setSortOrder("desc");
        break;
      case "bedrooms-high":
        setSortBy("propertyDetails.bedrooms");
        setSortOrder("desc");
        break;
      case "area-large":
        setSortBy("propertyDetails.squareFeet");
        setSortOrder("desc");
        break;
      default:
        setSortBy("createdAt");
        setSortOrder("desc");
    }
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (search) count++;
    if (city) count++;
    if (state) count++;
    if (bedrooms && bedrooms !== "all") count++;
    if (bathrooms && bathrooms !== "all") count++;
    if (minRent > 0) count++;
    if (maxRent < 100000) count++;
    if (availability !== "available") count++;
    return count;
  };

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error("Failed to load properties", {
        description: "Please try again later or adjust your filters.",
      });
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Perfect Home
            </h1>
            <p className="text-lg text-primary-foreground/90 mb-6">
              Browse through {pagination?.total || "our"} available properties
              with advanced search and filtering
            </p>

            {/* Quick Search Bar */}
            <div className="bg-background rounded-lg p-4 shadow-lg">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search by location, title, or description..."
                    value={tempSearch}
                    onChange={(e) => setTempSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                    className="pl-10 text-black h-11"
                  />
                </div>
                <Button
                  onClick={applyFilters}
                  size="lg"
                  className="md:w-auto w-full"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside
            className={`lg:w-80 ${
              showFilters ? "block" : "hidden lg:block"
            } lg:block`}
          >
            <div className="sticky top-4 space-y-4">
              <Card>
                <CardContent className="p-6 space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Filters
                      {getActiveFilterCount() > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {getActiveFilterCount()}
                        </Badge>
                      )}
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      disabled={getActiveFilterCount() === 0}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  </div>

                  {/* Location */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Location</Label>
                    <div className="space-y-2">
                      <Input
                        placeholder="City"
                        value={tempCity}
                        onChange={(e) => setTempCity(e.target.value)}
                      />
                      <Input
                        placeholder="State"
                        value={tempState}
                        onChange={(e) => setTempState(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">
                      Property Details
                    </Label>
                    <div className="space-y-3">
                      {/* Bedrooms */}
                      <div className="space-y-2">
                        <Label className="text-sm">Bedrooms</Label>
                        <Select value={bedrooms} onValueChange={setBedrooms}>
                          <SelectTrigger>
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any</SelectItem>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="5">5+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Bathrooms */}
                      <div className="space-y-2">
                        <Label className="text-sm">Bathrooms</Label>
                        <Select value={bathrooms} onValueChange={setBathrooms}>
                          <SelectTrigger>
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any</SelectItem>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">
                        Monthly Rent
                      </Label>
                      <span className="text-sm text-muted-foreground">
                        ${minRent.toLocaleString()} - $
                        {maxRent === 100000
                          ? "100k+"
                          : `$${maxRent.toLocaleString()}`}
                      </span>
                    </div>
                    <Slider
                      min={0}
                      max={100000}
                      step={1000}
                      value={[minRent, maxRent]}
                      onValueChange={(value) => {
                        setMinRent(value[0]);
                        setMaxRent(value[1]);
                      }}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>$0</span>
                      <span>$100,000+</span>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">
                      Availability
                    </Label>
                    <Select
                      value={availability}
                      onValueChange={setAvailability}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available Now</SelectItem>
                        <SelectItem value="rented">Rented</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Apply Filters Button */}
                  <Button onClick={applyFilters} className="w-full" size="lg">
                    Apply Filters
                  </Button>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/30 p-4 rounded-lg">
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  {showFilters ? "Hide" : "Show"} Filters
                  {getActiveFilterCount() > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {getActiveFilterCount()}
                    </Badge>
                  )}
                </Button>
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-semibold text-foreground">
                      {isLoading ? "..." : pagination?.total || 0}
                    </span>{" "}
                    properties found
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-sm whitespace-nowrap">Sort by:</Label>
                <Select
                  value={`${sortBy}-${sortOrder}`}
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="price-low">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-high">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="bedrooms-high">Most Bedrooms</SelectItem>
                    <SelectItem value="area-large">Largest Area</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-56 w-full" />
                    <CardContent className="p-5 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <Card>
                <CardContent className="text-center py-16">
                  <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    Failed to Load Properties
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    There was an error loading the properties. Please try again.
                  </p>
                  <Button onClick={() => refetch()}>Try Again</Button>
                </CardContent>
              </Card>
            )}

            {/* No Results */}
            {!isLoading && !error && apartments.length === 0 && (
              <Card>
                <CardContent className="text-center py-16">
                  <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    No Properties Found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search filters to find more properties
                  </p>
                  <Button onClick={clearFilters} variant="outline">
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Properties Grid */}
            {!isLoading && !error && apartments.length > 0 && (
              <>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {apartments.map((apartment: Apartment) => (
                    <PropertyCard key={apartment._id} apartment={apartment} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-muted-foreground">
                          Page {pagination.page} of {pagination.pages} (
                          {pagination.total} total properties)
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                          </Button>
                          <div className="flex items-center gap-1">
                            {Array.from(
                              { length: Math.min(pagination.pages, 5) },
                              (_, i) => {
                                const pageNum =
                                  pagination.pages <= 5
                                    ? i + 1
                                    : page <= 3
                                    ? i + 1
                                    : page >= pagination.pages - 2
                                    ? pagination.pages - 4 + i
                                    : page - 2 + i;
                                return (
                                  <Button
                                    key={pageNum}
                                    variant={
                                      page === pageNum ? "default" : "outline"
                                    }
                                    size="sm"
                                    onClick={() => setPage(pageNum)}
                                    className="w-10"
                                  >
                                    {pageNum}
                                  </Button>
                                );
                              }
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page + 1)}
                            disabled={page === pagination.pages}
                          >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Property Card Component
function PropertyCard({ apartment }: { apartment: Apartment }) {
  const firstImage =
    apartment.images && apartment.images.length > 0
      ? apartment.images[0]
      : "/placeholder.jpg";

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <Link href={`/properties/${apartment._id}`}>
        <div className="relative h-56 w-full overflow-hidden bg-muted">
          <img
            src={firstImage}
            alt={apartment.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.jpg";
            }}
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className="bg-primary/90 backdrop-blur-sm capitalize">
              {apartment.availability.status}
            </Badge>
            {apartment.images.length > 1 && (
              <Badge variant="secondary" className="backdrop-blur-sm">
                {apartment.images.length} photos
              </Badge>
            )}
          </div>
        </div>
      </Link>

      <CardContent className="p-5 space-y-4">
        <div>
          <Link href={`/properties/${apartment._id}`}>
            <h3 className="font-bold text-lg mb-1 hover:text-primary transition-colors line-clamp-1">
              {apartment.title}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="line-clamp-1">
              {apartment.address.city}, {apartment.address.state}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Bed className="h-4 w-4" />
            {apartment.propertyDetails.bedrooms}
          </span>
          <span className="flex items-center gap-1.5">
            <Bath className="h-4 w-4" />
            {apartment.propertyDetails.bathrooms}
          </span>
          <span className="flex items-center gap-1.5">
            <Maximize className="h-4 w-4" />
            {apartment.propertyDetails.squareFeet} sqft
          </span>
        </div>

        {apartment.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {apartment.amenities.slice(0, 3).map((amenity, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {apartment.amenities.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{apartment.amenities.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div>
            <p className="text-2xl font-bold text-primary flex items-center">
              <DollarSign className="h-5 w-5" />
              {apartment.rent.amount.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              per {apartment.rent.period}
            </p>
          </div>
          <Button asChild size="sm">
            <Link href={`/properties/${apartment._id}`}>View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
