"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  updateSettingsAction,
  changePasswordAction,
} from "@/app/(main)/settings/actions";
import { SettingsValues } from "@/validations/settingsSchema";
import { ChangePasswordValues } from "@/validations/profile/profileSchema";

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
