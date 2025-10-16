"use client";

import { PropertyCard } from "./PropertyCard";
import { useGetAllApartmentsQuery } from "@/redux/features/apartmentApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import Link from "next/link";

export function FeaturedProperties() {
  // Fetch 6 newest available apartments
  const { data, isLoading, error } = useGetAllApartmentsQuery({
    page: 1,
    limit: 6,
    status: "active",
    availability: "available",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const apartments = data?.data?.apartments || [];

  return (
    <section id="properties" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-block">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              Premium Selection
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-oswald font-bold text-foreground text-balance">
            Featured Properties
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            Discover our handpicked collection of exceptional properties,
            carefully selected for their quality, location, and value
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-72 w-full" />
                <div className="p-6 space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Card className="p-12 text-center">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Unable to Load Properties
            </h3>
            <p className="text-muted-foreground mb-4">
              Please try again later or browse all properties
            </p>
            <Button asChild>
              <Link href="/properties">Browse All Properties</Link>
            </Button>
          </Card>
        )}

        {/* Properties Grid */}
        {!isLoading && !error && apartments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {apartments.map((apartment) => (
              <PropertyCard
                key={apartment._id}
                id={apartment._id}
                image={apartment.images[0] || "/placeholder.jpg"}
                title={apartment.title}
                location={`${apartment.address.city}, ${apartment.address.state}`}
                price={`$${apartment.rent.amount.toLocaleString()}`}
                beds={apartment.propertyDetails.bedrooms}
                baths={apartment.propertyDetails.bathrooms}
                sqft={apartment.propertyDetails.squareFeet}
                featured={true}
                rating={4.8}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && apartments.length === 0 && (
          <Card className="p-12 text-center">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              No Properties Available
            </h3>
            <p className="text-muted-foreground mb-4">
              Check back soon for new listings
            </p>
            <Button asChild>
              <Link href="/properties">Browse All Properties</Link>
            </Button>
          </Card>
        )}

        {/* View All Button */}
        {!isLoading && apartments.length > 0 && (
          <div className="text-center mt-12">
            <Button asChild size="lg" className="px-8">
              <Link href="/properties">View All Properties</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
