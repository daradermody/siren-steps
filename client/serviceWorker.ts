const staticDevCoffee = "siren-steps-v1"
const assets = [
  "/",
  "/index.html",
  "/public/favicon.ico",
  "/public/logo60.png",
  "/public/logo192.png",
  "/public/logo512.png",
]

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(staticDevCoffee)
      .then(cache => cache.addAll(assets))
  )
})

self.addEventListener("fetch", fetchEvent => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request)
      .then(res => res || fetch(fetchEvent.request))
  )
})
