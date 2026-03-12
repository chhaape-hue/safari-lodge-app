import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: { value: number; label: string }
  color?: "amber" | "green" | "blue" | "rose" | "stone"
  className?: string
}

const colorClasses = {
  amber: { bg: "bg-amber-50", icon: "text-amber-700", iconBg: "bg-amber-100" },
  green: { bg: "bg-green-50", icon: "text-green-700", iconBg: "bg-green-100" },
  blue: { bg: "bg-blue-50", icon: "text-blue-700", iconBg: "bg-blue-100" },
  rose: { bg: "bg-rose-50", icon: "text-rose-700", iconBg: "bg-rose-100" },
  stone: { bg: "bg-stone-50", icon: "text-stone-600", iconBg: "bg-stone-100" },
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, color = "amber", className }: StatCardProps) {
  const colors = colorClasses[color]
  return (
    <div className={cn("rounded-xl border border-stone-200 bg-white p-5 shadow-sm", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-stone-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-stone-900">{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-stone-400">{subtitle}</p>}
          {trend && (
            <p className={cn("mt-1 text-xs font-medium", trend.value >= 0 ? "text-green-600" : "text-red-500")}>
              {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className={cn("rounded-lg p-2.5", colors.iconBg)}>
          <Icon className={cn("h-5 w-5", colors.icon)} />
        </div>
      </div>
    </div>
  )
}
