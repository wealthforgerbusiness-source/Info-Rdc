/**
 * INFO + RDC — Service Worker Professional
 * Caching Strategy: Stale-While-Revalidate + Push Listener
 */

const CACHE_NAME = 'info-rdc-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/logo.jpg',
  '/manifest.json'
];

self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Interceptor
self.addEventListener('fetch', (evt) => {
  if (evt.request.method !== 'GET') return;

  evt.respondWith(
    caches.match(evt.request).then((cachedResponse) => {
      const fetchPromise = fetch(evt.request)
        .then((networkResponse) => {
          if (networkResponse.status === 200) {
            const cacheCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(evt.request, cacheCopy));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// Web Push Event Handler
self.addEventListener('push', (evt) => {
  const data = evt.data ? evt.data.json() : { title: 'INFO + RDC', body: 'Nouvelle mise à jour disponible.' };
  
  const options = {
    body: data.body,
    icon: '/logo.jpg',
    badge: '/logo.jpg',
    data: { url: data.url || '/' }
  };

  evt.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (evt) => {
  evt.notification.close();
  evt.waitUntil(
    clients.openWindow(evt.notification.data.url)
  );
});
