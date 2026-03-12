"use client"

import { Topbar } from "@/components/layout/topbar"
import { StatCard } from "@/components/ui/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Building2, CalendarDays, DollarSign, Users,
  TrendingUp, BedDouble, AlertCircle, CheckCircle2,
  Clock, ArrowRight
} from "lucide-react"
import { DEMO_STATS, DEMO_BOOKINGS, DEMO_PROPERTIES, DEMO_ROOMS, DEMO_GUESTS } from "@/lib/demo-data"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "danger" | "info" | "neutral" }> = {
  confirmed: { label: "Bestätigt", variant: "info" },
  checked_in: { label: "Eingecheckt", variant: "success" },
  checked_out: { label: "Ausgecheckt", variant: "neutral" },
  pending: { label: "Ausstehend", variant: "warning" },
  cancelled: { label: "Storniert", variant: "danger" },
  no_show: { label: "No-Show", variant: "danger" },
}

const roomStatusConfig: Record<string, { label: string; color: string }> = {
  available: { label: "Verfügbar", color: "bg-green-400" },
  occupied: { label: "Belegt", color: "bg-amber-500" },
  maintenance: { label: "Wartung", color: "bg-red-400" },
  blocked: { label: "Gesperrt", color: "bg-stone-400" },
}

export default function DashboardPage() {
  const today = new Date()
  const todayStr = today.toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })

  const upcomingBookings = DEMO_BOOKINGS
    .filter(b => b.status === "confirmed" || b.status === "checked_in")
    .slice(0, 5)

  const activeProperties = DEMO_PROPERTIES.filter(p => p.status === "active")
  const roomsByProperty = DEMO_ROOMS.reduce((acc, room) => {
    if (!acc[room.property_id]) acc[room.property_id] = []
    acc[room.property_id].push(room)
    return acc
  }, {} as Record<string, typeof DEMO_ROOMS>)

  return (
    <div>
      <Topbar
        title="Dashboard"
        subtitle={todayStr}
        actions={
          <Link href="/bookings/new">
            <Button size="sm">
              <CalendarDays className="h-3.5 w-3.5" />
              Neue Buchung
            </Button>
          </Link>
        }
      />

      <div className="p-6 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Auslastung"
            value={`${DEMO_STATS.occupancyRate}%`}
            subtitle="Aktuell belegt"
            icon={TrendingUp}
            trend={{ value: 8.2, label: "ggü. letztem Monat" }}
            color="amber"
          />
          <StatCard
            title="Buchungen (März)"
            value={DEMO_STATS.bookingsThisMonth}
            subtitle="Diesen Monat"
            icon={CalendarDays}
            color="blue"
          />
          <StatCard
            title="Umsatz (März)"
            value={formatCurrency(DEMO_STATS.revenueThisMonth)}
            subtitle="Diesen Monat"
            icon={DollarSign}
            trend={{ value: 12.5, label: "ggü. letztem Monat" }}
            color="green"
          />
          <StatCard
            title="Aktives Personal"
            value={DEMO_STATS.activeStaff}
            subtitle={`${DEMO_STATS.totalProperties} Properties`}
            icon={Users}
            color="stone"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Aktuelle Buchungen</CardTitle>
                  <Link href="/bookings">
                    <Button variant="ghost" size="sm">
                      Alle anzeigen <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100 text-xs text-stone-500 uppercase tracking-wider">
                      <th className="px-6 py-3 text-left font-medium">Referenz</th>
                      <th className="px-6 py-3 text-left font-medium">Gast</th>
                      <th className="px-6 py-3 text-left font-medium">Check-in</th>
                      <th className="px-6 py-3 text-left font-medium">Check-out</th>
                      <th className="px-6 py-3 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {upcomingBookings.map((booking) => {
                      const guest = DEMO_GUESTS.find(g => g.id === booking.guest_id)
                      const property = DEMO_PROPERTIES.find(p => p.id === booking.property_id)
                      const status = statusConfig[booking.status]
                      return (
                        <tr key={booking.id} className="hover:bg-stone-50 transition-colors">
                          <td className="px-6 py-3 font-mono text-xs text-stone-600">{booking.booking_reference}</td>
                          <td className="px-6 py-3 font-medium text-stone-900">
                            {guest?.first_name} {guest?.last_name}
                            <p className="text-xs text-stone-400 font-normal">{property?.name}</p>
                          </td>
                          <td className="px-6 py-3 text-stone-600">{formatDate(booking.check_in)}</td>
                          <td className="px-6 py-3 text-stone-600">{formatDate(booking.check_out)}</td>
                          <td className="px-6 py-3">
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* Property Status */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Zimmerstatus</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeProperties.map((property) => {
                  const rooms = roomsByProperty[property.id] || []
                  const available = rooms.filter(r => r.status === "available").length
                  const occupied = rooms.filter(r => r.status === "occupied").length
                  const maintenance = rooms.filter(r => r.status === "maintenance").length
                  return (
                    <div key={property.id}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-stone-800 truncate">{property.name}</p>
                        <span className="text-xs text-stone-500">{rooms.length} Zimmer</span>
                      </div>
                      <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                        {occupied > 0 && (
                          <div
                            className="bg-amber-500 rounded-full"
                            style={{ width: `${(occupied / rooms.length) * 100}%` }}
                          />
                        )}
                        {available > 0 && (
                          <div
                            className="bg-green-400 rounded-full"
                            style={{ width: `${(available / rooms.length) * 100}%` }}
                          />
                        )}
                        {maintenance > 0 && (
                          <div
                            className="bg-red-400 rounded-full"
                            style={{ width: `${(maintenance / rooms.length) * 100}%` }}
                          />
                        )}
                      </div>
                      <div className="flex gap-3 mt-1.5">
                        <span className="text-xs text-stone-500">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 mr-1" />
                          {occupied} belegt
                        </span>
                        <span className="text-xs text-stone-500">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 mr-1" />
                          {available} frei
                        </span>
                        {maintenance > 0 && (
                          <span className="text-xs text-stone-500">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 mr-1" />
                            {maintenance} Wartung
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kosten (März)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">Personal</span>
                    <span className="font-medium">{formatCurrency(60500)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">Lebensmittel</span>
                    <span className="font-medium">{formatCurrency(8200)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">Logistik</span>
                    <span className="font-medium">{formatCurrency(4500)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">Sonstiges</span>
                    <span className="font-medium">{formatCurrency(7500)}</span>
                  </div>
                  <div className="border-t border-stone-100 pt-2 flex justify-between text-sm font-semibold">
                    <span>Gesamt</span>
                    <span>{formatCurrency(DEMO_STATS.costsThisMonth)}</span>
                  </div>
                </div>
                <Link href="/costs">
                  <Button variant="ghost" size="sm" className="w-full mt-3">
                    Details <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
