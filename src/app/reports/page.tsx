"use client"

import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"
import { Button } from "@/components/ui/button"
import { DEMO_STATS, DEMO_COSTS, DEMO_BOOKINGS, DEMO_PROPERTIES } from "@/lib/demo-data"
import { formatCurrency } from "@/lib/utils"
import { BarChart3, TrendingUp, DollarSign, Download, Calendar } from "lucide-react"

const monthlyRevenue = [
  { month: "Okt", revenue: 85000, costs: 62000 },
  { month: "Nov", revenue: 92000, costs: 64000 },
  { month: "Dez", revenue: 120000, costs: 71000 },
  { month: "Jan", revenue: 98000, costs: 68000 },
  { month: "Feb", revenue: 103000, costs: 72000 },
  { month: "Mär", revenue: 109600, costs: 80700 },
]

const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue))

export default function ReportsPage() {
  const netProfit = DEMO_STATS.revenueThisMonth - DEMO_STATS.costsThisMonth
  const profitMargin = ((netProfit / DEMO_STATS.revenueThisMonth) * 100).toFixed(1)

  return (
    <div>
      <Topbar
        title="Berichte & Auswertungen"
        subtitle="Finanzübersicht und KPIs"
        actions={
          <div className="flex gap-2">
            <select className="text-sm border border-stone-300 rounded-lg px-3 py-1.5 bg-white text-stone-700">
              <option>März 2025</option>
              <option>Februar 2025</option>
              <option>Januar 2025</option>
            </select>
            <Button variant="secondary" size="sm">
              <Download className="h-3.5 w-3.5" />
              Export PDF
            </Button>
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Umsatz (März)"
            value={formatCurrency(DEMO_STATS.revenueThisMonth)}
            icon={TrendingUp}
            trend={{ value: 12.5, label: "ggü. Feb." }}
            color="green"
          />
          <StatCard
            title="Gesamtkosten (März)"
            value={formatCurrency(DEMO_STATS.costsThisMonth)}
            icon={DollarSign}
            trend={{ value: -2.1, label: "ggü. Feb." }}
            color="rose"
          />
          <StatCard
            title="Nettogewinn (März)"
            value={formatCurrency(netProfit)}
            subtitle={`Marge: ${profitMargin}%`}
            icon={BarChart3}
            color="amber"
          />
          <StatCard
            title="Auslastung (März)"
            value={`${DEMO_STATS.occupancyRate}%`}
            icon={Calendar}
            trend={{ value: 8.2, label: "ggü. Feb." }}
            color="blue"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue vs Costs Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Umsatz vs. Kosten (6 Monate)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {monthlyRevenue.map(data => (
                  <div key={data.month} className="space-y-1">
                    <div className="flex justify-between text-xs text-stone-500">
                      <span className="font-medium text-stone-700">{data.month}</span>
                      <span className="text-green-700">{formatCurrency(data.revenue - data.costs)} Gewinn</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-stone-400 w-12">Umsatz</span>
                        <div className="flex-1 h-3 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-400 rounded-full"
                            style={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-stone-700 w-20 text-right">
                          {formatCurrency(data.revenue)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-stone-400 w-12">Kosten</span>
                        <div className="flex-1 h-3 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-rose-400 rounded-full"
                            style={{ width: `${(data.costs / maxRevenue) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-stone-700 w-20 text-right">
                          {formatCurrency(data.costs)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Revenue by Property */}
          <Card>
            <CardHeader>
              <CardTitle>Umsatz nach Property</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { property: "O Bona Moremi Safari Lodge", revenue: 72000, bookings: 5 },
                  { property: "Houseboat Okavango Dream", revenue: 22400, bookings: 2 },
                  { property: "Houseboat Delta Queen", revenue: 15200, bookings: 1 },
                  { property: "Nkasa Plains Camp", revenue: 0, bookings: 0 },
                ].map(item => (
                  <div key={item.property}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-stone-700 font-medium truncate">{item.property}</span>
                      <span className="font-semibold text-stone-900 ml-2 whitespace-nowrap">
                        {formatCurrency(item.revenue)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${(item.revenue / 72000) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-stone-400">{item.bookings} Buchungen</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-stone-900">{formatCurrency(DEMO_STATS.revenueThisMonth)}</p>
                    <p className="text-xs text-stone-500">Gesamtumsatz</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-stone-900">{DEMO_STATS.bookingsThisMonth}</p>
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
        </div>

        {/* Occupancy by property */}
        <Card>
          <CardHeader>
            <CardTitle>Auslastung nach Property – März 2025</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: "O Bona Moremi", pct: 62.5, rooms: 8, nights: 30 },
                { name: "Okavango Dream", pct: 35, rooms: 4, nights: 30 },
                { name: "Delta Queen", pct: 20, rooms: 2, nights: 30 },
                { name: "Nkasa Plains", pct: 0, rooms: 0, nights: 30 },
              ].map(item => (
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
                  <p className="mt-2 text-sm font-medium text-stone-700">{item.name}</p>
                  <p className="text-xs text-stone-400">{item.rooms} Zimmer</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
