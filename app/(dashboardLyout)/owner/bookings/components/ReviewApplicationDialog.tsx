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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import {
  Application,
  useReviewApplicationMutation,
} from "@/redux/features/applicationApi";
import { Alert, AlertDescription } from "@/components/ui/alert";

const reviewSchema = z.object({
  status: z.enum(["under_review", "approved", "rejected"], {
    required_error: "Please select a status",
  }),
  reviewNotes: z
    .string()
    .max(2000, "Review notes cannot exceed 2000 characters")
    .optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewApplicationDialogProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewApplicationDialog({
  application,
  isOpen,
  onClose,
  onSuccess,
}: ReviewApplicationDialogProps) {
  const [reviewApplication, { isLoading }] = useReviewApplicationMutation();

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      status: application?.status === "pending" ? "under_review" : undefined,
      reviewNotes: "",
    },
  });

  React.useEffect(() => {
    if (application && isOpen) {
      form.reset({
        status:
          application.status === "pending"
            ? "under_review"
            : (application.status as "under_review" | "approved" | "rejected"),
        reviewNotes: application.reviewNotes || "",
      });
    }
  }, [application, isOpen, form]);

  const onSubmit = async (data: ReviewFormData) => {
    if (!application) return;

    try {
      const response = await reviewApplication({
        id: application._id,
        data: {
          status: data.status,
          reviewNotes: data.reviewNotes,
        },
      }).unwrap();

      if (response.success) {
        toast.success("Application Reviewed!", {
          description: `Application has been ${data.status.replace(
            /_/g,
            " "
          )}.`,
        });
        form.reset();
        onSuccess();
        onClose();
      } else {
        toast.error("Review Failed", {
          description: response.message || "Failed to review application.",
        });
      }
    } catch (error: any) {
      console.error("Review application error:", error);
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to review application. Please try again.";
      toast.error("Review Failed", {
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

  if (!application) return null;

  const incomeToRentRatio =
    application.applicationDetails.monthlyIncome /
    application.apartment.rent.amount;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Review Application</DialogTitle>
          <DialogDescription>
            Review and make a decision on {application.tenant.firstName}{" "}
            {application.tenant.lastName}'s application for{" "}
            {application.apartment.title}
          </DialogDescription>
        </DialogHeader>

        {/* Application Summary */}
        <div className="bg-muted p-4 rounded-lg space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Monthly Income:</span>
              <p className="font-semibold">
                ${application.applicationDetails.monthlyIncome.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Rent:</span>
              <p className="font-semibold">
                ${application.apartment.rent.amount.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Income-to-Rent:</span>
              <p
                className={`font-semibold ${
                  incomeToRentRatio >= 3
                    ? "text-green-600"
                    : incomeToRentRatio >= 2.5
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {incomeToRentRatio.toFixed(2)}x
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Employment:</span>
              <p className="font-semibold capitalize">
                {application.applicationDetails.employmentStatus.replace(
                  /-/g,
                  " "
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Recommendation Alert */}
        {incomeToRentRatio < 2.5 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> The applicant's income-to-rent ratio is
              below the recommended 2.5x threshold. This may indicate potential
              financial difficulty.
            </AlertDescription>
          </Alert>
        )}

        {incomeToRentRatio >= 3 && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Strong Candidate:</strong> The applicant's income-to-rent
              ratio meets the recommended 3x threshold, indicating good
              financial stability.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Status Selection */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Decision *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a decision" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="under_review">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-blue-600" />
                          <span>Under Review</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="approved">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span>Approve Application</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="rejected">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span>Reject Application</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Review Notes */}
            <FormField
              control={form.control}
              name="reviewNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Review Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes about your decision (optional)"
                      className="min-h-[100px]"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
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
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
