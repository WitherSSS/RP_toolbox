const CACHE_NAME = 'rp-toolbox';
const ASSETS = [
  './',
  './index.html',
  './PW.html',
  './MTDP.html',
  './IP.html',
  './BDP.html',
  './MTCI.html',
  './VR.html',
  './DT.html',
  './js/pw_app.js',
  './css/light-theme.css',
  './css/dark-theme.css',
  './css/tailwind.css',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    event.respondWith(
      (async () => {
        let cachedRes = await caches.match(event.request);
        const isCleanUrl = !url.pathname.split('/').pop().includes('.') && url.pathname !== '/';
        if (!cachedRes && isCleanUrl) {
          const htmlUrl = url.origin + url.pathname + '.html';
          cachedRes = await caches.match(htmlUrl);
        }
        const fetchPromise = fetch(event.request).then(async (netRes) => {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, netRes.clone());
          return netRes;
        }).catch(() => {
        });
        return cachedRes || fetchPromise;
      })()
    );
  }
});