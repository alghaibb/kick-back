// iOS Safari PWA Enhanced Version

// Detect iOS Safari
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
// In service workers, we can't access window.navigator.standalone directly
// We'll detect PWA mode through other means
const isStandalone = false; // Will be determined by client-side detection

console.log('Service Worker: iOS Safari PWA detected:', isIOS && isSafari && isStandalone);

// Enhanced service worker for iOS PWA persistence
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();

  // Cache critical resources for iOS Safari
  if (isIOS && isSafari) {
    event.waitUntil(
      caches.open('ios-pwa-cache').then((cache) => {
        return cache.addAll([
          '/',
          '/manifest.json',
          '/apple-touch-icon.png',
          '/favicon.ico',
          '/favicon-16x16.png',
          '/favicon-32x32.png'
        ]);
      })
    );
  }
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  // Ensure the service worker takes control immediately
  event.waitUntil(self.clients.claim());

  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== 'ios-pwa-cache') {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// iOS-specific PWA persistence
if (isIOS && isSafari) {
  console.log('iOS Safari detected - enabling persistence features');

  // Keep the service worker alive and cache critical resources
  self.addEventListener('fetch', (event) => {
    // Cache critical resources for offline use
    if (event.request.url.includes('/manifest.json') ||
      event.request.url.includes('/apple-touch-icon') ||
      event.request.url.includes('/favicon') ||
      event.request.url.includes('/_next/static/')) {
      event.respondWith(
        caches.match(event.request).then((response) => {
          return response || fetch(event.request).then((fetchResponse) => {
            return caches.open('ios-pwa-cache').then((cache) => {
              cache.put(event.request, fetchResponse.clone());
              return fetchResponse;
            });
          });
        })
      );
    }

    // For navigation requests, always try network first, then cache
    if (event.request.mode === 'navigate') {
      event.respondWith(
        fetch(event.request).catch(() => {
          return caches.match('/');
        })
      );
    }
  });
}

// Error handling for iOS Safari PWA
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled rejection:', event.reason);
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  try {
    let data = {};
    if (event.data) {
      data = event.data.json();
    }

    const options = {
      body: data.body || 'You have a new notification!',
      icon: '/apple-touch-icon.png',
      badge: '/favicon-32x32.png',
      vibrate: [200, 100, 200],
      data: data,
      actions: [
        {
          action: 'open',
          title: 'Open App',
          icon: '/favicon-32x32.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/favicon-32x32.png'
        }
      ],
      // iOS Safari specific options
      requireInteraction: isIOS && isSafari,
      silent: false,
      tag: 'kick-back-notification',
      renotify: true
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Kick Back', options)
    );
  } catch (error) {
    console.error('Error showing notification:', error);
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Get notification data to determine navigation
  const data = event.notification.data || {};
  let targetUrl = '/';

  // Determine target URL based on notification type
  if (data.type && data.eventId) {
    switch (data.type) {
      case 'EVENT_COMMENT':
      case 'COMMENT_REPLY':
      case 'COMMENT_REACTION':
        targetUrl = `/calendar?event=${data.eventId}${data.commentId ? `&comment=${data.commentId}` : ''}`;
        break;
      case 'EVENT_PHOTO':
        targetUrl = `/calendar?event=${data.eventId}${data.photoId ? `&photo=${data.photoId}` : ''}`;
        break;
      case 'EVENT_REMINDER':
      case 'RSVP_UPDATE':
        targetUrl = `/calendar?event=${data.eventId}`;
        break;
      case 'GROUP_EVENT_CREATED':
        targetUrl = `/calendar?event=${data.eventId}`;
        break;
      case 'EVENT_CREATED':
        targetUrl = '/events';
        break;
      case 'GROUP_INVITE':
        targetUrl = '/groups';
        break;
      default:
        targetUrl = '/calendar';
    }
  } else if (data.eventId) {
    // Fallback: if we have an eventId but no type, go to calendar
    targetUrl = `/calendar?event=${data.eventId}`;
  } else {
    // Default fallback
    targetUrl = '/calendar';
  }

  console.log('Navigating to:', targetUrl);

  // Handle navigation
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          // Focus the existing window and navigate
          return client.focus().then(() => {
            // Use postMessage for iOS Safari PWA navigation
            if (isIOS && isSafari) {
              client.postMessage({ type: 'navigate', url: targetUrl });
            }
            // Try to navigate directly
            if ('navigate' in client) {
              return client.navigate(targetUrl);
            }
            // Fallback: reload with new URL
            return client.navigate(targetUrl);
          });
        }
      }

      // If app is not open, open it at the target URL
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Push subscription change handling
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('Push subscription changed:', event);

  try {
    event.waitUntil(
      self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: event.oldSubscription?.options?.applicationServerKey
      }).then((subscription) => {
        // Update subscription on server
        return fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
            auth: arrayBufferToBase64(subscription.getKey('auth')),
          }),
        });
      })
    );
  } catch (error) {
    console.error('Error handling subscription change:', error);
  }
});

// Message handling for iOS PWA
self.addEventListener('message', (event) => {
  console.log('Service Worker message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: '1.0.0' });
  }
});

// Helper function for base64 conversion
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
