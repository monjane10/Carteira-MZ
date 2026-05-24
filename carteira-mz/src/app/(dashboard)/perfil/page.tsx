"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Image from "next/image"
import {
  User,
  Mail,
  Globe,
  Edit3,
  Trash2,
  Sun,
  Moon,
  Lock,
  LogOut,
  Camera,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { supabase } from "@/services"
import { useUIStore } from "@/store"

export default function SettingsPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [currency, setCurrency] = useState("MZN")
  const [phone, setPhone] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editCurrency, setEditCurrency] = useState("MZN")
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showLogout, setShowLogout] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const theme = useUIStore((s) => s.theme)
  const toggleTheme = useUIStore((s) => s.toggleTheme)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user
      if (!user) return
      const meta = user.user_metadata ?? {}
      setName((meta.full_name as string) || "")
      setEmail(user.email ?? "")
      supabase
        .from("profiles")
        .select("phone, currency, avatar_url")
        .eq("id", user.id)
        .single()
        .then(({ data: profile }) => {
          if (profile) {
            setPhone(profile.phone ?? "")
            setCurrency(profile.currency ?? "MZN")
            setAvatarUrl(profile.avatar_url)
          }
        })
    })
  }, [])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const { data: u } = await supabase.auth.getUser()
    const userId = u.user?.id
    if (!userId) return

    setUploading(true)
    try {
      const ext = file.name.split(".").pop()
      const filePath = `${userId}/${crypto.randomUUID()}.${ext}`

      const avatarBucket = supabase.storage.from("avatars")
      const { error: listError } = await avatarBucket.list("", { limit: 1 })
      if (listError && listError.message?.includes("bucket")) {
        throw new Error("Bucket 'avatars' não encontrado. Cria-o no Supabase Storage.")
      }

      const { data: uploadData, error: uploadError } = await avatarBucket.upload(filePath, file)

      if (uploadError) {
        console.error("Upload error detail:", JSON.stringify(uploadError, null, 2))
        throw new Error(uploadError.message || "Erro ao fazer upload")
      }

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath)
      const publicUrl = urlData.publicUrl

      const { error: updateError } = await supabase
        .from("profiles")
        .upsert({ id: userId, avatar_url: publicUrl })

      if (updateError) throw updateError

      setAvatarUrl(publicUrl)
      toast({ title: "Sucesso", description: "Foto actualizada com sucesso.", variant: "success" })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      toast({ title: "Erro", description: msg, variant: "error" })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleSave = async () => {
    const { data: u } = await supabase.auth.getUser()
    const userId = u.user?.id
    if (!userId) return

    await supabase.auth.updateUser({
      data: { full_name: editName },
    })

    await supabase.from("profiles").upsert({
      id: userId,
      full_name: editName,
      phone: editPhone,
      currency: editCurrency,
    })

    setName(editName)
    setPhone(editPhone)
    setCurrency(editCurrency)
    setEditing(false)
    toast({
      title: "Perfil actualizado",
      description: "Alterações guardadas com sucesso.",
      variant: "success",
    })
  }

  const handleCancel = () => {
    setEditName(name)
    setEditEmail(email)
    setEditPhone(phone)
    setEditCurrency(currency)
    setEditing(false)
  }

  const handleEditClick = () => {
    setEditName(name)
    setEditEmail(email)
    setEditPhone(phone)
    setEditCurrency(currency)
    setEditing(true)
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      const registration = await navigator.serviceWorker?.getRegistration("/")
      if (registration) {
        const sub = await registration.pushManager.getSubscription()
        if (sub) {
          await fetch(
            "/api/push-subscriptions?endpoint=" + encodeURIComponent(sub.endpoint),
            { method: "DELETE" },
          )
          await sub.unsubscribe()
        }
      }
    } catch { /* non-critical */ }
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      const { data: u } = await supabase.auth.getUser()
      const userId = u.user?.id
      if (!userId) throw new Error("Sem sessão")

      await supabase.from("accounts").delete().eq("user_id", userId)
      await supabase.from("transactions").delete().eq("user_id", userId)
      await supabase.from("transfers").delete().eq("user_id", userId)
      await supabase.from("loans").delete().eq("user_id", userId)
      await supabase.from("goals").delete().eq("user_id", userId)
      await supabase.from("budgets").delete().eq("user_id", userId)
      await supabase.from("recurring_transactions").delete().eq("user_id", userId)
      await supabase.from("notifications").delete().eq("user_id", userId)
      await supabase.from("profiles").delete().eq("id", userId)

      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token

      if (token) {
        await fetch("/api/delete-account", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        })
      }

      await supabase.auth.signOut()
      router.push("/login")
    } catch (e) {
      console.error("Delete account error:", e)
      toast({
        title: "Erro",
        description: "Não foi possível eliminar a conta.",
        variant: "error",
      })
      setDeleting(false)
    }
  }

      return (
    <div className="flex flex-col">
      {/* Avatar Section */}
      <div className="flex flex-col items-center pt-2 pb-5">
        <div className="relative h-24 w-24">
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-emerald-500/15 text-4xl font-bold text-emerald-700 ring-4 ring-slate-200 dark:text-emerald-300 dark:ring-slate-800/60">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={name || "Foto de perfil"}
                fill
                sizes="96px"
                className="object-cover object-center"
                priority
              />
            ) : (
              name ? name.charAt(0).toUpperCase() : "?"
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            aria-label="Alterar foto de perfil"
            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg ring-2 ring-white transition-colors hover:bg-emerald-400 disabled:opacity-60 dark:ring-slate-950"
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
          </button>
        </div>
        <p className="mt-3 text-lg font-bold text-slate-900 dark:text-slate-100">{name || "Carregando..."}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{email}</p>

        <button
          type="button"
          onClick={handleEditClick}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
        >
          <Edit3 className="h-3.5 w-3.5" />
          Editar Perfil
        </button>
      </div>

      <div className="space-y-4">
        {/* Informações Pessoais */}
        <div>
          <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500">
            Informações Pessoais
          </p>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800/60 dark:bg-slate-900/40">
            <div className="flex items-center gap-3.5 px-4 py-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 shrink-0">
                <User className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-500 dark:text-slate-500 font-medium">Nome</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate mt-0.5">{name}</p>
              </div>
            </div>
            <div className="mx-4 h-px bg-slate-200 dark:bg-slate-800/50" />
            <div className="flex items-center gap-3.5 px-4 py-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 shrink-0">
                <Mail className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-500 dark:text-slate-500 font-medium">Email</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate mt-0.5">{email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Preferências */}
        <div>
          <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500">
            Preferências
          </p>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800/60 dark:bg-slate-900/40">
            <div className="flex items-center gap-3.5 px-4 py-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 shrink-0">
                <Globe className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-500 dark:text-slate-500 font-medium">Moeda</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  {currency === "MZN" ? "MZN (MT)" : "USD ($)"}
                </p>
              </div>
            </div>
            <div className="mx-4 h-px bg-slate-200 dark:bg-slate-800/50" />
            <button
              type="button"
              onClick={() => toggleTheme()}
              className="flex items-center gap-3.5 px-4 py-3.5 w-full text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 shrink-0">
                {theme === "dark" ? (
                  <Moon className="h-4.5 w-4.5" />
                ) : (
                  <Sun className="h-4.5 w-4.5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-500 dark:text-slate-500 font-medium">Tema</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  {theme === "dark" ? "Escuro" : "Claro"}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-600" />
            </button>
          </div>
        </div>

        {/* Segurança */}
        <div>
          <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500">
            Segurança
          </p>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800/60 dark:bg-slate-900/40">
            <button
              type="button"
              onClick={() => router.push("/reset-password")}
              className="flex items-center gap-3.5 px-4 py-3.5 w-full text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 shrink-0">
                <Lock className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-500 dark:text-slate-500 font-medium">Palavra-passe</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">Alterar senha</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-600" />
            </button>
            <div className="mx-4 h-px bg-slate-200 dark:bg-slate-800/50" />
            <button
              type="button"
              onClick={() => setShowLogout(true)}
              className="flex items-center gap-3.5 px-4 py-3.5 w-full text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-red-500 dark:bg-slate-800 dark:text-red-400/70 shrink-0">
                <LogOut className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-500 dark:text-slate-500 font-medium">Sessão</p>
                <p className="text-sm font-semibold text-red-600 dark:text-red-400/80 mt-0.5">Terminar sessão</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-600" />
            </button>
          </div>
        </div>

        {/* Excluir Conta */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowDelete(true)}
            className="w-full flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            <Trash2 className="h-4 w-4" />
            Excluir Conta
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={showLogout}
        onOpenChange={(open) => { if (!open) setShowLogout(false) }}
        title="Terminar Sessão"
        description="Tem a certeza que deseja terminar a sessão?"
        onConfirm={handleLogout}
        isLoading={loggingOut}
      />

      <ConfirmDialog
        open={showDelete}
        onOpenChange={(open) => { if (!open) setShowDelete(false) }}
        title="Excluir Conta"
        description="Tem a certeza que deseja excluir a sua conta? Todos os seus dados serão removidos permanentemente. Esta acção não pode ser desfeita."
        onConfirm={handleDeleteAccount}
        isLoading={deleting}
      />

      {/* Modal de Edição */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 px-4 pb-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 text-center mb-1">
              Editar Perfil
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-6">
              Actualize a sua informação pessoal
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
                  Telefone
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
                  Moeda
                </label>
                <select
                  value={editCurrency}
                  onChange={(e) => setEditCurrency(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors appearance-none dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100"
                >
                  <option value="MZN">MZN (MT)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/30 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 h-11 rounded-xl bg-emerald-600 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
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
