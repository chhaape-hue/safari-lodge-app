"use client"

import { Bell, Search } from "lucide-react"

interface TopbarProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function Topbar({ title, subtitle, actions }: TopbarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-stone-200 bg-white/95 backdrop-blur px-6">
      <div>
        <h1 className="text-lg font-semibold text-stone-900">{title}</h1>
        {subtitle && <p className="text-xs text-stone-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <button className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors">
          <Bell className="h-4 w-4" />
        </button>
        <div className="h-8 w-8 rounded-full bg-amber-600 flex items-center justify-center">
          <span className="text-xs font-bold text-white">US</span>
        </div>
      </div>
    </header>
  )
}
