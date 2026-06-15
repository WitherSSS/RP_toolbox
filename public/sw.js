const CACHE_NAME = 'rp-toolbox-v2'; 

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

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) return cachedResponse;
          const reqUrl = new URL(event.request.url);
          let cleanPath = reqUrl.pathname;
          if (cleanPath.endsWith('/')) {
            cleanPath = cleanPath.slice(0, -1);
          }
          if (cleanPath && !cleanPath.includes('.')) {
            const fallbackUrl = reqUrl.origin + cleanPath + '.html';
            return caches.match(fallbackUrl).then(htmlFallback => {
              if (htmlFallback) return htmlFallback;
              console.warn('离线且无缓存，尝试匹配后缀也失败:', fallbackUrl);
              throw new Error('离线且无缓存');
            });
          }
          console.warn('离线且无缓存，请求地址:', event.request.url);
          throw new Error('离线且无缓存');
        });
      })
  );
});