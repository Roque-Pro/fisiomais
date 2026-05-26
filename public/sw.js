self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // A fetch handler is required for PWA installability
  event.respondWith(fetch(event.request).catch(() => {
    // Optional: return a fallback or just let it fail
  }));
});
