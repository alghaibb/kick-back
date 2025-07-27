if(!self.define){let e,s={};const a=(a,i)=>(a=new URL(a+".js",i).href,s[a]||new Promise(s=>{if("document"in self){const e=document.createElement("script");e.src=a,e.onload=s,document.head.appendChild(e)}else e=a,importScripts(a),s()}).then(()=>{let e=s[a];if(!e)throw new Error(`Module ${a} didn’t register its module`);return e}));self.define=(i,n)=>{const t=e||("document"in self?document.currentScript.src:"")||location.href;if(s[t])return;let c={};const r=e=>a(e,t),x={module:{uri:t},exports:c,require:r};s[t]=Promise.all(i.map(e=>x[e]||r(e))).then(e=>(n(...e),c))}}define(["./workbox-e9849328"],function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/app-build-manifest.json",revision:"a5bc4e2b651123b7cdd3ecfd6ddd4ceb"},{url:"/_next/static/H-RMB4r0sl3bxzAMXY0zx/_buildManifest.js",revision:"069b4b7ac7d0c4e234cea4cfb63b7803"},{url:"/_next/static/H-RMB4r0sl3bxzAMXY0zx/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/chunks/1221-26fc83c54363b8f6.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/1350-63d42aa67126f432.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/1434-f42e5fdc9f79a735.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/1478-fa2edfb9a2564671.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/2338-cfa374c0c0be8a95.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/2378-83e324ed61d40f15.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/2452-b85e576947b21cca.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/2460-0acee753d4ae2d34.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/3896-57e076018403944f.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/3f731c04-918edd3217e774c5.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/4406-de841d8c5692bc6b.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/4417-f58d11c8c195e8c5.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/506-3e3f0fa9ffa7e289.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/5189-1a9aa31d1cbbc9fb.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/5769-28b2cb64fe2b0bfe.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/6002-89c8238053a956d8.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/7019-3c6af14f19839ba9.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/7365-782f6bca4c593bd6.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/7380-178f82f8762f7637.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/75fbeb73-ec083e3b7af84ec4.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/7616-7e7bec4b55aea1d9.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/7814-b551400bcdaf8532.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/7949-ca3020d463f3cbd0.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/8020-ba22e69c5fd38873.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/8281-7973d77524568134.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/849-995eaac2378b73b6.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/8665-25ecdb20a36a2651.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/9117-bc1022efe6d8814c.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/9168-ef72c7eeda4c0847.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/9560-41ff4e212a41a268.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/9993-62fa21b3b2ca1664.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/(auth)/create-account/page-09de608d912c6d72.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/(auth)/forgot-password/page-cd91689dac962d3e.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/(auth)/layout-9113c70f47511629.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/(auth)/login/page-0e583591932f2b85.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/(auth)/magic-link-create/page-1bfa0db7be6d5c41.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/(auth)/magic-link-login/page-bb6d865b7537e65e.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/(auth)/magic-link-verify/page-02c7ce4d3e6c1781.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/(auth)/reset-password/page-94163dcc75e430d2.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/(auth)/verify-account/page-25ec743d1d4907fb.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/(home)/layout-ebac922e72bfbba6.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/(home)/page-5e1f14ecf24613d8.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/(home)/privacy/page-dd0ef0bb631c0de4.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/(home)/terms/page-b7bf551e6ff8cc6e.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/(main)/calendar/page-3fe3929f37dafdda.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/(main)/dashboard/page-b0b71834d632e33c.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/(main)/events/page-568776ebfebca9d9.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/(main)/groups/accept-invite/page-194d0c0db66c259d.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/(main)/groups/page-5d456d78635d80fc.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/(main)/layout-be9c991c5a0cf70d.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/(main)/profile/page-0a5709a582d4607d.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/(main)/settings/page-9f16ad680476bf1b.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/_not-found/page-2f4493a6256c0f23.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/api/%5B...nextauth%5D/route-335da0bc6f91fa4b.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/api/auth/logout/route-738ff0db9be1f719.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/api/auth/me/route-3aed8760ee6a00f0.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/api/blob/upload/route-2001619c08b6f58e.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/api/calendar/route-1999c66c686e4b68.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/api/cron/clean-events/route-5141b180713c14d1.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/api/cron/send-event-reminders/route-96b41b79bf9dbc0a.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/api/dashboard/stats/route-bb22de839f944dd7.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/api/events/%5BeventId%5D/comments/route-de02ab9213e97827.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/api/events/%5BeventId%5D/photos/route-07b44a57fdcf8cca.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/api/events/%5BeventId%5D/rsvp/route-58b686874efe0b57.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/api/events/route-bb4d012a1e91ae85.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/api/groups/%5BgroupId%5D/invites/route-c567987558438d7a.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/api/groups/invites/%5BinviteId%5D/cancel/route-9486e441baa34ab0.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/api/groups/invites/%5BinviteId%5D/resend/route-73e74b6674dda4a5.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/api/groups/route-6bc1b1387f3dc6f6.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/layout-c319a3f92a51b7e3.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/not-found-bc0bc8d199fd92b8.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/app/onboarding/page-9aa9528c1a0935f4.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/c99cc0c1-72af2562621f9ed1.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/framework-395897f622eb8e2f.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/main-6b1e8ab190537547.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/main-app-6694c88fbbc93bab.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/pages/_app-0fa440c2385ab220.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/pages/_error-ff314dff8ae8fad5.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/chunks/polyfills-42372ed130431b0a.js",revision:"846118c33b2c0e922d7b3a7676f81f6f"},{url:"/_next/static/chunks/webpack-1fd0c3664119984e.js",revision:"H-RMB4r0sl3bxzAMXY0zx"},{url:"/_next/static/css/4183e00ad0e88413.css",revision:"4183e00ad0e88413"},{url:"/_next/static/css/9ce2e69ce8450141.css",revision:"9ce2e69ce8450141"},{url:"/_next/static/media/034d78ad42e9620c-s.woff2",revision:"be7c930fceb794521be0a68e113a71d8"},{url:"/_next/static/media/0484562807a97172-s.p.woff2",revision:"b550bca8934bd86812d1f5e28c9cc1de"},{url:"/_next/static/media/29a4aea02fdee119-s.woff2",revision:"69d9d2cdadeab7225297d50fc8e48e8b"},{url:"/_next/static/media/29e7bbdce9332268-s.woff2",revision:"9e3ecbe4bb4c6f0b71adc1cd481c2bdc"},{url:"/_next/static/media/8888a3826f4a3af4-s.p.woff2",revision:"792477d09826b11d1e5a611162c9797a"},{url:"/_next/static/media/a1386beebedccca4-s.woff2",revision:"d3aa06d13d3cf9c0558927051f3cb948"},{url:"/_next/static/media/b957ea75a84b6ea7-s.p.woff2",revision:"0bd523f6049956faaf43c254a719d06a"},{url:"/_next/static/media/c3bc380753a8436c-s.woff2",revision:"5a1b7c983a9dc0a87a2ff138e07ae822"},{url:"/_next/static/media/db911767852bc875-s.woff2",revision:"9516f567cd80b0f418bba2f1299ed6d1"},{url:"/_next/static/media/eafabf029ad39a43-s.p.woff2",revision:"43751174b6b810eb169101a20d8c26f8"},{url:"/_next/static/media/f10b8e9d91f3edcb-s.woff2",revision:"63af7d5e18e585fad8d0220e5d551da1"},{url:"/_next/static/media/fe0777f1195381cb-s.woff2",revision:"f2a04185547c36abfa589651236a9849"},{url:"/android-chrome-192x192.png",revision:"e293998aa826522e1b65448e810e26c8"},{url:"/android-chrome-512x512.png",revision:"c2bfdf478ae692e51dde80bf552f30bd"},{url:"/apple-touch-icon.png",revision:"ec25a8f913bc1bfae067db2c7d0f15ad"},{url:"/dashboard-blur-dark.png",revision:"fffe093caaccbfc6124e890cffdfaf27"},{url:"/dashboard-blur-light.png",revision:"3f58257341b08dd0c8278acf6618c92d"},{url:"/dashboard-dark.png",revision:"ff70013217a254dbf338a73701e586ce"},{url:"/dashboard-light.png",revision:"5bd3f5a06fdee89b396c1347c72cd944"},{url:"/favicon-16x16.png",revision:"85cbe41b7bd9736c9cd06d00ba3b50ca"},{url:"/favicon-32x32.png",revision:"f7a30ecbde8f0d234a3c2ddded54f464"},{url:"/gatherings-blur.png",revision:"627f594fa3d3ded01aa43091daaed74d"},{url:"/gatherings.png",revision:"40dc6240a2460f7b41f7474ea91f7793"},{url:"/logo.png",revision:"92d31f566092db226386b69b3b8fae03"},{url:"/manifest.json",revision:"7056931d65af30fc2e55b6991a729085"},{url:"/offline.html",revision:"fbebf0ea78d299b5c6c8c34c88a7330b"},{url:"/placeholder-avatar.jpg",revision:"a0509d92bb7cfe8f547640000fe488d5"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:a,state:i})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(({url:e})=>{if(!(self.origin===e.origin))return!1;const s=e.pathname;return!s.startsWith("/api/auth/")&&!!s.startsWith("/api/")},new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")},new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(({url:e})=>!(self.origin===e.origin),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")});

// Add push notification handling
self.addEventListener('push', function(event) {
  console.log('Push event received:', event);

  if (!event.data) {
    console.log('Push event has no data');
    return;
  }

  try {
    const data = event.data.json();
    console.log('Push notification data:', data);

    const options = {
      body: data.body,
      icon: data.icon || '/android-chrome-192x192.png',
      badge: data.badge || '/favicon-32x32.png',
      data: data.data || {},
      actions: data.actions || [],
      requireInteraction: false,
      silent: false,
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (error) {
    console.error('Error parsing push notification:', error);
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);

  event.notification.close();

  const data = event.notification.data;
  
  // Determine URL based on notification data
  let url = '/dashboard';
  
  if (data) {
    if (data.eventId) {
      url = `/calendar?event=${data.eventId}`;
    } else if (data.groupId) {
      url = `/groups?id=${data.groupId}`;
    } else if (data.inviteId) {
      url = `/groups/accept-invite?token=${data.inviteId}`;
    }
  }

  // Handle action button clicks
  if (event.action) {
    switch (event.action) {
      case 'view':
        // Use the determined URL
        break;
      case 'dismiss':
        return; // Don't open anything
      default:
        break;
    }
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clients) {
      // Check if there's already a window/tab open with the target URL
      for (let i = 0; i < clients.length; i++) {
        const client = clients[i];
        if (client.url.includes(url.split('?')[0]) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no existing window/tab, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Handle notification close events
self.addEventListener('notificationclose', function(event) {
  console.log('Notification closed:', event);
  
  // Optional: Send analytics or mark notification as dismissed
  // You could send a fetch request to your API here
});
