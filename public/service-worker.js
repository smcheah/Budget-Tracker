const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/index.js",
    "/indexedDB.js",
    "/manifest.webmanifest",
    "/styles.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    "/api/transaction"
];

const PRECACHE = "precache-v0";
const RUNTIME = "runtime";

// installation of cache
self.addEventListener("install", event => {
    event.waitUntil(caches
        .open(PRECACHE)
        .then(data => data.addAll(FILES_TO_CACHE))
        // .then(() => self.skipWaiting())
    );
    self.skipWaiting();
});

// cleans up old cache and activates new cache
self.addEventListener("activate", event => {
    const currentCache = [PRECACHE, RUNTIME];

    event.waitUntil(caches
        .keys()
        .then(data => {
            return data.filter(
                cacheName => !currentCache.includes(cacheName)
            );
        })
        .then(data => {
            return Promise.all(data.map(
                cacheToRemove => { return caches.delete(cacheToRemove); }
            ));
        })
        .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    // non GET requests are not cached and requests to other origins are not cached
    if (event.request.method !== "GET" || !event.request.url.startsWith(self.location.origin)) {
        console.log("one");
        event.respondWith(fetch(event.request));
        return;
    }

    if (event.request.url.includes("/api/transaction")) {
        event.respondWith(
            caches
                .open(PRECACHE)
                .then((cache) => {
                    return fetch(event.request)
                        .then((response) => {

                            if (response.status === 200) {
                                cache.put(event.request.url, response.clone());
                            }
                            return response;
                        }).catch((err) => cache.match(event.request));
                }).catch((err) => console.log(err))
        );
        return;
    }

    event.respondWith(caches
        .match(event.request)
        .then(data => {

            if (data) return data;

            return caches.open(RUNTIME).then(cache => {
                console.log("three");
                return fetch(event.request).then(response => {
                    cache.put(event.request, response.clone());
                    return response;
                }).catch(() => caches.match(event.request));
            });
        })
    );
});