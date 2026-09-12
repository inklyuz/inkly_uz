// Inkly Service Worker — Web Push Handler + minimal static-asset cache
// Bu fayl backend VAPID push yuborganda ishlaydi.
// Hozircha faqat local notification ko'rsatadi.
//
// MUHIM (tuzatildi): oldingi versiya BARCHA GET so'rovlarni (HTML sahifalar,
// Next.js JS chunk'lari, hatto Authorization header bilan ketadigan API
// so'rovlarni ham) ushlab, cache-first strategiya bilan javob berardi va
// tarmoq xatosida hech qanday fallback yo'q edi. Natija:
//   1) Deploy'dan keyin eski (endi mavjud bo'lmagan) JS chunk'lar keshdan
//      berilib, sahifa umuman ochilmay qolardi (ChunkLoadError).
//   2) Tarmoq xatosi (masalan 500/timeout) da event.respondWith reject
//      bo'lib, brauzer sahifani "yuklab bo'lmadi" holatida qoldirardi.
//   3) Authorization header'li so'rovlar URL bo'yicha keshlanib, boshqa
//      foydalanuvchiga/eski holatga tegishli javob qaytishi mumkin edi.
//
// Yangi strategiya:
//   - Faqat aniq statik asset'lar (Next.js /_next/static, rasm/shrift/ikonka)
//     cache-first qilinadi — bular content-hash'li, xavfsiz uzoq keshlanadi.
//   - Navigatsiya (HTML) va boshqa hamma narsa — network-first: tarmoqdan
//     olishga urinadi, faqat u butunlay ishlamasa (offline) keshga qaraydi.
//   - Authorization header bor so'rovlar HECH QACHON keshlanmaydi.
//   - Har doim tarmoq xatosini ushlab, imkon qadar keshga/xatoga muloyim
//     tushadi — reject bo'lgan promise hech qachon foydalanuvchiga
//     ko'rinmaydi.

const CACHE_VERSION = "inkly-v2"
const STATIC_CACHE = `${CACHE_VERSION}-static`
const NOTIFICATION_ICON = "/icons/notification-icon.png"
const NOTIFICATION_BADGE = "/icons/notification-badge.png"

self.addEventListener("install", (event) => {
  console.log("[SW] Installing...")
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...")
  event.waitUntil(
    (async () => {
      // Eski versiyadagi barcha cache'larni tozalaymiz — shu bilan
      // deploy'dan keyin eskirgan JS/HTML hech qachon serve qilinmaydi.
      const keys = await caches.keys()
      await Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE)
          .map((key) => caches.delete(key)),
      )
      await clients.claim()
    })(),
  )
})

// Faqat shu turdagi so'rovlarni cache-first qilamiz: content-hash'li Next.js
// static fayllari va statik rasm/shrift/ikonkalar. HTML/API bu yerga kirmaydi.
function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    /\.(?:png|jpg|jpeg|webp|gif|svg|ico|woff2?|ttf)$/i.test(url.pathname)
  )
}

// Push xabar qabul qilganda
self.addEventListener("push", (event) => {
  console.log("[SW] Push received")

  let data
  try {
    data = event.data?.json() ?? {}
  } catch {
    data = { title: "Inkly", body: event.data?.text() ?? "Yangi xabar" }
  }

  const title = data.title ?? "Inkly"
  const options = {
    body: data.body ?? "Yangi xabar keldi",
    icon: data.icon ?? NOTIFICATION_ICON,
    badge: data.badge ?? NOTIFICATION_BADGE,
    image: data.image,
    tag: data.tag ?? "inkly-notification",
    data: data.data ?? {},
    actions: data.actions ?? [],
    requireInteraction: data.requireInteraction ?? false,
    silent: data.silent ?? false,
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Notification bosilganda
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.notification.tag)

  event.notification.close()

  const data = event.notification.data ?? {}
  const url = data.url ?? "/"

  // Agar action bosilsa
  if (event.action) {
    console.log("[SW] Action:", event.action)
    // Actionga qarab maxsus harakatlar qo'shilishi mumkin
    return
  }

  // Asosiy notification bosilganda sahifani ochish
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Mavjud oyna borligini tekshirish
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus()
        }
      }
      // Yangi oyna ochish
      return clients.openWindow(url)
    })
  )
})

// Notification yopilganda
self.addEventListener("notificationclose", (event) => {
  console.log("[SW] Notification closed:", event.notification.tag)
  // Analytics uchun log yuborish mumkin
})

// Fetch event
self.addEventListener("fetch", (event) => {
  const { request } = event

  // Faqat GET so'rovlarini ko'rib chiqamiz — POST/PATCH/DELETE hech qachon
  // ushlanmaydi va to'g'ridan-to'g'ri tarmoqqa ketadi.
  if (request.method !== "GET") return

  // Boshqa origin'ga (masalan backend API boshqa domenda bo'lsa) ketadigan
  // so'rovlarga aralashmaymiz — brauzerning o'zi hal qilsin.
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Authorization header bor so'rovlar (token bilan ketadigan API chaqiruvlari)
  // hech qachon keshlanmaydi va hech qachon keshdan qaytarilmaydi — bo'lmasa
  // boshqa foydalanuvchi yoki eskirgan holat ko'rsatilib qolishi mumkin.
  const hasAuth = request.headers.has("authorization")

  if (isStaticAsset(url) && !hasAuth) {
    // ── Cache-first: content-hash'li static asset'lar ──────────────────────
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request)
          .then((response) => {
            if (response && response.ok && response.type === "basic") {
              const copy = response.clone()
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy))
            }
            return response
          })
          .catch(() => cached || Response.error())
      }),
    )
    return
  }

  // ── Network-first: HTML sahifalar, RSC payload, API so'rovlari ─────────
  // Muvaffaqiyatli bo'lsa to'g'ridan-to'g'ri tarmoq javobini qaytaramiz.
  // Tarmoq butunlay ishlamasa (offline) — faqat shunda, va faqat auth bo'lmasa
  // — eski keshga qaraymiz; aks holda xatoni to'g'ridan-to'g'ri ko'rsatamiz,
  // hech qachon "osilib qolgan" reject holatida qoldirmaymiz.
  event.respondWith(
    fetch(request).catch(async () => {
      if (!hasAuth) {
        const cached = await caches.match(request)
        if (cached) return cached
      }
      return new Response("Tarmoqqa ulanib bo'lmadi.", {
        status: 503,
        statusText: "Service Unavailable",
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      })
    }),
  )
})