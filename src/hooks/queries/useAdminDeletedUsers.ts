import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { recoverUser as recoverUserAction } from "@/app/(main)/admin/actions";

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
  _count: {
    groupMembers: number;
    eventComments: number;
    contacts: number;
  };
}

interface DeletedUsersResponse {
  users: DeletedUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface DeletedUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

async function fetchDeletedUsers(
  params: DeletedUsersParams = {}
): Promise<DeletedUsersResponse> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.search) searchParams.set("search", params.search);
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

  const response = await fetch(
    `/api/admin/deleted-users?${searchParams.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch deleted users");
  }

  return response.json();
}

async function recoverUser(userId: string): Promise<{ success: boolean }> {
  try {
    return await recoverUserAction(userId);
  } catch (error) {
    console.error("Failed to recover user:", error);
    throw new Error("Failed to recover user");
  }
}

export function useAdminDeletedUsers(
  params: Omit<DeletedUsersParams, "page"> = {}
) {
  return useInfiniteQuery({
    queryKey: ["admin", "deleted-users", params],
    queryFn: ({ pageParam = 1 }) =>
      fetchDeletedUsers({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasNext
        ? lastPage.pagination.page + 1
        : undefined;
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (error?.message?.includes("Forbidden")) {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
}

export function useRecoverUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId }: { userId: string }) => recoverUser(userId),
    onMutate: async ({ userId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["admin", "deleted-users"] });
      await queryClient.cancelQueries({ queryKey: ["admin", "users"] });

      // Snapshot the previous values
      const previousDeletedUsers = queryClient.getQueryData([
        "admin",
        "deleted-users",
      ]);
      const previousUsers = queryClient.getQueryData(["admin", "users"]);

      // Optimistically remove from deleted users
      queryClient.setQueryData(["admin", "deleted-users"], (old: unknown) => {
        if (!old || typeof old !== "object" || !("pages" in old)) return old;

        const oldData = old as {
          pages: Array<{ users: DeletedUser[]; pagination: { total: number } }>;
        };
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            users: page.users.filter((user: DeletedUser) => user.id !== userId),
            pagination: {
              ...page.pagination,
              total: Math.max(0, page.pagination.total - 1),
            },
          })),
        };
      });

      return { previousDeletedUsers, previousUsers };
    },
    onError: (_err, _variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousDeletedUsers) {
        queryClient.setQueryData(
          ["admin", "deleted-users"],
          context.previousDeletedUsers
        );
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["admin", "deleted-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}
