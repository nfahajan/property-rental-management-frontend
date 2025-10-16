"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Square, Heart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface PropertyCardProps {
  id?: string | number;
  image: string;
  title: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
  sqft: number;
  featured?: boolean;
  rating?: number;
}

export function PropertyCard({
  id = "1",
  image,
  title,
  location,
  price,
  beds,
  baths,
  sqft,
  featured = false,
  rating = 4.8,
}: PropertyCardProps) {
  return (
    <Card className="overflow-hidden group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-card">
      <Link href={`/properties/${id}`} className="block">
        <div className="relative h-72 overflow-hidden">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/20" />

          {/* Top badges */}
          <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
            <div className="flex gap-2">
            
              <Badge className="bg-background/95 text-foreground font-semibold shadow-lg backdrop-blur-sm">
                For Rent
              </Badge>
            </div>
            
          </div>

          {/* Bottom price and rating */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between z-10">
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-xl backdrop-blur-sm">
              <div className="text-2xl font-bold">{price}</div>
              <div className="text-xs opacity-90">per month</div>
            </div>
            <div className="flex items-center gap-1 bg-background/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold">{rating}</span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
              {title}
            </h3>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
              <span className="text-sm line-clamp-1">{location}</span>
            </div>
          </div>

          {/* Property features with modern styling */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <div className="p-2 rounded-lg bg-muted/50">
                <Bed className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Beds</div>
                <div className="text-sm font-semibold text-foreground">
                  {beds}
                </div>
              </div>
            </div>

            <div className="h-10 w-px bg-border" />

            <div className="flex items-center gap-1.5 text-muted-foreground">
              <div className="p-2 rounded-lg bg-muted/50">
                <Bath className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Baths</div>
                <div className="text-sm font-semibold text-foreground">
                  {baths}
                </div>
              </div>
            </div>

            <div className="h-10 w-px bg-border" />

            <div className="flex items-center gap-1.5 text-muted-foreground">
              <div className="p-2 rounded-lg bg-muted/50">
                <Square className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Area</div>
                <div className="text-sm font-semibold text-foreground">
                  {sqft}
                </div>
              </div>
            </div>
          </div>

          <Button
            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 bg-transparent"
            variant="outline"
            size="lg"
          >
            View Details
          </Button>
        </div>
      </Link>
    </Card>
  );
}
