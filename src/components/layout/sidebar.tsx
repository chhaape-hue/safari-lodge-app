"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  DollarSign,
  Users,
  BarChart3,
  Settings,
  RefreshCw,
  Mail,
  ChevronRight,
} from "lucide-react"

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Properties & Zimmer",
    href: "/properties",
    icon: Building2,
  },
  {
    label: "Buchungen",
    href: "/bookings",
    icon: CalendarDays,
  },
  {
    label: "Kosten & Finanzen",
    href: "/costs",
    icon: DollarSign,
  },
  {
    label: "Personal (HR)",
    href: "/staff",
    icon: Users,
  },
  {
    label: "Berichte",
    href: "/reports",
    icon: BarChart3,
  },
  {
    label: "Nightsbridge Sync",
    href: "/nightsbridge",
    icon: RefreshCw,
  },
  {
    label: "E-Mail Marketing",
    href: "/email",
    icon: Mail,
  },
  {
    label: "Einstellungen",
    href: "/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-stone-200 bg-stone-900">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-stone-700">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-600">
          <span className="text-lg">🦁</span>
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight">Untouched Safaris</p>
          <p className="text-xs text-stone-400">Lodge Management</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors group",
                isActive
                  ? "bg-amber-600 text-white"
                  : "text-stone-400 hover:bg-stone-800 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-70" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-stone-700 px-4 py-3">
        <p className="text-xs text-stone-500 text-center">untouched-safaris.com</p>
      </div>
    </aside>
  )
}
