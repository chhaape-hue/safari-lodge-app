"use client"

import { useMemo } from "react"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import { formatCurrency } from "@/lib/utils"
import { BarChart3, TrendingUp, DollarSign, Calendar } from "lucide-react"

const costCategoryLabels: Record<string, string> = {
  staff: "Personal",
  food_beverage: "Lebensmittel",
  logistics: "Logistik",
  maintenance: "Wartung",
  utilities: "Nebenkosten",
  marketing: "Marketing",
  insurance: "Versicherung",
  other: "Sonstiges",
}

export default function ReportsPage() {
  const { bookings, costs, properties, rooms } = useStore()

  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  const monthLabel = today.toLocaleDateString("de-DE", { month: "long", year: "numeric" })

  const monthBookings = useMemo(() =>
    bookings.filter(b => {
      const d = new Date(b.check_in)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && b.status !== "cancelled"
    }),
    [bookings, currentMonth, currentYear]
  )

  const revenueThisMonth = useMemo(() =>
    monthBookings.reduce((sum, b) => sum + Number(b.total_amount), 0),
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

  const netProfit = revenueThisMonth - costsThisMonth
  const profitMargin = revenueThisMonth > 0
    ? ((netProfit / revenueThisMonth) * 100).toFixed(1)
    : "0.0"

  // Occupancy rate for current month
  const occupancyRate = useMemo(() => {
    if (rooms.length === 0) return 0
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const totalRoomNights = rooms.length * daysInMonth
    const bookedNights = monthBookings.reduce((sum, b) => {
      const checkIn = new Date(b.check_in)
      const checkOut = new Date(b.check_out)
      const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
      return sum + nights
    }, 0)
    return totalRoomNights > 0 ? Math.round((bookedNights / totalRoomNights) * 100) : 0
  }, [rooms, monthBookings, currentMonth, currentYear])

  // Revenue by property
  const revenueByProperty = useMemo(() =>
    properties.map(p => {
      const rev = monthBookings
        .filter(b => b.property_id === p.id)
        .reduce((sum, b) => sum + Number(b.total_amount), 0)
      const count = monthBookings.filter(b => b.property_id === p.id).length
      return { id: p.id, name: p.name, revenue: rev, bookings: count }
    }).sort((a, b) => b.revenue - a.revenue),
    [properties, monthBookings]
  )

  const maxPropertyRevenue = Math.max(...revenueByProperty.map(p => p.revenue), 1)

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
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [costs, currentMonth, currentYear])

  const maxCost = Math.max(...costsByCategory.map(([, v]) => v), 1)

  // Occupancy by property this month
  const occupancyByProperty = useMemo(() =>
    properties.map(p => {
      const propRooms = rooms.filter(r => r.property_id === p.id)
      if (propRooms.length === 0) return { name: p.name, pct: 0, rooms: 0 }
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
      const totalRoomNights = propRooms.length * daysInMonth
      const bookedNights = monthBookings
        .filter(b => b.property_id === p.id)
        .reduce((sum, b) => {
          const checkIn = new Date(b.check_in)
          const checkOut = new Date(b.check_out)
          return sum + Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
        }, 0)
      return {
        name: p.name,
        pct: Math.min(100, Math.round((bookedNights / totalRoomNights) * 100)),
        rooms: propRooms.length,
      }
    }),
    [properties, rooms, monthBookings, currentMonth, currentYear]
  )

  return (
    <div>
      <Topbar
        title="Berichte & Auswertungen"
        subtitle="Finanzübersicht und KPIs"
      />

      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={`Umsatz (${monthLabel})`}
            value={formatCurrency(revenueThisMonth)}
            icon={TrendingUp}
            color="green"
          />
          <StatCard
            title={`Gesamtkosten (${monthLabel})`}
            value={formatCurrency(costsThisMonth)}
            icon={DollarSign}
            color="rose"
          />
          <StatCard
            title={`Nettogewinn (${monthLabel})`}
            value={formatCurrency(netProfit)}
            subtitle={`Marge: ${profitMargin}%`}
            icon={BarChart3}
            color="amber"
          />
          <StatCard
            title={`Auslastung (${monthLabel})`}
            value={`${occupancyRate}%`}
            icon={Calendar}
            color="blue"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue by Property */}
          <Card>
            <CardHeader>
              <CardTitle>Umsatz nach Property</CardTitle>
            </CardHeader>
            <CardContent>
              {revenueByProperty.length === 0 ? (
                <p className="text-sm text-stone-500 text-center py-4">Keine Daten verfügbar</p>
              ) : (
                <div className="space-y-4">
                  {revenueByProperty.map(item => (
                    <div key={item.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-stone-700 font-medium truncate">{item.name}</span>
                        <span className="font-semibold text-stone-900 ml-2 whitespace-nowrap">
                          {formatCurrency(item.revenue)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${(item.revenue / maxPropertyRevenue) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-stone-400">{item.bookings} Buchungen</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-stone-100">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-stone-900">{formatCurrency(revenueThisMonth)}</p>
                    <p className="text-xs text-stone-500">Gesamtumsatz</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-stone-900">{monthBookings.length}</p>
                    <p className="text-xs text-stone-500">Buchungen</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-700">{profitMargin}%</p>
                    <p className="text-xs text-stone-500">Marge</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Costs by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Kosten nach Kategorie</CardTitle>
            </CardHeader>
            <CardContent>
              {costsByCategory.length === 0 ? (
                <p className="text-sm text-stone-500 text-center py-4">Keine Kosten diesen Monat</p>
              ) : (
                <div className="space-y-3">
                  {costsByCategory.map(([cat, amount]) => (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs text-stone-500">
                        <span className="font-medium text-stone-700">{costCategoryLabels[cat] || cat}</span>
                        <span>{formatCurrency(amount)}</span>
                      </div>
                      <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-400 rounded-full"
                          style={{ width: `${(amount / maxCost) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-stone-100 pt-2 flex justify-between text-sm font-semibold">
                    <span>Gesamt</span>
                    <span>{formatCurrency(costsThisMonth)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Occupancy by Property */}
        <Card>
          <CardHeader>
            <CardTitle>Auslastung nach Property – {monthLabel}</CardTitle>
          </CardHeader>
          <CardContent>
            {occupancyByProperty.length === 0 ? (
              <p className="text-sm text-stone-500 text-center py-4">Keine Properties vorhanden</p>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {occupancyByProperty.map(item => (
                  <div key={item.name} className="text-center">
                    <div className="relative inline-flex items-center justify-center">
                      <svg className="h-20 w-20 -rotate-90">
                        <circle cx="40" cy="40" r="32" fill="none" stroke="#f5f5f4" strokeWidth="8" />
                        <circle
                          cx="40" cy="40" r="32" fill="none"
                          stroke={item.pct > 50 ? "#d97706" : item.pct > 20 ? "#f59e0b" : "#d6d3d1"}
                          strokeWidth="8"
                          strokeDasharray={`${(item.pct / 100) * 201} 201`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-lg font-bold text-stone-900">{item.pct}%</span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-stone-700 truncate">{item.name}</p>
                    <p className="text-xs text-stone-400">{item.rooms} Zimmer</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
