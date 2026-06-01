const CACHE_NAME = 'core-system-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css'
];

// Install Event - Caching App Shell static assets safely
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clearing out historical old engine caches 
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Dynamic Network-First fallback to Offline Local Cache Strategy
self.addEventListener('fetch', (e) => {
  // Pass Google Sheet API synchronization routing straight through without intercepting cache
  if (e.request.url.includes('script.google.com')) {
    return fetch(e.request);
  }

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Clone valid response to update local storage storage layout seamlessly
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, resClone);
        });
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});