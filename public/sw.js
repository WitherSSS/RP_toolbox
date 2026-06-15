const CACHE_NAME = 'rp-toolbox-v3'; 

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
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        ASSETS.map(url => {
          return fetch(url)
            .then(response => {
              if (!response.ok) {
                console.error('【预缓存跳过，文件不存在或报错】:', url);
                return;
              }
              return cache.put(url, response);
            })
            .catch(err => {
              console.error('【预缓存网络错误】:', url, err);
            });
        })
      );
    })
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
              throw new Error('离线且无缓存');
            });
          }
          throw new Error('离线且无缓存');
        });
      })
  );
});