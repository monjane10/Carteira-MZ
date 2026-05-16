import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Providers } from "@/providers"
import { ServiceWorkerRegister } from "@/components/shared/service-worker-register"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Carteira MZ",
  description: "Aplicação moderna de gestão financeira pessoal",
  manifest: "/manifest.json",

}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-MZ" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <Providers>{children}</Providers>
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
