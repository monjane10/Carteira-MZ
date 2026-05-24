"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUIStore } from "@/store"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Menu, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { NotificationDropdown } from "@/components/shared/notification-dropdown"

const pageTitles: Record<string, string> = {
  dashboard: "Dashboard",
  contas: "Contas",
  transacoes: "Transacções",
  transferencias: "Transferências",
  categorias: "Categorias",
  emprestimos: "Empréstimos",
  metas: "Metas",
  orcamentos: "Orçamentos",
  relatorios: "Relatórios",
  recorrentes: "Recorrentes",
  perfil: "Perfil",
}

export function Header() {
  const router = useRouter()
  const { toggleSidebar, activePage } = useUIStore()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")

  const handleSearch = (value: string) => {
    if (value.trim()) {
      router.push(`/transacoes?search=${encodeURIComponent(value.trim())}`)
      setSearchValue("")
      setSearchOpen(false)
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950 lg:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden dark:hover:bg-slate-800 dark:hover:text-slate-300"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          {pageTitles[activePage] || activePage}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <div
          className={cn(
            "hidden items-center md:flex",
            searchOpen && "flex"
          )}
        >
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Pesquisar transacções..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(searchValue) }}
              className="h-9 w-48 rounded-lg border-slate-200 pl-8 text-sm dark:border-slate-800 lg:w-64"
            />
          </div>
        </div>

        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 md:hidden dark:hover:bg-slate-800 dark:hover:text-slate-300"
        >
          <Search className="h-4 w-4" />
        </button>

        <NotificationDropdown />

        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarFallback className="bg-slate-200 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            U
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
