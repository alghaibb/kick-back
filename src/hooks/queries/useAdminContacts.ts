import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  deleteContact as deleteContactAction,
  replyToContact as replyToContactAction,
} from "@/app/(main)/admin/actions";

interface Contact {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  subject: string;
  message: string;
  userId: string | null;
  createdAt: string;
  repliedAt?: string | null;
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

async function replyToContact(data: {
  contactId: string;
  replyMessage: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    return await replyToContactAction(data);
  } catch (error) {
    console.error("Failed to reply to contact:", error);
    throw new Error("Failed to reply to contact");
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
      await queryClient.cancelQueries({ queryKey: ["admin", "contacts"] });

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
      if (context?.previousContacts) {
        queryClient.setQueryData(
          ["admin", "contacts"],
          context.previousContacts
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "contacts"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });

      // Clear the stats cache by making a DELETE request
      fetch("/api/admin/stats", { method: "DELETE" }).catch(console.error);
    },
  });
}

export function useContactReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contactId,
      replyMessage,
    }: {
      contactId: string;
      replyMessage: string;
    }) => replyToContact({ contactId, replyMessage }),
    onMutate: async ({ contactId }) => {
      await queryClient.cancelQueries({ queryKey: ["admin", "contacts"] });

      const previousContacts = queryClient.getQueryData(["admin", "contacts"]);

      queryClient.setQueryData(["admin", "contacts"], (old: unknown) => {
        if (!old || typeof old !== "object" || !("pages" in old)) return old;

        const oldData = old as { pages: Array<{ contacts: Contact[] }> };
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            contacts: page.contacts.map((contact: Contact) =>
              contact.id === contactId
                ? { ...contact, repliedAt: new Date().toISOString() }
                : contact
            ),
          })),
        };
      });

      return { previousContacts };
    },
    onError: (err, variables, context) => {
      if (context?.previousContacts) {
        queryClient.setQueryData(
          ["admin", "contacts"],
          context.previousContacts
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "contacts"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });

      // Clear the stats cache by making a DELETE request
      fetch("/api/admin/stats", { method: "DELETE" }).catch(console.error);
    },
  });
}
