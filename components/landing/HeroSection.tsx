"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, Building2, DollarSign, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useGetAllApartmentsQuery } from "@/redux/features/apartmentApi";

export function HeroSection() {
  const router = useRouter();
  const [searchLocation, setSearchLocation] = useState("");
  const [searchBedrooms, setSearchBedrooms] = useState("all");
  const [searchPriceRange, setSearchPriceRange] = useState("all");

  const handleSearch = () => {
    // Build search URL parameters
    const params = new URLSearchParams();

    if (searchLocation.trim()) {
      params.set("search", searchLocation.trim());
    }

    if (searchBedrooms !== "all") {
      params.set("bedrooms", searchBedrooms);
    }

    if (searchPriceRange !== "all") {
      const [min, max] = searchPriceRange.split("-");
      if (min) params.set("minRent", min);
      if (max) params.set("maxRent", max);
    }

    // Navigate to properties page with filters
    const searchQuery = params.toString();
    router.push(`/properties${searchQuery ? `?${searchQuery}` : ""}`);

    toast.success("Searching properties...", {
      description: "Taking you to the search results",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleQuickFilter = (bedrooms: string, priceRange: string) => {
    setSearchBedrooms(bedrooms);
    setSearchPriceRange(priceRange);

    // Auto search after quick filter
    setTimeout(() => {
      const params = new URLSearchParams();
      if (bedrooms !== "all") params.set("bedrooms", bedrooms);
      if (priceRange !== "all") {
        const [min, max] = priceRange.split("-");
        if (min) params.set("minRent", min);
        if (max) params.set("maxRent", max);
      }
      router.push(`/properties?${params.toString()}`);
    }, 300);
  };

  return (
    <section className="relative min-h-[90vh] py-10 md:py-5 flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url(/main.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/80" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 z-10 text-center">
        <div className="mb-6 inline-flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-sm font-semibold text-primary uppercase tracking-wider bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
            Premium Property Rentals
          </span>
        </div>
        <h1 className="text-5xl md:text-7xl font-oswald font-bold text-white mb-6 text-balance leading-tight">
          Find Your Perfect Home
        </h1>
        <p className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto text-pretty">
          Discover exceptional properties tailored to your lifestyle. Your dream
          home awaits.
        </p>

        {/* Enhanced Search Bar */}
        <div className="max-w-5xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-4 hover:shadow-3xl transition-shadow">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Location Search */}
            <div className="flex-1 relative group">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
              <Input
                type="text"
                placeholder="Search by city, state, or location..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-12 h-14 border-2 border-muted focus-visible:border-primary focus-visible:ring-0 rounded-xl text-base bg-background transition-all"
              />
            </div>

            {/* Bedrooms Select */}
            <div className="md:w-52 relative group">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
              <Select value={searchBedrooms} onValueChange={setSearchBedrooms}>
                <SelectTrigger className="h-14 pl-12 border-2 border-muted focus:border-primary rounded-xl bg-background hover:bg-muted/50 transition-all">
                  <SelectValue placeholder="Bedrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Bedrooms</SelectItem>
                  <SelectItem value="1">1 Bedroom</SelectItem>
                  <SelectItem value="2">2 Bedrooms</SelectItem>
                  <SelectItem value="3">3 Bedrooms</SelectItem>
                  <SelectItem value="4">4 Bedrooms</SelectItem>
                  <SelectItem value="5">5+ Bedrooms</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Range Select */}
            <div className="md:w-56 relative group">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
              <Select
                value={searchPriceRange}
                onValueChange={setSearchPriceRange}
              >
                <SelectTrigger className="h-14 pl-12 border-2 border-muted focus:border-primary rounded-xl bg-background hover:bg-muted/50 transition-all">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Price</SelectItem>
                  <SelectItem value="0-1000">Under $1,000</SelectItem>
                  <SelectItem value="1000-2000">$1,000 - $2,000</SelectItem>
                  <SelectItem value="2000-3000">$2,000 - $3,000</SelectItem>
                  <SelectItem value="3000-5000">$3,000 - $5,000</SelectItem>
                  <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
                  <SelectItem value="10000-100000">$10,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search Button */}
            <Button
              size="lg"
              className="h-14 px-10 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 bg-primary hover:bg-primary/90"
              onClick={handleSearch}
            >
              <Search className="h-5 w-5 mr-2" />
              Search
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center border-t border-muted pt-4">
            <span className="text-xs text-muted-foreground font-medium self-center mr-2">
              Quick Filters:
            </span>
            <Button
              variant="outline"
              size="sm"
              className="text-xs rounded-full hover:bg-primary hover:text-white transition-all"
              onClick={() => handleQuickFilter("2", "1000-2000")}
            >
              2 Bed • $1k-$2k
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs rounded-full hover:bg-primary hover:text-white transition-all"
              onClick={() => handleQuickFilter("3", "2000-3000")}
            >
              3 Bed • $2k-$3k
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs rounded-full hover:bg-primary hover:text-white transition-all"
              onClick={() => handleQuickFilter("1", "0-1000")}
            >
              Studio/1 Bed
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs rounded-full hover:bg-primary hover:text-white transition-all"
              onClick={() => handleQuickFilter("all", "5000-10000")}
            >
              Luxury ($5k+)
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="text-white backdrop-blur-sm bg-white/5 rounded-2xl p-6 hover:bg-white/10 transition-all group">
            <div className="text-3xl md:text-4xl font-bold mb-2 group-hover:scale-110 transition-transform">
              2,500+
            </div>
            <div className="text-sm text-white/80">Properties Available</div>
          </div>
          <div className="text-white backdrop-blur-sm bg-white/5 rounded-2xl p-6 hover:bg-white/10 transition-all group">
            <div className="text-3xl md:text-4xl font-bold mb-2 group-hover:scale-110 transition-transform">
              1,200+
            </div>
            <div className="text-sm text-white/80">Happy Tenants</div>
          </div>
          <div className="text-white backdrop-blur-sm bg-white/5 rounded-2xl p-6 hover:bg-white/10 transition-all group">
            <div className="text-3xl md:text-4xl font-bold mb-2 group-hover:scale-110 transition-transform">
              50+
            </div>
            <div className="text-sm text-white/80">Cities Covered</div>
          </div>
          <div className="text-white backdrop-blur-sm bg-white/5 rounded-2xl p-6 hover:bg-white/10 transition-all group">
            <div className="text-3xl md:text-4xl font-bold mb-2 group-hover:scale-110 transition-transform">
              15+
            </div>
            <div className="text-sm text-white/80">Years Experience</div>
          </div>
        </div>
      </div>
    </section>
  );
}
