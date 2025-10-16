"use client";

import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Calendar as CalendarIcon,
  DollarSign,
  Briefcase,
  Building,
  Phone,
  MessageSquare,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Apartment } from "@/redux/features/apartmentApi";
import { useCreateApplicationMutation } from "@/redux/features/applicationApi";
import {
  applicationSchema,
  ApplicationFormData,
} from "@/lib/validations/application";
import { formatCurrency } from "@/lib/utils";

// Import missing icons
import { MapPin, Bed, Bath, Square } from "lucide-react";

interface BookApartmentDialogProps {
  apartment: Apartment | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BookApartmentDialog({
  apartment,
  isOpen,
  onClose,
  onSuccess,
}: BookApartmentDialogProps) {
  const [createApplication, { isLoading }] = useCreateApplicationMutation();

  // Stable default values
  const defaultValues = useMemo(
    () => ({
      moveInDate: "",
      leaseTerm: undefined,
      monthlyIncome: 0,
      employmentStatus: undefined,
      employerName: "",
      employerPhone: "",
      additionalInfo: "",
    }),
    []
  );

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues,
  });

  const onSubmit = async (data: ApplicationFormData) => {
    if (!apartment) return;

    try {
      const response = await createApplication({
        apartmentId: apartment._id,
        applicationDetails: {
          moveInDate: data.moveInDate,
          leaseTerm: data.leaseTerm,
          monthlyIncome: data.monthlyIncome,
          employmentStatus: data.employmentStatus,
          employerName: data.employerName || undefined,
          employerPhone: data.employerPhone || undefined,
          additionalInfo: data.additionalInfo || undefined,
        },
      }).unwrap();

      if (response.success) {
        toast.success("Application Submitted!", {
          description:
            "Your rental application has been submitted successfully. We'll review it and get back to you soon.",
        });
        form.reset();
        onClose();
        onSuccess?.();
      } else {
        toast.error("Submission Failed", {
          description:
            response.message ||
            "Failed to submit application. Please try again.",
        });
      }
    } catch (error: any) {
      console.error("Application submission error:", error);

      // Handle validation errors from backend
      if (error?.data?.errors && Array.isArray(error.data.errors)) {
        error.data.errors.forEach((err: any) => {
          const fieldName = err.path?.[err.path.length - 1];
          if (fieldName) {
            form.setError(fieldName as keyof ApplicationFormData, {
              type: "manual",
              message: err.message,
            });
          }
        });
        toast.error("Validation Error", {
          description: "Please check the form for errors.",
        });
      } else {
        const errorMessage =
          error?.data?.message ||
          error?.message ||
          "Failed to submit application. Please try again.";
        toast.error("Submission Failed", {
          description: errorMessage,
        });
      }
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      form.reset();
      onClose();
    }
  };

  if (!apartment) return null;

  const formatAddress = () => {
    const { street, city, state, zipCode } = apartment.address;
    return `${street}, ${city}, ${state} ${zipCode}`;
  };

  const formatRent = () => {
    return formatCurrency(apartment.rent.amount, apartment.rent.currency);
  };

  const getIncomeToRentRatio = (income: number) => {
    if (income > 0 && apartment.rent.amount > 0) {
      return (income / apartment.rent.amount).toFixed(1);
    }
    return "0";
  };

  const monthlyIncome = form.watch("monthlyIncome");
  const incomeRatio = getIncomeToRentRatio(monthlyIncome);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Book Apartment
          </DialogTitle>
          <DialogDescription>
            Submit your rental application for this property
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Property Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{apartment.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{formatAddress()}</span>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Bed className="h-4 w-4" />
                  <span>{apartment.propertyDetails.bedrooms} bed</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="h-4 w-4" />
                  <span>{apartment.propertyDetails.bathrooms} bath</span>
                </div>
                <div className="flex items-center gap-1">
                  <Square className="h-4 w-4" />
                  <span>
                    {apartment.propertyDetails.squareFeet.toLocaleString()} sqft
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-xl font-bold text-green-600">
                  {formatRent()}/{apartment.rent.period}
                </span>
              </div>

              {apartment.utilities.included.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">
                    Utilities Included:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {apartment.utilities.included.map((utility, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {utility}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Application Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Application Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Move-in Date */}
                  <FormField
                    control={form.control}
                    name="moveInDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Move-in Date *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                disabled={isLoading}
                              >
                                {field.value ? (
                                  format(new Date(field.value), "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={
                                field.value ? new Date(field.value) : undefined
                              }
                              onSelect={(date) => {
                                field.onChange(
                                  date ? format(date, "yyyy-MM-dd") : ""
                                );
                              }}
                              disabled={(date) =>
                                date <
                                  new Date(new Date().setHours(0, 0, 0, 0)) ||
                                isLoading
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Lease Term */}
                  <FormField
                    control={form.control}
                    name="leaseTerm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lease Term *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          disabled={isLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select lease term" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="6 months">6 months</SelectItem>
                            <SelectItem value="1 year">1 year</SelectItem>
                            <SelectItem value="18 months">18 months</SelectItem>
                            <SelectItem value="2 years">2 years</SelectItem>
                            <SelectItem value="month-to-month">
                              Month-to-month
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Monthly Income */}
                  <FormField
                    control={form.control}
                    name="monthlyIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Income *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter your monthly income"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              field.onChange(value);
                            }}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Employment Status */}
                  <FormField
                    control={form.control}
                    name="employmentStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employment Status *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          disabled={isLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select employment status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="employed">Employed</SelectItem>
                            <SelectItem value="self-employed">
                              Self-employed
                            </SelectItem>
                            <SelectItem value="unemployed">
                              Unemployed
                            </SelectItem>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="retired">Retired</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Employer Name - Conditional */}
                  <FormField
                    control={form.control}
                    name="employerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Employer Name
                          {form.watch("employmentStatus") === "employed" && (
                            <span className="text-red-500">*</span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter employer name"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Employer Phone - Conditional */}
                  <FormField
                    control={form.control}
                    name="employerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Employer Phone
                          {form.watch("employmentStatus") === "employed" && (
                            <span className="text-red-500">*</span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="Enter employer phone number"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Additional Information */}
                  <FormField
                    control={form.control}
                    name="additionalInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Additional Information
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any additional information you'd like to share..."
                            className="min-h-[100px]"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <DialogFooter className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="min-w-[120px]"
                >
                  {isLoading ? "Submitting..." : "Submit Application"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
