import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQuery,
} from "@tanstack/react-query";
import {
  deleteUser as deleteUserAction,
  recoverUser as recoverUserAction,
  editUserProfile as editUserProfileAction,
  revokeUserSessions as revokeUserSessionsAction,
} from "@/app/(main)/admin/actions";
import { toast } from "sonner";
import type { EditUserInput } from "@/validations/admin/editUserSchema";

interface User {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  image: string | null;
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

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta?: {
    searchApplied: boolean;
    roleFilter: string | null;
  };
}

interface UsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Enhanced fetch function with better error handling and retry logic
async function fetchUsers(params: UsersParams): Promise<UsersResponse> {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const response = await fetch(
      `/api/admin/users?${searchParams.toString()}`,
      {
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Error fetching admin users:", error);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("Request timeout - please try again");
      }
      throw error;
    }

    throw new Error("Failed to fetch users");
  }
}

// Optimized hook with better caching strategy
export function useAdminUsers(params: Omit<UsersParams, "page"> = {}) {
  // Stable query key to prevent unnecessary re-renders
  const queryKey = ["admin", "users", params];

  return useQuery({
    queryKey,
    queryFn: () => fetchUsers({ ...params, page: 1 }),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error instanceof Error && error.message.includes("Forbidden")) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
}

// Infinite query for pagination
export function useAdminUsersInfinite(params: Omit<UsersParams, "page"> = {}) {
  return useInfiniteQuery({
    queryKey: ["admin", "users", "infinite", params],
    queryFn: ({ pageParam = 1 }) => fetchUsers({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasNext
        ? lastPage.pagination.page + 1
        : undefined;
    },
    initialPageParam: 1,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
}

// Optimized update mutation with better error handling
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      updates,
    }: {
      userId: string;
      updates: Record<string, unknown>;
    }) => {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, updates }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update user");
      }

      return response.json();
    },
    onMutate: async ({ userId, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["admin", "users"] });

      const previousUsers = queryClient.getQueryData(["admin", "users"]);

      queryClient.setQueryData(
        ["admin", "users"],
        (old: UsersResponse | undefined) => {
          if (!old) return old;

          return {
            ...old,
            users: old.users.map((user) =>
              user.id === userId
                ? { ...user, ...updates, updatedAt: new Date().toISOString() }
                : user
            ),
          };
        }
      );

      return { previousUsers };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(["admin", "users"], context.previousUsers);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      return deleteUserAction(userId);
    },
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ["admin", "users"] });

      const previousUsers = queryClient.getQueryData(["admin", "users"]);

      queryClient.setQueryData(
        ["admin", "users"],
        (old: UsersResponse | undefined) => {
          if (!old) return old;

          return {
            ...old,
            users: old.users.filter((user) => user.id !== userId),
            pagination: {
              ...old.pagination,
              total: old.pagination.total - 1,
            },
          };
        }
      );

      return { previousUsers };
    },
    onError: (err, userId, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(["admin", "users"], context.previousUsers);
      }
    },
    onSettled: async () => {
      // Batch invalidate related queries for better performance
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "deleted-users"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "stats"] }),
      ]);
    },
  });
}

