self.addEventListener('install', (event) => {
  console.log('SW installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('SW activated');
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // A fetch handler is required for PWA installability
  event.respondWith(fetch(event.request).catch(() => {
    // Optional: return a fallback or just let it fail
  }));
});
