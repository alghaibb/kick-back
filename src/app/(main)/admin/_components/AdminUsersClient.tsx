"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import {
  ArrowLeft,
  Users,
  Search,
  MoreHorizontal,
  Shield,
  User,
  Calendar,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Trash2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import {
  useAdminUsers,
  useUpdateUser,
} from "@/hooks/queries/useAdminUsers";
import { useAuth } from "@/hooks/use-auth";
import { AdminUsersSkeleton } from "./AdminUsersSkeleton";
import { useFilters } from "@/providers/FilterProvider";
import { useDebounce } from "@/hooks/use-debounced-search";
import { useModal } from "@/hooks/use-modal";

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

export function AdminUsersClient() {
  const { user: currentUser } = useAuth();
  const { filters, updateFilter } = useFilters();

  const { role: roleFilter, sortBy, sortOrder } = filters;

  // Use debounced search for instant UI updates
  const {
    value: searchValue,
    debouncedValue: search,
    setValue: setSearchValue,
  } = useDebounce(filters.search as string, 300);

  const updateUserMutation = useUpdateUser();

  const handleRoleChange = async (
    userId: string,
    newRole: "USER" | "ADMIN"
  ) => {
    try {
      await updateUserMutation.mutateAsync({
        userId,
        updates: { role: newRole },
      });
    } catch (error) {
      console.error("Failed to update user role:", error);
    }
  };

  const { open } = useModal();

  const handleDeleteUser = (userId: string, userName: string) => {
    open("delete-user", { userId, userName });
  };

  const getInitials = (firstName: string, lastName: string | null) => {
    return (firstName[0] || "" + (lastName?.[0] || "")).toUpperCase();
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    updateFilter("search", value);
  };

  const handleRoleFilter = (value: string) => {
    updateFilter("role", value === "all" ? "" : value);
  };

  const handleSortBy = (value: string) => {
    updateFilter("sortBy", value);
  };

  const handleSortOrder = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    updateFilter("sortOrder", newOrder);
  };

  const { data, isLoading, error, refetch } = useAdminUsers({
    search: search as string,
    role: roleFilter === "all" ? "" : (roleFilter as string),
    sortBy: sortBy as string,
    sortOrder: sortOrder as "asc" | "desc",
  });

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return <AdminUsersSkeleton />;
  }

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
    <div className="relative pt-16 md:pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Header */}
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
              <h1 className="text-2xl md:text-3xl font-bold">
                User Management
              </h1>
            </div>
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
          <p className="text-sm md:text-base text-muted-foreground">
            Manage user accounts, roles, and permissions.
          </p>
        </div>

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
                    value={searchValue}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Role Filter */}
              <Select
                value={roleFilter as string}
                onValueChange={handleRoleFilter}
              >
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
                          {format(new Date(user.createdAt), "MMM d, yyyy")}
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
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} users
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilter("page", pagination.page - 1)}
                disabled={!pagination.hasPrev}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilter("page", pagination.page + 1)}
                disabled={!pagination.hasNext}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
