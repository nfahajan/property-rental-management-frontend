"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "../../../../public/assets/mainlogo.png";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Home, User, Building2, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { registerSchema, RegisterFormData } from "@/lib/validations/register";
import { useRegisterMutation } from "@/redux/features/authApi";
import Image from "next/image";

export default function Register() {
  const router = useRouter();
  const [register, { isLoading }] = useRegisterMutation();
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      role: "tenant",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registerData } = data;

      const response = await register(registerData).unwrap();

      if (response.success) {
        setIsSuccess(true);
        toast.success("Registration successful!", {
          description: "Your account has been created. Redirecting to login...",
        });

        setTimeout(() => {
          router.push("/login");
        }, 1000);
      } else {
        toast.error("Registration Failed", {
          description: response.message,
        });
      }
    } catch (error: any) {
      console.error("Registration error:", error);

      // Handle validation errors from backend
      if (error?.data?.errors && Array.isArray(error.data.errors)) {
        error.data.errors.forEach((err: any) => {
          const fieldName = err.path?.[0];
          if (fieldName) {
            form.setError(fieldName as any, {
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
          "Registration failed. Please try again.";
        toast.error("Registration Failed", {
          description: errorMessage,
        });
      }
    }
  };

  const onError = (errors: any) => {
    console.log("Form validation errors:", errors);

    // Get the first error message
    const firstErrorField = Object.keys(errors)[0];
    const firstError = errors[firstErrorField];

    toast.error("Validation Error", {
      description:
        firstError?.message || "Please fill in all required fields correctly.",
    });
  };

  const selectedRole = form.watch("role");

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Registration Successful!
            </h2>
            <p className="text-gray-600 mb-4">
              Your account has been created successfully.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting you to login page...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 py-12">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Link href={"/"}>
              <Image src={logo} alt="logo" width={150} height={150} />
            </Link>
          </div>

          <CardDescription className="text-base">
            Create your account and start your property journey today
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onError)}>
            <CardContent className="space-y-6">
              {/* Role Selection */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base font-semibold">
                      I want to register as:
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div>
                          <RadioGroupItem
                            value="tenant"
                            id="tenant"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="tenant"
                            className="flex flex-col items-center justify-between rounded-lg border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-all"
                          >
                            <User className="mb-3 h-8 w-8 text-primary" />
                            <div className="text-center">
                              <div className="font-semibold text-gray-900">
                                Tenant
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Looking for a property
                              </div>
                            </div>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem
                            value="owner"
                            id="owner"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="owner"
                            className="flex flex-col items-center justify-between rounded-lg border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-all"
                          >
                            <Building2 className="mb-3 h-8 w-8 text-primary" />
                            <div className="text-center">
                              <div className="font-semibold text-gray-900">
                                Owner
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Have properties to rent
                              </div>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

              {/* Name Fields */}
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
                          disabled={isLoading}
                          className="transition-all"
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
                          disabled={isLoading}
                          className="transition-all"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Contact Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john.doe@example.com"
                          {...field}
                          disabled={isLoading}
                          className="transition-all"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          {...field}
                          disabled={isLoading}
                          className="transition-all"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password *</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          {...field}
                          disabled={isLoading}
                          className="transition-all"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password *</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm your password"
                          {...field}
                          disabled={isLoading}
                          className="transition-all"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating your account...
                  </>
                ) : (
                  <>
                    Create {selectedRole === "owner" ? "Owner" : "Tenant"}{" "}
                    Account
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <span>Already have an account?</span>
                <Link
                  href="/login"
                  className={`font-semibold  transition-colors`}
                >
                  Sign in
                </Link>
              </div>

              <p className="text-xs text-center text-gray-500 px-6">
                By creating an account, you agree to our Terms of Service and
                Privacy Policy
              </p>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
