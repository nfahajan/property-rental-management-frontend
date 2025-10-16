"use client";

import React, { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, DollarSign, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  propertySearchSchema,
  PropertySearchData,
} from "@/lib/validations/application";

interface PropertySearchFiltersProps {
  onSearch: (filters: PropertySearchData) => void;
  onClear: () => void;
  isLoading?: boolean;
  className?: string;
}

const SORT_OPTIONS = [
  { value: "rent_asc", label: "Rent: Low to High" },
  { value: "rent_desc", label: "Rent: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
];

export default function PropertySearchFilters({
  onSearch,
  onClear,
  isLoading = false,
  className = "",
}: PropertySearchFiltersProps) {
  // Stable default values
  const defaultValues = useMemo(
    () => ({
      search: "",
      minRent: undefined,
      maxRent: undefined,
      sortBy: "newest" as const,
    }),
    []
  );

  const form = useForm<PropertySearchData>({
    resolver: zodResolver(propertySearchSchema),
    defaultValues,
  });

  // Stable callback functions
  const onSubmit = useCallback(
    (data: PropertySearchData) => {
      onSearch(data);
    },
    [onSearch]
  );

  const handleClear = useCallback(() => {
    form.reset();
    onClear();
  }, [form, onClear]);

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    const values = form.getValues();
    let count = 0;
    if (values.search) count++;
    if (values.minRent) count++;
    if (values.maxRent) count++;
    return count;
  }, [form]);

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Properties
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4 mr-1" />
              Clear ({activeFiltersCount})
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Search Input */}
            <FormField
              control={form.control}
              name="search"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by title, description, or address..."
                        className="pl-10"
                        {...field}
                        disabled={isLoading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Basic Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="minRent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Min Rent
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Min amount"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? parseFloat(value) : undefined);
                        }}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxRent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Rent</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Max amount"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? parseFloat(value) : undefined);
                        }}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sortBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort By</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || "newest"}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SORT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search Properties
                  </>
                )}
              </Button>

              {activeFiltersCount > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClear}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