export function useRecoverUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      return recoverUserAction(userId);
    },
    onMutate: async ({ userId }) => {
      await queryClient.cancelQueries({ queryKey: ["admin", "deleted-users"] });
      await queryClient.cancelQueries({ queryKey: ["admin", "users"] });

      const previousDeletedUsers = queryClient.getQueryData([
        "admin",
        "deleted-users",
      ]);
      const previousUsers = queryClient.getQueryData(["admin", "users"]);

      queryClient.setQueryData(
        ["admin", "deleted-users"],
        (old: UsersResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            users: old.users.filter((user: User) => user.id !== userId),
            pagination: {
              ...old.pagination,
              total: old.pagination.total - 1,
            },
          };
        }
      );

      return { previousDeletedUsers, previousUsers };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousDeletedUsers) {
        queryClient.setQueryData(
          ["admin", "deleted-users"],
          context.previousDeletedUsers
        );
      }
      if (context?.previousUsers) {
        queryClient.setQueryData(["admin", "users"], context.previousUsers);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "deleted-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

// Edit user profile mutation with optimistic updates
export function useEditUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string;
      data: EditUserInput;
    }) => {
      try {
        const result = await editUserProfileAction(userId, data);
        return result;
      } catch (error) {
        console.error("Edit user profile mutation error:", error);
        throw error;
      }
    },
    onMutate: async ({ userId, data }) => {
      // Cancel ALL admin users queries to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ["admin", "users"] });

      const allQueryData = queryClient.getQueriesData({
        queryKey: ["admin", "users"],
      });

      const updateUser = (user: User) =>
        user.id === userId
          ? {
              ...user,
              firstName: data.firstName,
              lastName: data.lastName,
              nickname: data.nickname,
              role: data.role,
              hasOnboarded: data.hasOnboarded,
              image: data.image !== undefined ? data.image || null : user.image,
              updatedAt: new Date().toISOString(),
            }
          : user;

      allQueryData.forEach(([queryKey, queryData]) => {
        if (queryData) {
          if (
            queryKey.includes("infinite") &&
            queryData &&
            typeof queryData === "object" &&
            "pages" in queryData
          ) {
            const infiniteData = queryData as { pages: UsersResponse[] };
            queryClient.setQueryData(queryKey, {
              ...infiniteData,
              pages: infiniteData.pages.map((page: UsersResponse) => ({
                ...page,
                users: page.users.map(updateUser),
              })),
            });
          }
          else if (
            queryData &&
            typeof queryData === "object" &&
            "users" in queryData
          ) {
            const regularData = queryData as UsersResponse;
            queryClient.setQueryData(queryKey, {
              ...regularData,
              users: regularData.users.map(updateUser),
            });
          }
        }
      });

      return { allQueryData };
    },
    onSuccess: (result, { userId }) => {
      const updateUserWithServerData = (user: User) =>
        user.id === userId ? { ...user, ...result.user } : user;

      const allQueryData = queryClient.getQueriesData({
        queryKey: ["admin", "users"],
      });

      allQueryData.forEach(([queryKey, queryData]) => {
        if (queryData) {
          if (
            queryKey.includes("infinite") &&
            queryData &&
            typeof queryData === "object" &&
            "pages" in queryData
          ) {
            const infiniteData = queryData as { pages: UsersResponse[] };
            queryClient.setQueryData(queryKey, {
              ...infiniteData,
              pages: infiniteData.pages.map((page: UsersResponse) => ({
                ...page,
                users: page.users.map(updateUserWithServerData),
              })),
            });
          }
          else if (
            queryData &&
            typeof queryData === "object" &&
            "users" in queryData
          ) {
            const regularData = queryData as UsersResponse;
            queryClient.setQueryData(queryKey, {
              ...regularData,
              users: regularData.users.map(updateUserWithServerData),
            });
          }
        }
      });
    },
    onError: (_err, _variables, context) => {
      // Rollback all queries to their previous state
      if (context?.allQueryData) {
        context.allQueryData.forEach(([queryKey, queryData]) => {
          if (queryData) {
            queryClient.setQueryData(queryKey, queryData);
          }
        });
      }
    },
    onSettled: () => {
      // Don't invalidate anything - we're managing cache manually in onSuccess
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      }, 100);
    },
  });
}

// Prefetch function for better UX
export function usePrefetchAdminUsers() {
  const queryClient = useQueryClient();

  return (params: UsersParams = {}) => {
    queryClient.prefetchQuery({
      queryKey: ["admin", "users", params],
      queryFn: () => fetchUsers(params),
      staleTime: 2 * 60 * 1000,
    });
  };
}

// Revoke user sessions mutation (optimistic UX)
export function useRevokeUserSessions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const res = await revokeUserSessionsAction(userId);
      if ("error" in res) throw new Error(res.error);
      return res;
    },
    onMutate: async ({ userId }) => {
      // Cancel to prevent flicker; modal closes immediately from caller
      await queryClient.cancelQueries({ queryKey: ["admin", "users"] });

      // Snapshot all user-related queries
      const allQueryData = queryClient.getQueriesData({
        queryKey: ["admin", "users"],
      });

      const updateUserSession = (user: User) =>
        user.id === userId ? { ...user, activeSessionId: null } : user;

      // Apply optimistic update across all queries (regular and infinite)
      allQueryData.forEach(([queryKey, queryData]) => {
        if (!queryData) return;

        // Infinite queries shape: { pages: UsersResponse[] }
        if (
          typeof queryData === "object" &&
          queryData !== null &&
          Array.isArray((queryData as { pages?: unknown }).pages)
        ) {
          const infiniteData = queryData as { pages: UsersResponse[] };
          queryClient.setQueryData(queryKey, {
            ...infiniteData,
            pages: infiniteData.pages.map((page: UsersResponse) => ({
              ...page,
              users: page.users.map(updateUserSession),
            })),
          });
          return;
        }

        if (
          typeof queryData === "object" &&
          queryData !== null &&
          (queryData as { users?: unknown }).users
        ) {
          const regularData = queryData as UsersResponse;
          queryClient.setQueryData(queryKey, {
            ...regularData,
            users: regularData.users.map(updateUserSession),
          });
          return;
        }
      });

      toast.success("Session revoked");
      return { allQueryData };
    },
    onError: (
      error,
      _vars,
      context: { allQueryData?: Array<[unknown, unknown]> } | undefined
    ) => {
      // Rollback cache if we changed it
      if (context?.allQueryData) {
        context.allQueryData.forEach(([queryKey, queryData]) => {
          queryClient.setQueryData(queryKey as unknown[], queryData);
        });
      }
      console.error("Revoke sessions mutation error:", error);
      toast.error((error as Error)?.message || "Failed to revoke sessions");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}
