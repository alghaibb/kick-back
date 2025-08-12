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
import { useGroupInvites } from "@/hooks/queries/useGroupInvites";

interface GroupInviteManagerProps {
  groupId: string;
  groupName: string;
}

export function GroupInviteManager({
  groupId,
  groupName,
}: GroupInviteManagerProps) {
  const {
    pendingInvites,
    otherInvites,
    isLoading,
    isCanceling,
    isResending,
    error,
    cancelInvite,
    resendInvite,
    refetchInvites,
  } = useGroupInvites(groupId);

  function handleCancelInvite(inviteId: string) {
    cancelInvite(inviteId);
  }

  function handleResendInvite(inviteId: string) {
    resendInvite(inviteId);
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
            onClick={() => refetchInvites()}
            disabled={isLoading || isCanceling || isResending}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="text-center py-4 text-destructive">
            <p>Error loading invitations: {error.message}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchInvites()}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}
        {isLoading ? (
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
                    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-start sm:items-center gap-3">
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
                    <div className="flex items-center gap-2 sm:self-auto">
                      {getStatusBadge(invite.status)}
                      {!isExpired(invite.expiresAt) && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResendInvite(invite.id)}
                            disabled={isResending}
                          >
                            <RefreshCw
                              className={`h-3 w-3 ${isResending ? "animate-spin" : ""}`}
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
                      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        {getStatusIcon(invite.status)}
                        <div>
                          <p className="font-medium">{invite.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Invited by {invite.inviter.firstName} on{" "}
                            {format(new Date(invite.createdAt), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:self-auto">
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
