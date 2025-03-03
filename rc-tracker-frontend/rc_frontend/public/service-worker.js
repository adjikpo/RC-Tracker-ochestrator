/* eslint-env serviceworker */
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

const { precacheAndRoute } = workbox.precaching;
const { registerRoute } = workbox.routing;
const { StaleWhileRevalidate, CacheFirst } = workbox.strategies;
const { CacheableResponsePlugin } = workbox.cacheableResponse;

// Précache les fichiers statiques générés par le build
precacheAndRoute(self.__WB_MANIFEST || []);

// Cache les appels API avec StaleWhileRevalidate
registerRoute(
  ({ url }) => url.pathname.startsWith('/tracking/'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Cache les fichiers statiques avec CacheFirst
registerRoute(
  ({ request }) => request.destination === 'image' || request.destination === 'script' || request.destination === 'style',
  new CacheFirst({
    cacheName: 'static-cache',
  })
);

// Écoute les messages pour forcer un rechargement
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});