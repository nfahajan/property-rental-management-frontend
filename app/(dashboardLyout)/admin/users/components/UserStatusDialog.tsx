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
  AlertCircle,
} from "lucide-react";
import { useUpdateTenantStatusMutation } from "@/redux/features/tenantApi";
import { useUpdateOwnerStatusMutation } from "@/redux/features/ownerApi";

const statusSchema = z.object({
  status: z.enum(["approved", "pending", "blocked", "inactive"]),
});

type StatusFormData = z.infer<typeof statusSchema>;

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  user: {
    roles: string[];
    status: string;
  };
}

interface UserStatusDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserStatusDialog({
  user,
  isOpen,
  onClose,
  onSuccess,
}: UserStatusDialogProps) {
  const [updateTenantStatus, { isLoading: isUpdatingTenant }] =
    useUpdateTenantStatusMutation();
  const [updateOwnerStatus, { isLoading: isUpdatingOwner }] =
    useUpdateOwnerStatusMutation();

  const isLoading = isUpdatingTenant || isUpdatingOwner;

  const form = useForm<StatusFormData>({
    resolver: zodResolver(statusSchema),
    defaultValues: {
      status: (user?.user?.status as any) || "pending",
    },
  });

  React.useEffect(() => {
    if (user && isOpen) {
      form.reset({
        status: (user.user?.status as any) || "pending",
      });
    }
  }, [user, isOpen, form]);

  const onSubmit = async (data: StatusFormData) => {
    if (!user) return;

    try {
      const userRole = user.user?.roles?.[0];
      let response;

      if (userRole === "tenant") {
        response = await updateTenantStatus({
          id: user._id,
          status: data.status,
        }).unwrap();
      } else if (userRole === "owner") {
        response = await updateOwnerStatus({
          id: user._id,
          status: data.status,
        }).unwrap();
      } else {
        toast.error("Update Failed", {
          description: "Unknown user role",
        });
        return;
      }

      if (response.success) {
        toast.success("Status Updated!", {
          description: `User status has been changed to ${data.status}.`,
        });
        form.reset();
        onSuccess();
        onClose();
      } else {
        toast.error("Update Failed", {
          description: response.message || "Failed to update user status.",
        });
      }
    } catch (error: any) {
      console.error("Update status error:", error);
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to update user status. Please try again.";
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

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Update User Status</DialogTitle>
          <DialogDescription>
            Change the status for {user.firstName} {user.lastName} ({user.email}
            )
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted p-4 rounded-lg space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current Status:</span>
            <span className="font-semibold capitalize">
              {user.user?.status}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">User Role:</span>
            <span className="font-semibold capitalize">
              {user.user?.roles?.[0]}
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Status Selection */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Status *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="approved">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span>Approved</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="pending">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-yellow-600" />
                          <span>Pending</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="blocked">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span>Blocked</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="inactive">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-gray-600" />
                          <span>Inactive</span>
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
