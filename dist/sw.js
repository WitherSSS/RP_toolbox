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
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/')) {
    return; 
  }
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch((err) => {
        console.error('网络请求失败且无缓存:', err);
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/index.html');
        }
        return new Response('网络连接失败（离线状态）', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      });
    })
  );
});