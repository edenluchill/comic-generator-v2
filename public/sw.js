// Service Worker for better SPA performance
const CACHE_NAME = "comic-generator-v1";
const urlsToCache = [
  "/",
  "/chat",
  "/workshop",
  "/profile",
  "/static/css/",
  "/static/js/",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});
