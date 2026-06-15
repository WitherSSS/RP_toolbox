const CACHE_NAME = 'rp-toolbox-v2'; 
const ASSETS = [
  './',
  './index.html',
  './main.js',
  './pages/index.js',
  './pages/pw.js',
  './pages/mtdp.js',
  './pages/mtci.js',
  './pages/ip.js',
  './pages/dt.js',
  './pages/bdp.js',
  './pages/vr.js',
  './css/light-theme.css',
  './css/dark-theme.css',
  './manifest.json'
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
  if (event.request.mode === 'navigate' && url.origin === self.location.origin) {
    event.respondWith(
      caches.match('./index.html').then(cachedRes => {
        return cachedRes || fetch(event.request);
      })
    );
    return;
  }
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
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cachedRes => {
      const fetchRes = fetch(event.request).then(netRes => {
        
        if (netRes.status === 200 || netRes.status === 0) {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, netRes.clone());
            return netRes;
          });
        }
        return netRes;
      }).catch(() => cachedRes);
      return cachedRes || fetchRes;
    })
  );
});