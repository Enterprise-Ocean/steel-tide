/* 钢铁潮汐 · Service Worker（PWA） */
const CACHE = 'steel-tide-v2-2';
const ASSETS = [
  './',
  './index.html',
  './steel-tide.html',
  './manifest.json',
  './css/style.css',
  './js/data.js',
  './js/engine.js',
  './js/ai.js',
  './js/ui.js',
  './js/main.js',
  './icon-192.png',
  './icon-512.png',
  './favicon.ico'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(resp => {
        if (resp && resp.ok) caches.open(CACHE).then(c => c.put(req, resp.clone()));
        return resp;
      }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) {
        fetch(req).then(resp => {
          if (resp && resp.ok) caches.open(CACHE).then(c => c.put(req, resp.clone()));
        }).catch(() => { });
        return cached;
      }
      return fetch(req).then(resp => {
        if (resp && resp.ok) caches.open(CACHE).then(c => c.put(req, resp.clone()));
        return resp;
      }).catch(() => caches.match('./index.html'));
    })
  );
});


