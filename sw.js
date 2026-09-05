const CACHE_ADI = "atolyepro-v12";
const TEMEL_DOSYALAR = ["./", "./index.html", "./app.js", "./manifest.json", "./icons/icon-192.png", "./icons/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_ADI).then((cache) => cache.addAll(TEMEL_DOSYALAR)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((anahtarlar) => Promise.all(anahtarlar.filter((k) => k !== CACHE_ADI).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((onbellek) => {
      const agFetch = fetch(e.request)
        .then((yanit) => {
          if (yanit && yanit.status === 200) {
            const kopya = yanit.clone();
            caches.open(CACHE_ADI).then((cache) => cache.put(e.request, kopya));
          }
          return yanit;
        })
        .catch(() => onbellek);
      return onbellek || agFetch;
    })
  );
});
