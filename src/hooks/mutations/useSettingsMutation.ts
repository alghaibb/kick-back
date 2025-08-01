"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  updateSettingsAction,
  changePasswordAction,
  deleteAccountAction,
} from "@/app/(main)/settings/actions";
import { recoverAccountAction } from "@/app/(main)/settings/actions";
import { SettingsValues } from "@/validations/settingsSchema";
import { ChangePasswordValues } from "@/validations/profile/profileSchema";
import { signOut } from "next-auth/react";

export function useSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: SettingsValues) => {
      const result = await updateSettingsAction(values);

      if (result?.error) {
        throw new Error(result.error);
      }

      return result;
    },
    onSuccess: () => {
      // Invalidate and refetch settings data
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["auth"] });

      toast.success("Settings updated successfully!");
    },
    onError: (error: Error) => {
      console.error("Settings update error:", error);
      toast.error(error.message || "Failed to update settings");
    },
  });
}

export function useChangePasswordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: ChangePasswordValues) => {
      const result = await changePasswordAction(values);

      if (result?.error) {
        throw new Error(result.error);
      }

      return result;
    },
    onSuccess: () => {
      // Invalidate settings to refresh hasPassword status
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });

      toast.success("Password changed successfully!");
    },
    onError: (error: Error) => {
      console.error("Password change error:", error);
      toast.error(error.message || "Failed to change password");
    },
  });
}

export function useDeleteAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await deleteAccountAction();

      if (result?.error) {
        throw new Error(result.error);
      }

      return result;
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      toast.success(
        "Account scheduled for deletion. You have 30 days to recover it."
      );

      // Sign out the user and redirect to login page
      signOut({
        callbackUrl: "/login",
        redirect: true,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete account");
    },
  });
}

export function useRecoverAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await recoverAccountAction();

      if (result?.error) {
        throw new Error(result.error);
      }

      return result;
    },
    onSuccess: () => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      toast.success("Account recovered successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to recover account");
    },
  });
}
