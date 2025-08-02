"use client";

import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  User,
  Users,
  Calendar,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { useAdminUsers } from "@/hooks/queries/useAdminUsers";
import { useAuth } from "@/hooks/use-auth";
import { AdminUsersSkeleton } from "./AdminUsersSkeleton";
import { useFilters } from "@/providers/FilterProvider";
import { useModal } from "@/hooks/use-modal";
import { formatDate } from "@/lib/date-utils";

interface User {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  image?: string | null;
  nickname: string | null;
  role: "USER" | "ADMIN";
  hasOnboarded: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    groupMembers: number;
    eventComments: number;
    contacts: number;
  };
}

// Static header component
function AdminUsersHeader() {
  return (
    <div className="mb-6 md:mb-8">
      <Button asChild variant="ghost" className="mb-3 md:mb-4">
        <Link href="/admin">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin
        </Link>
      </Button>
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-1.5 md:p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <Users className="h-4 w-4 md:h-5 md:w-5 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">User Management</h1>
        </div>
      </div>
      <p className="text-sm md:text-base text-muted-foreground">
        Manage user accounts, roles, and permissions.
      </p>
    </div>
  );
}

// Data component that can be wrapped in Suspense
function AdminUsersData() {
  const { user: currentUser } = useAuth();
  const { filters, updateFilters } = useFilters();
  const { open } = useModal();

  const { search, role, sortBy, sortOrder } = filters;

  const { data, isLoading, error, refetch } = useAdminUsers({
    search: search as string,
    role: role as string,
    sortBy: sortBy as string,
    sortOrder: sortOrder as "asc" | "desc",
  });

  const handleRoleChange = async (
    userId: string,
    newRole: "USER" | "ADMIN"
  ) => {
    try {
      const response = await fetch(`/api/admin/users`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, updates: { role: newRole } }),
      });

      if (!response.ok) throw new Error("Failed to update user");

      // Refetch data to update the UI
      refetch();
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    open("delete-user", { userId, userName });
  };

  const getInitials = (firstName: string, lastName: string | null) => {
    return `${firstName.charAt(0)}${lastName ? lastName.charAt(0) : ""}`.toUpperCase();
  };

  const handleSearch = (value: string) => {
    updateFilters({ search: value, page: 1 });
  };

  const handleRoleFilter = (value: string) => {
    updateFilters({ role: value === "all" ? "" : value, page: 1 });
  };

  const handleSortBy = (value: string) => {
    updateFilters({ sortBy: value, page: 1 });
  };

  const handleSortOrder = () => {
    updateFilters({ sortOrder: sortOrder === "asc" ? "desc" : "asc" });
  };

  const handleRefresh = () => {
    refetch();
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Failed to load users</p>
      </div>
    );
  }

  const users = data?.pages.flatMap((page) => page.users) || [];
  const pagination = data?.pages[0]?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  };

  return (
    <>
      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={search as string}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Role Filter */}
            <Select value={role as string} onValueChange={handleRoleFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy as string} onValueChange={handleSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date Created</SelectItem>
                <SelectItem value="firstName">First Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="role">Role</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Order */}
            <Button variant="outline" size="icon" onClick={handleSortOrder}>
              {sortOrder === "asc" ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Users ({pagination.total})</span>
            <Badge variant="secondary">
              Page {pagination.page} of {pagination.totalPages}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="text-sm font-mono text-muted-foreground">
                        {user.id}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={user.image ?? undefined}
                            alt="Profile"
                          />
                          <AvatarFallback>
                            {getInitials(user.firstName, user.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "ADMIN" ? "default" : "secondary"
                        }
                        className="flex items-center gap-1 w-fit"
                      >
                        {user.role === "ADMIN" ? (
                          <Shield className="h-3 w-3" />
                        ) : (
                          <User className="h-3 w-3" />
                        )}
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {user._count.groupMembers}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {user._count.eventComments}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(user.createdAt, { format: "short" })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.hasOnboarded ? "default" : "secondary"}
                      >
                        {user.hasOnboarded ? "Active" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {user.id !== currentUser?.id && (
                            <>
                              {user.role === "USER" ? (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleRoleChange(user.id, "ADMIN")
                                  }
                                >
                                  <Shield className="mr-2 h-4 w-4" />
                                  Make Admin
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleRoleChange(user.id, "USER")
                                  }
                                >
                                  <User className="mr-2 h-4 w-4" />
                                  Remove Admin
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDeleteUser(
                                    user.id,
                                    `${user.firstName} ${user.lastName || ""}`
                                  )
                                }
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete User
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} users
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFilters({ page: pagination.page - 1 })}
              disabled={!pagination.hasPrev}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFilters({ page: pagination.page + 1 })}
              disabled={!pagination.hasNext}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

// Main component with Suspense
export function AdminUsersClient() {
  return (
    <div className="relative pt-16 md:pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
        <AdminUsersHeader />
        <Suspense fallback={<AdminUsersSkeleton />}>
          <AdminUsersData />
        </Suspense>
      </div>
    </div>
  );
}
