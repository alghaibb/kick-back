import { EventData } from "@/hooks/queries/useEvents";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";

export interface EventFilters {
  search: string;
  groupId: string; // "all" for no filter, or actual group ID
  dateRange: "all" | "today" | "week" | "month" | "custom";
  sortBy: "date" | "name" | "created";
  sortOrder: "asc" | "desc";
  customStartDate?: string;
  customEndDate?: string;
}

export function filterAndSortEvents(
  events: EventData[],
  filters: EventFilters
): EventData[] {
  let filteredEvents = [...events];

  // Search filter - search in name, description, and location
  if (filters.search.trim()) {
    const searchTerm = filters.search.toLowerCase().trim();
    filteredEvents = filteredEvents.filter(
      (event) =>
        event.name.toLowerCase().includes(searchTerm) ||
        event.description?.toLowerCase().includes(searchTerm) ||
        event.location?.toLowerCase().includes(searchTerm)
    );
  }

  if (filters.groupId && filters.groupId !== "all") {
    filteredEvents = filteredEvents.filter(
      (event) => event.groupId === filters.groupId
    );
  }

  if (filters.dateRange !== "all") {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (filters.dateRange) {
      case "today":
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case "week":
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
        break;
      case "month":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "custom":
        if (filters.customStartDate && filters.customEndDate) {
          startDate = new Date(filters.customStartDate);
          endDate = new Date(filters.customEndDate);
        } else {
          startDate = new Date(0); // No filter if custom dates not provided
          endDate = new Date(8640000000000000); // Max date
        }
        break;
      default:
        startDate = new Date(0);
        endDate = new Date(8640000000000000);
    }

    filteredEvents = filteredEvents.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate >= startDate && eventDate <= endDate;
    });
  }

  filteredEvents.sort((a, b) => {
    let comparison = 0;

    switch (filters.sortBy) {
      case "date":
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "created":
        // Assuming we don't have createdAt field, fallback to date
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      default:
        comparison = 0;
    }

    return filters.sortOrder === "desc" ? -comparison : comparison;
  });

  return filteredEvents;
}

export const defaultFilters: EventFilters = {
  search: "",
  groupId: "all",
  dateRange: "all",
  sortBy: "date",
  sortOrder: "desc",
};
