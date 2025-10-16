"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useGetApartmentByIdQuery,
  useGetAllApartmentsQuery,
} from "@/redux/features/apartmentApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Heart,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Calendar,
  ArrowLeft,
  Check,
  Share2,
  MapPinned,
  Building2,
  DollarSign,
  Home,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs, FreeMode } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";
import "swiper/css/free-mode";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import BookApartmentDialog from "@/app/(dashboardLyout)/tenant/book-apartment/components/BookApartmentDialog";

// Custom Swiper Styles
const swiperCustomStyles = `
  .property-swiper .swiper-button-prev,
  .property-swiper .swiper-button-next {
    display: none !important;
  }
  
  .property-swiper .swiper-pagination-bullet {
    width: 10px;
    height: 10px;
    background: white;
    opacity: 0.6;
    transition: all 0.3s ease;
  }
  
  .property-swiper .swiper-pagination-bullet-active {
    background: white;
    opacity: 1;
    transform: scale(1.3);
  }
  
  .property-swiper .swiper-pagination {
    bottom: 20px !important;
  }
  
  .thumbs-swiper .swiper-slide {
    cursor: pointer;
    opacity: 0.6;
    transition: all 0.3s ease;
  }
  
  .thumbs-swiper .swiper-slide-thumb-active {
    opacity: 1;
    border-color: hsl(var(--primary)) !important;
  }
`;

