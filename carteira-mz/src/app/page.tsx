"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/shared/logo"
import { motion, AnimatePresence } from "framer-motion"

export default function SplashScreen() {
  const router = useRouter()
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
      setTimeout(() => router.replace("/login"), 400)
    }, 2200)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-slate-950"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Logo size="lg" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
