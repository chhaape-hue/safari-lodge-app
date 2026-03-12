"use client"

import { useState } from "react"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DEMO_BOOKINGS, DEMO_GUESTS, DEMO_PROPERTIES, DEMO_ROOMS } from "@/lib/demo-data"
import { formatCurrency, formatDate, getDaysBetween } from "@/lib/utils"
import { Plus, Search, Filter, RefreshCw, CalendarDays, Download } from "lucide-react"

const statusConfig = {
  confirmed: { label: "Bestätigt", variant: "info" as const },
  checked_in: { label: "Eingecheckt", variant: "success" as const },
  checked_out: { label: "Ausgecheckt", variant: "neutral" as const },
  pending: { label: "Ausstehend", variant: "warning" as const },
  cancelled: { label: "Storniert", variant: "danger" as const },
  no_show: { label: "No-Show", variant: "danger" as const },
}

const sourceConfig: Record<string, string> = {
  nightsbridge: "Nightsbridge",
  direct: "Direkt",
  agent: "Reisebüro",
  email: "E-Mail",
  phone: "Telefon",
  walk_in: "Walk-in",
}

export default function BookingsPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filtered = DEMO_BOOKINGS.filter(b => {
    const guest = DEMO_GUESTS.find(g => g.id === b.guest_id)
    const matchesSearch = search === "" ||
      b.booking_reference.toLowerCase().includes(search.toLowerCase()) ||
      `${guest?.first_name} ${guest?.last_name}`.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || b.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalRevenue = filtered.reduce((sum, b) => sum + b.total_amount, 0)
  const totalPaid = filtered.reduce((sum, b) => sum + b.paid_amount, 0)

  return (
    <div>
      <Topbar
        title="Buchungen"
        subtitle="Alle Reservierungen & Check-ins"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">
              <RefreshCw className="h-3.5 w-3.5" />
              NB Sync
            </Button>
            <Button size="sm">
              <Plus className="h-3.5 w-3.5" />
              Neue Buchung
            </Button>
          </div>
        }
      />

      <div className="p-6 space-y-5">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Gesamt", value: DEMO_BOOKINGS.length, color: "text-stone-900" },
            { label: "Aktiv (Eingecheckt)", value: DEMO_BOOKINGS.filter(b => b.status === "checked_in").length, color: "text-green-700" },
            { label: "Bestätigt", value: DEMO_BOOKINGS.filter(b => b.status === "confirmed").length, color: "text-blue-700" },
            { label: "Ausstehend", value: DEMO_BOOKINGS.filter(b => b.status === "pending").length, color: "text-amber-700" },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm">
              <p className="text-xs text-stone-500 font-medium">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="Referenz oder Gastname..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent w-64"
            />
          </div>
          <div className="flex gap-1">
            {(["all", "confirmed", "checked_in", "pending", "cancelled"] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  statusFilter === status
                    ? "bg-amber-700 text-white"
                    : "bg-white border border-stone-300 text-stone-600 hover:bg-stone-50"
                }`}
              >
                {status === "all" ? "Alle" : statusConfig[status]?.label || status}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2 text-sm text-stone-600">
            <span>Umsatz:</span>
            <span className="font-semibold">{formatCurrency(totalRevenue)}</span>
            <span className="text-stone-400">·</span>
            <span>Bezahlt:</span>
            <span className="font-semibold text-green-700">{formatCurrency(totalPaid)}</span>
          </div>
        </div>

        {/* Bookings Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-xs text-stone-500 uppercase tracking-wider">
                  <th className="px-5 py-3 text-left font-medium">Referenz</th>
                  <th className="px-5 py-3 text-left font-medium">Gast</th>
                  <th className="px-5 py-3 text-left font-medium">Property / Zimmer</th>
                  <th className="px-5 py-3 text-left font-medium">Check-in</th>
                  <th className="px-5 py-3 text-left font-medium">Check-out</th>
                  <th className="px-5 py-3 text-left font-medium">Nächte</th>
                  <th className="px-5 py-3 text-left font-medium">Betrag</th>
                  <th className="px-5 py-3 text-left font-medium">Quelle</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-left font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filtered.map((booking) => {
                  const guest = DEMO_GUESTS.find(g => g.id === booking.guest_id)
                  const property = DEMO_PROPERTIES.find(p => p.id === booking.property_id)
                  const room = DEMO_ROOMS.find(r => r.id === booking.room_id)
                  const nights = getDaysBetween(new Date(booking.check_in), new Date(booking.check_out))
                  const status = statusConfig[booking.status]
                  const outstanding = booking.total_amount - booking.paid_amount

                  return (
                    <tr key={booking.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-5 py-3">
                        <span className="font-mono text-xs text-stone-600">{booking.booking_reference}</span>
                        {booking.nightsbridge_booking_id && (
                          <p className="text-xs text-blue-500 mt-0.5">NB: {booking.nightsbridge_booking_id}</p>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-stone-900">{guest?.first_name} {guest?.last_name}</p>
                        <p className="text-xs text-stone-400">{guest?.nationality} · {booking.adults + booking.children} Pers.</p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-stone-700">{property?.name}</p>
                        <p className="text-xs text-stone-400">{room?.name}</p>
                      </td>
                      <td className="px-5 py-3 text-stone-600">{formatDate(booking.check_in)}</td>
                      <td className="px-5 py-3 text-stone-600">{formatDate(booking.check_out)}</td>
                      <td className="px-5 py-3 text-center text-stone-700 font-medium">{nights}</td>
                      <td className="px-5 py-3">
                        <p className="font-semibold text-stone-900">{formatCurrency(booking.total_amount)}</p>
                        {outstanding > 0 && (
                          <p className="text-xs text-amber-600 font-medium">{formatCurrency(outstanding)} offen</p>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs text-stone-500">{sourceConfig[booking.source]}</span>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <Button variant="ghost" size="sm">Details</Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-stone-400">
                <CalendarDays className="h-8 w-8 mb-2" />
                <p className="text-sm">Keine Buchungen gefunden</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
