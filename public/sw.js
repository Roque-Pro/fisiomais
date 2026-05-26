const CACHE_NAME = 'fisio-plus-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // Solo interceptar peticiones GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        // No cachear si no es una respuesta válida o es de una extensión/externo
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Cachear la respuesta para el futuro (opcional, puede ser ruidoso)
        // const responseToCache = response.clone();
        // caches.open(CACHE_NAME).then((cache) => {
          // cache.put(event.request, responseToCache);
        // });

        return response;
      }).catch(() => {
        // Fallback si falla la red y no está en cache
        return caches.match('/');
      });
    })
  );
});
