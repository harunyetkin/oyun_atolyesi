self.__DOSYALAR__ = ["./","./assets/index-BVdHJ6Fu.js","./assets/index-DWrbyqo_.css","./index.html","./manifest.webmanifest","./simge-180.png","./simge-192.png","./simge-512.png"];
self.__SURUM__ = "mwnmuohl";
// Yankı çevrimdışı çalışma: ağ varsa her zaman en yenisi indirilir ve saklanır; ağ yoksa saklanan sürüm açılır.
// DOSYALAR listesini derleme (vite.config.ts) doldurur; sürüm her derlemede değişir, eski saklananlar silinir.
const DOSYALAR = self.__DOSYALAR__ || ["./", "./index.html"];
const KUTU = "yanki-" + (self.__SURUM__ || "gelistirme");
self.addEventListener("install", e => {
  e.waitUntil(caches.open(KUTU).then(k => k.addAll(DOSYALAR)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(l => Promise.all(l.filter(a => a !== KUTU).map(a => caches.delete(a)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const istek = e.request;
  if (istek.method !== "GET" || new URL(istek.url).origin !== location.origin) return;
  e.respondWith(
    fetch(istek).then(cevap => {
      if (cevap.ok) { const kopya = cevap.clone(); caches.open(KUTU).then(k => k.put(istek, kopya)); }
      return cevap;
    }).catch(() => caches.match(istek, { ignoreSearch: true }).then(c => c || caches.match("./index.html")))
  );
});
