"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  deleteGroupAction,
  leaveGroupAction,
  inviteToGroupAction,
  updateGroupMemberRoleAction,
  removeGroupMemberAction,
} from "@/app/(main)/groups/actions";
import { useDashboardInvalidation } from "@/hooks/queries/useDashboardInvalidation";

export function useDeleteGroup() {
  const queryClient = useQueryClient();
  const { invalidateDashboard } = useDashboardInvalidation();

  return useMutation({
    mutationFn: async (groupId: string) => {
      const result = await deleteGroupAction(groupId);
      if (result?.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      toast.success("Group disbanded successfully");
      // Invalidate dashboard stats to update group count
      invalidateDashboard();
      // Invalidate groups data
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
    onError: (error: Error) => {
      console.error("Delete group error:", error);
      toast.error(error.message || "Failed to disband group");
    },
  });
}

export function useLeaveGroup() {
  const queryClient = useQueryClient();
  const { invalidateDashboard } = useDashboardInvalidation();

  return useMutation({
    mutationFn: async (groupId: string) => {
      const result = await leaveGroupAction(groupId);
      if (result?.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      toast.success("You left the group");
      // Invalidate dashboard stats to update group count
      invalidateDashboard();
      // Invalidate groups data
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
    onError: (error: Error) => {
      console.error("Leave group error:", error);
      toast.error(error.message || "Failed to leave group");
    },
  });
}

export function useInviteToGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      groupId: string;
      email: string;
      role: string;
    }) => {
      const formData = new FormData();
      formData.append("groupId", data.groupId);
      formData.append("email", data.email);
      formData.append("role", data.role);

      const result = await inviteToGroupAction(formData);
      if (result?.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (_, variables) => {
      toast.success(`Invitation sent to ${variables.email}!`);
      // Invalidate group invites
      queryClient.invalidateQueries({
        queryKey: ["group-invites", variables.groupId],
      });

      // Invalidate notifications so invited user gets notification immediately
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: Error) => {
      console.error("Invite to group error:", error);
      toast.error(error.message || "Failed to send invitation");
    },
  });
}

export function useUpdateGroupMemberRole() {
  return useMutation({
    mutationFn: async (data: {
      groupId: string;
      memberId: string;
      newRole: string;
    }) => {
      const result = await updateGroupMemberRoleAction(data);
      if (result?.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      toast.success("Role updated");
    },
    onError: (error: Error) => {
      console.error("Update member role error:", error);
      toast.error(error.message || "Failed to update role");
    },
  });
}

export function useRemoveGroupMember() {
  return useMutation({
    mutationFn: async (data: { groupId: string; memberId: string }) => {
      const result = await removeGroupMemberAction(data);
      if (result?.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      toast.success("Member removed");
    },
    onError: (error: Error) => {
      console.error("Remove member error:", error);
      toast.error(error.message || "Failed to remove member");
    },
  });
}
