"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  Loader2,
  MapPin,
  Bed,
  Bath,
  Maximize,
  DollarSign,
  Calendar,
  Plus,
  X,
  CheckCircle2,
  ArrowLeft,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  apartmentSchema,
  ApartmentFormData,
} from "@/lib/validations/apartment";
import { useGetApartmentByIdQuery } from "@/redux/features/apartmentApi";
import ImageUpload from "@/components/shared/ImageUpload";
import { getAccessToken } from "@/lib/auth-utils";

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

// Common utilities list
const COMMON_UTILITIES = [
  "Water",
  "Electricity",
  "Gas",
  "Internet",
  "Cable TV",
  "Trash Collection",
  "HOA Fees",
];

export default function EditApartment() {
  const router = useRouter();
  const params = useParams();
  const apartmentId = params?.id as string;

  const {
    data,
    isLoading: isFetching,
    error,
  } = useGetApartmentByIdQuery(apartmentId);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [customAmenity, setCustomAmenity] = useState("");
  const [customUtilityIncluded, setCustomUtilityIncluded] = useState("");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const form = useForm<ApartmentFormData>({
    resolver: zodResolver(apartmentSchema),
    defaultValues: {
      title: "",
      description: "",
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "USA",
      },
      propertyDetails: {
        bedrooms: 1,
        bathrooms: 1,
        squareFeet: 500,
        floorNumber: undefined,
        totalFloors: undefined,
        yearBuilt: undefined,
      },
      amenities: [],
      rent: {
        amount: 0,
        currency: "USD",
        period: "monthly",
      },
      utilities: {
        included: [],
      },
      availability: {
        status: "available",
        availableFrom: "",
        leaseTerm: "",
      },
    },
  });

  // Load apartment data when available
  useEffect(() => {
    if (data?.data) {
      const apartment = data.data;
      setExistingImages(apartment.images || []);
      form.reset({
        title: apartment.title,
        description: apartment.description,
        address: apartment.address,
        propertyDetails: apartment.propertyDetails,
        amenities: apartment.amenities || [],
        rent: {
          amount: apartment.rent.amount,
          currency: apartment.rent.currency as
            | "USD"
            | "EUR"
            | "GBP"
            | "CAD"
            | "AUD",
          period: apartment.rent.period,
        },
        utilities: apartment.utilities || { included: [] },
        availability: {
          status: apartment.availability.status,
          availableFrom: apartment.availability.availableFrom
            ? apartment.availability.availableFrom.split("T")[0]
            : "",
          leaseTerm: apartment.availability.leaseTerm || "",
        },
      });
    }
  }, [data, form]);

  const onSubmit = async (formData: ApartmentFormData) => {
    try {
      setIsLoading(true);

      // Create FormData
      const formDataObj = new FormData();

      // Append apartment data
      formDataObj.append("title", formData.title);
      formDataObj.append("description", formData.description);

      // Address
      formDataObj.append("address[street]", formData.address.street);
      formDataObj.append("address[city]", formData.address.city);
      formDataObj.append("address[state]", formData.address.state);
      formDataObj.append("address[zipCode]", formData.address.zipCode);
      formDataObj.append("address[country]", formData.address.country);

      // Property Details
      formDataObj.append(
        "propertyDetails[bedrooms]",
        formData.propertyDetails.bedrooms.toString()
      );
      formDataObj.append(
        "propertyDetails[bathrooms]",
        formData.propertyDetails.bathrooms.toString()
      );
      formDataObj.append(
        "propertyDetails[squareFeet]",
        formData.propertyDetails.squareFeet.toString()
      );
      if (formData.propertyDetails.floorNumber !== undefined) {
        formDataObj.append(
          "propertyDetails[floorNumber]",
          formData.propertyDetails.floorNumber.toString()
        );
      }
      if (formData.propertyDetails.totalFloors !== undefined) {
        formDataObj.append(
          "propertyDetails[totalFloors]",
          formData.propertyDetails.totalFloors.toString()
        );
      }
      if (formData.propertyDetails.yearBuilt !== undefined) {
        formDataObj.append(
          "propertyDetails[yearBuilt]",
          formData.propertyDetails.yearBuilt.toString()
        );
      }

      // Amenities
      formData.amenities.forEach((amenity) => {
        formDataObj.append("amenities[]", amenity);
      });

      // Rent
      formDataObj.append("rent[amount]", formData.rent.amount.toString());
      formDataObj.append("rent[currency]", formData.rent.currency);
      formDataObj.append("rent[period]", formData.rent.period);

      // Utilities
      formData.utilities.included.forEach((utility) => {
        formDataObj.append("utilities[included][]", utility);
      });

      // Availability
      formDataObj.append("availability[status]", formData.availability.status);
      if (formData.availability.availableFrom) {
        formDataObj.append(
          "availability[availableFrom]",
          formData.availability.availableFrom
        );
      }
      if (formData.availability.leaseTerm) {
        formDataObj.append(
          "availability[leaseTerm]",
          formData.availability.leaseTerm
        );
      }

      // Append new images
      uploadedImages.forEach((file) => {
        formDataObj.append("images", file);
      });

      // Get auth token
      const token = getAccessToken();

      // Send request
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/v1/apartments/${apartmentId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataObj,
        }
      );

      const result = await response.json();

      if (result.success) {
        setIsSuccess(true);
        toast.success("Apartment Updated!", {
          description: "Your apartment listing has been updated successfully.",
        });

        // Redirect to apartments list after 2 seconds
        setTimeout(() => {
          router.push("/owner/apartments");
        }, 2000);
      } else {
        throw new Error(result.message || "Failed to update apartment");
      }
    } catch (error: any) {
      const errorMessage =
        error?.message || "Failed to update apartment. Please try again.";
      toast.error("Update Failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle removing existing image
  const handleRemoveExistingImage = async (imageName: string) => {
    try {
      const token = getAccessToken();

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/v1/apartments/${apartmentId}/remove-image`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ imageName }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setExistingImages(existingImages.filter((img) => img !== imageName));
        toast.success("Image removed successfully");
      } else {
        throw new Error(result.message || "Failed to remove image");
      }
    } catch (error: any) {
      toast.error("Failed to remove image", {
        description: error.message,
      });
    }
  };

  // Amenity management
  const addAmenity = (amenity: string) => {
    const current = form.getValues("amenities");
    if (!current.includes(amenity)) {
      form.setValue("amenities", [...current, amenity]);
    }
  };

  const removeAmenity = (amenity: string) => {
    const current = form.getValues("amenities");
    form.setValue(
      "amenities",
      current.filter((a) => a !== amenity)
    );
  };

  const addCustomAmenity = () => {
    if (customAmenity.trim()) {
      addAmenity(customAmenity.trim());
      setCustomAmenity("");
    }
  };

  // Utility management
  const addUtilityIncluded = (utility: string) => {
    const current = form.getValues("utilities.included");
    if (!current.includes(utility)) {
      form.setValue("utilities.included", [...current, utility]);
    }
  };

  const removeUtilityIncluded = (utility: string) => {
    const current = form.getValues("utilities.included");
    form.setValue(
      "utilities.included",
      current.filter((u) => u !== utility)
    );
  };

  const addCustomUtilityIncluded = () => {
    if (customUtilityIncluded.trim()) {
      addUtilityIncluded(customUtilityIncluded.trim());
      setCustomUtilityIncluded("");
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p>Failed to load apartment details. Please try again.</p>
              <Button onClick={() => router.back()} className="mt-4">
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isFetching) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Apartment Updated!
            </h2>
            <p className="text-gray-600 mb-4">
              Your apartment listing has been updated successfully.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to your apartments...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
          <Building2 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Edit Apartment</h1>
          <p className="text-muted-foreground">
            Update your property listing information
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Provide the essential details about your property
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Modern 2BR Apartment in Downtown"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your property in detail..."
                        rows={5}
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a detailed description of the property (minimum 20
                      characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location
              </CardTitle>
              <CardDescription>Where is your property located?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="address.street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123 Main Street, Apt 4B"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="New York"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="NY"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address.zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip Code *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="10001"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country *</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Maximize className="w-5 h-5" />
                Property Details
              </CardTitle>
              <CardDescription>
                Specify the property characteristics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="propertyDetails.bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Bed className="w-4 h-4" />
                        Bedrooms *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={20}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="propertyDetails.bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Bath className="w-4 h-4" />
                        Bathrooms *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={20}
                          step={0.5}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="propertyDetails.squareFeet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Square Feet *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={100000}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="propertyDetails.floorNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Floor Number</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Optional"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseInt(e.target.value)
                                : undefined
                            )
                          }
                          value={field.value ?? ""}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="propertyDetails.totalFloors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Floors</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="Optional"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseInt(e.target.value)
                                : undefined
                            )
                          }
                          value={field.value ?? ""}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="propertyDetails.yearBuilt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year Built</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1800}
                          max={new Date().getFullYear() + 5}
                          placeholder="Optional"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseInt(e.target.value)
                                : undefined
                            )
                          }
                          value={field.value ?? ""}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Rent Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Rent Information
              </CardTitle>
              <CardDescription>Set your rental pricing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="rent.amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rent Amount *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={1000000}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rent.currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="CAD">CAD ($)</SelectItem>
                          <SelectItem value="AUD">AUD ($)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rent.period"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rent Period *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select period" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
              <CardDescription>
                Select all amenities included with this property
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {COMMON_AMENITIES.map((amenity) => {
                  const isSelected = form.watch("amenities").includes(amenity);
                  return (
                    <Badge
                      key={amenity}
                      variant={isSelected ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() =>
                        isSelected
                          ? removeAmenity(amenity)
                          : addAmenity(amenity)
                      }
                    >
                      {amenity}
                      {isSelected && <X className="ml-1 w-3 h-3" />}
                    </Badge>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Add custom amenity..."
                  value={customAmenity}
                  onChange={(e) => setCustomAmenity(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), addCustomAmenity())
                  }
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addCustomAmenity}
                  disabled={isLoading || !customAmenity.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {form.watch("amenities").length > 0 && (
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-2">
                    Selected amenities:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {form.watch("amenities").map((amenity) => (
                      <Badge key={amenity} variant="secondary">
                        {amenity}
                        <button
                          type="button"
                          onClick={() => removeAmenity(amenity)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Utilities */}
          <Card>
            <CardHeader>
              <CardTitle>Utilities</CardTitle>
              <CardDescription>
                Specify which utilities are included in the rent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Utilities Included</h4>
                <div className="flex flex-wrap gap-2 mb-2">
                  {COMMON_UTILITIES.map((utility) => {
                    const isSelected = form
                      .watch("utilities.included")
                      .includes(utility);
                    return (
                      <Badge
                        key={utility}
                        variant={isSelected ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() =>
                          isSelected
                            ? removeUtilityIncluded(utility)
                            : addUtilityIncluded(utility)
                        }
                      >
                        {utility}
                        {isSelected && <X className="ml-1 w-3 h-3" />}
                      </Badge>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom included utility..."
                    value={customUtilityIncluded}
                    onChange={(e) => setCustomUtilityIncluded(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), addCustomUtilityIncluded())
                    }
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={addCustomUtilityIncluded}
                    disabled={isLoading || !customUtilityIncluded.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Property Images
              </CardTitle>
              <CardDescription>
                Upload high-quality images of your property (max 20 images)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload
                maxFiles={20}
                existingImages={existingImages}
                onImagesChange={setUploadedImages}
                onRemoveExisting={handleRemoveExistingImage}
                disabled={isLoading}
              />
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Availability
              </CardTitle>
              <CardDescription>
                Set the availability status and lease terms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="availability.status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="rented">Rented</SelectItem>
                          <SelectItem value="maintenance">
                            Maintenance
                          </SelectItem>
                          <SelectItem value="unavailable">
                            Unavailable
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="availability.availableFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available From</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="availability.leaseTerm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lease Term</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 12 months"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>Minimum lease duration</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[150px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Building2 className="mr-2 h-4 w-4" />
                  Update Apartment
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
