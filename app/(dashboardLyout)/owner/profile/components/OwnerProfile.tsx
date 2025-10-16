"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Save,
  Loader2,
  AlertCircle,
  Edit,
  X,
  Building2,
} from "lucide-react";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useGetOwnerProfileQuery,
  useUpdateOwnerProfileMutation,
} from "@/redux/features/ownerApi";
import {
  ownerProfileSchema,
  OwnerProfileFormData,
} from "@/lib/validations/owner";
import ChangePasswordDialog from "./ChangePasswordDialog";
import ProfileImageUpload from "./ProfileImageUpload";

export default function OwnerProfile() {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  const {
    data: profileResponse,
    isLoading: isFetching,
    error,
    refetch,
  } = useGetOwnerProfileQuery(undefined);

  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateOwnerProfileMutation();

  const form = useForm<OwnerProfileFormData>({
    resolver: zodResolver(ownerProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "USA",
      },
    },
  });

  // Load profile data when available
  useEffect(() => {
    if (profileResponse?.data) {
      const profile = profileResponse.data;
      form.reset({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        phone: profile.phone || "",
        address: {
          street: profile.address?.street || "",
          city: profile.address?.city || "",
          state: profile.address?.state || "",
          zipCode: profile.address?.zipCode || "",
          country: profile.address?.country || "USA",
        },
      });
    }
  }, [profileResponse, form]);

  const onSubmit = async (data: OwnerProfileFormData) => {
    try {
      // If there's a profile image file, send as FormData
      if (profileImageFile) {
        const formData = new FormData();
        formData.append("firstName", data.firstName);
        formData.append("lastName", data.lastName);
        formData.append("phone", data.phone);

        // Add address fields if they exist
        if (data.address) {
          if (data.address.street)
            formData.append("address[street]", data.address.street);
          if (data.address.city)
            formData.append("address[city]", data.address.city);
          if (data.address.state)
            formData.append("address[state]", data.address.state);
          if (data.address.zipCode)
            formData.append("address[zipCode]", data.address.zipCode);
          if (data.address.country)
            formData.append("address[country]", data.address.country);
        }

        // Add the profile image
        formData.append("profileImage", profileImageFile);

        const response = await updateProfile(formData).unwrap();

        if (response.success) {
          toast.success("Profile Updated!", {
            description: "Your profile has been updated successfully.",
          });
          setIsEditing(false);
          setProfileImageFile(null);
          refetch();
        } else {
          toast.error("Update Failed", {
            description: response.message || "Failed to update profile.",
          });
        }
      } else {
        // No image file, send as regular JSON
        const response = await updateProfile(data).unwrap();

        if (response.success) {
          toast.success("Profile Updated!", {
            description: "Your profile has been updated successfully.",
          });
          setIsEditing(false);
          refetch();
        } else {
          toast.error("Update Failed", {
            description: response.message || "Failed to update profile.",
          });
        }
      }
    } catch (error: any) {
      console.error("Profile update error:", error);
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to update profile. Please try again.";
      toast.error("Update Failed", {
        description: errorMessage,
      });
    }
  };

  const handleCancelEdit = () => {
    if (profileResponse?.data) {
      const profile = profileResponse.data;
      form.reset({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        phone: profile.phone || "",
        address: {
          street: profile.address?.street || "",
          city: profile.address?.city || "",
          state: profile.address?.state || "",
          zipCode: profile.address?.zipCode || "",
          country: profile.address?.country || "USA",
        },
      });
    }
    setProfileImageFile(null);
    setIsEditing(false);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load your profile. Please try again later.
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetch()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  if (isFetching) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground">
              Manage your personal information and settings
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <>
              <Button
                variant="outline"
                onClick={() => setIsPasswordDialogOpen(true)}
              >
                <Lock className="w-4 h-4 mr-2" />
                Change Password
              </Button>
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </>
          )}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Image Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Picture
              </CardTitle>
              <CardDescription>
                Upload a professional profile picture
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-6">
              <ProfileImageUpload
                currentImage={profileResponse?.data?.profileImage}
                onImageChange={(file) => setProfileImageFile(file)}
                disabled={!isEditing || isUpdating}
                firstName={profileResponse?.data?.firstName}
                lastName={profileResponse?.data?.lastName}
              />
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John"
                          {...field}
                          disabled={!isEditing || isUpdating}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Doe"
                          {...field}
                          disabled={!isEditing || isUpdating}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        {...field}
                        disabled={!isEditing || isUpdating}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4" />
                  <label className="text-sm font-medium">Email Address</label>
                </div>
                <Input
                  value={profileResponse?.data?.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email cannot be changed
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Address Information
              </CardTitle>
              <CardDescription>
                Your current business/home address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="address.street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123 Main Street, Suite 100"
                        {...field}
                        disabled={!isEditing || isUpdating}
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
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="New York"
                          {...field}
                          disabled={!isEditing || isUpdating}
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
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="NY"
                          {...field}
                          disabled={!isEditing || isUpdating}
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
                      <FormLabel>Zip Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="10001"
                          {...field}
                          disabled={!isEditing || isUpdating}
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
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing || isUpdating} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button - Only show when editing */}
          {isEditing && (
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isUpdating}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="min-w-[150px]"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </Form>

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        isOpen={isPasswordDialogOpen}
        onClose={() => setIsPasswordDialogOpen(false)}
      />
    </div>
  );
}
