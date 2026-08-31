/**
 * Service Worker للعمل دون اتصال بالإنترنت (Offline First PWA)
 */

const CACHE_NAME = "al-fatiha-cache-v2";

const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./config.js",
  "./fatiha.js",
  "./data.js",
  "./auth.js",
  "./students.js",
  "./teachers.js",
  "./reports.js",
  "./app.js",
  "./manifest.json",
  "./uthmanic_hafs_v20.ttf"
];

// التثبيت وتخزين الملفات الأساسية
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// التفعيل ومسح الكاش القديم
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// الاستجابة للطلبات من الشبكة أولاً، ثم الكاش عند انقطاع الإنترنت (Network First)
self.addEventListener("fetch", (event) => {
  if (!event.request.url.startsWith("http")) return;

  event.respondWith(
    fetch(event.request).then((networkResponse) => {
      // تخزين نسخة حديثة في الكاش دائماً إذا كان الطلب ناجحاً
      if (networkResponse && networkResponse.status === 200) {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
      }
      return networkResponse;
    }).catch(() => {
      // إذا انقطع الإنترنت، جلب الملف من الكاش
      return caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || caches.match("./index.html");
      });
    })
  );
});
