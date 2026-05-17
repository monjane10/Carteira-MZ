const STATIC_CACHE = "carteira-mz-static-v2"

const IMAGE_CACHE = "carteira-mz-images-v2"

const NAV_CACHE = "carteira-mz-nav-v2"

self.addEventListener("install", (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll([
        "/logo.png",
        "/BCI.png",
        "/BIM.png",
        "/mpesa.png",
        "/emola.png",
        "/absa.png",
        "/standard-Bank.png",
        "/mkesh.png",
      ])
    })
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== IMAGE_CACHE && k !== NAV_CACHE)
          .map((k) => caches.delete(k))
      )
    })
  )
  event.waitUntil(clients.claim())
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone()
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone))
          }
          return response
        })
      })
    )
    return
  }

  if (
    url.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp)$/i) ||
    url.pathname === "/manifest.json"
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone()
            caches.open(IMAGE_CACHE).then((cache) => cache.put(request, clone))
          }
          return response
        })
      })
    )
    return
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone()
            caches.open(NAV_CACHE).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached
            return caches.match("/dashboard")
          })
        })
    )
    return
  }

  event.respondWith(fetch(request))
})
