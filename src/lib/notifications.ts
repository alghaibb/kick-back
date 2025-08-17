import prisma from "@/lib/prisma";
import { NotificationType } from "@/generated/prisma";
import { env } from "@/lib/env";

export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: unknown;
}

export interface PushNotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: unknown;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

// Create in-app notification
export async function createNotification(data: CreateNotificationData) {
  try {
    // Check if user has in-app notifications enabled
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { inAppNotifications: true },
    });

    if (!user?.inAppNotifications) {
      return null;
    }

    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data || {},
      },
    });

    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error);
    throw error;
  }
}

// Send push notification to user's devices
export async function sendPushNotification(
  userId: string,
  notification: PushNotificationData
) {
  try {
    // Get user's enabled push subscriptions only
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId,
        disabled: false, // Only get enabled subscriptions
      },
    });

    if (subscriptions.length === 0) {
      return;
    }

    const webpush = await import("web-push");

    // Configure web-push using env.ts
    webpush.setVapidDetails(
      `mailto:${env.VAPID_EMAIL}`,
      env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      env.VAPID_PRIVATE_KEY
    );

    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      icon: notification.icon || "/android-chrome-192x192.png",
      badge: notification.badge || "/favicon-32x32.png",
      data: {
        ...((notification.data as Record<string, unknown>) || {}),
        type: (notification.data as Record<string, unknown>)?.type || "default",
        timestamp: Date.now(),
      },
      actions: notification.actions || [],
    });

    // Send to all user's devices
    const promises = subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          payload
        );
      } catch (error: unknown) {
        console.error(
          `Failed to send push to ${subscription.endpoint}:`,
          error
        );

        // If subscription is invalid, remove it
        if (
          error &&
          typeof error === "object" &&
          "statusCode" in error &&
          (error.statusCode === 404 || error.statusCode === 410)
        ) {
          await prisma.pushSubscription.delete({
            where: { id: subscription.id },
          });
        }
      }
    });

    await Promise.allSettled(promises);
  } catch (error) {
    console.error("Failed to send push notification:", error);
  }
}

// Combined function to create both in-app and push notification
export async function notifyUser(
  data: CreateNotificationData,
  pushData?: PushNotificationData
) {
  try {
    // Create in-app notification
    const notification = await createNotification(data);

    // Send push notification if provided and user has enabled them
    if (pushData) {
      // Check if user has enabled push notifications
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { pushNotifications: true },
      });

      if (user?.pushNotifications) {
        await sendPushNotification(data.userId, pushData);
      }
    }

    return notification;
  } catch (error) {
    console.error("Failed to notify user:", error);
    // Don't re-throw the error to prevent it from showing as a toast to users
    return null;
  }
}

// Get user's unread notification count
export async function getUnreadNotificationCount(userId: string) {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
    return count;
  } catch (error) {
    console.error("Failed to get unread notification count:", error);
    return 0;
  }
}

// Get user's notifications with pagination
export async function getUserNotifications(
  userId: string,
  page = 1,
  limit = 20
) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return notifications;
  } catch (error) {
    console.error("Failed to get user notifications:", error);
    return [];
  }
}

// Mark notification as read
export async function markNotificationAsRead(
  notificationId: string,
  userId: string
) {
  try {
    await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId, // Ensure user owns the notification
      },
      data: { read: true },
    });
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(userId: string) {
  try {
    await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: { read: true },
    });
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
  }
}

// Notification message templates
export const NotificationTemplates = {
  GROUP_INVITE: (groupName: string, inviterName: string) => ({
    title: "Group Invitation",
    message: `${inviterName} invited you to join "${groupName}"`,
    pushTitle: "New Group Invitation",
    pushBody: `${inviterName} invited you to join "${groupName}". Tap to view.`,
  }),

  EVENT_INVITE: (eventName: string, inviterName: string) => ({
    title: "Event Invitation",
    message: `${inviterName} invited you to "${eventName}"`,
    pushTitle: "New Event Invitation",
    pushBody: `${inviterName} invited you to "${eventName}". Tap to view.`,
  }),

  EVENT_REMINDER: (eventName: string, timeUntil: string) => ({
    title: "Event Reminder",
    message: `"${eventName}" starts ${timeUntil}`,
    pushTitle: `Event Reminder: ${eventName}`,
    pushBody: `Your event "${eventName}" starts ${timeUntil}`,
  }),

  EVENT_COMMENT: (eventName: string, commenterName: string) => ({
    title: "New Comment",
    message: `${commenterName} commented on "${eventName}"`,
    pushTitle: "New Event Comment",
    pushBody: `${commenterName} commented on "${eventName}". Tap to view.`,
  }),

  EVENT_PHOTO: (eventName: string, photographerName: string) => ({
    title: "New Photo",
    message: `${photographerName} posted a photo to "${eventName}"`,
    pushTitle: "New Event Photo",
    pushBody: `${photographerName} posted a photo to "${eventName}". Tap to view.`,
  }),

  EVENT_CREATED: (
    eventName: string,
    creatorName: string,
    groupName?: string
  ) => ({
    title: "New Event",
    message: groupName
      ? `${creatorName} created "${eventName}" in ${groupName}`
      : `${creatorName} created "${eventName}"`,
    pushTitle: "New Event Created",
    pushBody: groupName
      ? `${creatorName} created "${eventName}" in ${groupName}. Tap to view.`
      : `${creatorName} created "${eventName}". Tap to view.`,
  }),

  RSVP_UPDATE: (attendeeName: string, eventName: string, status: string) => ({
    title: "RSVP Update",
    message: `${attendeeName} ${status === "yes" ? "will attend" : status === "no" ? "declined" : "might attend"} "${eventName}"`,
    pushTitle: "RSVP Update",
    pushBody: `${attendeeName} ${status === "yes" ? "will attend" : status === "no" ? "declined" : "might attend"} "${eventName}"`,
  }),

  COMMENT_REPLY: (replierName: string, eventName: string) => ({
    title: "Comment Reply",
    message: `${replierName} replied to your comment on "${eventName}"`,
    pushTitle: "New Reply",
    pushBody: `${replierName} replied to your comment on "${eventName}". Tap to view.`,
  }),

  COMMENT_REACTION: (
    reactorName: string,
    eventName: string,
    emoji: string
  ) => ({
    title: "Comment Reaction",
    message: `${reactorName} reacted ${emoji} to your comment on "${eventName}"`,
    pushTitle: "New Reaction",
    pushBody: `${reactorName} reacted ${emoji} to your comment on "${eventName}". Tap to view.`,
  }),
};
