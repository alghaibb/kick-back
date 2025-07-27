"use client";

import { useState } from "react";
import { Search, Filter, X, Calendar, Users, SortDesc } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { GroupData } from "@/hooks/queries/useEvents";
import type { EventFilters } from "@/lib/event-filters";

interface EventFiltersProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  groups: GroupData[];
  eventCount: number;
}

export default function EventFilters({
  filters,
  onFiltersChange,
  groups,
  eventCount,
}: EventFiltersProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const updateFilter = (key: keyof EventFilters, value: string) => {
    // Ensure groupId is never an empty string
    if (key === "groupId" && (!value || value.trim() === "")) {
      value = "all";
    }

    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: "",
      groupId: "all",
      dateRange: "all",
      sortBy: "date",
      sortOrder: "desc",
    });
  };

  const hasActiveFilters =
    filters.search ||
    (filters.groupId && filters.groupId !== "all") ||
    filters.dateRange !== "all" ||
    filters.sortBy !== "date" ||
    filters.sortOrder !== "desc";

  const activeFilterCount = [
    filters.search,
    filters.groupId && filters.groupId !== "all",
    filters.dateRange !== "all",
    filters.sortBy !== "date" || filters.sortOrder !== "desc",
  ].filter(Boolean).length;

  // Desktop filters content
  const FiltersContent = () => (
    <div className="space-y-4">
      {/* Group Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Group</label>
        <Select
          value={filters.groupId}
          onValueChange={(value) => updateFilter("groupId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All groups" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All groups</SelectItem>
            {groups
              ?.filter((group) => group.id && group.id.trim() !== "")
              .map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              )) || []}
          </SelectContent>
        </Select>
      </div>

      {/* Date Range Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Date Range
        </label>
        <Select
          value={filters.dateRange}
          onValueChange={(value) => updateFilter("dateRange", value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All dates</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This week</SelectItem>
            <SelectItem value="month">This month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sort Options */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Sort by</label>
        <div className="flex gap-2">
          <Select
            value={filters.sortBy}
            onValueChange={(value) => updateFilter("sortBy", value)}
          >
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="created">Created</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.sortOrder}
            onValueChange={(value) => updateFilter("sortOrder", value)}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">↑ Asc</SelectItem>
              <SelectItem value="desc">↓ Desc</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearAllFilters}
          className="w-full"
        >
          <X className="w-4 h-4 mr-2" />
          Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search Bar - Always visible */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search events by name, description, or location..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="pl-10 pr-4"
        />
      </div>

      {/* Mobile Filter Sheet & Desktop Filters */}
      <div className="flex items-center justify-between">
        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          {eventCount} {eventCount === 1 ? "event" : "events"} found
        </div>

        {/* Desktop Filters - Hidden on mobile */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Group Filter */}
          <Select
            value={filters.groupId}
            onValueChange={(value) => updateFilter("groupId", value)}
          >
            <SelectTrigger className="w-40">
              <Users className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All groups</SelectItem>
              {groups
                ?.filter((group) => group.id && group.id.trim() !== "")
                .map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                )) || []}
            </SelectContent>
          </Select>

          {/* Date Range */}
          <Select
            value={filters.dateRange}
            onValueChange={(value) => updateFilter("dateRange", value)}
          >
            <SelectTrigger className="w-36">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onValueChange={(value) => {
              const [sortBy, sortOrder] = value.split("-");
              updateFilter("sortBy", sortBy);
              updateFilter("sortOrder", sortOrder);
            }}
          >
            <SelectTrigger className="w-40">
              <SortDesc className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Latest first</SelectItem>
              <SelectItem value="date-asc">Oldest first</SelectItem>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Mobile Filter Button */}
        <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="lg:hidden relative">
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl px-6 pb-8">
            <SheetHeader className="px-0">
              <SheetTitle>Filter Events</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FiltersContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters Display - Mobile */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 lg:hidden">
          {filters.search && (
            <Badge variant="secondary" className="text-xs">
              Search: {filters.search}
              <button
                onClick={() => updateFilter("search", "")}
                className="ml-2 hover:bg-destructive/20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.groupId && filters.groupId !== "all" && (
            <Badge variant="secondary" className="text-xs">
              Group:{" "}
              {groups?.find((g) => g.id === filters.groupId)?.name || "Unknown"}
              <button
                onClick={() => updateFilter("groupId", "all")}
                className="ml-2 hover:bg-destructive/20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.dateRange !== "all" && (
            <Badge variant="secondary" className="text-xs">
              Date: {filters.dateRange}
              <button
                onClick={() => updateFilter("dateRange", "all")}
                className="ml-2 hover:bg-destructive/20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
