const CACHE_NAME = 'cg-tourism-v1';
const STATIC_ASSETS = [
  '/',
  '/sos',
  '/manifest.json',
  '/globe.svg',
  '/file.svg',
  '/window.svg'
];

// Install Event: Pre-cache core shell pages and icons
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching Core Shell');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event: Cleanup older caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Cleaning old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Implement caching strategies
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Strategy 1: Cache-First then Network-Update for localized API Translations
  if (requestUrl.pathname.includes('/api/v1/translations')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // Offline fallback if network fails
            return cachedResponse;
          });

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Strategy 2: Stale-While-Revalidate for other local API routes (e.g. places list)
  if (requestUrl.pathname.includes('/api/v1/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            return cachedResponse;
          });
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Strategy 3: HTML Pages and UI assets: Network-First with Cache Fallback
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache successful requests for documents and static assets
        if (
          networkResponse.status === 200 &&
          (event.request.destination === 'document' ||
            event.request.destination === 'script' ||
            event.request.destination === 'style' ||
            event.request.destination === 'image' ||
            event.request.destination === 'font')
        ) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Return cached page when offline
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If a page/document is not cached, return index shell as fallback
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
        });
      })
  );
});
