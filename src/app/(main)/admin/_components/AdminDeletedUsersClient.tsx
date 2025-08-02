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
  ArrowLeft,
  Search,
  Shield,
  User,
  Calendar,
  MessageSquare,
  ChevronRight,
  RotateCcw,
  Trash2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useAdminDeletedUsers } from "@/hooks/queries/useAdminDeletedUsers";
import { AdminDeletedUsersSkeleton } from "./AdminDeletedUsersSkeleton";
import { useFilters } from "@/providers/FilterProvider";
import { formatDate } from "@/lib/date-utils";
import { useModal } from "@/hooks/use-modal";

interface DeletedUser {
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
  deletedAt: string;
  _count?: {
    groupMembers: number;
    eventComments: number;
    contacts: number;
  };
}

// Static header component
function AdminDeletedUsersHeader() {
  return (
    <div className="mb-8 md:mb-10">
      <Button
        asChild
        variant="ghost"
        className="mb-4 md:mb-6 hover:bg-primary/5 transition-colors"
      >
        <Link href="/admin">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin
        </Link>
      </Button>
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-xl p-6 md:p-8 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-destructive/5 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-destructive/20 blur-xl" />
              <div className="relative h-12 w-12 md:h-14 md:w-14 bg-gradient-to-br from-destructive to-destructive/80 rounded-2xl flex items-center justify-center shadow-lg">
                <Trash2 className="h-6 w-6 md:h-7 md:w-7 text-destructive-foreground" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Deleted Users
              </h1>
              <p className="text-sm md:text-base text-muted-foreground/90 mt-1">
                View and recover deleted user accounts across the platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Data component
function AdminDeletedUsersData({
  users,
  pagination,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  refetch,
}: {
  users: DeletedUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
}) {
  const { filters, updateFilters } = useFilters();
  const { open } = useModal();

  const { search, sortBy, sortOrder } = filters;

  const handleRecoverUser = (userId: string, userName: string) => {
    open("recover-user", { userId, userName });
  };

  const getInitials = (firstName: string, lastName: string | null) => {
    return `${firstName.charAt(0)}${lastName ? lastName.charAt(0) : ""}`.toUpperCase();
  };

  const getCleanEmail = (email: string) => {
    return email.replace(/^deleted_\d+_/, "");
  };

  const handleSearch = (value: string) => {
    updateFilters({ search: value });
  };

  const handleSortBy = (value: string) => {
    updateFilters({ sortBy: value });
  };

  const handleSortOrder = () => {
    updateFilters({ sortOrder: sortOrder === "asc" ? "desc" : "asc" });
  };

  return (
    <>
      {/* Modern Filters and Search */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-5 md:p-6 shadow-lg mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-destructive/5 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-hover:text-destructive transition-colors" />
                <Input
                  placeholder="Search deleted users by name, email, or nickname..."
                  value={search as string}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50 focus:bg-background focus:border-destructive/50 transition-all"
                />
              </div>
            </div>

            {/* Sort By */}
            <div className="w-full md:w-48">
              <Select value={sortBy as string} onValueChange={handleSortBy}>
                <SelectTrigger className="bg-background/50 border-border/50 hover:bg-background hover:border-destructive/50 transition-all">
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
                className="w-full md:w-auto bg-background/50 border-border/50 hover:bg-background hover:border-destructive/50 transition-all"
              >
                {sortOrder === "asc" ? "↑ Ascending" : "↓ Descending"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Users Table */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-destructive/5 pointer-events-none" />
        <div className="relative z-10">
          <CardHeader className="border-b border-border/50 bg-card/50 pb-4 pt-6">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl font-semibold">Deleted Users</span>
                <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                  {pagination.total} total
                </Badge>
              </div>
              <Badge variant="secondary" className="text-xs">
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
                              {getCleanEmail(user.email)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Deleted on{" "}
                              {formatDate(user.deletedAt, { format: "short" })}
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
                            {user._count?.groupMembers ?? 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {user._count?.eventComments ?? 0}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(user.deletedAt, { format: "short" })}
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
                              getCleanEmail(user.email)
                            )
                          }
                        >
                          <RotateCcw className="mr-2 h-3 w-3" />
                          Recover
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Loading indicator for fetching next page */}
            {isFetchingNextPage && (
              <div className="flex items-center justify-center py-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Loading more users...
                </div>
              </div>
            )}
          </CardContent>
        </div>
      </div>

      {/* Load More / Pagination Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
        <div className="text-sm text-muted-foreground">
          Showing {users.length} of {pagination.total} deleted users
          {users.length === pagination.total && pagination.total > 0 && (
            <span className="ml-2 text-green-600 font-medium">
              • All loaded
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {hasNextPage ? (
            <Button
              variant="outline"
              onClick={fetchNextPage}
              disabled={isFetchingNextPage}
              className="w-full sm:w-auto"
            >
              {isFetchingNextPage ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Loading more...
                </>
              ) : (
                <>
                  Load More Users
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            users.length > 0 && (
              <div className="text-sm text-muted-foreground italic">
                No more users to load
              </div>
            )
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    </>
  );
}

// Main component with proper loading states
export function AdminDeletedUsersClient() {
  const { filters } = useFilters();
  const { search, sortBy, sortOrder } = filters;

  const {
    data,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useAdminDeletedUsers({
    search: search as string,
    sortBy: sortBy as string,
    sortOrder: sortOrder as "asc" | "desc",
  });

  const users = data?.pages.flatMap((page) => page.users) || [];
  const pagination = data?.pages[0]?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  };

  if (error) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-muted/10 pt-16 md:pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <AdminDeletedUsersHeader />
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">
              Failed to load deleted users
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-muted/10 pt-16 md:pt-20 pb-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <AdminDeletedUsersHeader />
        {isLoading ? (
          <AdminDeletedUsersSkeleton />
        ) : (
          <AdminDeletedUsersData
            users={users}
            pagination={pagination}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
            refetch={refetch}
          />
        )}
      </div>
    </div>
  );
}
