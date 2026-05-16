"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Mail, Lock, Eye, EyeOff, User, ArrowRight } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { registerSchema, type RegisterFormData } from "@/validators"
import { toast } from "@/hooks/use-toast"
import { Logo } from "@/components/shared/logo"

export function RegisterForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  function onSubmit(data: RegisterFormData) {
    toast({
      title: "Conta criada",
      description: "Registo simulado com sucesso",
      variant: "success",
    })
    document.cookie = "carteira_session=authenticated; path=/; max-age=86400"
    setTimeout(() => router.push("/dashboard"), 500)
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-white px-6 py-8">
      <div className="w-full max-w-[360px] mx-auto max-h-full overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="flex flex-col items-center">
            <Logo size="xl" />
            <h1 className="font-bold text-center text-[#0F172A] mt-8 leading-tight" style={{ fontSize: 30 }}>
              Criar conta
            </h1>
            <p className="text-center text-slate-500 mt-1.5" style={{ fontSize: 14 }}>
              Comece a organizar as suas finanças
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: 36 }}>
            <div style={{ marginBottom: 18 }}>
              <label className="text-[#0F172A] block font-semibold" style={{ fontSize: 14, marginBottom: 5 }}>
                Nome Completo
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" style={{ width: 20, height: 20 }} />
                <input
                  type="text"
                  placeholder="Seu nome"
                  {...register("full_name")}
                  className="w-full border border-slate-200 bg-white text-[#0F172A] placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                  style={{ height: 48, fontSize: 14, borderRadius: 12, padding: "0 16px 0 46px" }}
                />
              </div>
              {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name.message}</p>}
            </div>

            <div style={{ marginBottom: 18 }}>
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

            <div style={{ marginBottom: 18 }}>
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

            <div style={{ marginBottom: 18 }}>
              <label className="text-[#0F172A] block font-semibold" style={{ fontSize: 14, marginBottom: 5 }}>
                Confirmar Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" style={{ width: 20, height: 20 }} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("confirm_password")}
                  className="w-full border border-slate-200 bg-white text-[#0F172A] placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                  style={{ height: 48, fontSize: 14, borderRadius: 12, padding: "0 44px 0 46px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute text-slate-400 hover:text-slate-600 transition-colors"
                  style={{ right: 16, top: "50%", transform: "translateY(-50%)" }}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                </button>
              </div>
              {errors.confirm_password && <p className="text-xs text-red-500 mt-1">{errors.confirm_password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-[#0F172A] text-white transition-all hover:bg-[#1E293B] disabled:opacity-60"
              style={{ height: 48, fontSize: 15, fontWeight: 700, borderRadius: 12, marginTop: 4 }}
            >
              {isSubmitting ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  Criar Conta
                  <ArrowRight style={{ width: 20, height: 20 }} />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-slate-500 mt-5 pt-4" style={{ borderTop: "1px solid #F1F5F9", fontSize: 14 }}>
            Já tem conta?{" "}
            <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
              Entrar
            </Link>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
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
