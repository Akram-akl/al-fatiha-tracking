/**
 * Service Worker - استراتيجية ذكية: HTML دائماً من الإنترنت، باقي الملفات من الكاش
 */

const CACHE_VERSION = "al-fatiha-v3";

// الملفات التي تُخزّن مؤقتاً (الأصول الثابتة فقط - وليس HTML)
const STATIC_ASSETS = [
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

// ======================== تثبيت ========================
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // التفعيل الفوري بدون انتظار
  self.skipWaiting();
});

// ======================== تفعيل ========================
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => {
            console.log("[SW] Deleting old cache:", key);
            return caches.delete(key);
          })
      );
    })
  );
  // السيطرة الفورية على كل التبويبات المفتوحة
  self.clients.claim();
});

// ======================== اعتراض الطلبات ========================
self.addEventListener("fetch", (event) => {
  if (!event.request.url.startsWith("http")) return;

  const url = new URL(event.request.url);
  const isHTML = event.request.headers.get("accept")?.includes("text/html");
  const isHTMLFile = url.pathname.endsWith(".html") || url.pathname.endsWith("/");

  // ---- HTML: دائماً من الإنترنت (Network Only) ----
  if (isHTML || isHTMLFile) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // عند انقطاع الإنترنت فقط
        return caches.match("./index.html");
      })
    );
    return;
  }

  // ---- الأصول الثابتة (JS/CSS/Fonts): من الكاش، تحديث في الخلفية ----
  event.respondWith(
    caches.open(CACHE_VERSION).then(async (cache) => {
      const cached = await cache.match(event.request);
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      });
      // أعط الكاش فوراً ثم حدّث في الخلفية
      return cached || fetchPromise;
    })
  );
});
