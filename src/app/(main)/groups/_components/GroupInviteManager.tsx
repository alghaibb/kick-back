"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { CheckCircle, Clock, Mail, RefreshCw, X, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  cancelGroupInviteAction,
  getGroupInvitesAction,
  resendGroupInviteAction,
} from "../actions";

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
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Log component initialization for debugging
  console.log(`GroupInviteManager initialized for group ${groupId}`);

  // Fetch invites on component mount
  useEffect(() => {
    fetchInvites();
  }, [groupId]);

  async function fetchInvites() {
    try {
      setLoading(true);
      const result = await getGroupInvitesAction(groupId);
      if (result.success) {
        setInvites(result.invites);
      } else {
        console.error(
          `Failed to fetch invites for group ${groupId}:`,
          result.error
        );
        toast.error(result.error || "Failed to fetch invites");
      }
    } catch (error) {
      console.error(`Failed to fetch invites for group ${groupId}:`, error);
      toast.error("Failed to fetch invites");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelInvite(inviteId: string) {
    try {
      // Additional validation: ensure invite belongs to this group
      const inviteToCancel = invites.find((invite) => invite.id === inviteId);
      if (!inviteToCancel) {
        console.error(`Invite ${inviteId} not found in group ${groupId}`);
        toast.error("Invitation not found");
        return;
      }

      console.log(`Cancelling invite ${inviteId} for group ${groupId}`);
      const result = await cancelGroupInviteAction(inviteId);
      if (result?.success) {
        toast.success("Invitation cancelled");
        setInvites((prev) => prev.filter((invite) => invite.id !== inviteId));
        fetchInvites();
      } else {
        console.error(
          `Failed to cancel invite ${inviteId} for group ${groupId}:`,
          result?.error
        );
        toast.error(result?.error || "Failed to cancel invitation");
      }
    } catch (error) {
      console.error(
        `Failed to cancel invitation ${inviteId} for group ${groupId}:`,
        error
      );
      toast.error("Failed to cancel invitation");
    }
  }

  async function handleResendInvite(inviteId: string) {
    setRefreshing(true);
    try {
      // Additional validation: ensure invite belongs to this group
      const inviteToResend = invites.find((invite) => invite.id === inviteId);
      if (!inviteToResend) {
        console.error(`Invite ${inviteId} not found in group ${groupId}`);
        toast.error("Invitation not found");
        setRefreshing(false);
        return;
      }

      console.log(`Resending invite ${inviteId} for group ${groupId}`);
      const result = await resendGroupInviteAction(inviteId);
      if (result?.success) {
        toast.success("Invitation resent successfully");
        fetchInvites();
      } else {
        console.error(
          `Failed to resend invite ${inviteId} for group ${groupId}:`,
          result?.error
        );
        toast.error(result?.error || "Failed to resend invitation");
      }
    } catch (error) {
      console.error(
        `Failed to resend invitation ${inviteId} for group ${groupId}:`,
        error
      );
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
        return <XCircle className="h-4 w-4 text-destructive" />;
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
            onClick={fetchInvites}
            disabled={refreshing || loading}
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin" />
            <p>Loading invitations...</p>
          </div>
        ) : pendingInvites.length === 0 && otherInvites.length === 0 ? (
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
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(invite.status)}
                      <div>
                        <p className="font-medium">{invite.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Invited by {invite.inviter.firstName} on{" "}
                          {format(new Date(invite.createdAt), "MMM d, yyyy")}
                        </p>
                        {isExpired(invite.expiresAt) && (
                          <p className="text-sm text-red-500">
                            Expired on{" "}
                            {format(new Date(invite.expiresAt), "MMM d, yyyy")}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(invite.status)}
                      {!isExpired(invite.expiresAt) && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResendInvite(invite.id)}
                            disabled={refreshing}
                          >
                            <RefreshCw
                              className={`h-3 w-3 ${
                                refreshing ? "animate-spin" : ""
                              }`}
                            />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelInvite(invite.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      )}
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
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(invite.status)}
                        <div>
                          <p className="font-medium">{invite.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Invited by {invite.inviter.firstName} on{" "}
                            {format(new Date(invite.createdAt), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
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
