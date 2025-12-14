const CACHE_NAME = 'studia-offline-v2';
const OFFLINE_URL = '/workspace/courses';

const ASSETS_TO_CACHE = [
  '/',
  '/workspace',
  '/workspace/courses',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Pas de cache pour les appels API (on veut des données fraîches ou rien)
  if (url.pathname.startsWith('/api/')) return;

  // Stratégie "Network first, falling back to cache"
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Mise à jour du cache si succès
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // En cas d'échec réseau, on sert le cache
        return caches.match(event.request).then((response) => {
            if (response) return response;
            // Si pas en cache, on redirige vers une page sûre
            if (event.request.mode === 'navigate') {
                return caches.match('/workspace/courses');
            }
        });
      })
  );
});