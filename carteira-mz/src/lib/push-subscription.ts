export async function subscribeToPush(registration: ServiceWorkerRegistration): Promise<PushSubscriptionJSON | null> {
  try {
    const existing = await registration.pushManager.getSubscription()
    if (existing) return existing.toJSON()

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapidPublicKey) return null

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
    })

    return subscription.toJSON()
  } catch {
    return null
  }
}

export async function unsubscribeFromPush(registration: ServiceWorkerRegistration): Promise<boolean> {
  try {
    const subscription = await registration.pushManager.getSubscription()
    if (!subscription) return false
    await subscription.unsubscribe()
    return true
  } catch {
    return false
  }
}

export function getPushSubscriptionPayload(sub: PushSubscriptionJSON) {
  if (!sub.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) return null

  return {
    endpoint: sub.endpoint,
    p256dh: sub.keys.p256dh,
    auth: sub.keys.auth,
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = atob(base64)
  return Uint8Array.from(rawData.split("").map((c) => c.charCodeAt(0)))
}
