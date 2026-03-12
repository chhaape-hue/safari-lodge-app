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
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#3D2010]" style={{ background: "linear-gradient(180deg, #2C1A0E 0%, #3D2010 100%)" }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[#5C3A1E]/50">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6B4226] shadow-lg">
          <span className="text-xl">🦁</span>
        </div>
        <div>
          <p className="text-sm font-bold text-[#F5E6D0] leading-tight">Untouched Safaris</p>
          <p className="text-xs text-[#A07850]">Lodge Management</p>
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
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group",
                isActive
                  ? "bg-[#C8956B] text-white shadow-md"
                  : "text-[#C4A882] hover:bg-[#5C3A1E]/60 hover:text-[#F5E6D0]"
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
      <div className="border-t border-[#5C3A1E]/50 px-4 py-3">
        <p className="text-xs text-[#7A5535] text-center">untouched-safaris.com</p>
      </div>
    </aside>
  )
}
