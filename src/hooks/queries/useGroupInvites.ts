"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface GroupInvite {
  id: string;
  email: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  inviter: {
    firstName: string;
    email: string;
  };
}

interface GroupInvitesResponse {
  success: boolean;
  invites: GroupInvite[];
}

async function fetchGroupInvites(groupId: string): Promise<GroupInvite[]> {
  const response = await fetch(`/api/groups/${groupId}/invites`, {
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Not authenticated");
    }
    if (response.status === 403) {
      throw new Error("Not authorized to view group invites");
    }
    throw new Error("Failed to fetch group invites");
  }

  const result: GroupInvitesResponse = await response.json();

  if (!result.success) {
    throw new Error("Failed to fetch group invites");
  }

  return result.invites;
}

// Cancel invite API call
async function cancelInviteApi(inviteId: string): Promise<void> {
  const response = await fetch(`/api/groups/invites/${inviteId}/cancel`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to cancel invitation");
  }
}

// Resend invite API call  
async function resendInviteApi(inviteId: string): Promise<void> {
  const response = await fetch(`/api/groups/invites/${inviteId}/resend`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to resend invitation");
  }
}

export function useGroupInvites(groupId: string) {
  const queryClient = useQueryClient();

  // Query for fetching invites
  const {
    data: invites = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["group-invites", groupId],
    queryFn: () => fetchGroupInvites(groupId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    enabled: !!groupId,
  });

  const cancelInviteMutation = useMutation({
    mutationFn: cancelInviteApi,
    onMutate: async (inviteId: string) => {
      await queryClient.cancelQueries({ queryKey: ["group-invites", groupId] });

      const previousInvites = queryClient.getQueryData<GroupInvite[]>(["group-invites", groupId]);

      queryClient.setQueryData<GroupInvite[]>(["group-invites", groupId], (old = []) =>
        old.map(invite =>
          invite.id === inviteId
            ? { ...invite, status: "cancelled" }
            : invite
        )
      );

      return { previousInvites };
    },
    onSuccess: () => {
      toast.success("Invitation cancelled successfully");
    },
    onError: (error, inviteId, context) => {
      console.error("Failed to cancel invitation:", error);
      toast.error(error.message || "Failed to cancel invitation");

      if (context?.previousInvites) {
        queryClient.setQueryData(["group-invites", groupId], context.previousInvites);
      }
    },
    onSettled: () => {
      // Always refetch to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ["group-invites", groupId] });
    },
  });

  const resendInviteMutation = useMutation({
    mutationFn: resendInviteApi,
    onSuccess: () => {
      toast.success("Invitation resent successfully");
      // Refetch to get updated data (like new expiry date)
      queryClient.invalidateQueries({ queryKey: ["group-invites", groupId] });
    },
    onError: (error) => {
      console.error("Failed to resend invitation:", error);
      toast.error(error.message || "Failed to resend invitation");
    },
  });

  const pendingInvites = invites.filter(invite => invite.status === "pending");
  const otherInvites = invites.filter(invite => invite.status !== "pending");

  return {
    invites,
    pendingInvites,
    otherInvites,

    isLoading,
    isCanceling: cancelInviteMutation.isPending,
    isResending: resendInviteMutation.isPending,

    error,

    cancelInvite: cancelInviteMutation.mutate,
    resendInvite: resendInviteMutation.mutate,
    refetchInvites: refetch,
  };
} 