export default function PropertyDetails() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false);

  // Fetch apartment details
  const {
    data: apartmentData,
    isLoading,
    error,
  } = useGetApartmentByIdQuery(params.id as string);

  const apartment = apartmentData?.data;

  // Fetch similar properties in the same city
  const { data: similarData } = useGetAllApartmentsQuery(
    {
      city: apartment?.address.city || "",
      limit: 3,
      status: "active",
      availability: "available",
    },
    {
      skip: !apartment?.address.city,
    }
  );

  const similarProperties =
    similarData?.data?.apartments.filter((p) => p._id !== apartment?._id) || [];

  const handleToggleSave = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setIsSaved(!isSaved);
    toast.success(isSaved ? "Removed from favorites" : "Added to favorites");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: apartment?.title,
          text: apartment?.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleBookNow = () => {
    if (!user) {
      // Redirect to login with return URL
      router.push(
        "/login?redirect=" + encodeURIComponent(window.location.pathname)
      );
      toast.info("Please login to book this property");
      return;
    }

    // Check if user is a tenant
    if (!user.roles?.includes("tenant")) {
      toast.error("Only tenants can book properties", {
        description: "Please register as a tenant to book properties.",
      });
      return;
    }

    // Show booking dialog
    setIsBookDialogOpen(true);
  };

  const handleBookingSuccess = () => {
    setIsBookDialogOpen(false);
    toast.success("Application submitted successfully!", {
      description: "You can track your application in your dashboard.",
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <Skeleton className="h-[600px] w-full mb-4" />
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-64 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
      </div>
    );
  }

  // Error or not found
  if (error || !apartment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Property Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The property you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/properties">Browse Properties</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const firstImage =
    apartment.images && apartment.images.length > 0
      ? apartment.images[0]
      : "/placeholder.jpg";

  return (
    <div className="min-h-screen bg-background">
      {/* Custom Swiper Styles */}
      <style jsx global>
        {swiperCustomStyles}
      </style>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          {/* Image Gallery */}
          {apartment.images && apartment.images.length > 0 && (
            <div className="space-y-4">
              {/* Main Swiper */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl group">
                <Swiper
                  modules={[Navigation, Pagination, Thumbs]}
                  navigation={{
                    prevEl: ".custom-swiper-button-prev",
                    nextEl: ".custom-swiper-button-next",
                  }}
                  pagination={{
                    clickable: true,
                    dynamicBullets: true,
                  }}
                  thumbs={{
                    swiper:
                      thumbsSwiper && !thumbsSwiper.destroyed
                        ? thumbsSwiper
                        : null,
                  }}
                  className="h-[400px] md:h-[600px] property-swiper"
                  spaceBetween={10}
                >
                  {apartment.images.map((image, index) => (
                    <SwiperSlide key={index}>
                      <div className="relative w-full h-full bg-muted">
                        <img
                          src={image}
                          alt={`${apartment.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.jpg";
                          }}
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Custom Navigation Buttons */}
                <button
                  className="custom-swiper-button-prev absolute left-4 top-1/2 -translate-y-1/2 z-10 
                    w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg
                    flex items-center justify-center
                    opacity-0 group-hover:opacity-100 transition-all duration-300
                    hover:bg-white hover:scale-110 active:scale-95
                    disabled:opacity-0 disabled:cursor-not-allowed"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-800" />
                </button>
                <button
                  className="custom-swiper-button-next absolute right-4 top-1/2 -translate-y-1/2 z-10
                    w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg
                    flex items-center justify-center
                    opacity-0 group-hover:opacity-100 transition-all duration-300
                    hover:bg-white hover:scale-110 active:scale-95
                    disabled:opacity-0 disabled:cursor-not-allowed"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6 text-gray-800" />
                </button>

                {apartment.availability.status === "available" && (
                  <Badge className="absolute top-6 left-6 bg-green-500 text-white z-10 px-4 py-2 text-sm">
                    Available Now
                  </Badge>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-6 right-6 z-10 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                  {apartment.images.length} Photos
                </div>
              </div>

              {/* Thumbnail Swiper */}
              {apartment.images.length > 1 && (
                <div className="relative">
                  <Swiper
                    onSwiper={setThumbsSwiper}
                    modules={[FreeMode, Thumbs, Navigation]}
                    navigation={{
                      prevEl: ".thumbs-button-prev",
                      nextEl: ".thumbs-button-next",
                    }}
                    spaceBetween={12}
                    slidesPerView={4}
                    freeMode={true}
                    watchSlidesProgress={true}
                    breakpoints={{
                      640: { slidesPerView: 5 },
                      768: { slidesPerView: 6 },
                      1024: { slidesPerView: 7 },
                    }}
                    className="thumbs-swiper group"
                  >
                    {apartment.images.map((image, index) => (
                      <SwiperSlide key={index}>
                        <div className="relative h-20 md:h-24 rounded-lg overflow-hidden cursor-pointer border-2 border-muted hover:border-primary transition-all">
                          <img
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.jpg";
                            }}
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  {/* Thumbnail Navigation Buttons */}
                  {apartment.images.length > 7 && (
                    <>
                      <button
                        className="thumbs-button-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-4
                          w-10 h-10 rounded-full bg-white shadow-md
                          flex items-center justify-center
                          hover:bg-gray-50 hover:scale-105 active:scale-95
                          transition-all duration-200
                          disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Previous thumbnails"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-700" />
                      </button>
                      <button
                        className="thumbs-button-next absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-4
                          w-10 h-10 rounded-full bg-white shadow-md
                          flex items-center justify-center
                          hover:bg-gray-50 hover:scale-105 active:scale-95
                          transition-all duration-200
                          disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Next thumbnails"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-700" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title and Info */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-4xl font-bold mb-3 text-balance">
                      {apartment.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <span className="font-medium">
                          {apartment.address.street}, {apartment.address.city},{" "}
                          {apartment.address.state} {apartment.address.zipCode}
                        </span>
                      </p>
                    </div>
                  </div>
                  {user?.roles?.includes("tenant") && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleToggleSave}
                      className="h-12 w-12"
                    >
                      <Heart
                        className={`h-6 w-6 ${
                          isSaved ? "fill-red-500 text-red-500" : ""
                        }`}
                      />
                    </Button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Badge
                    variant="secondary"
                    className="text-base px-4 py-2 font-medium capitalize"
                  >
                    {apartment.availability.status}
                  </Badge>
                  <div className="flex items-center gap-6 text-base">
                    <span className="flex items-center gap-2 font-medium">
                      <Bed className="h-5 w-5 text-primary" />
                      {apartment.propertyDetails.bedrooms} Beds
                    </span>
                    <span className="flex items-center gap-2 font-medium">
                      <Bath className="h-5 w-5 text-primary" />
                      {apartment.propertyDetails.bathrooms} Baths
                    </span>
                    <span className="flex items-center gap-2 font-medium">
                      <Maximize className="h-5 w-5 text-primary" />
                      {apartment.propertyDetails.squareFeet} sqft
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div>
                <h2 className="text-2xl font-bold mb-4">About This Property</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {apartment.description}
                </p>
              </div>

              {/* Property Details */}
              {(apartment.propertyDetails.floorNumber ||
                apartment.propertyDetails.yearBuilt) && (
                <>
                  <Separator />
                  <div>
                    <h2 className="text-2xl font-bold mb-4">
                      Property Details
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {apartment.propertyDetails.floorNumber !== undefined && (
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                          <Layers className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Floor
                            </p>
                            <p className="font-semibold">
                              {apartment.propertyDetails.floorNumber}
                            </p>
                          </div>
                        </div>
                      )}
                      {apartment.propertyDetails.totalFloors && (
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                          <Building2 className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Total Floors
                            </p>
                            <p className="font-semibold">
                              {apartment.propertyDetails.totalFloors}
                            </p>
                          </div>
                        </div>
                      )}
                      {apartment.propertyDetails.yearBuilt && (
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                          <Calendar className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Year Built
                            </p>
                            <p className="font-semibold">
                              {apartment.propertyDetails.yearBuilt}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Amenities */}
              {apartment.amenities && apartment.amenities.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h2 className="text-2xl font-bold mb-4">
                      Amenities & Features
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {apartment.amenities.map((amenity, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Check className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Utilities */}
              {apartment.utilities.included &&
                apartment.utilities.included.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h2 className="text-2xl font-bold mb-4">
                        Utilities Included
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {apartment.utilities.included.map((utility, index) => (
                          <Badge
                            key={index}
                            variant="default"
                            className="px-4 py-2"
                          >
                            {utility}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

              <Separator />

              {/* Location */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Location</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                    <MapPinned className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-semibold">
                        {apartment.address.street}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {apartment.address.city}, {apartment.address.state}{" "}
                        {apartment.address.zipCode}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {apartment.address.country}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Booking Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 shadow-lg">
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <DollarSign className="h-6 w-6 text-primary" />
                      <span className="text-4xl font-bold text-primary">
                        {apartment.rent.amount.toLocaleString()}
                      </span>
                      <span className="text-lg text-muted-foreground">
                        {apartment.rent.currency}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      per {apartment.rent.period}
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="font-semibold">Availability</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Status
                        </span>
                        <Badge className="capitalize">
                          {apartment.availability.status}
                        </Badge>
                      </div>
                      {apartment.availability.availableFrom && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Available From
                          </span>
                          <span className="text-sm font-medium">
                            {new Date(
                              apartment.availability.availableFrom
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {apartment.availability.leaseTerm && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Lease Term
                          </span>
                          <span className="text-sm font-medium">
                            {apartment.availability.leaseTerm}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    {apartment.availability.status === "available" ? (
                      <Button
                        onClick={handleBookNow}
                        size="lg"
                        className="w-full"
                      >
                        <Home className="h-5 w-5 mr-2" />
                        Book Now
                      </Button>
                    ) : (
                      <Button disabled size="lg" className="w-full">
                        Not Available
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full"
                      asChild
                    >
                      <Link href="/properties">Browse More Properties</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Similar Properties */}
          {similarProperties.length > 0 && (
            <div className="space-y-6 mt-12">
              <Separator />
              <div>
                <h2 className="text-3xl font-bold mb-6">
                  Similar Properties Nearby
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {similarProperties.map((property) => (
                    <Card
                      key={property._id}
                      className="overflow-hidden hover:shadow-lg transition-all group"
                    >
                      <Link href={`/properties/${property._id}`}>
                        <div className="relative h-48 w-full overflow-hidden bg-muted">
                          <img
                            src={property.images[0] || "/placeholder.jpg"}
                            alt={property.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.jpg";
                            }}
                          />
                        </div>
                      </Link>
                      <CardContent className="p-5 space-y-3">
                        <Link href={`/properties/${property._id}`}>
                          <h3 className="font-bold text-lg hover:text-primary transition-colors line-clamp-1">
                            {property.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {property.address.city}, {property.address.state}
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="text-xl font-bold text-primary">
                            ${property.rent.amount.toLocaleString()}
                          </div>
                          <Button asChild size="sm">
                            <Link href={`/properties/${property._id}`}>
                              View
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Book Apartment Dialog */}
      <BookApartmentDialog
        apartment={apartment}
        isOpen={isBookDialogOpen}
        onClose={() => setIsBookDialogOpen(false)}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
}
