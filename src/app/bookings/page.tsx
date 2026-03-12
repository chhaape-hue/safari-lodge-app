"use client"

import { useState } from "react"
import { Topbar } from "@/components/layout/topbar"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookingForm } from "@/components/modules/booking-form"
import { useStore } from "@/lib/store"
import { formatCurrency, formatDate, getDaysBetween } from "@/lib/utils"
import { Plus, Search, RefreshCw, CalendarDays, Trash2, CheckCircle2 } from "lucide-react"

const statusConfig = {
  confirmed:   { label: "Bestätigt",   variant: "info" as const },
  checked_in:  { label: "Eingecheckt", variant: "success" as const },
  checked_out: { label: "Ausgecheckt", variant: "neutral" as const },
  pending:     { label: "Ausstehend",  variant: "warning" as const },
  cancelled:   { label: "Storniert",   variant: "danger" as const },
  no_show:     { label: "No-Show",     variant: "danger" as const },
}

const sourceLabel: Record<string, string> = {
  nightsbridge: "Nightsbridge", direct: "Direkt", agent: "Reisebüro",
  email: "E-Mail", phone: "Telefon", walk_in: "Walk-in",
}

export default function BookingsPage() {
  const { bookings, guests, properties, rooms, updateBooking, deleteBooking } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filtered = bookings.filter(b => {
    const guest = guests.find(g => g.id === b.guest_id)
    const matchesSearch = !search ||
      b.booking_reference.toLowerCase().includes(search.toLowerCase()) ||
      `${guest?.first_name} ${guest?.last_name}`.toLowerCase().includes(search.toLowerCase())
    return matchesSearch && (statusFilter === "all" || b.status === statusFilter)
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const totalRevenue = filtered.reduce((s, b) => s + b.total_amount, 0)
  const totalPaid = filtered.reduce((s, b) => s + b.paid_amount, 0)

  return (
    <div>
      <Topbar title="Buchungen" subtitle={`${bookings.length} Buchungen gesamt`}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm"><RefreshCw className="h-3.5 w-3.5" /> NB Sync</Button>
            <Button size="sm" onClick={() => setShowForm(true)}><Plus className="h-3.5 w-3.5" /> Neue Buchung</Button>
          </div>
        }
      />
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Gesamt", value: bookings.length, color: "text-stone-900" },
            { label: "Eingecheckt", value: bookings.filter(b => b.status === "checked_in").length, color: "text-[#4A7C59]" },
            { label: "Bestätigt", value: bookings.filter(b => b.status === "confirmed").length, color: "text-[#6B4226]" },
            { label: "Ausstehend", value: bookings.filter(b => b.status === "pending").length, color: "text-amber-600" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm">
              <p className="text-xs text-stone-500">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
            <input type="text" placeholder="Referenz oder Gastname..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#6B4226] w-64" />
          </div>
          <div className="flex gap-1 flex-wrap">
            {["all","confirmed","checked_in","pending","cancelled"].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  statusFilter === s ? "bg-[#6B4226] text-white" : "bg-white border border-stone-300 text-stone-600 hover:bg-stone-50"
                }`}>
                {s === "all" ? "Alle" : statusConfig[s as keyof typeof statusConfig]?.label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex gap-3 text-sm flex-wrap">
            <span className="text-stone-600">Umsatz: <strong>{formatCurrency(totalRevenue)}</strong></span>
            <span className="text-[#4A7C59]">Bezahlt: <strong>{formatCurrency(totalPaid)}</strong></span>
            {totalRevenue - totalPaid > 0 && <span className="text-amber-600">Offen: <strong>{formatCurrency(totalRevenue - totalPaid)}</strong></span>}
          </div>
        </div>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-xs text-stone-500 uppercase tracking-wider">
                  {["Referenz","Gast","Property / Zimmer","Check-in","Check-out","N","Betrag","Quelle","Status",""].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filtered.map(booking => {
                  const guest = guests.find(g => g.id === booking.guest_id)
                  const property = properties.find(p => p.id === booking.property_id)
                  const room = rooms.find(r => r.id === booking.room_id)
                  const nights = getDaysBetween(new Date(booking.check_in), new Date(booking.check_out))
                  const status = statusConfig[booking.status]
                  const outstanding = booking.total_amount - booking.paid_amount
                  return (
                    <tr key={booking.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-5 py-3">
                        <span className="font-mono text-xs text-stone-600">{booking.booking_reference}</span>
                        {booking.nightsbridge_booking_id && <p className="text-xs text-blue-500 mt-0.5">NB: {booking.nightsbridge_booking_id}</p>}
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-stone-900">{guest?.first_name} {guest?.last_name}</p>
                        <p className="text-xs text-stone-400">{guest?.nationality} · {booking.adults + booking.children} Pers.</p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-xs font-medium text-stone-700">{property?.name}</p>
                        <p className="text-xs text-stone-400">{room?.name}</p>
                      </td>
                      <td className="px-5 py-3 text-stone-600 whitespace-nowrap">{formatDate(booking.check_in)}</td>
                      <td className="px-5 py-3 text-stone-600 whitespace-nowrap">{formatDate(booking.check_out)}</td>
                      <td className="px-5 py-3 text-center font-bold text-stone-700">{nights}</td>
                      <td className="px-5 py-3">
                        <p className="font-semibold text-stone-900">{formatCurrency(booking.total_amount)}</p>
                        {outstanding > 0 && <p className="text-xs text-amber-600">{formatCurrency(outstanding)} offen</p>}
                      </td>
                      <td className="px-5 py-3 text-xs text-stone-500">{sourceLabel[booking.source]}</td>
                      <td className="px-5 py-3"><Badge variant={status.variant}>{status.label}</Badge></td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1 items-center">
                          {booking.status === "confirmed" && (
                            <button onClick={() => updateBooking(booking.id, { status: "checked_in" })} title="Einchecken"
                              className="p-1.5 rounded-lg text-[#4A7C59] hover:bg-green-50 transition-colors">
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                          )}
                          {booking.status === "checked_in" && (
                            <button onClick={() => updateBooking(booking.id, { status: "checked_out" })}
                              className="px-2 py-1 rounded-lg text-xs font-medium text-stone-500 hover:bg-stone-100">
                              Out
                            </button>
                          )}
                          <button onClick={() => { if (confirm("Buchung löschen?")) deleteBooking(booking.id) }}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-stone-400">
                <CalendarDays className="h-8 w-8 mb-2" />
                <p className="text-sm font-medium">Keine Buchungen gefunden</p>
                <Button size="sm" className="mt-4" onClick={() => setShowForm(true)}>
                  <Plus className="h-3.5 w-3.5" /> Erste Buchung anlegen
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
      {showForm && <BookingForm onClose={() => setShowForm(false)} />}
    </div>
  )
}
