const CACHE = "mm-cal-v6";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./myanmarCalendar.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./data/holidays.json"
];

self.addEventListener("install", (e)=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});
self.addEventListener("activate", (e)=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE && caches.delete(k))))
  );
});
self.addEventListener("fetch", (e)=>{
  const url = new URL(e.request.url);
  // Network-first for JSON API, cache-first for static
  if(url.pathname.startsWith("/data/")){
    e.respondWith(
      fetch(e.request).then(res=>{
        const copy = res.clone();
        caches.open(CACHE).then(c=>c.put(e.request, copy));
        return res;
      }).catch(()=>caches.match(e.request))
    );
  }else{
    e.respondWith(
      caches.match(e.request).then(cached=>cached || fetch(e.request))
    );
  }
});