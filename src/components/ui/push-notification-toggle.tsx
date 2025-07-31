"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BellOff, Smartphone, Home, AlertTriangle } from "lucide-react";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useAuth, type User } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function PushNotificationToggle() {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    isPWA,
    hasFallback,
    isIOS,
    subscribe,
    unsubscribe,
    permission,
    showFallbackNotification,
  } = usePushNotifications();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEnabling, setIsEnabling] = useState(false);

  // Defensive check for user data
  if (!user) {
    console.log("PushNotificationToggle: No user data");
    return null;
  }

  // Check if it's Safari on iOS
  const isSafariIOS = () => {
    if (typeof window === "undefined") return false;
    const userAgent = window.navigator.userAgent;
    return (
      /iPad|iPhone|iPod/.test(userAgent) &&
      /Safari/.test(userAgent) &&
      !/Chrome/.test(userAgent)
    );
  };

  // Debug logging for mobile issues
  console.log("PushNotificationToggle: User data:", {
    id: user.id,
    pushNotifications: user.pushNotifications,
    isSupported,
    isSubscribed,
    isPWA,
    hasFallback,
    isIOS,
    permission,
    isSafariIOS: isSafariIOS(),
  });

  const handleToggle = async () => {
    if (isLoading || isEnabling) return;

    const newValue = !user?.pushNotifications;

    // Optimistically update the UI
    queryClient.setQueryData(["user"], (oldData: User | undefined) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pushNotifications: newValue,
      };
    });

    try {
      setIsEnabling(true);

      if (isSubscribed) {
        await unsubscribe();
        await updateDbPreference(false);
        toast.success("Push notifications disabled");
      } else {
        await subscribe();
        await updateDbPreference(true);
        toast.success(
          "Push notifications enabled! You'll now receive notifications when you're away from the app."
        );
      }
    } catch (error) {
      console.error("Failed to toggle push notifications:", error);

      // Revert optimistic update on error
      queryClient.setQueryData(["user"], (oldData: User | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pushNotifications: !newValue, // Revert to previous value
        };
      });

      if (error instanceof Error) {
        if (error.message.includes("permission denied")) {
          toast.error(
            "Please allow notifications in your browser settings to enable push notifications."
          );
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error("Failed to update push notification settings");
      }
    } finally {
      setIsEnabling(false);
    }
  };

  const updateDbPreference = async (enabled: boolean) => {
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pushNotifications: enabled,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update preference");
      }
    } catch (error) {
      console.error("Failed to update push notification preference:", error);
      toast.error("Failed to save preference");
      throw error; // Re-throw to trigger optimistic rollback
    }
  };

  // iOS Safari PWA specific handling
  if (isIOS && isPWA) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Push Notifications (PWA Mode)
          </CardTitle>
          <CardDescription>
            {hasFallback ? "Using fallback notifications" : "Full PWA support"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications-pwa">
                Enable push notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified about comments, RSVPs, group invites, and more
              </p>
            </div>
            <Switch
              id="push-notifications-pwa"
              checked={user?.pushNotifications || false}
              onCheckedChange={handleToggle}
              disabled={isLoading || isEnabling}
            />
          </div>

          {hasFallback && (
            <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-md">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-orange-800 dark:text-orange-200 font-medium">
                    Using fallback notifications
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                    Service worker registration failed, but you&apos;ll still
                    receive browser notifications when the app is open.
                  </p>
                </div>
              </div>
            </div>
          )}

          {permission === "denied" && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Notifications are blocked. Please enable them in your iOS
                settings.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  toast.info(
                    "Go to iOS Settings > Safari > Notifications and allow notifications for this site"
                  );
                }}
              >
                How to enable
              </Button>
            </div>
          )}

          {user?.pushNotifications && (
            <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✅ Push notifications are enabled in PWA mode! You&apos;ll
                receive notifications for:
              </p>
              <ul className="text-sm text-green-700 dark:text-green-300 mt-2 space-y-1">
                <li>• New comments on your events</li>
                <li>• Replies to your comments</li>
                <li>• Group invitations</li>
                <li>• RSVP updates</li>
                <li>• Event reminders</li>
                <li>• New photos added to events</li>
              </ul>
              {process.env.NODE_ENV === "development" && (
                <div className="mt-3 space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        const response = await fetch(
                          "/api/notifications/test",
                          {
                            method: "POST",
                          }
                        );
                        if (response.ok) {
                          toast.success(
                            "Test notification sent! Check your device."
                          );
                        } else {
                          toast.error("Failed to send test notification");
                        }
                      } catch (error) {
                        console.error(
                          "Failed to send test notification:",
                          error
                        );
                        toast.error("Failed to send test notification");
                      }
                    }}
                  >
                    Send Test Notification
                  </Button>
                  {hasFallback && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        showFallbackNotification(
                          "Test Notification",
                          "This is a fallback notification for iOS Safari PWA"
                        );
                      }}
                    >
                      Test Fallback Notification
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {isEnabling && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              Setting up push notifications...
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // For Safari iOS (not PWA), show a simplified version
  if (isSafariIOS() && !isPWA) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>Limited support in Safari on iOS</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Safari on iOS has limited push notification support. For full
            functionality, try Chrome or Firefox, or install this app to your
            home screen as a PWA.
          </p>
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 <strong>Tip:</strong> Add this app to your home screen to
              enable push notifications! Tap the share button and select
              &quot;Add to Home Screen&quot;.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            {isSafariIOS()
              ? "Limited support in Safari on iOS"
              : "Push notifications are not supported in your browser"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {isSafariIOS()
              ? "Safari on iOS has limited push notification support. For full functionality, try Chrome or Firefox, or install this app to your home screen as a PWA."
              : "Your browser doesn&apos;t support push notifications. Try using a modern browser like Chrome, Firefox, or Safari."}
          </p>
          {isSafariIOS() && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 <strong>Tip:</strong> Add this app to your home screen to
                enable push notifications! Tap the share button and select
                &quot;Add to Home Screen&quot;.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Receive notifications when you&apos;re away from the app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="push-notifications">
              Enable push notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Get notified about comments, RSVPs, group invites, and more
            </p>
          </div>
          <Switch
            id="push-notifications"
            checked={user?.pushNotifications || false}
            onCheckedChange={handleToggle}
            disabled={isLoading || isEnabling}
          />
        </div>

        {permission === "denied" && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Notifications are blocked. Please enable them in your browser
              settings to receive push notifications.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {
                toast.info(
                  "Please go to your browser settings and allow notifications for this site"
                );
              }}
            >
              How to enable
            </Button>
          </div>
        )}

        {user?.pushNotifications && (
          <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✅ Push notifications are enabled! You&apos;ll receive
              notifications for:
            </p>
            <ul className="text-sm text-green-700 dark:text-green-300 mt-2 space-y-1">
              <li>• New comments on your events</li>
              <li>• Replies to your comments</li>
              <li>• Group invitations</li>
              <li>• RSVP updates</li>
              <li>• Event reminders</li>
              <li>• New photos added to events</li>
            </ul>
            {process.env.NODE_ENV === "development" && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={async () => {
                  try {
                    const response = await fetch("/api/notifications/test", {
                      method: "POST",
                    });
                    if (response.ok) {
                      toast.success(
                        "Test notification sent! Check your device."
                      );
                    } else {
                      toast.error("Failed to send test notification");
                    }
                  } catch (error) {
                    console.error("Failed to send test notification:", error);
                    toast.error("Failed to send test notification");
                  }
                }}
              >
                Send Test Notification
              </Button>
            )}
          </div>
        )}

        {isEnabling && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            Setting up push notifications...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
