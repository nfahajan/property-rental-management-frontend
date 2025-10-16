"use client";

import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  Search,
  UserCheck,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Settings2,
  Filter,
} from "lucide-react";
import { useGetAllTenantsQuery } from "@/redux/features/tenantApi";
import { useGetAllOwnersQuery } from "@/redux/features/ownerApi";
import UserStatusDialog from "./UserStatusDialog";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  user: {
    _id: string;
    roles: string[];
    status: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  const {
    data: tenantsResponse,
    isLoading: isLoadingTenants,
    error: tenantsError,
    refetch: refetchTenants,
  } = useGetAllTenantsQuery({ page: 1, limit: 1000 });

  const {
    data: ownersResponse,
    isLoading: isLoadingOwners,
    error: ownersError,
    refetch: refetchOwners,
  } = useGetAllOwnersQuery({ page: 1, limit: 1000 });

  // Extract and combine users
  const allUsers = useMemo(() => {
    const tenants = tenantsResponse?.data
      ? (tenantsResponse.data as any).tenants || tenantsResponse.data || []
      : [];
    const owners = ownersResponse?.data
      ? (ownersResponse.data as any).owners || ownersResponse.data || []
      : [];

    return [...tenants, ...owners] as User[];
  }, [tenantsResponse, ownersResponse]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = allUsers.length;
    const owners = allUsers.filter((user) =>
      user.user?.roles?.includes("owner")
    ).length;
    const tenants = allUsers.filter((user) =>
      user.user?.roles?.includes("tenant")
    ).length;
    const active = allUsers.filter(
      (user) => user.user?.status === "approved"
    ).length;
    const pending = allUsers.filter(
      (user) => user.user?.status === "pending"
    ).length;
    const blocked = allUsers.filter(
      (user) => user.user?.status === "blocked"
    ).length;

    return {
      total,
      owners,
      tenants,
      active,
      pending,
      blocked,
    };
  }, [allUsers]);

  // Filter users
  const filteredUsers = useMemo(() => {
    let filtered = [...allUsers];

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) =>
        user.user?.roles?.includes(roleFilter)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.user?.status === statusFilter);
    }

    // Search by name or email
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(search) ||
          user.lastName.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search)
      );
    }

    // Sort by creation date (newest first)
    return filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [allUsers, roleFilter, statusFilter, searchTerm]);

  const handleUpdateStatus = (user: User) => {
    setSelectedUser(user);
    setIsStatusDialogOpen(true);
  };

  const handleStatusUpdateSuccess = () => {
    refetchTenants();
    refetchOwners();
  };

  const getRoleBadge = (roles: string[]) => {
    if (!roles || roles.length === 0) return null;
    const role = roles[0];

    const roleConfig: any = {
      admin: {
        color: "bg-red-100 text-red-800 border-red-200",
        label: "Admin",
      },
      owner: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        label: "Owner",
      },
      tenant: {
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Tenant",
      },
      staff: {
        color: "bg-purple-100 text-purple-800 border-purple-200",
        label: "Staff",
      },
    };

    const config = roleConfig[role] || {
      color: "bg-gray-100 text-gray-800 border-gray-200",
      label: role,
    };

    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      approved: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle2,
        label: "Approved",
      },
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
        label: "Pending",
      },
      blocked: {
        color: "bg-red-100 text-red-800",
        icon: XCircle,
        label: "Blocked",
      },
      inactive: {
        color: "bg-gray-100 text-gray-800",
        icon: AlertCircle,
        label: "Inactive",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const isLoading = isLoadingTenants || isLoadingOwners;
  const error = tenantsError || ownersError;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load users. Please try again later.
          </AlertDescription>
        </Alert>
        <Button
          onClick={() => {
            refetchTenants();
            refetchOwners();
          }}
          variant="outline"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">
              Manage all platform users and their access
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.total > 0
                ? `${((stats.active / stats.total) * 100).toFixed(0)}%`
                : "0%"}{" "}
              of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Property Owners
            </CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.owners}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Managing properties
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tenants</CardTitle>
            <UserPlus className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.tenants}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Seeking properties
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Users
          </CardTitle>
          <CardDescription>
            Search and filter users by role or status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="owner">Owners</SelectItem>
                <SelectItem value="tenant">Tenants</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            {filteredUsers.length === 0
              ? "No users found"
              : "View and manage all platform users"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Users Found</h3>
              <p className="text-muted-foreground">
                {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No users registered yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <p className="font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{user.email}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{user.phone}</p>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(user.user?.roles || [])}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user.user?.status || "pending")}
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(user)}
                        >
                          <Settings2 className="w-4 h-4 mr-1" />
                          Update Status
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Status Dialog */}
      <UserStatusDialog
        user={selectedUser}
        isOpen={isStatusDialogOpen}
        onClose={() => setIsStatusDialogOpen(false)}
        onSuccess={handleStatusUpdateSuccess}
      />
    </div>
  );
}
