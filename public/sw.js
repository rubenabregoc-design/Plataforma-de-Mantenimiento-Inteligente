const CACHE_NAME = 'mantechpro-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Ignorar peticiones de Vite / HMR / Extensiones
  if (
    event.request.url.includes('@vite') ||
    event.request.url.includes('@react-refresh') ||
    event.request.url.includes('chrome-extension') ||
    event.request.url.includes('localhost')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        // Retornar una respuesta vacía en caso de error de red para evitar crashes
        return new Response('', { status: 408, statusText: 'Network Error' });
      });
    })
  );
});
