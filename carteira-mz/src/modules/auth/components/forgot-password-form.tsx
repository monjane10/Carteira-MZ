"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, ChevronLeft, Send } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/validators"
import { toast } from "@/hooks/use-toast"
import { Logo } from "@/components/shared/logo"
import { supabase } from "@/services"

export function ForgotPasswordForm() {
  const [emailSent, setEmailSent] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  async function onSubmit(data: ForgotPasswordFormData) {
    const redirectTo = `${window.location.origin}/reset-password`
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo,
    })

    if (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "error",
      })
      return
    }

    setEmailSent(true)
  }

  if (emailSent) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-white px-6 py-8">
        <div className="w-full max-w-[360px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <Send className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
            <h1 className="font-bold text-[#0F172A] text-2xl mb-2">Email enviado</h1>
            <p className="text-slate-500 text-sm mb-8">
              Verifique a sua caixa de entrada. Enviámos um link para recuperar a sua palavra-passe.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold text-sm transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar ao login
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-white px-6 py-8">
      <div className="w-full max-w-[360px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center">
            <Logo size="xl" />
            <h1 className="font-bold text-center text-[#0F172A] mt-8 leading-tight text-[30px]">
              Recuperar Senha
            </h1>
            <p className="text-center text-slate-500 mt-1.5 text-sm">
              Digite o seu email para receber o link de recuperação
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-9">
            <div className="mb-5">
              <label className="text-[#0F172A] block font-semibold text-sm mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  {...register("email")}
                  className="w-full border border-slate-200 bg-white text-[#0F172A] placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors h-12 text-sm rounded-xl pl-11 pr-4"
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-[#0F172A] text-white transition-all hover:bg-[#1E293B] disabled:opacity-60 h-12 text-[15px] font-bold rounded-xl"
            >
              {isSubmitting ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "Enviar Link"
              )}
            </button>

            <div className="text-center mt-5">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors text-sm"
              >
                <ChevronLeft className="h-4 w-4" />
                Voltar ao login
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
