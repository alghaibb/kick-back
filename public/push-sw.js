// Push Notification Service Worker
// iOS Safari PWA Enhanced Version

// Detect iOS Safari
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
const isStandalone = navigator.standalone === true;

console.log('Service Worker: iOS Safari PWA detected:', isIOS && isSafari && isStandalone);

self.addEventListener("push", function (event) {
  console.log('Push event received:', event);

  // Prevent any errors from causing issues
  try {
    if (event.data) {
      try {
        const data = event.data.json();
        console.log('Push data:', data);

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

        // iOS Safari PWA specific options
        if (isIOS && isSafari && isStandalone) {
          options.icon = "/apple-touch-icon.png"; // Use Apple touch icon for iOS
          options.badge = "/favicon-32x32.png";
          options.requireInteraction = true; // Keep notification visible longer on iOS
        }

        event.waitUntil(self.registration.showNotification(data.title, options));
      } catch (error) {
        console.error('Error processing push notification:', error);

        // Fallback for iOS Safari PWA
        if (isIOS && isSafari && isStandalone) {
          const fallbackOptions = {
            body: 'You have a new notification',
            icon: "/apple-touch-icon.png",
            badge: "/favicon-32x32.png",
            tag: `fallback-${Date.now()}`,
            requireInteraction: true,
          };
          event.waitUntil(self.registration.showNotification('Kick Back', fallbackOptions));
        }
      }
    }
  } catch (outerError) {
    console.error('Critical error in push event handler:', outerError);
    // Don't let this error bubble up
  }
});

// Handle notification clicks
self.addEventListener("notificationclick", function (event) {
  console.log('Notification clicked:', event);

  // Prevent any errors from causing issues
  try {
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

      // iOS Safari PWA specific navigation
      if (isIOS && isSafari && isStandalone) {
        // For iOS PWA, try to focus existing window first
        event.waitUntil(
          clients.matchAll({ type: "window" }).then((clientList) => {
            // Check if there's already a window open
            for (const client of clientList) {
              if (client.url.includes(self.location.origin) && "focus" in client) {
                return client.focus().then(() => {
                  // Use postMessage for iOS Safari PWA navigation
                  client.postMessage({ type: 'navigate', url: url });
                  return client.navigate(url);
                });
              }
            }
            // If no window is open, open a new one
            return clients.openWindow(url);
          })
        );
      } else {
        // Standard navigation for other browsers
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
      }
    } else {
      // Default behavior - open the app
      event.waitUntil(clients.openWindow("/"));
    }
  } catch (error) {
    console.error('Error handling notification click:', error);
    // Fallback - just open the app
    event.waitUntil(clients.openWindow("/"));
  }
});

// Handle notification close
self.addEventListener("notificationclose", function (event) {
  console.log('Notification closed:', event);
});

// Handle push subscription changes
self.addEventListener("pushsubscriptionchange", function (event) {
  console.log('Push subscription changed:', event);

  try {
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
        .catch(function (error) {
          console.error('Error handling subscription change:', error);

          // Fallback for iOS Safari PWA
          if (isIOS && isSafari && isStandalone) {
            console.log('iOS Safari PWA subscription change fallback');
          }
        })
    );
  } catch (error) {
    console.error('Error in pushsubscriptionchange handler:', error);
  }
});

// Handle service worker messages
self.addEventListener("message", function (event) {
  console.log('Service worker message received:', event.data);

  try {
    if (event.data && event.data.type === 'navigate') {
      // Handle navigation messages from iOS Safari PWA
      event.waitUntil(
        clients.matchAll({ type: "window" }).then((clientList) => {
          for (const client of clientList) {
            if (client.url.includes(self.location.origin) && "navigate" in client) {
              return client.navigate(event.data.url);
            }
          }
        })
      );
    }
  } catch (error) {
    console.error('Error handling service worker message:', error);
  }
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
  console.log('Service worker installing...');
  self.skipWaiting();
});

// Activate event - take control immediately
self.addEventListener("activate", function (event) {
  console.log('Service worker activating...');
  event.waitUntil(self.clients.claim());
});

// Error handling for iOS Safari PWA
self.addEventListener("error", function (event) {
  console.error('Service worker error:', event.error);
});

self.addEventListener("unhandledrejection", function (event) {
  console.error('Service worker unhandled rejection:', event.reason);
});
