"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "./use-auth";
import { env } from "@/lib/env";

const isIOS =
  typeof window !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);
const isSafari =
  typeof window !== "undefined" &&
  /Safari/.test(navigator.userAgent) &&
  !/Chrome/.test(navigator.userAgent);
const isStandalone =
  typeof window !== "undefined" &&
  (window.navigator as Navigator & { standalone?: boolean })?.standalone ===
    true;

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPWA, setIsPWA] = useState(false);
  const [hasFallback, setHasFallback] = useState(false);
  const { user } = useAuth();
  const hasInitialized = useRef(false);
  const initialPermission = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || hasInitialized.current) return;

    setIsPWA(isStandalone);

    const supported =
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;

    setIsSupported(supported);

    if (!supported) {
      setIsLoading(false);
      hasInitialized.current = true;
      return;
    }

    // Check current subscription status only once
    checkSubscriptionStatus();
  }, []);

  useEffect(() => {
    if (!hasInitialized.current || !user) return;

    // This prevents unnecessary checks on route navigation
  }, [user?.id, user]);

  const checkSubscriptionStatus = async () => {
    try {
      // For iOS Safari PWA, check if notifications are enabled in device settings
      if (isIOS && isSafari && isStandalone) {
        // Cache the initial permission to prevent changes on route navigation
        if (initialPermission.current === null) {
          initialPermission.current = Notification.permission;
        }

        const currentPermission = initialPermission.current;
        const isEnabled = currentPermission === "granted";

        setIsSubscribed(isEnabled);
        setHasFallback(isEnabled);
        setIsLoading(false);
        hasInitialized.current = true;

        return;
      }

      const registration =
        await navigator.serviceWorker.getRegistration("/push-sw.js");
      const subscription = await registration?.pushManager.getSubscription();
      const subscribed = !!subscription;
      setIsSubscribed(subscribed);

      if (isIOS && isSafari && isStandalone && !subscription) {
        setHasFallback(true);
      }
    } catch (error) {
      console.error("Failed to check subscription status:", error);

      if (isIOS && isSafari && isStandalone) {
        setHasFallback(true);
      }

      // Don't let this error bubble up to cause error boundary
    } finally {
      setIsLoading(false);
      hasInitialized.current = true;
    }
  };

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      throw new Error("Push notifications are not supported");
    }

    if (!("Notification" in window)) {
      throw new Error("Notification API not available");
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
        // For iOS Safari PWA, we need to register service worker differently
        const registration = await navigator.serviceWorker.register(
          "/push-sw.js?v=" + Date.now(),
          {
            scope: "/",
            updateViaCache: "none", // Ensure fresh service worker in PWA mode
          }
        );

        await navigator.serviceWorker.ready;

        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
              env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
            ) as BufferSource,
          });
        }

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
      }

      const registration = await navigator.serviceWorker.register(
        "/push-sw.js?v=" + Date.now(),
        {
          scope: "/",
          updateViaCache: "none",
        }
      );

      await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
          ) as BufferSource,
        });
      }

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

      if (isIOS && isSafari && isStandalone) {
        // Use cached permission as fallback
        try {
          const currentPermission =
            initialPermission.current || Notification.permission;
          const isEnabled = currentPermission === "granted";
          setIsSubscribed(isEnabled);
          setHasFallback(isEnabled);
        } catch (permError) {
          console.error(
            "Failed to check iOS Safari PWA permission:",
            permError
          );
          setIsSubscribed(false);
          setHasFallback(false);
        }
      }

      // Don't let this error bubble up to cause error boundary
      throw error;
    }
  };

  const unsubscribe = async () => {
    try {
      const registration =
        await navigator.serviceWorker.getRegistration("/push-sw.js");
      const subscription = await registration?.pushManager.getSubscription();

      if (subscription) {
        await fetch("/api/notifications/subscribe", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        });

        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
      setHasFallback(false);
    } catch (error) {
      console.error("Failed to unsubscribe from push notifications:", error);

      // Don't let this error bubble up to cause error boundary
      throw error;
    }
  };

  // Fallback notification method for iOS Safari PWA
  const showFallbackNotification = async (title: string, body: string) => {
    if (isIOS && isSafari && isStandalone && hasFallback) {
      // Use browser notifications as fallback
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, {
          body,
          icon: "/android-chrome-192x192.png",
          badge: "/favicon-32x192.png",
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
      typeof window !== "undefined" && "Notification" in window
        ? initialPermission.current || Notification.permission
        : "default",
    subscribe,
    unsubscribe,
    requestPermission,
    showFallbackNotification,
  };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
