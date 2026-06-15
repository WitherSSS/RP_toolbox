const CACHE_NAME = 'rp-toolbox-v5'; 

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
  './css/dark-theme.css'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  self.clients.claim();
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;
  let cacheKeyUrl = event.request.url;
  const reqUrl = new URL(event.request.url);
  const pathName = reqUrl.pathname;

  if (pathName !== '/' && !pathName.split('/').pop().includes('.')) {
    const cleanPath = pathName.endsWith('/') ? pathName.slice(0, -1) : pathName;
    cacheKeyUrl = reqUrl.origin + cleanPath + '.html' + reqUrl.search;
  }

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(cacheKeyUrl, resClone));
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(cacheKeyUrl).then(cachedResponse => {
          if (cachedResponse) return cachedResponse;
          console.error('彻底离线且无缓存：', cacheKeyUrl);
          throw new Error('离线且无缓存');
        });
      })
  );
});