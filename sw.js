/* Hani Desk – service worker: lets the app open and run quizzes without internet.
 *
 * - App files (HTML, CSS, JS, icons, backup CSV): saved on install, served from the saved copy.
 * - Question data (Google Sheets CSV): always try the internet first, fall back to the last saved copy.
 * - Google Fonts: saved the first time they load.
 *
 * When the app files change, bump VERSION so phones pick up the new copy.
 */
var VERSION = 'hani-v5';
var APP_FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/styles.css?v=5',
  'js/config.js?v=5',
  'js/app.js?v=5',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
  'data/grade3.csv',
  'data/exam-structure.csv'
];
var DATA_CACHE = 'hani-data';
var FONT_CACHE = 'hani-fonts';

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(APP_FILES); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('hani-v') === 0 && k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

function networkFirst(req, cacheName) {
  return fetch(req).then(function (res) {
    if (res && (res.ok || res.type === 'opaque')) {
      var copy = res.clone();
      caches.open(cacheName).then(function (c) { c.put(req, copy); });
    }
    return res;
  }).catch(function () {
    return caches.match(req, { ignoreVary: true }).then(function (hit) {
      return hit || Promise.reject(new Error('offline'));
    });
  });
}

function cacheFirst(req, cacheName) {
  return caches.match(req, { ignoreVary: true }).then(function (hit) {
    return hit || fetch(req).then(function (res) {
      if (res && (res.ok || res.type === 'opaque')) {
        var copy = res.clone();
        caches.open(cacheName).then(function (c) { c.put(req, copy); });
      }
      return res;
    });
  });
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);

  // Question data from Google Sheets, and the backup CSV in GitHub: fresh when online, saved copy when offline.
  if (url.hostname === 'docs.google.com' || /\.csv$/.test(url.pathname)) {
    e.respondWith(networkFirst(req, DATA_CACHE));
    return;
  }
  // Fonts.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(cacheFirst(req, FONT_CACHE));
    return;
  }
  // The page itself: fresh when online so updates show up, saved copy when offline.
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(function (res) {
      var copy = res.clone();
      caches.open(VERSION).then(function (c) { c.put('index.html', copy); });
      return res;
    }).catch(function () {
      return caches.match('index.html').then(function (hit) { return hit || caches.match('./'); });
    }));
    return;
  }
  // Other app files.
  if (url.origin === self.location.origin) {
    e.respondWith(cacheFirst(req, VERSION));
  }
});
