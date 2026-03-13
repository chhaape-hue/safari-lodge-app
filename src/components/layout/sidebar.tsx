"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth, roleLabel, roleBadgeColor } from "@/lib/auth"
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
  LogOut,
  Package,
  Wrench,
  UserCog,
} from "lucide-react"

const mainNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Properties & Rooms", href: "/properties", icon: Building2 },
  { label: "Bookings", href: "/bookings", icon: CalendarDays },
  { label: "Costs & Finance", href: "/costs", icon: DollarSign },
  { label: "Staff (HR)", href: "/staff", icon: Users },
]

const operationsNav = [
  { label: "Stock Control", href: "/stock", icon: Package },
  { label: "Maintenance", href: "/maintenance", icon: Wrench },
]

const analyticsNav = [
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Nightsbridge Sync", href: "/nightsbridge", icon: RefreshCw },
  { label: "Email Marketing", href: "/email", icon: Mail },
]

const adminNav = [
  { label: "User Management", href: "/users", icon: UserCog },
  { label: "Settings", href: "/settings", icon: Settings },
]

function NavGroup({ label, items }: { label?: string; items: { label: string; href: string; icon: React.ElementType }[] }) {
  const pathname = usePathname()
  return (
    <div className="space-y-0.5">
      {label && (
        <p className="px-3 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-[#7A5C38]/60">
          {label}
        </p>
      )}
      {items.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group",
              isActive
                ? "bg-[#C9A84C] text-white shadow-md"
                : "text-[#C4A882] hover:bg-[#5C3A1E]/60 hover:text-[#F5E6D0]"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-70" />}
          </Link>
        )
      })}
    </div>
  )
}

export function Sidebar() {
  const { profile, signOut, isAdmin } = useAuth()

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : profile?.email?.slice(0, 2).toUpperCase() ?? "?"

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#3D2010]" style={{ background: "linear-gradient(180deg, #1E1209 0%, #2C1A0E 60%, #3D2010 100%)" }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[#5C3A1E]/50">
        {/* Golden O with birds logo */}
        <div className="flex h-10 w-10 items-center justify-center shrink-0">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="24" r="7" fill="none" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M10 10 C12 8, 14 9, 15 11 C16 9, 18 8, 20 10" stroke="#C9A84C" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M14 15.5 C15.5 14, 17 14.5, 18 16 C19 14.5, 20.5 14, 22 15.5" stroke="#C9A84C" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-[#F5E6D0] leading-tight tracking-wide uppercase">Untouched</p>
          <p className="text-xs text-[#C9A84C] tracking-[0.2em] uppercase font-medium">Safaris</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <NavGroup items={mainNav} />
        <NavGroup label="Operations" items={operationsNav} />
        <NavGroup label="Analytics" items={analyticsNav} />
        {isAdmin && <NavGroup label="Admin" items={adminNav} />}
        {!isAdmin && <NavGroup items={[{ label: "Settings", href: "/settings", icon: Settings }]} />}
      </nav>

      {/* User info + Logout */}
      <div className="border-t border-[#5C3A1E]/50 px-3 py-3 space-y-2">
        {profile && (
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="h-8 w-8 rounded-full bg-[#C9A84C] flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-white">{initials}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#F5E6D0] truncate">
                {profile.full_name || profile.email}
              </p>
              <span className={cn("text-xs px-1.5 py-0.5 rounded-full font-medium", roleBadgeColor(profile.role))}>
                {roleLabel(profile.role)}
              </span>
            </div>
          </div>
        )}
        <button
          onClick={signOut}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[#C4A882] hover:bg-[#5C3A1E]/60 hover:text-[#F5E6D0] transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
