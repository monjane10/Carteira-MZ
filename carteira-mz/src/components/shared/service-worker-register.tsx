"use client"

import { useEffect, useRef } from "react"
import { toast } from "@/hooks/use-toast"
import { subscribeToPush, getPushSubscriptionPayload } from "@/lib/push-subscription"
import { supabase } from "@/services/supabase/client"

export function ServiceWorkerRegister() {
  const subscribedRef = useRef(false)
  const regRef = useRef<ServiceWorkerRegistration | null>(null)

  const trySubscribe = async (registration: ServiceWorkerRegistration) => {
    if (subscribedRef.current) return
    subscribedRef.current = true

    if (!("Notification" in window) || !("PushManager" in window)) return

    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission()
      if (permission !== "granted") return
    }

    if (Notification.permission !== "granted") return

    try {
      const sub = await subscribeToPush(registration)
      if (!sub) return

      const payload = getPushSubscriptionPayload(sub)
      if (!payload) return

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      await fetch("/api/push-subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          ...payload,
          userAgent: navigator.userAgent,
        }),
      })
    } catch (e) {
      console.error("Push subscription error:", e)
    }
  }

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        })
        regRef.current = registration

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                toast({
                  title: "Nova versão disponível",
                  description: "A actualizar...",
                  variant: "info",
                })
                newWorker.postMessage({ type: "SKIP_WAITING" })
              }
            })
          }
        })

        let refreshing = false
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (!refreshing) {
            refreshing = true
            window.location.reload()
          }
        })

        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          await trySubscribe(registration)
        }
      } catch (e) {
        console.error("SW registration error:", e)
      }
    }

    register()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_IN" && regRef.current) {
        subscribedRef.current = false
        await trySubscribe(regRef.current)
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  return null
}
