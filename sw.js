const APP_NAME = "jewellery-xrf-pwa"; // Aapki app se related naam rakha hai
const VERSION = "v1.0"; // Hamesha static number use karein. Update aane par "v1.1" kar dein.
const CACHE_NAME = APP_NAME + "-" + VERSION;

const URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png"
];

// Install Event
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Caching App Shell...");
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// Activate Event (Delete ALL old caches of this app)
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          // Agar cache ka naam current cache jaisa nahi hai, toh delete kar do
          if (cache !== CACHE_NAME) {
            console.log("Deleting old cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event (Network First, fallback to Cache)
self.addEventListener("fetch", event => {
  // Ignore non-GET requests (like POST)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Network se data aane par cache update kar lo
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Agar internet nahi hai, toh cache se file de do
        return caches.match(event.request);
      })
  );
});