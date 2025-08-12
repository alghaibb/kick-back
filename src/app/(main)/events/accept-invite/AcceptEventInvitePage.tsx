"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, Calendar, MapPin } from "lucide-react";
import { toast } from "sonner";

interface AcceptEventInvitePageProps {
  token?: string;
}

interface EventInviteData {
  event: {
    id: string;
    name: string;
    description: string | null;
    date: string;
    location: string | null;
  };
  inviter: {
    firstName: string;
    email: string;
  };
}

export function AcceptEventInvitePage({ token }: AcceptEventInvitePageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [inviteData, setInviteData] = useState<EventInviteData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("No invitation token provided");
      setLoading(false);
      return;
    }

    // Fetch invite data
    fetchInviteData(token);
  }, [token]);

  const fetchInviteData = async (inviteToken: string) => {
    try {
      const response = await fetch(`/api/events/invites/${inviteToken}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to load invitation");
        return;
      }

      setInviteData(data);
    } catch (error) {
      console.error("Load invite failed:", error);
      setError("Failed to load invitation");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!token) return;

    setAccepting(true);
    try {
      const response = await fetch(`/api/events/invites/${token}/accept`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to accept invitation");
        return;
      }

      toast.success(data.message || "Successfully joined the event!");
      router.push(`/events/${data.event.id}`);
    } catch (error) {
      console.error("Accept invite failed:", error);
      toast.error("Failed to accept invitation");
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = () => {
    router.push("/events");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Invalid Invitation</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => router.push("/events")}>Go to Events</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!inviteData) {
    return null;
  }

  const eventDate = new Date(inviteData.event.date);
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = eventDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Event Invitation</CardTitle>
          <p className="text-muted-foreground">
            {inviteData.inviter.firstName || inviteData.inviter.email} has
            invited you to an event
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Event Details */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">{inviteData.event.name}</h3>

            {inviteData.event.description && (
              <p className="text-muted-foreground">
                {inviteData.event.description}
              </p>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {formattedDate} at {formattedTime}
                </span>
              </div>

              {inviteData.event.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{inviteData.event.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleAcceptInvite}
              disabled={accepting}
              className="flex-1"
            >
              {accepting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Accepting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept Invitation
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleDecline}
              disabled={accepting}
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Decline
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
