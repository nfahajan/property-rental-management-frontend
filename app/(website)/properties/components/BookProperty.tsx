"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/mock-db";
import type { Property } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, MapPin, DollarSign } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function BookProperty() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    message: "",
  });

  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (!user || !user.roles.includes("tenant")) {
      router.push("/login");
      return;
    }

    const propertyId = params.id as string;
    const foundProperty = db.properties.getById(propertyId);

    if (!foundProperty) {
      router.push("/properties");
      return;
    }

    setProperty(foundProperty);
  }, [params.id, user, router]);

  useEffect(() => {
    if (formData.startDate && formData.endDate && property) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const months = Math.max(
        1,
        Math.ceil(
          (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)
        )
      );
      setTotalPrice(property.price * months);
    }
  }, [formData.startDate, formData.endDate, property]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !property) return;

    setIsLoading(true);

    const booking = {
      id: Date.now().toString(),
      propertyId: property.id,
      buyerId: user._id,
      sellerId: property.sellerId,
      startDate: formData.startDate,
      endDate: formData.endDate,
      totalPrice,
      status: "pending" as const,
      message: formData.message,
      createdAt: new Date().toISOString(),
    };

    db.bookings.create(booking);
    setIsLoading(false);
    router.push("/properties");
  };

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild>
              <Link href={`/properties/${property.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Property
              </Link>
            </Button>
            <Link href="/" className="text-xl font-bold">
              HomeNest
            </Link>
            <div className="w-32" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Book Property</h1>
            <p className="text-muted-foreground mt-1">
              Complete your booking request
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit}>
                <Card>
                  <CardHeader>
                    <CardTitle>Booking Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date *</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              startDate: e.target.value,
                            })
                          }
                          min={new Date().toISOString().split("T")[0]}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date *</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={formData.endDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              endDate: e.target.value,
                            })
                          }
                          min={
                            formData.startDate ||
                            new Date().toISOString().split("T")[0]
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">
                        Message to Owner (Optional)
                      </Label>
                      <Textarea
                        id="message"
                        placeholder="Tell the owner about yourself and why you're interested in this property..."
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        rows={4}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Monthly rent
                        </span>
                        <span className="font-medium">${property.price}</span>
                      </div>
                      {formData.startDate && formData.endDate && (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Duration
                            </span>
                            <span className="font-medium">
                              {Math.max(
                                1,
                                Math.ceil(
                                  (new Date(formData.endDate).getTime() -
                                    new Date(formData.startDate).getTime()) /
                                    (1000 * 60 * 60 * 24 * 30)
                                )
                              )}{" "}
                              month(s)
                            </span>
                          </div>
                          <Separator />
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">Total Amount</span>
                            <span className="text-2xl font-bold text-primary">
                              ${totalPrice}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={isLoading}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      {isLoading ? "Submitting..." : "Submit Booking Request"}
                    </Button>
                  </CardContent>
                </Card>
              </form>
            </div>

            {/* Property Summary */}
            <div>
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="relative h-40 rounded-lg overflow-hidden">
                    <Image
                      src={property.images[0] || "/placeholder.svg"}
                      alt={property.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      {property.title}
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {property.city}
                    </p>
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-medium capitalize">
                        {property.type}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Bedrooms</span>
                      <span className="font-medium">{property.bedrooms}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Bathrooms</span>
                      <span className="font-medium">{property.bathrooms}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Area</span>
                      <span className="font-medium">{property.area} sqft</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        ${property.price}
                      </p>
                      <p className="text-xs text-muted-foreground">per month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
