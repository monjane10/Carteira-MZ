"use client"

import { useEffect } from "react"
import { toast } from "@/hooks/use-toast"

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
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
        } catch {
          // Silently fail
        }
      }
      register()
    }
  }, [])

  return null
}
