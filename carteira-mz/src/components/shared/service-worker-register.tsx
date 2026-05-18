"use client"

import { useEffect, useRef } from "react"
import { toast } from "@/hooks/use-toast"
import { subscribeToPush, getPushSubscriptionPayload } from "@/lib/push-subscription"

export function ServiceWorkerRegister() {
  const subscribedRef = useRef(false)

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        })

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

        if (subscribedRef.current) return
        subscribedRef.current = true

        if (Notification.permission === "default") {
          const permission = await Notification.requestPermission()
          if (permission !== "granted") return
        }

        if (Notification.permission !== "granted") return

        const sub = await subscribeToPush(registration)
        if (!sub) return

        const payload = getPushSubscriptionPayload(sub)
        if (!payload) return

        const { supabase } = await import("@/services")
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
      } catch {
        // Silently fail
      }
    }

    register()
  }, [])

  return null
}
