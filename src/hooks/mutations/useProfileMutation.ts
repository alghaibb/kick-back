"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateProfileAction } from "@/app/(main)/profile/actions";
import { UpdateProfileValues } from "@/validations/profile/profileSchema";

export function useProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: UpdateProfileValues) => {
      const result = await updateProfileAction(values);

      if (result?.error) {
        throw new Error(result.error);
      }

      return result;
    },
    onSuccess: () => {
      // Invalidate and refetch user data from multiple locations
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      queryClient.refetchQueries({ queryKey: ["user"] });

      toast.success("Profile updated successfully!");
    },
    onError: (error: Error) => {
      console.error("Profile update error:", error);
      toast.error(error.message || "Failed to update profile");
    },
  });
}
