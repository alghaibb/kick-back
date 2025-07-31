"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./use-auth";
import { env } from "@/lib/env";

// iOS Safari detection
const isIOS = typeof window !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);
const isSafari = typeof window !== "undefined" && /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
const isStandalone = typeof window !== "undefined" && (window.navigator as Navigator & { standalone?: boolean })?.standalone === true;

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPWA, setIsPWA] = useState(false);
  const [hasFallback, setHasFallback] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if we're in PWA mode
    setIsPWA(isStandalone);

    // Check if push notifications are supported
    const supported =
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;

    setIsSupported(supported);

    if (!supported) {
      setIsLoading(false);
      return;
    }

    // Check current subscription status
    checkSubscriptionStatus();
  }, [user]);

  const checkSubscriptionStatus = async () => {
    try {
      const registration =
        await navigator.serviceWorker.getRegistration("/push-sw.js");
      const subscription = await registration?.pushManager.getSubscription();
      setIsSubscribed(!!subscription);

      // Check if we need fallback for iOS Safari PWA
      if (isIOS && isSafari && isStandalone && !subscription) {
        setHasFallback(true);
      }
    } catch (error) {
      console.error("Failed to check subscription status:", error);

      // Set fallback for iOS Safari PWA
      if (isIOS && isSafari && isStandalone) {
        setHasFallback(true);
      }

      // Don't let this error bubble up to cause error boundary
      console.log("Push notification check failed, continuing without push notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      throw new Error("Push notifications are not supported");
    }

    if (Notification.permission === "granted") {
      return "granted";
    }

    const permission = await Notification.requestPermission();
    return permission;
  };

  const subscribe = async () => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    const permission = await requestPermission();
    if (permission !== "granted") {
      throw new Error("Notification permission denied");
    }

    try {
      // iOS Safari PWA specific handling
      if (isIOS && isSafari && isStandalone) {
        console.log("iOS Safari PWA detected - using enhanced service worker registration");
      }

      // Register the push notification service worker with cache busting
      const registration = await navigator.serviceWorker.register(
        "/push-sw.js?v=" + Date.now(),
        {
          scope: "/",
          updateViaCache: "none" // Ensure fresh service worker in PWA mode
        }
      );

      await navigator.serviceWorker.ready;

      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        // Create new subscription
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
          ),
        });
      }

      // Save subscription to server
      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          p256dh: arrayBufferToBase64(subscription.getKey("p256dh")!),
          auth: arrayBufferToBase64(subscription.getKey("auth")!),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save subscription");
      }

      setIsSubscribed(true);
      setHasFallback(false);
      return subscription;
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error);

      // Set fallback for iOS Safari PWA
      if (isIOS && isSafari && isStandalone) {
        setHasFallback(true);
        console.log("iOS Safari PWA: Using fallback notification mode");
      }

      // Don't let this error bubble up to cause error boundary
      console.log("Push subscription failed, continuing without push notifications");
      throw error;
    }
  };

  const unsubscribe = async () => {
    try {
      const registration =
        await navigator.serviceWorker.getRegistration("/push-sw.js");
      const subscription = await registration?.pushManager.getSubscription();

      if (subscription) {
        // Remove from server
        await fetch("/api/notifications/subscribe", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        });

        // Unsubscribe locally
        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
      setHasFallback(false);
    } catch (error) {
      console.error("Failed to unsubscribe from push notifications:", error);

      // Don't let this error bubble up to cause error boundary
      console.log("Push unsubscription failed, but continuing");
      throw error;
    }
  };

  // Fallback notification method for iOS Safari PWA
  const showFallbackNotification = async (title: string, body: string) => {
    if (isIOS && isSafari && isStandalone && hasFallback) {
      // Use browser notifications as fallback
      if (Notification.permission === "granted") {
        new Notification(title, {
          body,
          icon: "/android-chrome-192x192.png",
          badge: "/favicon-32x32.png",
          tag: `fallback-${Date.now()}`,
        });
      }
    }
  };

  return {
    isSupported,
    isSubscribed,
    isLoading,
    isPWA,
    hasFallback,
    isIOS: isIOS && isSafari,
    permission:
      typeof window !== "undefined" ? Notification.permission : "default",
    subscribe,
    unsubscribe,
    requestPermission,
    showFallbackNotification,
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Helper function to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
