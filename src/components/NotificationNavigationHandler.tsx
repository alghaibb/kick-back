"use client";

import { useEffect } from "react";

// Component to handle navigation from service worker notifications
export function NotificationNavigationHandler() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "navigate") {
        // Use Next.js router to navigate
        window.location.href = event.data.url;
      }
    };

    // Listen for messages from service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", handleMessage);
    }

    return () => {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("message", handleMessage);
      }
    };
  }, []);

  return null;
}
