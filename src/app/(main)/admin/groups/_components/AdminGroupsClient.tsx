"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/date-utils";
import {
  ArrowLeft,
  Users2,
  MoreHorizontal,
  Trash2,
  Edit,
  Calendar,
  Search,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { useAdminGroups } from "@/hooks/queries/useAdminGroups";
import { AdminGroupsSkeleton } from "./AdminGroupsSkeleton";
import { useModal } from "@/hooks/use-modal";
import { useFilters } from "@/providers/FilterProvider";

interface Group {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string;
    image?: string | null;
  };
  members: {
    id: string;
    role: string;
    joinedAt: string;
    user: {
      id: string;
      firstName: string;
      lastName: string | null;
      email: string;
      image?: string | null;
    };
  }[];
  _count: {
    members: number;
    events: number;
  };
}

export function AdminGroupsClient() {
  const { filters, updateFilter } = useFilters();
  const searchTerm = filters.search || "";
  const groupFilter =
    (filters.groupFilter as "all" | "active" | "inactive") || "all";

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useAdminGroups();

  const { open } = useModal();

  const handleDeleteGroup = (group: Group) => {
    open("delete-group", {
      groupId: group.id,
      groupName: group.name,
    });
  };

  const handleEditGroup = (group: Group) => {
    open("edit-group", {
      groupId: group.id,
      groupName: group.name,
      description: group.description || "",
      image: group.image,
    });
  };

  const getInitials = (firstName: string, lastName: string | null) => {
    return (firstName[0] || "" + (lastName?.[0] || "")).toUpperCase();
  };

  const handleRefresh = () => {
    refetch();
  };

  const filteredGroups = data?.pages.flatMap((page) => page.groups) || [];

  // Filter groups based on search and filter
  const displayGroups = filteredGroups.filter((group: Group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesFilter = true;
    if (groupFilter === "active") {
      matchesFilter = group._count.members > 1; // More than just the creator
    } else if (groupFilter === "inactive") {
      matchesFilter = group._count.members <= 1; // Only creator
    }

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-muted/10 pt-16 md:pt-20 pb-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        {/* Modern Header */}
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
          <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-xl p-4 sm:p-6 md:p-8 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-500/5 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-500/20 blur-xl" />
                  <div className="relative h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Users2 className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-orange-foreground" />
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    Admin Groups
                  </h1>
                  <p className="text-xs sm:text-sm md:text-base text-muted-foreground/90 mt-1">
                    Monitor and manage all groups across the platform.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefetching}
                  className="flex-shrink-0"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${isRefetching ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content - Shows skeleton only for data */}
        {isLoading ? (
          <AdminGroupsSkeleton />
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Failed to load groups</p>
          </div>
        ) : (
          <>
            {/* Search and Filter Controls */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search groups, descriptions, or creators..."
                    value={searchTerm}
                    onChange={(e) => updateFilter("search", e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={groupFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateFilter("groupFilter", "all")}
                  >
                    All Groups
                  </Button>
                  <Button
                    variant={groupFilter === "active" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateFilter("groupFilter", "active")}
                  >
                    Active
                  </Button>
                  <Button
                    variant={groupFilter === "inactive" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateFilter("groupFilter", "inactive")}
                  >
                    Inactive
                  </Button>
                </div>
              </div>
            </div>

            {/* Modern Groups List */}
            <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm shadow-xl">
              <div className="p-4 sm:p-6">
                {displayGroups.length === 0 ? (
                  <div className="text-center py-12">
                    <Users2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                      No groups found
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {searchTerm || groupFilter !== "all"
                        ? "Try adjusting your search or filters"
                        : "No groups have been created yet"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displayGroups.map((group: Group) => (
                      <div
                        key={group.id}
                        className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors"
                      >
                        {/* Group Image */}
                        <div className="flex-shrink-0">
                          {group.image ? (
                            <img
                              src={group.image}
                              alt={group.name}
                              className="h-16 w-16 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-orange-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Group Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-semibold text-foreground truncate">
                                  {group.name}
                                </h3>
                                <Badge variant="outline" className="text-xs">
                                  {group._count.members} members
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {group._count.events} events
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                Created by{" "}
                                <span className="font-bold text-foreground">
                                  {group.user.firstName} {group.user.lastName}
                                </span>
                              </p>
                              {group.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {group.description}
                                </p>
                              )}
                            </div>

                            {/* Dropdown Menu - Admin actions */}
                            <div className="flex justify-end sm:flex-shrink-0">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 sm:h-9 sm:w-9"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-48"
                                >
                                  <DropdownMenuItem
                                    onClick={() => handleEditGroup(group)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Group
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteGroup(group)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Group
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          {/* Members */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Members:
                            </span>
                            <div className="flex -space-x-1">
                              {group.members.slice(0, 5).map((member) => (
                                <Avatar
                                  key={member.id}
                                  className="h-8 w-8 border-2 border-background hover:scale-110 transition-transform"
                                >
                                  <AvatarImage
                                    src={member.user.image || undefined}
                                    alt={`${member.user.firstName} ${member.user.lastName}`}
                                  />
                                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                    {getInitials(
                                      member.user.firstName,
                                      member.user.lastName
                                    )}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                            {group.members.length > 5 && (
                              <span className="text-xs text-muted-foreground">
                                +{group.members.length - 5} more
                              </span>
                            )}
                          </div>

                          {/* Created Date */}
                          <div className="flex items-center gap-1 mt-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              Created {formatDate(group.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Load More Button */}
              {hasNextPage && (
                <div className="p-4 sm:p-6 border-t border-border">
                  <Button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="w-full"
                    variant="outline"
                  >
                    {isFetchingNextPage ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More Groups"
                    )}
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
