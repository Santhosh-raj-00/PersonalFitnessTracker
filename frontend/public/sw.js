const CACHE_NAME = 'fittrack-cache-v2';
const MEDIA_CACHE_NAME = 'fittrack-media-cache-v1';
const MAX_MEDIA_CACHE_ITEMS = 80;

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
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
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== MEDIA_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Helper to enforce size limit on media cache
async function limitCacheSize(cacheName, maxItems) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
      // Evict oldest items
      const itemsToDelete = keys.length - maxItems;
      for (let i = 0; i < itemsToDelete; i++) {
        await cache.delete(keys[i]);
      }
    }
  } catch (err) {
    console.warn('[SW] Cache trim error:', err);
  }
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Media caching (MP4, WebM, GIF, WebP, /media/ requests)
  const isMediaRequest = 
    url.pathname.includes('/media/') || 
    url.pathname.match(/\.(mp4|webm|gif|webp|jpg|jpeg|png)$/i);

  if (isMediaRequest && event.request.method === 'GET') {
    event.respondWith(
      caches.open(MEDIA_CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        try {
          const networkResponse = await fetch(event.request);
          // Only cache valid 200 or 206 responses
          if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 206)) {
            // Clone response before putting into cache
            cache.put(event.request, networkResponse.clone());
            // Limit cache size asynchronously
            limitCacheSize(MEDIA_CACHE_NAME, MAX_MEDIA_CACHE_ITEMS);
          }
          return networkResponse;
        } catch (fetchErr) {
          // If offline and not in cache, fallback
          return cachedResponse || new Response('Media offline', { status: 503 });
        }
      })
    );
    return;
  }

  // 2. API requests (Network-first)
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }

  // 3. Static assets (Cache-first)
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
