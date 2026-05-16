import type { Metadata } from "next"
import { Providers } from "@/providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "Carteira MZ - Gestão Financeira",
  description: "Aplicação moderna de gestão financeira pessoal",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-MZ" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
