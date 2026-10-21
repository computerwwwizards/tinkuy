const apiUrl = process.env.API_URL || '';
const apiSpritesUrl = process.env.API_SPRITES_URL || '';

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const runtimeCaching = [
  {
    urlPattern: /\/sw\/test$/,
    handler: ({ event }) => {
      return new Response('service worker is working', {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    },
  },
];

if (apiUrl) {
  runtimeCaching.push({
    urlPattern: new RegExp('^' + escapeRegExp(apiUrl)),
    handler: 'CacheFirst',
    options: {
      cacheName: 'api-cache',
      expiration: {
        maxEntries: 500,
        maxAgeSeconds: 365 * 24 * 60 * 60,
      },
      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  });
}

if (apiSpritesUrl) {
  runtimeCaching.push({
    urlPattern: new RegExp('^' + escapeRegExp(apiSpritesUrl)),
    handler: 'CacheFirst',
    options: {
      cacheName: 'api-sprites-cache',
      expiration: {
        maxEntries: 1000,
        maxAgeSeconds: 365 * 24 * 60 * 60,
      },
      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  });
}

module.exports = {
  swDest: 'public/sw.js',
  skipWaiting: true,
  clientsClaim: true,
  globPatterns: [],
  runtimeCaching,
};
