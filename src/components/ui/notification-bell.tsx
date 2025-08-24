"use client";

import React from "react";
import { Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { NotificationType } from "@/generated/prisma";
import { useSmartPolling } from "@/hooks/useSmartPolling";
import { toast } from "sonner";
import { deleteNotificationAction } from "@/app/api/notifications/actions";
import { ActionLoader } from "@/components/ui/loading-animations";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data: unknown;
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

async function fetchNotifications(): Promise<NotificationsResponse> {
  const response = await fetch("/api/notifications");
  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }
  return response.json();
}

async function markAsRead(notificationId: string): Promise<void> {
  const response = await fetch(`/api/notifications/${notificationId}/read`, {
    method: "PATCH",
  });
  if (!response.ok) {
    throw new Error("Failed to mark notification as read");
  }
}

async function markAllAsRead(): Promise<void> {
  const response = await fetch("/api/notifications/read-all", {
    method: "PATCH",
  });
  if (!response.ok) {
    throw new Error("Failed to mark all notifications as read");
  }
}

async function acceptInvite(
  inviteId: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`/api/groups/invites/${inviteId}/accept`, {
    method: "POST",
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to accept invitation");
  }
  return response.json();
}

async function declineInvite(
  inviteId: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`/api/groups/invites/${inviteId}/decline`, {
    method: "POST",
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to decline invitation");
  }
  return response.json();
}

async function acceptEventInvite(
  inviteId: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`/api/events/invites/${inviteId}/accept`, {
    method: "POST",
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to accept event invitation");
  }
  return response.json();
}

async function declineEventInvite(
  inviteId: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`/api/events/invites/${inviteId}/decline`, {
    method: "POST",
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to decline event invitation");
  }
  return response.json();
}

