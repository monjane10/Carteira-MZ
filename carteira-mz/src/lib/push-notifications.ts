export function requestNotificationPermission(): void {
  if (!("Notification" in window)) return
  if (Notification.permission === "default") {
    Notification.requestPermission()
  }
}

export function showBrowserNotification(title: string, body: string): void {
  if (!("Notification" in window)) return
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "/icon.png" })
  }
}
