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
import { format } from "date-fns";
import {
  ArrowLeft,
  Search,
  Shield,
  User,
  Calendar,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Trash2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import {
  useAdminDeletedUsers,
  useRecoverUser,
} from "@/hooks/queries/useAdminDeletedUsers";
import { AdminDeletedUsersSkeleton } from "./AdminDeletedUsersSkeleton";
import { useFilters } from "@/providers/FilterProvider";
import { useDebounce } from "@/hooks/use-debounced-search";

export function AdminDeletedUsersClient() {
  const { filters, updateFilter } = useFilters();
  const { sortBy, sortOrder } = filters;

  const {
    value: searchValue,
    debouncedValue: search,
    setValue: setSearchValue,
  } = useDebounce(filters.search as string, 300);

  const recoverUserMutation = useRecoverUser();

  const handleRecoverUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to recover ${userName}?`)) {
      return;
    }

    try {
      await recoverUserMutation.mutateAsync({ userId });
    } catch (error) {
      console.error("Error recovering user:", error);
    }
  };

  const getInitials = (firstName: string, lastName: string | null) => {
    return (firstName[0] || "" + (lastName?.[0] || "")).toUpperCase();
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    updateFilter("search", value);
  };

  const handleSortBy = (value: string) => {
    updateFilter("sortBy", value);
  };

  const handleSortOrder = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    updateFilter("sortOrder", newOrder);
  };

  const { data, isLoading, error, refetch } = useAdminDeletedUsers({
    search: search as string,
    sortBy: sortBy as string,
    sortOrder: sortOrder as "asc" | "desc",
  });

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return <AdminDeletedUsersSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Failed to load deleted users</p>
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
              <div className="p-1.5 md:p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <Trash2 className="h-4 w-4 md:h-5 md:w-5 text-red-600 dark:text-red-400" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">Deleted Users</h1>
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
            View and recover deleted user accounts.
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
                    placeholder="Search deleted users..."
                    value={searchValue}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Sort By */}
              <div className="w-full md:w-48">
                <Select value={sortBy as string} onValueChange={handleSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deletedAt">Deleted Date</SelectItem>
                    <SelectItem value="createdAt">Created Date</SelectItem>
                    <SelectItem value="firstName">First Name</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Order */}
              <div className="w-full md:w-auto">
                <Button
                  variant="outline"
                  onClick={handleSortOrder}
                  className="w-full md:w-auto"
                >
                  {sortOrder === "asc" ? "↑ Ascending" : "↓ Descending"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Deleted Users ({pagination.total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Deleted Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                            <AvatarImage src={user.image || undefined} />
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
                            {user.nickname && (
                              <div className="text-xs text-muted-foreground">
                                @{user.nickname}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "ADMIN" ? "default" : "secondary"
                          }
                        >
                          {user.role === "ADMIN" ? (
                            <>
                              <Shield className="mr-1 h-3 w-3" />
                              Admin
                            </>
                          ) : (
                            <>
                              <User className="mr-1 h-3 w-3" />
                              User
                            </>
                          )}
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
                          {format(new Date(user.deletedAt), "MMM d, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">Deleted</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleRecoverUser(
                              user.id,
                              `${user.firstName} ${user.lastName || ""}`
                            )
                          }
                          disabled={recoverUserMutation.isPending}
                        >
                          {recoverUserMutation.isPending ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2" />
                              Recovering...
                            </>
                          ) : (
                            <>
                              <RotateCcw className="mr-2 h-3 w-3" />
                              Recover
                            </>
                          )}
                        </Button>
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
              of {pagination.total} deleted users
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
