"use client"

import { useState } from "react"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/ui/stat-card"
import { DEMO_COSTS, DEMO_PROPERTIES } from "@/lib/demo-data"
import { formatCurrency, formatDate } from "@/lib/utils"
import { DollarSign, TrendingDown, Plus, Filter, Users, ShoppingCart, Truck, Wrench, Zap, Megaphone } from "lucide-react"
import type { CostCategory } from "@/types"

const categoryConfig: Record<CostCategory, { label: string; icon: React.ReactNode; color: string }> = {
  staff: { label: "Personal", icon: <Users className="h-3.5 w-3.5" />, color: "bg-blue-100 text-blue-700" },
  food_beverage: { label: "Lebensmittel & Getränke", icon: <ShoppingCart className="h-3.5 w-3.5" />, color: "bg-green-100 text-green-700" },
  logistics: { label: "Logistik & Transport", icon: <Truck className="h-3.5 w-3.5" />, color: "bg-amber-100 text-amber-700" },
  maintenance: { label: "Wartung & Reparatur", icon: <Wrench className="h-3.5 w-3.5" />, color: "bg-orange-100 text-orange-700" },
  utilities: { label: "Energie & Wasser", icon: <Zap className="h-3.5 w-3.5" />, color: "bg-yellow-100 text-yellow-700" },
  marketing: { label: "Marketing", icon: <Megaphone className="h-3.5 w-3.5" />, color: "bg-purple-100 text-purple-700" },
  insurance: { label: "Versicherung", icon: <DollarSign className="h-3.5 w-3.5" />, color: "bg-stone-100 text-stone-700" },
  other: { label: "Sonstiges", icon: <DollarSign className="h-3.5 w-3.5" />, color: "bg-stone-100 text-stone-600" },
}

const frequencyLabel: Record<string, string> = {
  once: "Einmalig",
  daily: "Täglich",
  weekly: "Wöchentlich",
  monthly: "Monatlich",
  annually: "Jährlich",
}

export default function CostsPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [propertyFilter, setPropertyFilter] = useState<string>("all")

  const filtered = DEMO_COSTS.filter(c => {
    const matchesCat = categoryFilter === "all" || c.category === categoryFilter
    const matchesProp = propertyFilter === "all" || c.property_id === propertyFilter
    return matchesCat && matchesProp
  })

  const totalCosts = filtered.reduce((sum, c) => sum + c.amount, 0)
  const staffCosts = DEMO_COSTS.filter(c => c.category === "staff").reduce((s, c) => s + c.amount, 0)
  const foodCosts = DEMO_COSTS.filter(c => c.category === "food_beverage").reduce((s, c) => s + c.amount, 0)
  const logisticsCosts = DEMO_COSTS.filter(c => c.category === "logistics").reduce((s, c) => s + c.amount, 0)

  // Category breakdown
  const categoryTotals = DEMO_COSTS.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + c.amount
    return acc
  }, {} as Record<string, number>)
  const grandTotal = Object.values(categoryTotals).reduce((s, v) => s + v, 0)

  return (
    <div>
      <Topbar
        title="Kosten & Finanzen"
        subtitle="Ausgaben nach Kategorie, Property und Zeitraum"
        actions={
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" />
            Kosten eintragen
          </Button>
        }
      />

      <div className="p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Gesamtkosten (März)" value={formatCurrency(grandTotal)} icon={DollarSign} color="rose" />
          <StatCard title="Personal" value={formatCurrency(staffCosts)} subtitle={`${((staffCosts/grandTotal)*100).toFixed(1)}% der Gesamtkosten`} icon={Users} color="blue" />
          <StatCard title="Lebensmittel" value={formatCurrency(foodCosts)} icon={ShoppingCart} color="green" />
          <StatCard title="Logistik" value={formatCurrency(logisticsCosts)} icon={Truck} color="amber" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Nach Kategorie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(Object.entries(categoryTotals) as [CostCategory, number][])
                .sort((a, b) => b[1] - a[1])
                .map(([cat, amount]) => {
                  const config = categoryConfig[cat]
                  const pct = ((amount / grandTotal) * 100).toFixed(1)
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${config.color}`}>
                          {config.icon}
                          {config.label}
                        </span>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-stone-800">{formatCurrency(amount)}</span>
                          <span className="text-xs text-stone-400 ml-1">{pct}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </CardContent>
          </Card>

          {/* Cost Entries Table */}
          <div className="lg:col-span-2 space-y-3">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <select
                value={propertyFilter}
                onChange={e => setPropertyFilter(e.target.value)}
                className="text-sm border border-stone-300 rounded-lg px-3 py-1.5 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">Alle Properties</option>
                {DEMO_PROPERTIES.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="text-sm border border-stone-300 rounded-lg px-3 py-1.5 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">Alle Kategorien</option>
                {(Object.entries(categoryConfig) as [CostCategory, typeof categoryConfig[CostCategory]][]).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>

            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100 text-xs text-stone-500 uppercase tracking-wider">
                      <th className="px-5 py-3 text-left font-medium">Datum</th>
                      <th className="px-5 py-3 text-left font-medium">Beschreibung</th>
                      <th className="px-5 py-3 text-left font-medium">Kategorie</th>
                      <th className="px-5 py-3 text-left font-medium">Property</th>
                      <th className="px-5 py-3 text-left font-medium">Frequenz</th>
                      <th className="px-5 py-3 text-right font-medium">Betrag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {filtered.map((cost) => {
                      const property = DEMO_PROPERTIES.find(p => p.id === cost.property_id)
                      const config = categoryConfig[cost.category]
                      return (
                        <tr key={cost.id} className="hover:bg-stone-50 transition-colors">
                          <td className="px-5 py-3 text-stone-600 whitespace-nowrap">{formatDate(cost.date)}</td>
                          <td className="px-5 py-3">
                            <p className="text-stone-800 font-medium">{cost.description}</p>
                            {cost.supplier && <p className="text-xs text-stone-400">{cost.supplier}</p>}
                            {cost.invoice_number && <p className="text-xs text-stone-400">{cost.invoice_number}</p>}
                          </td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${config.color}`}>
                              {config.icon}
                              {config.label}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-xs text-stone-500">{property?.name || "–"}</td>
                          <td className="px-5 py-3 text-xs text-stone-500">{frequencyLabel[cost.frequency]}</td>
                          <td className="px-5 py-3 text-right font-semibold text-stone-900 whitespace-nowrap">
                            {formatCurrency(cost.amount, cost.currency)}
                          </td>
                        </tr>
                      )
                    })}
                    {filtered.length > 0 && (
                      <tr className="bg-stone-50 font-semibold">
                        <td colSpan={5} className="px-5 py-3 text-right text-stone-700">Gesamt (gefiltert):</td>
                        <td className="px-5 py-3 text-right text-stone-900">{formatCurrency(totalCosts)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="text-center py-12 text-stone-400 text-sm">Keine Einträge gefunden</div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
