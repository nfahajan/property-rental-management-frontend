"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Wrench,
  Home,
} from "lucide-react";
import {
  Apartment,
  useUpdateApartmentMutation,
} from "@/redux/features/apartmentApi";
import { formatCurrency } from "@/lib/utils";

const statusSchema = z.object({
  status: z.enum(["active", "inactive", "pending", "sold"]),
  availabilityStatus: z.enum([
    "available",
    "rented",
    "maintenance",
    "unavailable",
  ]),
});

type StatusFormData = z.infer<typeof statusSchema>;

interface UpdateApartmentStatusDialogProps {
  apartment: Apartment | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UpdateApartmentStatusDialog({
  apartment,
  isOpen,
  onClose,
  onSuccess,
}: UpdateApartmentStatusDialogProps) {
  const [updateApartment, { isLoading }] = useUpdateApartmentMutation();

  const form = useForm<StatusFormData>({
    resolver: zodResolver(statusSchema),
    defaultValues: {
      status: apartment?.status || "active",
      availabilityStatus: apartment?.availability?.status || "available",
    },
  });

  React.useEffect(() => {
    if (apartment && isOpen) {
      form.reset({
        status: apartment.status || "active",
        availabilityStatus: apartment.availability?.status || "available",
      });
    }
  }, [apartment, isOpen, form]);

  const onSubmit = async (data: StatusFormData) => {
    if (!apartment) return;

    try {
      const response = await updateApartment({
        id: apartment._id,
        data: {
          status: data.status,
          availability: {
            ...apartment.availability,
            status: data.availabilityStatus,
          },
        },
      }).unwrap();

      if (response.success) {
        toast.success("Status Updated!", {
          description: "Apartment status has been updated successfully.",
        });
        form.reset();
        onSuccess();
        onClose();
      } else {
        toast.error("Update Failed", {
          description: response.message || "Failed to update apartment status.",
        });
      }
    } catch (error: any) {
      console.error("Update status error:", error);
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to update apartment status. Please try again.";
      toast.error("Update Failed", {
        description: errorMessage,
      });
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      form.reset();
      onClose();
    }
  };

  if (!apartment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Update Property Status</DialogTitle>
          <DialogDescription>
            Change the status for {apartment.title}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted p-4 rounded-lg space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current Status:</span>
            <span className="font-semibold capitalize">{apartment.status}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Availability:</span>
            <span className="font-semibold capitalize">
              {apartment.availability.status}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Monthly Rent:</span>
            <span className="font-semibold">
              {formatCurrency(apartment.rent.amount, apartment.rent.currency)}
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Property Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Status *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span>Active</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="inactive">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-gray-600" />
                          <span>Inactive</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="pending">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-yellow-600" />
                          <span>Pending</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="sold">
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-red-600" />
                          <span>Sold</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Availability Status */}
            <FormField
              control={form.control}
              name="availabilityStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Availability Status *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select availability status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="available">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span>Available</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="rented">
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-blue-600" />
                          <span>Rented</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="maintenance">
                        <div className="flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-yellow-600" />
                          <span>Under Maintenance</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="unavailable">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span>Unavailable</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Status"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
