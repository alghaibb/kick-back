import { useQuery } from "@tanstack/react-query";
import { useSmartPolling } from "@/hooks/useSmartPolling";

export interface EventPollOptionData {
  id: string;
  label: string;
  addressFormatted: string;
  latitude?: number;
  longitude?: number;
  votes: number;
  votedByMe: boolean;
  myYes?: boolean;
  myNo?: boolean;
  voters: Array<{
    user: {
      id: string;
      image?: string;
      nickname?: string;
      firstName?: string;
    };
  }>;
  noVoters: Array<{
    user: {
      id: string;
      image?: string;
      nickname?: string;
      firstName?: string;
    };
  }>;
}

export interface EventPollData {
  id: string;
  status: "open" | "closed";
  createdAt: string;
  options: EventPollOptionData[];
  myVoteOptionId?: string;
  isHost: boolean;
  hasEventLocation: boolean;
  totalYesVotes: number;
}

export function useEventPoll(eventId: string) {
  const { pollingInterval } = useSmartPolling({ strategy: "ultra-fast" });

  return useQuery<{ poll: EventPollData | null }>({
    queryKey: ["event-poll", eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/poll`);
      if (!res.ok) throw new Error("Failed to load poll");
      return res.json();
    },
    refetchInterval: pollingInterval,
    refetchOnWindowFocus: true,
    staleTime: 1000,
    gcTime: 15 * 60 * 1000,
  });
}


