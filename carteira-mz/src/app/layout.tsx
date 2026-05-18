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
  title: {
    default: "Carteira MZ",
    template: "%s | Carteira MZ",
  },
  description: "Aplicação moderna de gestão financeira pessoal para Moçambique - controle suas contas, transacções, orçamentos e metas.",
  manifest: "/manifest.json",
  openGraph: {
    title: "Carteira MZ",
    description: "Aplicação moderna de gestão financeira pessoal para Moçambique",
    type: "website",
    locale: "pt_MZ",
    siteName: "Carteira MZ",
  },
  twitter: {
    card: "summary_large_image",
    title: "Carteira MZ",
    description: "Aplicação moderna de gestão financeira pessoal para Moçambique",
  },
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
