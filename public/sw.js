// Tirthamala service worker: instant repeat visits and offline reading. Same-origin GET only.
// Hashed build assets: cache-first. Data and map files: stale-while-revalidate. Pages: network-first.
const VERSION = "v1";
const STATIC = `static-${VERSION}`;
const DATA = `data-${VERSION}`;
const PAGES = `pages-${VERSION}`;
const PAGE_LIMIT = 150;

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  const keep = new Set([STATIC, DATA, PAGES]);
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((n) => !keep.has(n)).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

async function cacheFirst(request) {
  const hit = await caches.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) (await caches.open(STATIC)).put(request, res.clone());
  return res;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(DATA);
  const hit = await cache.match(request);
  const fresh = fetch(request)
    .then((res) => {
      if (res.ok) cache.put(request, res.clone());
      return res;
    })
    .catch(() => hit);
  return hit ?? fresh;
}

// Keeps the page cache bounded by dropping the oldest entries.
async function trim(cache) {
  const keys = await cache.keys();
  for (const k of keys.slice(0, Math.max(0, keys.length - PAGE_LIMIT))) await cache.delete(k);
}

async function networkFirst(request) {
  const cache = await caches.open(PAGES);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(request, res.clone()).then(() => trim(cache));
    return res;
  } catch {
    return (await cache.match(request, { ignoreSearch: true })) ?? Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/_next/static/")) return event.respondWith(cacheFirst(request));
  if (
    url.pathname === "/cards.json" ||
    url.pathname.startsWith("/geo/") ||
    url.pathname.startsWith("/maplibre/") ||
    url.pathname === "/favicon.ico"
  )
    return event.respondWith(staleWhileRevalidate(request));
  if (request.mode === "navigate" || url.pathname.endsWith(".txt"))
    return event.respondWith(networkFirst(request));
});
