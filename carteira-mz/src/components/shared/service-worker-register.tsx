"use client"

import { useEffect } from "react"

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const register = async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
          })
        } catch (err) {
          // Silently fail — SW is optional
        }
      }
      register()
    }
  }, [])

  return null
}
