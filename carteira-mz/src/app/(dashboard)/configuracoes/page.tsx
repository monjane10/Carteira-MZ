"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { User, Mail, Globe, ChevronRight, Edit3 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const [name, setName] = useState("Lourenço")
  const [email, setEmail] = useState("lourenco@email.com")
  const [currency, setCurrency] = useState("MZN")
  const [phone, setPhone] = useState("+258 84 000 0000")
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(name)
  const [editEmail, setEditEmail] = useState(email)
  const [editPhone, setEditPhone] = useState(phone)
  const [editCurrency, setEditCurrency] = useState(currency)

  const handleSave = () => {
    setName(editName)
    setEmail(editEmail)
    setPhone(editPhone)
    setCurrency(editCurrency)
    setEditing(false)
    toast({ title: "Perfil actualizado", description: "Alterações guardadas com sucesso.", variant: "success" })
  }

  const handleCancel = () => {
    setEditName(name)
    setEditEmail(email)
    setEditPhone(phone)
    setEditCurrency(currency)
    setEditing(false)
  }

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <div className="px-5 pt-6 pb-3">
        <h1 className="text-2xl font-bold text-[#0F172A]">Perfil</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-28 hide-scrollbar" style={{ WebkitOverflowScrolling: "touch" }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-5 mt-5"
        >
          {/* Avatar */}
          <div className="flex flex-col items-center pt-2">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#0F172A] text-4xl font-bold text-white ring-4 ring-slate-100">
              {name.charAt(0).toUpperCase()}
            </div>
            <p className="mt-4 text-lg font-bold text-[#0F172A]">{name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{email}</p>
          </div>

          {/* Container único */}
          <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
            <div className="flex items-center gap-3.5 px-4 py-4 border-b border-slate-50">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400 shrink-0">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-400 font-medium">Nome</p>
                <p className="text-sm font-bold text-[#0F172A] truncate mt-0.5">{name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3.5 px-4 py-4 border-b border-slate-50">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400 shrink-0">
                <Mail className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-400 font-medium">Email</p>
                <p className="text-sm font-bold text-[#0F172A] truncate mt-0.5">{email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3.5 px-4 py-4 border-b border-slate-50">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400 shrink-0">
                <Globe className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-400 font-medium">Moeda</p>
                <p className="text-sm font-bold text-[#0F172A] mt-0.5">{currency === "MZN" ? "MZN" : "USD"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3.5 px-4 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400 shrink-0">
                <div className="h-4 w-4 rounded-full border-2 border-slate-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-400 font-medium">Tema</p>
                <p className="text-sm font-bold text-[#0F172A] mt-0.5">Claro</p>
              </div>
            </div>
          </div>

          {/* Botão Editar */}
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="w-full h-13 flex items-center justify-center gap-2 rounded-2xl bg-[#0F172A] text-sm font-bold text-white transition-all hover:bg-[#1E293B]"
          >
            <Edit3 className="h-4 w-4" />
            Editar Perfil
          </button>
        </motion.div>
      </div>

      {/* Modal de Edição */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
          >
            <h3 className="text-lg font-bold text-[#0F172A] text-center mb-1">Editar Perfil</h3>
            <p className="text-xs text-slate-400 text-center mb-6">Actualize a sua informação pessoal</p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-[#0F172A] block mb-1.5">Nome Completo</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-[15px] text-[#0F172A] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#0F172A] block mb-1.5">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-[15px] text-[#0F172A] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#0F172A] block mb-1.5">Telefone</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-[15px] text-[#0F172A] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#0F172A] block mb-1.5">Moeda</label>
                <select
                  value={editCurrency}
                  onChange={(e) => setEditCurrency(e.target.value)}
                  className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-[15px] text-[#0F172A] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors appearance-none"
                >
                  <option value="MZN">MZN</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 h-12 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 h-12 rounded-xl bg-[#0F172A] text-sm font-semibold text-white transition-colors hover:bg-[#1E293B]"
              >
                Salvar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
