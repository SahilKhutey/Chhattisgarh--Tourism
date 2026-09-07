const CACHE_VERSION = "cg-tourism-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const OFFLINE_URL = "/offline.html";

const PRECACHE = [
  "/",
  "/offline.html",
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !key.startsWith(CACHE_VERSION))
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Navigation requests: Network-First with Cache and /offline.html fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) {
            return cached;
          }
          return (await caches.match(OFFLINE_URL)) || (await caches.match("/"));
        })
    );
    return;
  }

  // Static / API / Asset requests: Cache-First then Network
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkRequest = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);

      return cached ?? networkRequest;
    })
  );
});

// Background Sync handler
self.addEventListener("sync", (event) => {
  if (event.tag === "cg-tourism-sync") {
    event.waitUntil(notifyClientsToSync());
  }
});

async function notifyClientsToSync() {
  const clientsList = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });

  for (const client of clientsList) {
    client.postMessage({
      type: "OFFLINE_SYNC_REQUIRED",
    });
  }
}

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
