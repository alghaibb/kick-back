"use client";

import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  LogOut,
  User,
  Users,
  Edit,
  Calendar,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { useAdminUsersInfinite } from "@/hooks/queries/useAdminUsers";
import { useAuth } from "@/hooks/use-auth";
import { AdminUsersSkeleton } from "./AdminUsersSkeleton";
import { useFilters } from "@/providers/FilterProvider";
import { useModal } from "@/hooks/use-modal";
import { formatDate } from "@/lib/date-utils";
import EditUserModal from "./EditUserModal";
import { ActionLoader } from "@/components/ui/loading-animations";

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
  hasPassword?: boolean;
  accounts?: Array<{ provider: string }>;
  activeSessionId?: string | null;
  _count?: {
    groupMembers: number;
    eventComments: number;
    contacts: number;
  };
}

function AdminUsersHeader() {
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
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-500/5 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 blur-xl" />
              <div className="relative h-12 w-12 md:h-14 md:w-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="h-6 w-6 md:h-7 md:w-7 text-foreground" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                User Management
              </h1>
              <p className="text-sm md:text-base text-muted-foreground/90 mt-1">
                Manage user accounts, roles, and permissions across the
                platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminUsersData({
  users,
  pagination,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  refetch,
}: {
  users: User[];
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
  const { user: currentUser } = useAuth();
  const { filters, updateFilters } = useFilters();
  const { open } = useModal();

  const { search, role, sortBy, sortOrder } = filters;

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

  const handleEditUser = (user: User) => {
    open("edit-user", { user });
  };

  const handleRevokeSessions = (user: User) => {
    open("revoke-user-sessions", {
      revokeUserId: user.id,
      revokeUserEmail: user.email,
    });
  };

  const getInitials = (firstName: string, lastName: string | null) => {
    return `${firstName.charAt(0)}${lastName ? lastName.charAt(0) : ""}`.toUpperCase();
  };

  const handleSearch = (value: string) => {
    updateFilters({ search: value });
  };

  const handleRoleFilter = (value: string) => {
    updateFilters({ role: value === "all" ? "" : value });
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
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                <Input
                  placeholder="Search users by name, email, or nickname..."
                  value={search as string}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50 focus:bg-background focus:border-primary/50 transition-all"
                />
              </div>
            </div>

            {/* Role Filter */}
            <Select value={role as string} onValueChange={handleRoleFilter}>
              <SelectTrigger className="w-full md:w-48 bg-background/50 border-border/50 hover:bg-background hover:border-primary/50 transition-all">
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
              <SelectTrigger className="w-full md:w-48 bg-background/50 border-border/50 hover:bg-background hover:border-primary/50 transition-all">
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
            <Button
              variant="outline"
              size="icon"
              onClick={handleSortOrder}
              className="bg-background/50 border-border/50 hover:bg-background hover:border-primary/50 transition-all"
            >
              {sortOrder === "asc" ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Modern Users Table */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 pointer-events-none" />
        <div className="relative z-10">
          <CardHeader className="border-b border-border/50 bg-card/50 pb-4 pt-6">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl font-semibold">Users</span>
                <Badge className="bg-primary/10 text-primary border-primary/20">
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
                    <TableHead>Nickname</TableHead>
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
                        <div className="text-sm font-mono text-muted-foreground">
                          {user.nickname}
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
                            {user._count?.groupMembers ?? 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {user._count?.eventComments ?? 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs">Sess:</span>
                            <Badge
                              variant={
                                user.activeSessionId ? "secondary" : "outline"
                              }
                              className="font-mono text-[10px]"
                            >
                              {user.activeSessionId ?? "null"}
                            </Badge>
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
                            <DropdownMenuItem
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit User
                            </DropdownMenuItem>
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
                                  onClick={() => handleRevokeSessions(user)}
                                >
                                  <LogOut className="mr-2 h-4 w-4" />
                                  Revoke Session
                                </DropdownMenuItem>
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

            {/* Loading indicator for fetching next page */}
            {isFetchingNextPage && (
              <div className="flex items-center justify-center py-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ActionLoader action="sync" size="sm" />
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
          Showing {users.length} of {pagination.total} users
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
                  <ActionLoader action="sync" size="sm" className="mr-2" />
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

export function AdminUsersClient() {
  const { filters } = useFilters();
  const { search, role, sortBy, sortOrder } = filters;

  const {
    data,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useAdminUsersInfinite({
    search: search as string,
    role: role as string,
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
          <AdminUsersHeader />
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Failed to load users</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-muted/10 pt-16 md:pt-20 pb-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <AdminUsersHeader />
        {isLoading ? (
          <AdminUsersSkeleton />
        ) : (
          <AdminUsersData
            users={users}
            pagination={pagination}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
            refetch={refetch}
          />
        )}
      </div>
      <EditUserModal />
    </div>
  );
}