export default function NotificationBell() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { pollingInterval, userStatus } = useSmartPolling({
    strategy: "ultra-fast",
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: pollingInterval,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    staleTime: 1 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const acceptInviteMutation = useMutation({
    mutationFn: acceptInvite,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const declineInviteMutation = useMutation({
    mutationFn: declineInvite,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const acceptEventInviteMutation = useMutation({
    mutationFn: acceptEventInvite,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const declineEventInviteMutation = useMutation({
    mutationFn: declineEventInvite,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: deleteNotificationAction,
    onMutate: async (notificationId) => {
      // Cancel any outgoing notifications queries
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      // Snapshot the previous value
      const previousNotifications = queryClient.getQueryData(["notifications"]);

      // Optimistically remove the notification
      queryClient.setQueryData(
        ["notifications"],
        (old: { notifications: Notification[] } | undefined) => {
          if (!old?.notifications) return old;
          return {
            ...old,
            notifications: old.notifications.filter(
              (n: Notification) => n.id !== notificationId
            ),
          };
        }
      );

      // Return context with the previous value
      return { previousNotifications };
    },
    onError: (error: Error, notificationId, context) => {
      // Rollback on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          ["notifications"],
          context.previousNotifications
        );
      }
      toast.error(error.message);
    },
    onSettled: () => {
      // Always refetch to ensure we're in sync with server
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Bell className="h-5 w-5" />
      </Button>
    );
  }

  if (error) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Bell className="h-5 w-5" />
      </Button>
    );
  }

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      markReadMutation.mutate(notification.id);
    }

    // Type guard for notification data
    const data = notification.data;
    if (!data || typeof data !== "object") return;

    // Navigate based on notification type and data
    if (notification.type === "GROUP_INVITE" && "groupId" in data) {
      router.push(`/groups`);
    } else if (
      (notification.type === "EVENT_COMMENT" ||
        notification.type === "COMMENT_REPLY" ||
        notification.type === "COMMENT_REACTION" ||
        notification.type === "EVENT_PHOTO" ||
        notification.type === "EVENT_REMINDER") &&
      "eventId" in data
    ) {
      router.push(`/calendar?event=${data.eventId}`);
    } else if (notification.type === "EVENT_CREATED" && "eventId" in data) {
      router.push(`/events`);
    } else if (notification.type === "RSVP_UPDATE" && "eventId" in data) {
      router.push(`/calendar?event=${data.eventId}`);
    }
  };

  const handleInviteAction = (
    e: React.MouseEvent,
    action: "accept" | "decline",
    inviteId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (action === "accept") {
      acceptInviteMutation.mutate(inviteId);
    } else {
      declineInviteMutation.mutate(inviteId);
    }
  };

  const handleEventInviteAction = (
    e: React.MouseEvent,
    action: "accept" | "decline",
    inviteId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (action === "accept") {
      acceptEventInviteMutation.mutate(inviteId);
    } else {
      declineEventInviteMutation.mutate(inviteId);
    }
  };

  const handleDeleteNotification = (
    e: React.MouseEvent,
    notificationId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    deleteNotificationMutation.mutate(notificationId);
  };

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-[20px]"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 sm:w-96 max-h-[70vh] sm:max-h-96 overflow-y-auto"
      >
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Notifications</h3>
            <div
              className="sr-only"
              role="status"
              aria-label={`Notification system ${userStatus}, checking every ${pollingInterval / 1000} seconds`}
            >
              Polling every {pollingInterval / 1000} seconds
            </div>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              Mark all read
            </Button>
          )}
        </div>
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          notifications.map((notification) => {
            // Special handling for GROUP_INVITE notifications
            if (notification.type === "GROUP_INVITE") {
              const data = notification.data as {
                inviteId?: string;
                groupId?: string;
              } | null;
              const inviteId = data?.inviteId;

              return (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex flex-col items-start p-3"
                  onClick={(e) => e.preventDefault()} // Prevent default click behavior
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>

                      {/* Accept/Decline buttons for group invites */}
                      {inviteId && (
                        <div className="flex flex-col sm:flex-row gap-2 mt-3 w-full">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={(e) =>
                              handleInviteAction(e, "accept", inviteId)
                            }
                            disabled={
                              acceptInviteMutation.isPending ||
                              declineInviteMutation.isPending
                            }
                            className="h-8 px-3 flex-1 sm:flex-none"
                          >
                            {acceptInviteMutation.isPending ? (
                              <ActionLoader
                                action="update"
                                size="sm"
                                className="mr-1"
                              />
                            ) : (
                              <Check className="h-3 w-3 mr-1" />
                            )}
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) =>
                              handleInviteAction(e, "decline", inviteId)
                            }
                            disabled={
                              acceptInviteMutation.isPending ||
                              declineInviteMutation.isPending
                            }
                            className="h-8 px-3 flex-1 sm:flex-none"
                          >
                            {declineInviteMutation.isPending ? (
                              <ActionLoader
                                action="update"
                                size="sm"
                                className="mr-1"
                              />
                            ) : (
                              <X className="h-3 w-3 mr-1" />
                            )}
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Delete button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) =>
                        handleDeleteNotification(e, notification.id)
                      }
                      disabled={deleteNotificationMutation.isPending}
                      className="h-6 w-6 p-0 flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </DropdownMenuItem>
              );
            }

            // Special handling for EVENT_INVITE notifications
            if (notification.type === "EVENT_INVITE") {
              const data = notification.data as {
                inviteId?: string;
                eventId?: string;
              } | null;
              const inviteId = data?.inviteId;

              return (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex flex-col items-start p-3"
                  onClick={(e) => e.preventDefault()} // Prevent default click behavior
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>

                      {/* Accept/Decline buttons for event invites */}
                      {inviteId && (
                        <div className="flex flex-col sm:flex-row gap-2 mt-3 w-full">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={(e) =>
                              handleEventInviteAction(e, "accept", inviteId)
                            }
                            disabled={
                              acceptEventInviteMutation.isPending ||
                              declineEventInviteMutation.isPending
                            }
                            className="h-8 px-3 flex-1 sm:flex-none"
                          >
                            {acceptEventInviteMutation.isPending ? (
                              <ActionLoader
                                action="update"
                                size="sm"
                                className="mr-1"
                              />
                            ) : (
                              <Check className="h-3 w-3 mr-1" />
                            )}
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) =>
                              handleEventInviteAction(e, "decline", inviteId)
                            }
                            disabled={
                              acceptEventInviteMutation.isPending ||
                              declineEventInviteMutation.isPending
                            }
                            className="h-8 px-3 flex-1 sm:flex-none"
                          >
                            {declineEventInviteMutation.isPending ? (
                              <ActionLoader
                                action="update"
                                size="sm"
                                className="mr-1"
                              />
                            ) : (
                              <X className="h-3 w-3 mr-1" />
                            )}
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Delete button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) =>
                        handleDeleteNotification(e, notification.id)
                      }
                      disabled={deleteNotificationMutation.isPending}
                      className="h-6 w-6 p-0 flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </DropdownMenuItem>
              );
            }

            // Regular notification rendering for other types
            return (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start p-3 cursor-pointer"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start justify-between w-full">
                  <div className="flex-1 pr-2">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Delete button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) =>
                      handleDeleteNotification(e, notification.id)
                    }
                    disabled={deleteNotificationMutation.isPending}
                    className="h-6 w-6 p-0 flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
