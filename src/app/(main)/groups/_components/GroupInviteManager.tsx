"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  getGroupInvitesAction,
  cancelGroupInviteAction,
  resendGroupInviteAction,
} from "../actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, X, RefreshCw, Clock, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

interface GroupInviteManagerProps {
  groupId: string;
  groupName: string;
}

interface Invite {
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

export function GroupInviteManager({
  groupId,
  groupName,
}: GroupInviteManagerProps) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInvites();
  }, [groupId, loadInvites]);

  async function loadInvites() {
    try {
      const result = await getGroupInvitesAction(groupId);
      if (result?.success) {
        setInvites(
          result.invites.map((invite) => ({
            id: invite.id,
            email: invite.email,
            status: invite.status,
            createdAt: invite.createdAt.toString(),
            expiresAt: invite.expiresAt.toString(),
            inviter: {
              firstName: invite.inviter.firstName,
              email: invite.inviter.email,
            },
          }))
        );
      } else {
        toast.error("Failed to load invitations");
      }
    } catch (error) {
      console.error("Faile to load invitations:", error);
      toast.error("Failed to load invitations");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelInvite(inviteId: string) {
    try {
      const result = await cancelGroupInviteAction(inviteId);
      if (result?.success) {
        toast.success("Invitation cancelled");
        setInvites((prev) => prev.filter((invite) => invite.id !== inviteId));
      } else {
        toast.error(result?.error || "Failed to cancel invitation");
      }
    } catch (error) {
      console.error("Failed to cancel invitation:", error);
      toast.error("Failed to cancel invitation");
    }
  }

  async function handleResendInvite(inviteId: string) {
    setRefreshing(true);
    try {
      const result = await resendGroupInviteAction(inviteId);
      if (result?.success) {
        toast.success("Invitation resent successfully");
        await loadInvites(); // Refresh to get updated expiration
      } else {
        toast.error(result?.error || "Failed to resend invitation");
      }
    } catch (error) {
      console.error("Failed to resend invitation:", error);
      toast.error("Failed to resend invitation");
    } finally {
      setRefreshing(false);
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "accepted":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "accepted":
        return <Badge variant="default">Accepted</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  function isExpired(expiresAt: string) {
    return new Date(expiresAt) < new Date();
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Group Invitations
          </CardTitle>
          <CardDescription>Loading invitations...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const pendingInvites = invites.filter(
    (invite) => invite.status === "pending"
  );
  const otherInvites = invites.filter((invite) => invite.status !== "pending");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Group Invitations
            </CardTitle>
            <CardDescription>
              Manage invitations for {groupName}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadInvites}
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingInvites.length === 0 && otherInvites.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No invitations found</p>
            <p className="text-sm">Invitations will appear here once sent</p>
          </div>
        ) : (
          <>
            {pendingInvites.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Pending Invitations</h4>
                {pendingInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(invite.status)}
                      <div>
                        <p className="font-medium">{invite.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Invited by{" "}
                          {invite.inviter.firstName || invite.inviter.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(
                            new Date(invite.createdAt),
                            "MMM d, yyyy 'at' h:mm a"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(invite.status)}
                      {isExpired(invite.expiresAt) && (
                        <Badge variant="destructive">Expired</Badge>
                      )}
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResendInvite(invite.id)}
                          disabled={refreshing}
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelInvite(invite.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {otherInvites.length > 0 && (
              <>
                {pendingInvites.length > 0 && <Separator />}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Other Invitations</h4>
                  {otherInvites.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(invite.status)}
                        <div>
                          <p className="font-medium">{invite.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Invited by{" "}
                            {invite.inviter.firstName || invite.inviter.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(
                              new Date(invite.createdAt),
                              "MMM d, yyyy 'at' h:mm a"
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(invite.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
