// Push Notification Service Worker
self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();

    const options = {
      body: data.body,
      icon: data.icon || "/android-chrome-192x192.png",
      badge: data.badge || "/favicon-32x32.png",
      data: data.data || {},
      actions: data.actions || [],
      requireInteraction: false,
      silent: false,
      tag: `notification-${Date.now()}-${Math.random()}`,
      renotify: true,
      vibrate: [200, 100, 200],
      timestamp: Date.now(),
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Handle notification clicks
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  // Handle different notification types
  const data = event.notification.data;

  if (data && data.type) {
    let url = "/";

    // Professional navigation mapping
    switch (data.type) {
      case "GROUP_INVITE":
        url = "/groups";
        break;
      case "EVENT_COMMENT":
      case "COMMENT_REPLY":
      case "COMMENT_REACTION":
        if (data.eventId) {
          url = `/calendar?event=${data.eventId}${data.commentId ? `&comment=${data.commentId}` : ""}`;
        } else {
          url = "/calendar";
        }
        break;
      case "EVENT_PHOTO":
        if (data.eventId) {
          url = `/calendar?event=${data.eventId}${data.photoId ? `&photo=${data.photoId}` : ""}`;
        } else {
          url = "/calendar";
        }
        break;
      case "EVENT_REMINDER":
      case "RSVP_UPDATE":
        if (data.eventId) {
          url = `/calendar?event=${data.eventId}`;
        } else {
          url = "/calendar";
        }
        break;
      case "GROUP_EVENT_CREATED":
        if (data.eventId) {
          url = `/calendar?event=${data.eventId}`;
        } else {
          url = "/events";
        }
        break;
      case "EVENT_CREATED":
        url = "/events";
        break;
      default:
        url = "/";
    }

    // Focus existing window if available, otherwise open new one
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.focus().then(() => client.navigate(url));
          }
        }
        // If no window is open, open a new one
        return clients.openWindow(url);
      })
    );
  } else {
    // Default behavior - open the app
    event.waitUntil(clients.openWindow("/"));
  }
});

// Handle notification close
self.addEventListener("notificationclose", function (event) {
  // Notification was closed
});

// Handle push subscription changes
self.addEventListener("pushsubscriptionchange", function (event) {
  event.waitUntil(
    self.registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: self.applicationServerKey,
      })
      .then(function (subscription) {
        // Send the new subscription to the server
        return fetch("/api/notifications/subscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            p256dh: arrayBufferToBase64(subscription.getKey("p256dh")),
            auth: arrayBufferToBase64(subscription.getKey("auth")),
          }),
        });
      })
  );
});

// Helper function to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Install event - set up the service worker
self.addEventListener("install", function (event) {
  self.skipWaiting();
});

// Activate event - take control immediately
self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});
