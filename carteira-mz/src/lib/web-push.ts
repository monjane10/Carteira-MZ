import webPush from "web-push"
import type { PushSubscription as WebPushSubscription } from "web-push"

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const privateKey = process.env.VAPID_PRIVATE_KEY
const rawSubject = process.env.VAPID_SUBJECT ?? "mailto:admin@carteira-mz.co.mz"
const subject = rawSubject.startsWith("mailto:") ? rawSubject : `mailto:${rawSubject}`

if (publicKey && privateKey) {
  webPush.setVapidDetails(subject, publicKey, privateKey)
}

export interface PushSubscriptionRow {
  id: string
  user_id: string
  endpoint: string
  p256dh: string
  auth: string
  user_agent: string | null
  created_at: string
}

export async function sendPushNotification(
  subscription: PushSubscriptionRow,
  payload: { title: string; body: string; url?: string; tag?: string },
) {
  if (!publicKey || !privateKey) return

  const pushSubscription: WebPushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.p256dh,
      auth: subscription.auth,
    },
  }

  try {
    await webPush.sendNotification(
      pushSubscription,
      JSON.stringify(payload),
      { TTL: 86400 },
    )
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "statusCode" in error) {
      const statusCode = (error as { statusCode: number }).statusCode
      if (statusCode === 410 || statusCode === 404) {
        return { expired: true, id: subscription.id }
      }
    }
    throw error
  }
}

export async function sendPushToUser(
  subscriptions: PushSubscriptionRow[],
  payload: { title: string; body: string; url?: string; tag?: string },
): Promise<string[]> {
  const expiredIds: string[] = []

  // O mesmo dispositivo (endpoint) pode estar registado várias vezes: envia só uma
  const byEndpoint = new Map<string, PushSubscriptionRow[]>()
  for (const sub of subscriptions) {
    byEndpoint.set(sub.endpoint, [...(byEndpoint.get(sub.endpoint) ?? []), sub])
  }

  await Promise.allSettled(
    [...byEndpoint.values()].map(async (subs) => {
      const latest = subs.reduce((a, b) => (b.created_at > a.created_at ? b : a))
      const result = await sendPushNotification(latest, payload)
      if (result?.expired) expiredIds.push(...subs.map((s) => s.id))
    }),
  )

  return expiredIds
}
