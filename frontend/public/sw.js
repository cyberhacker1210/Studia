const CACHE_NAME = 'studia-offline-v3'; // Incrément de version
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

  // 1. Ignorer les requêtes qui ne sont pas GET (POST, PUT, DELETE...)
  if (event.request.method !== 'GET') return;

  // 2. Ignorer les appels API (on veut des données fraîches)
  if (url.pathname.startsWith('/api/')) return;

  // 3. Ignorer les requêtes d'analytics (pour éviter les conflits)
  if (url.href.includes('analytics')) return;

  // 4. Ignorer les extensions Chrome/Browser
  if (!url.protocol.startsWith('http')) return;

  // Stratégie "Network first, falling back to cache"
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Mise à jour du cache si succès ET si c'est une requête valide
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
            // Si pas en cache et navigation, page de secours
            if (event.request.mode === 'navigate') {
                return caches.match('/workspace/courses');
            }
        });
      })
  );
});