"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useEventPoll } from "@/hooks/queries/useEventPoll";
import {
  useSuggestLocationOption,
  useVoteLocationOption,
  useCloseLocationPoll,
  useVoteNoLocationOption,
} from "@/hooks/mutations/useEventPollMutations";
import { LocationInput } from "@/components/ui/location-input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface EventLocationPollProps {
  eventId: string;
}

export function EventLocationPoll({ eventId }: EventLocationPollProps) {
  const { data, isLoading } = useEventPoll(eventId);
  const suggestMutation = useSuggestLocationOption();
  const voteMutation = useVoteLocationOption();
  const closeMutation = useCloseLocationPoll();
  const voteNoMutation = useVoteNoLocationOption();

  const [locationText, setLocationText] = useState<string>("");
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lng, setLng] = useState<number | undefined>(undefined);

  const poll = data?.poll ?? null;

  if (isLoading) return null;
  if (poll && poll.hasEventLocation) return null;

  // Percentages are computed per option (yes vs no for that suggestion)

  const handleSuggest = async () => {
    if (!locationText.trim()) return;
    await suggestMutation.mutateAsync({
      eventId,
      label: locationText,
      addressFormatted: locationText,
      latitude: lat,
      longitude: lng,
    });
    setLocationText("");
    setLat(undefined);
    setLng(undefined);
  };

  const handleVote = async (optionId: string) => {
    await voteMutation.mutateAsync({ eventId, optionId });
  };

  const handleClose = async (optionId?: string) => {
    await closeMutation.mutateAsync({ eventId, winningOptionId: optionId });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Location Poll
          <Badge variant="secondary">Open</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Suggestion input */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 min-w-0">
            <LocationInput
              value={locationText}
              onChange={(v) => setLocationText(v)}
              onSelectSuggestion={(s) => {
                setLocationText(s.displayName);
                setLat(s.lat);
                setLng(s.lon);
              }}
            />
          </div>
          <Button
            onClick={handleSuggest}
            disabled={suggestMutation.isPending}
            className="w-full sm:w-auto"
          >
            Suggest
          </Button>
        </div>

        {/* Global Vote NO removed; now per-option */}

        {/* Options list */}
        {poll && poll.options.length > 0 && (
          <div className="space-y-3">
            {poll.options.map((o) => {
              const yesCount = o.votes;
              const noCount = o.noVoters?.length || 0;
              const optionTotal = yesCount + noCount;
              const yesPercent = optionTotal
                ? Math.round((yesCount / optionTotal) * 100)
                : 0;
              return (
                <div key={o.id} className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="text-sm font-medium truncate min-w-0">
                      {o.addressFormatted || o.label}
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                      <Badge
                        variant={o.myYes ? "default" : "outline"}
                        className="text-[11px] sm:text-xs whitespace-nowrap"
                      >
                        {yesPercent}% yes · {100 - yesPercent}% no ·{" "}
                        {optionTotal} vote{optionTotal === 1 ? "" : "s"}
                      </Badge>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                        <Button
                          size="sm"
                          variant={o.myYes ? "default" : "secondary"}
                          onClick={() => handleVote(o.id)}
                          disabled={voteMutation.isPending}
                          className="w-full sm:w-auto"
                        >
                          {o.myYes ? "Yes" : "Vote Yes"}
                        </Button>
                        <Button
                          size="sm"
                          variant={o.myNo ? "default" : "outline"}
                          onClick={() =>
                            voteNoMutation.mutate({ eventId, optionId: o.id })
                          }
                          disabled={voteNoMutation.isPending}
                          className="w-full sm:w-auto"
                        >
                          {o.myNo ? "No" : "Vote No"}
                        </Button>
                      </div>
                    </div>
                  </div>
                  {/* Progress shows YES proportion for this option */}
                  <Progress value={yesPercent} className="h-2" />
                  {o.noVoters?.length ? (
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        Voted No:
                      </span>
                      {o.noVoters.map(({ user }) => (
                        <div
                          key={user.id}
                          className="flex items-center gap-2 text-xs text-muted-foreground"
                        >
                          <Avatar className="h-5 w-5">
                            {user.image ? (
                              <AvatarImage src={user.image} alt="" />
                            ) : (
                              <AvatarFallback className="text-[10px]">
                                {(user.nickname || user.firstName || "?")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <span>
                            {user.nickname || user.firstName || "User"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {o.voters?.length ? (
                    <div className="flex flex-wrap items-center gap-2">
                      {o.voters.map(({ user }) => (
                        <div
                          key={user.id}
                          className="flex items-center gap-2 text-xs text-muted-foreground"
                        >
                          <Avatar className="h-5 w-5">
                            {user.image ? (
                              <AvatarImage src={user.image} alt="" />
                            ) : (
                              <AvatarFallback className="text-[10px]">
                                {(user.nickname || user.firstName || "?")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <span>
                            {user.nickname || user.firstName || "User"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        {/* Host controls: show only if host */}
        {poll?.isHost && poll.options.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              variant="default"
              onClick={() => handleClose(poll.options[0].id)}
              disabled={closeMutation.isPending}
              className="w-full sm:w-auto"
            >
              Set top option & close
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleClose()}
              disabled={closeMutation.isPending}
              className="w-full sm:w-auto"
            >
              Close without setting
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
