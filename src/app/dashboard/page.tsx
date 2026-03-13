"use client"

import { useMemo } from "react"
import { Topbar } from "@/components/layout/topbar"
import { StatCard } from "@/components/ui/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageLoader } from "@/components/ui/loading-spinner"
import {
  Building2, CalendarDays, DollarSign, Users,
  TrendingUp, ArrowRight, AlertCircle
} from "lucide-react"
import { useStore } from "@/lib/store"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "danger" | "info" | "neutral" }> = {
  confirmed: { label: "Confirmed", variant: "info" },
  checked_in: { label: "Checked In", variant: "success" },
  checked_out: { label: "Checked Out", variant: "neutral" },
  pending: { label: "Pending", variant: "warning" },
  cancelled: { label: "Cancelled", variant: "danger" },
  no_show: { label: "No Show", variant: "danger" },
}

const costCategoryLabels: Record<string, string> = {
  staff: "Staff",
  food_beverage: "Food & Beverage",
  logistics: "Logistics",
  maintenance: "Maintenance",
  utilities: "Utilities",
  marketing: "Marketing",
  insurance: "Insurance",
  other: "Other",
}

export default function DashboardPage() {
  const { bookings, properties, rooms, guests, costs, staff, loading, error } = useStore()

  const today = new Date()
  const todayStr = today.toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  const recentBookings = useMemo(() =>
    bookings
      .filter(b => b.status === "confirmed" || b.status === "checked_in" || b.status === "pending")
      .sort((a, b) => new Date(a.check_in).getTime() - new Date(b.check_in).getTime())
      .slice(0, 5),
    [bookings]
  )

  const activeProperties = useMemo(() => properties.filter(p => p.status === "active"), [properties])

  const roomsByProperty = useMemo(() =>
    rooms.reduce((acc, room) => {
      if (!acc[room.property_id]) acc[room.property_id] = []
      acc[room.property_id].push(room)
      return acc
    }, {} as Record<string, typeof rooms>),
    [rooms]
  )

  // Current month stats
  const monthBookings = useMemo(() =>
    bookings.filter(b => {
      const d = new Date(b.check_in)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    }),
    [bookings, currentMonth, currentYear]
  )

  const revenueThisMonth = useMemo(() =>
    monthBookings
      .filter(b => b.status !== "cancelled")
      .reduce((sum, b) => sum + Number(b.total_amount), 0),
    [monthBookings]
  )

  const costsThisMonth = useMemo(() =>
    costs
      .filter(c => {
        const d = new Date(c.date)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
      })
      .reduce((sum, c) => sum + Number(c.amount), 0),
    [costs, currentMonth, currentYear]
  )

  // Occupancy: rooms currently occupied vs total
  const occupancyRate = useMemo(() => {
    if (rooms.length === 0) return 0
    const occupied = rooms.filter(r => r.status === "occupied").length
    return Math.round((occupied / rooms.length) * 100)
  }, [rooms])

  const activeStaff = useMemo(() => staff.filter(s => s.status === "active").length, [staff])

  // Costs by category this month
  const costsByCategory = useMemo(() => {
    const map: Record<string, number> = {}
    costs
      .filter(c => {
        const d = new Date(c.date)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
      })
      .forEach(c => {
        map[c.category] = (map[c.category] || 0) + Number(c.amount)
      })
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 4)
  }, [costs, currentMonth, currentYear])

  const monthLabel = today.toLocaleDateString("en-GB", { month: "long" })

  return (
    <div>
      <Topbar
        title="Dashboard"
        subtitle={todayStr}
        actions={
          <Link href="/bookings/new">
            <Button size="sm">
              <CalendarDays className="h-3.5 w-3.5" />
              New Booking
            </Button>
          </Link>
        }
      />

      {loading && <PageLoader message="Loading dashboard data..." />}

      {error && (
        <div className="mx-6 mt-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {!loading && <div className="p-6 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Occupancy"
            value={`${occupancyRate}%`}
            subtitle="Currently occupied"
            icon={TrendingUp}
            color="amber"
          />
          <StatCard
            title={`Bookings (${monthLabel})`}
            value={monthBookings.length}
            subtitle="This month"
            icon={CalendarDays}
            color="blue"
          />
          <StatCard
            title={`Revenue (${monthLabel})`}
            value={formatCurrency(revenueThisMonth)}
            subtitle="This month"
            icon={DollarSign}
            color="green"
          />
          <StatCard
            title="Active Staff"
            value={activeStaff}
            subtitle={`${properties.length} Properties`}
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
                  <CardTitle>Recent Bookings</CardTitle>
                  <Link href="/bookings">
                    <Button variant="ghost" size="sm">
                      View all <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {recentBookings.length === 0 ? (
                  <p className="text-sm text-stone-500 px-6 py-8 text-center">No active bookings</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-100 text-xs text-stone-500 uppercase tracking-wider">
                        <th className="px-6 py-3 text-left font-medium">Reference</th>
                        <th className="px-6 py-3 text-left font-medium">Guest</th>
                        <th className="px-6 py-3 text-left font-medium">Check-in</th>
                        <th className="px-6 py-3 text-left font-medium">Check-out</th>
                        <th className="px-6 py-3 text-left font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {recentBookings.map((booking) => {
                        const guest = guests.find(g => g.id === booking.guest_id)
                        const property = properties.find(p => p.id === booking.property_id)
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
                              {status && <Badge variant={status.variant}>{status.label}</Badge>}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Property Status */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Room Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeProperties.length === 0 ? (
                  <p className="text-sm text-stone-500 text-center py-2">No active properties</p>
                ) : activeProperties.map((property) => {
                  const propRooms = roomsByProperty[property.id] || []
                  const available = propRooms.filter(r => r.status === "available").length
                  const occupied = propRooms.filter(r => r.status === "occupied").length
                  const maintenance = propRooms.filter(r => r.status === "maintenance").length
                  return (
                    <div key={property.id}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-stone-800 truncate">{property.name}</p>
                        <span className="text-xs text-stone-500">{propRooms.length} Zimmer</span>
                      </div>
                      {propRooms.length > 0 && (
                        <>
                          <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                            {occupied > 0 && (
                              <div className="bg-amber-500 rounded-full" style={{ width: `${(occupied / propRooms.length) * 100}%` }} />
                            )}
                            {available > 0 && (
                              <div className="bg-green-400 rounded-full" style={{ width: `${(available / propRooms.length) * 100}%` }} />
                            )}
                            {maintenance > 0 && (
                              <div className="bg-red-400 rounded-full" style={{ width: `${(maintenance / propRooms.length) * 100}%` }} />
                            )}
                          </div>
                          <div className="flex gap-3 mt-1.5">
                            <span className="text-xs text-stone-500">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 mr-1" />{occupied} occupied
                            </span>
                            <span className="text-xs text-stone-500">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 mr-1" />{available} free
                            </span>
                            {maintenance > 0 && (
                              <span className="text-xs text-stone-500">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 mr-1" />{maintenance} maintenance
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Costs ({monthLabel})</CardTitle>
              </CardHeader>
              <CardContent>
                {costsByCategory.length === 0 ? (
                  <p className="text-sm text-stone-500 text-center py-2">No costs this month</p>
                ) : (
                  <div className="space-y-3">
                    {costsByCategory.map(([cat, amount]) => (
                      <div key={cat} className="flex justify-between text-sm">
                        <span className="text-stone-600">{costCategoryLabels[cat] || cat}</span>
                        <span className="font-medium">{formatCurrency(amount)}</span>
                      </div>
                    ))}
                    <div className="border-t border-stone-100 pt-2 flex justify-between text-sm font-semibold">
                      <span>Total</span>
                      <span>{formatCurrency(costsThisMonth)}</span>
                    </div>
                  </div>
                )}
                <Link href="/costs">
                  <Button variant="ghost" size="sm" className="w-full mt-3">
                    View details <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>}
    </div>
  )
}
