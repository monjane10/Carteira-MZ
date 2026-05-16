import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  showText?: boolean
}

const sizeMap = {
  sm: { width: 100, height: 28 },
  md: { width: 160, height: 44 },
  lg: { width: 220, height: 60 },
}

export function Logo({ className, size = "md" }: LogoProps) {
  const s = sizeMap[size]

  return (
    <div className={cn("relative", className)} style={{ width: s.width, height: s.height }}>
      <Image
        src="/logo.png"
        alt="Carteira MZ"
        fill
        className="object-contain object-left"
        priority
      />
    </div>
  )
}
