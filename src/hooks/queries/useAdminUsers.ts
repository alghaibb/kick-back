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
} from "@/app/(main)/admin/actions";
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
    if (value !== undefined && value !== null && value !== '') {
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
          'Content-Type': 'application/json',
        },
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
      }
      throw error;
    }

    throw new Error('Failed to fetch users');
  }
}

// Optimized hook with better caching strategy
export function useAdminUsers(params: Omit<UsersParams, "page"> = {}) {
  const queryKey = ["admin", "users", params];

  return useQuery({
    queryKey,
    queryFn: () => fetchUsers({ ...params, page: 1 }),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes (was cacheTime)
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error instanceof Error && error.message.includes('Forbidden')) {
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
      return lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// Optimized update mutation with better error handling
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Record<string, unknown> }) => {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, updates }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update user');
      }

      return response.json();
    },
    onMutate: async ({ userId, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["admin", "users"] });

      // Snapshot previous value
      const previousUsers = queryClient.getQueryData(["admin", "users"]);

      // Optimistically update
      queryClient.setQueryData(["admin", "users"], (old: UsersResponse | undefined) => {
        if (!old) return old;

        return {
          ...old,
          users: old.users.map(user =>
            user.id === userId
              ? { ...user, ...updates, updatedAt: new Date().toISOString() }
              : user
          ),
        };
      });

      return { previousUsers };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousUsers) {
        queryClient.setQueryData(["admin", "users"], context.previousUsers);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

// Optimized delete mutation
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      return deleteUserAction(userId);
    },
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ["admin", "users"] });

      const previousUsers = queryClient.getQueryData(["admin", "users"]);

      // Optimistically remove user
      queryClient.setQueryData(["admin", "users"], (old: UsersResponse | undefined) => {
        if (!old) return old;

        return {
          ...old,
          users: old.users.filter(user => user.id !== userId),
          pagination: {
            ...old.pagination,
            total: old.pagination.total - 1,
          },
        };
      });

      return { previousUsers };
    },
    onError: (err, userId, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(["admin", "users"], context.previousUsers);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "deleted-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

// Recover user mutation
export function useRecoverUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      return recoverUserAction(userId);
    },
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ["admin", "deleted-users"] });
      await queryClient.cancelQueries({ queryKey: ["admin", "users"] });

      const previousDeletedUsers = queryClient.getQueryData(["admin", "deleted-users"]);
      const previousUsers = queryClient.getQueryData(["admin", "users"]);

      // Remove from deleted users list
      queryClient.setQueryData(["admin", "deleted-users"], (old: UsersResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          users: old.users.filter((user: User) => user.id !== userId),
          pagination: {
            ...old.pagination,
            total: old.pagination.total - 1,
          },
        };
      });

      return { previousDeletedUsers, previousUsers };
    },
    onError: (err, userId, context) => {
      if (context?.previousDeletedUsers) {
        queryClient.setQueryData(["admin", "deleted-users"], context.previousDeletedUsers);
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
    mutationFn: async ({ userId, data }: { userId: string; data: EditUserInput }) => {
      try {
        const result = await editUserProfileAction(userId, data);
        return result;
      } catch (error) {
        console.error("Edit user profile mutation error:", error);
        throw error;
      }
    },
    onMutate: async ({ userId, data }) => {
      console.log("Optimistic update starting for user:", userId, data);

      // Cancel ALL admin users queries to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ["admin", "users"] });

      // Get all existing query data before updating
      const allQueryData = queryClient.getQueriesData({ queryKey: ["admin", "users"] });

      // Helper function to update user data
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
            updatedAt: new Date().toISOString()
          }
          : user;

      // Update ALL queries that match the pattern
      allQueryData.forEach(([queryKey, queryData]) => {
        if (queryData) {
          // Handle infinite queries
          if (queryKey.includes("infinite") && queryData && typeof queryData === 'object' && 'pages' in queryData) {
            const infiniteData = queryData as { pages: UsersResponse[] };
            queryClient.setQueryData(queryKey, {
              ...infiniteData,
              pages: infiniteData.pages.map((page: UsersResponse) => ({
                ...page,
                users: page.users.map(updateUser),
              })),
            });
          }
          // Handle regular queries
          else if (queryData && typeof queryData === 'object' && 'users' in queryData) {
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
      console.log("Edit user success, updating cache with server data:", result);

      // Update cache with actual server response
      const updateUserWithServerData = (user: User) =>
        user.id === userId ? { ...user, ...result.user } : user;

      // Update ALL queries with server data
      const allQueryData = queryClient.getQueriesData({ queryKey: ["admin", "users"] });

      allQueryData.forEach(([queryKey, queryData]) => {
        if (queryData) {
          // Handle infinite queries
          if (queryKey.includes("infinite") && queryData && typeof queryData === 'object' && 'pages' in queryData) {
            const infiniteData = queryData as { pages: UsersResponse[] };
            queryClient.setQueryData(queryKey, {
              ...infiniteData,
              pages: infiniteData.pages.map((page: UsersResponse) => ({
                ...page,
                users: page.users.map(updateUserWithServerData),
              })),
            });
          }
          // Handle regular queries
          else if (queryData && typeof queryData === 'object' && 'users' in queryData) {
            const regularData = queryData as UsersResponse;
            queryClient.setQueryData(queryKey, {
              ...regularData,
              users: regularData.users.map(updateUserWithServerData),
            });
          }
        }
      });
    },
    onError: (_err, { userId }, context) => {
      console.log("Edit user error, rolling back optimistic updates");

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
      // Only invalidate stats after a delay to avoid race conditions
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