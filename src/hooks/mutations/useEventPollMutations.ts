import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  SuggestLocationOptionValues,
  VoteLocationOptionValues,
  CloseLocationPollValues,
} from "@/validations/events/eventPollSchema";
import {
  suggestLocationOptionAction,
  voteLocationOptionAction,
  closeLocationPollAction,
  voteNoLocationOptionAction,
} from "@/app/(main)/events/actions";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export function useSuggestLocationOption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: SuggestLocationOptionValues) => {
      const res = await suggestLocationOptionAction(values);
      if ((res as { error?: string }).error) {
        throw new Error((res as { error: string }).error);
      }
      return res as { success: true; pollId: string; optionId: string };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["event-poll", variables.eventId],
      });
      toast.success("Location suggested");
    },
    onError: (error) => {
      console.error("Suggest location option mutation error:", error);
      toast.error((error as Error).message || "Failed to suggest location");
    },
  });
}

export function useVoteLocationOption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: VoteLocationOptionValues) => {
      const res = await voteLocationOptionAction(values);
      if ((res as { error?: string }).error) {
        throw new Error((res as { error: string }).error);
      }
      return res as { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["event-poll", variables.eventId],
      });
    },
    onError: (error) => {
      console.error("Vote location option mutation error:", error);
      toast.error((error as Error).message || "Failed to vote");
    },
  });
}

export function useCloseLocationPoll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: CloseLocationPollValues) => {
      const res = await closeLocationPollAction(values);
      if ((res as { error?: string }).error) {
        throw new Error((res as { error: string }).error);
      }
      return res as { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      toast.success("Poll closed and location set");
    },
    onError: (error) => {
      console.error("Close location poll mutation error:", error);
      toast.error((error as Error).message || "Failed to close poll");
    },
  });
}

export function useVoteNoLocationOption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: VoteLocationOptionValues) => {
      const res = await voteNoLocationOptionAction(values);
      if ((res as { error?: string }).error) {
        throw new Error((res as { error: string }).error);
      }
      return res as { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["event-poll", variables.eventId] });
    },
    onError: (error) => {
      console.error("Vote NO location option mutation error:", error);
      toast.error((error as Error).message || "Failed to vote no");
    },
  });
}


