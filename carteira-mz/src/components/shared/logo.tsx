import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  showText?: boolean
}

const sizeMap = {
  sm: { icon: 24, text: "text-lg", subtext: "text-xs" },
  md: { icon: 32, text: "text-xl", subtext: "text-sm" },
  lg: { icon: 48, text: "text-3xl", subtext: "text-base" },
}

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  const s = sizeMap[size]

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="48" height="48" rx="12" fill="#0F172A" />
        <path
          d="M14 28V18C14 16.8954 14.8954 16 16 16H32C33.1046 16 34 16.8954 34 18V28"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x="12"
          y="26"
          width="24"
          height="10"
          rx="3"
          fill="#10B981"
          stroke="white"
          strokeWidth="1.5"
        />
        <path
          d="M22 31H26"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="18" cy="21" r="1.5" fill="#10B981" />
        <circle cx="30" cy="21" r="1.5" fill="#10B981" />
      </svg>
      {showText && (
        <div>
          <h1 className={cn("font-bold text-slate-900 dark:text-white", s.text)}>
            Carteira MZ
          </h1>
          <p className={cn("text-slate-500 dark:text-slate-400", s.subtext)}>
            Gestão Financeira
          </p>
        </div>
      )}
    </div>
  )
}
