"use client"

interface FinancialGrowthIllustrationProps {
  className?: string
}

export function FinancialGrowthIllustration({ className }: FinancialGrowthIllustrationProps) {
  return (
    <svg
      viewBox="0 0 120 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect x="4" y="4" width="112" height="82" rx="20" fill="#E8F5E9" />

      <circle cx="36" cy="62" r="10" fill="#A5D6A7" stroke="#66BB6A" strokeWidth="1.5" />
      <circle cx="50" cy="52" r="10" fill="#81C784" stroke="#43A047" strokeWidth="1.5" />
      <circle cx="44" cy="72" r="10" fill="#C8E6C9" stroke="#81C784" strokeWidth="1.5" />

      <polyline
        points="56,56 68,48 80,52 92,38"
        stroke="#0F172A"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      <circle cx="92" cy="38" r="3" fill="#0F172A" />

      <path
        d="M74 34 C74 34, 76 28, 80 26 C84 24, 86 26, 86 26"
        stroke="#43A047"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M80 26 C80 26, 82 22, 85 20 C88 18, 90 20, 90 20"
        stroke="#66BB6A"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M86 26 C86 26, 85 22, 84 18 C83 14, 81 14, 81 14"
        stroke="#81C784"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
