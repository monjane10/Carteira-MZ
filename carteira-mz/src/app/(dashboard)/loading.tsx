export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#0F172A]" />
        <p className="text-sm text-slate-400">A carregar...</p>
      </div>
    </div>
  )
}
