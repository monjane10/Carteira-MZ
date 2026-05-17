import Link from "next/link"
import { Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-white px-6">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 mb-6">
          <span className="text-3xl font-bold text-slate-400">404</span>
        </div>
        <h1 className="text-xl font-bold text-[#0F172A] mb-2">Página não encontrada</h1>
        <p className="text-sm text-slate-500 mb-8 max-w-xs">
          A página que procura não existe ou foi movida.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl bg-[#0F172A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1E293B] transition-colors"
        >
          <Home className="h-4 w-4" />
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  )
}
