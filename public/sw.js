self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // This is a minimal service worker to satisfy PWA requirements
  // In a real app, you would implement caching strategies here
});
