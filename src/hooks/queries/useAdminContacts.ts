import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { deleteContact as deleteContactAction } from "@/app/(main)/admin/actions";

interface Contact {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  subject: string;
  message: string;
  userId: string | null;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string;
  } | null;
}

interface ContactsResponse {
  contacts: Contact[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface ContactsParams {
  page?: number;
  limit?: number;
}

async function fetchContacts(
  params: ContactsParams = {}
): Promise<ContactsResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());

  const response = await fetch(
    `/api/admin/contacts?${searchParams.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch contacts");
  }

  return response.json();
}

async function deleteContact(contactId: string): Promise<{ success: boolean }> {
  try {
    return await deleteContactAction(contactId);
  } catch (error) {
    console.error("Failed to delete contact:", error);
    throw new Error("Failed to delete contact");
  }
}

export function useAdminContacts(params: Omit<ContactsParams, "page"> = {}) {
  return useInfiniteQuery({
    queryKey: ["admin", "contacts", params],
    queryFn: ({ pageParam = 1 }) =>
      fetchContacts({ ...params, page: pageParam }),
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
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contactId }: { contactId: string }) =>
      deleteContact(contactId),
    onMutate: async ({ contactId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["admin", "contacts"] });

      // Snapshot the previous value
      const previousContacts = queryClient.getQueryData(["admin", "contacts"]);

      // Optimistically remove the contact
      queryClient.setQueryData(["admin", "contacts"], (old: unknown) => {
        if (!old || typeof old !== "object" || !("pages" in old)) return old;

        const oldData = old as { pages: Array<{ contacts: Contact[] }> };
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            contacts: page.contacts.filter(
              (contact: Contact) => contact.id !== contactId
            ),
          })),
        };
      });

      return { previousContacts };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousContacts) {
        queryClient.setQueryData(
          ["admin", "contacts"],
          context.previousContacts
        );
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["admin", "contacts"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}
