"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  X,
  Calendar,
  Users,
  MessageCircle,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { NotificationType } from "@/generated/prisma";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

// Fetch notifications
async function fetchNotifications(): Promise<{
  notifications: Notification[];
  unreadCount: number;
}> {
  const response = await fetch("/api/notifications");
  if (!response.ok) throw new Error("Failed to fetch notifications");
  return response.json();
}

// Mark notification as read
async function markNotificationRead(id: string): Promise<void> {
  const response = await fetch(`/api/notifications/${id}/read`, {
    method: "PATCH",
  });
  if (!response.ok) throw new Error("Failed to mark notification as read");
}

// Mark all notifications as read
async function markAllNotificationsRead(): Promise<void> {
  const response = await fetch("/api/notifications/read-all", {
    method: "PATCH",
  });
  if (!response.ok) throw new Error("Failed to mark all notifications as read");
}

// Get icon for notification type
function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "GROUP_INVITE":
      return <Users className="w-4 h-4 text-blue-500" />;
    case "EVENT_REMINDER":
    case "EVENT_CREATED":
    case "EVENT_UPDATED":
    case "GROUP_EVENT_CREATED":
      return <Calendar className="w-4 h-4 text-green-500" />;
    case "EVENT_COMMENT":
      return <MessageCircle className="w-4 h-4 text-purple-500" />;
    case "EVENT_PHOTO":
      return <Camera className="w-4 h-4 text-orange-500" />;
    case "RSVP_UPDATE":
      return <Check className="w-4 h-4 text-teal-500" />;
    default:
      return <Bell className="w-4 h-4 text-gray-500" />;
  }
}

// Handle notification click (navigate to relevant page)
function handleNotificationClick(notification: Notification) {
  const data = notification.data;

  if (!data) return;

  switch (notification.type) {
    case "GROUP_INVITE":
      if (data.inviteId) {
        window.location.href = `/groups/accept-invite?token=${data.inviteId}`;
      }
      break;
    case "EVENT_REMINDER":
    case "EVENT_CREATED":
    case "EVENT_UPDATED":
    case "EVENT_COMMENT":
    case "EVENT_PHOTO":
      if (data.eventId) {
        window.location.href = `/calendar?event=${data.eventId}`;
      }
      break;
    case "GROUP_EVENT_CREATED":
      if (data.groupId) {
        window.location.href = `/groups?id=${data.groupId}`;
      }
      break;
    case "RSVP_UPDATE":
      if (data.eventId) {
        window.location.href = `/calendar?event=${data.eventId}`;
      }
      break;
  }
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 5000, // Refresh every 5 seconds for better UX
    refetchOnWindowFocus: true, // Refresh when user focuses window
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => {
      toast.error("Failed to mark notification as read");
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
    onError: () => {
      toast.error("Failed to mark all notifications as read");
    },
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const handleNotificationItemClick = (notification: Notification) => {
    // Mark as read if unread
    if (!notification.read) {
      markReadMutation.mutate(notification.id);
    }

    // Handle navigation
    handleNotificationClick(notification);
    setIsOpen(false);
  };

  const handleMarkAllRead = () => {
    if (unreadCount > 0) {
      markAllReadMutation.mutate();
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 max-h-96 overflow-y-auto"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={markAllReadMutation.isPending}
              className="text-xs h-6 px-2"
            >
              <CheckCheck className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0 transition-colors ${
                  !notification.read ? "bg-primary/5" : ""
                }`}
                onClick={() => handleNotificationItemClick(notification)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p
                        className={`text-sm font-medium truncate ${
                          !notification.read
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 ml-2" />
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                      {notification.message}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to notifications page (you can create this later)
                  // window.location.href = "/notifications";
                }}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
