"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { loginSchema, type LoginFormData } from "@/validators"
import { toast } from "@/hooks/use-toast"
import { Logo } from "@/components/shared/logo"
import { supabase } from "@/services"

export function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginFormData) {
    setError("")
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (authError) {
      setError("Email ou senha inválidos.")
      return
    }

    document.cookie = "carteira_session=authenticated; path=/; max-age=86400"
    toast({
      title: "Autenticação",
      description: "Login efetuado com sucesso",
      variant: "success",
    })
    router.push("/dashboard")
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-white px-6 py-8">
      <div className="w-full max-w-[360px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="flex flex-col items-center">
            <Logo size="xl" />
            <h1 className="font-bold text-center text-[#0F172A] mt-8 leading-tight" style={{ fontSize: 30 }}>
              Bem-vindo ao<br />Carteira MZ
            </h1>
            <p className="text-center text-slate-500 mt-1.5" style={{ fontSize: 14 }}>
              Entre na sua conta para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: 36 }}>
            <div style={{ marginBottom: 20 }}>
              <label className="text-[#0F172A] block font-semibold" style={{ fontSize: 14, marginBottom: 5 }}>
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" style={{ width: 20, height: 20 }} />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  {...register("email")}
                  className="w-full border border-slate-200 bg-white text-[#0F172A] placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                  style={{ height: 48, fontSize: 14, borderRadius: 12, padding: "0 16px 0 46px" }}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="text-[#0F172A] block font-semibold" style={{ fontSize: 14, marginBottom: 5 }}>
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" style={{ width: 20, height: 20 }} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className="w-full border border-slate-200 bg-white text-[#0F172A] placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                  style={{ height: 48, fontSize: 14, borderRadius: 12, padding: "0 44px 0 46px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute text-slate-400 hover:text-slate-600 transition-colors"
                  style={{ right: 16, top: "50%", transform: "translateY(-50%)" }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff style={{ width: 20, height: 20 }} /> : <Eye style={{ width: 20, height: 20 }} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-xl border border-red-200 mb-4">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !!error}
              className="w-full flex items-center justify-center gap-2 bg-[#0F172A] text-white transition-all hover:bg-[#1E293B] disabled:opacity-60"
              style={{ height: 48, fontSize: 15, fontWeight: 700, borderRadius: 12 }}
            >
              {isSubmitting ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  Entrar
                  <ArrowRight style={{ width: 20, height: 20 }} />
                </>
              )}
            </button>

            <div className="text-center mt-5">
              <Link href="#" className="text-slate-500 hover:text-slate-700 transition-colors" style={{ fontSize: 14 }}>
                Esqueceu a senha?
              </Link>
            </div>
          </form>

          <div className="text-center text-slate-500 mt-5 pt-4" style={{ borderTop: "1px solid #F1F5F9", fontSize: 14 }}>
            Não tem conta?{" "}
            <Link href="/register" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
              Criar Conta
            </Link>
          </div>

          <p className="text-center text-xs text-slate-400 mt-4">
            © 2026 Carteira MZ. Desenvolvido por{" "}
            <a
              href="https://lourencomonjane.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              Lourenço Monjane
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
