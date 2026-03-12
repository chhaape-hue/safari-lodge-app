"use client"

import { useState } from "react"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/ui/stat-card"
import { CostForm } from "@/components/modules/cost-form"
import { useStore } from "@/lib/store"
import { formatCurrency, formatDate } from "@/lib/utils"
import { DollarSign, Plus, Users, ShoppingCart, Truck, Wrench, Zap, Megaphone, Trash2 } from "lucide-react"
import type { CostCategory } from "@/types"

const categoryConfig: Record<CostCategory, { label: string; icon: React.ReactNode; color: string }> = {
  staff:         { label: "Personal",            icon: <Users className="h-3.5 w-3.5" />,       color: "bg-blue-100 text-blue-700" },
  food_beverage: { label: "Lebensmittel",         icon: <ShoppingCart className="h-3.5 w-3.5" />, color: "bg-green-100 text-green-700" },
  logistics:     { label: "Logistik",             icon: <Truck className="h-3.5 w-3.5" />,        color: "bg-amber-100 text-amber-700" },
  maintenance:   { label: "Wartung",              icon: <Wrench className="h-3.5 w-3.5" />,       color: "bg-orange-100 text-orange-700" },
  utilities:     { label: "Energie",              icon: <Zap className="h-3.5 w-3.5" />,          color: "bg-yellow-100 text-yellow-700" },
  marketing:     { label: "Marketing",            icon: <Megaphone className="h-3.5 w-3.5" />,    color: "bg-purple-100 text-purple-700" },
  insurance:     { label: "Versicherung",         icon: <DollarSign className="h-3.5 w-3.5" />,   color: "bg-stone-100 text-stone-700" },
  other:         { label: "Sonstiges",            icon: <DollarSign className="h-3.5 w-3.5" />,   color: "bg-stone-100 text-stone-600" },
}

const frequencyLabel: Record<string, string> = {
  once: "Einmalig", daily: "Täglich", weekly: "Wöchentlich", monthly: "Monatlich", annually: "Jährlich",
}

export default function CostsPage() {
  const { costs, properties, deleteCost } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [propertyFilter, setPropertyFilter] = useState("all")

  const filtered = costs.filter(c =>
    (categoryFilter === "all" || c.category === categoryFilter) &&
    (propertyFilter === "all" || c.property_id === propertyFilter)
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const grandTotal = costs.reduce((s, c) => s + c.amount, 0)
  const staffCosts = costs.filter(c => c.category === "staff").reduce((s, c) => s + c.amount, 0)
  const foodCosts  = costs.filter(c => c.category === "food_beverage").reduce((s, c) => s + c.amount, 0)

  const categoryTotals = costs.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + c.amount
    return acc
  }, {} as Record<string, number>)

  return (
    <div>
      <Topbar title="Kosten & Finanzen" subtitle={`${costs.length} Einträge`}
        actions={<Button size="sm" onClick={() => setShowForm(true)}><Plus className="h-3.5 w-3.5" />Kosten eintragen</Button>}
      />
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Gesamtkosten" value={formatCurrency(grandTotal)} icon={DollarSign} color="rose" />
          <StatCard title="Personal" value={formatCurrency(staffCosts)} subtitle={grandTotal ? `${((staffCosts/grandTotal)*100).toFixed(0)}%` : ""} icon={Users} color="blue" />
          <StatCard title="Lebensmittel" value={formatCurrency(foodCosts)} icon={ShoppingCart} color="green" />
          <StatCard title="Einträge gesamt" value={costs.length} icon={DollarSign} color="amber" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader><CardTitle>Nach Kategorie</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {(Object.entries(categoryTotals) as [CostCategory, number][]).sort((a,b) => b[1]-a[1]).map(([cat, amount]) => {
                const cfg = categoryConfig[cat]
                const pct = grandTotal > 0 ? ((amount/grandTotal)*100).toFixed(0) : "0"
                return (
                  <div key={cat}>
                    <div className="flex justify-between mb-1">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>
                        {cfg.icon}{cfg.label}
                      </span>
                      <span className="text-sm font-semibold text-stone-800">{formatCurrency(amount)} <span className="text-xs text-stone-400">{pct}%</span></span>
                    </div>
                    <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#C8956B] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
              {costs.length === 0 && <p className="text-sm text-stone-400 text-center py-4">Noch keine Einträge</p>}
            </CardContent>
          </Card>
          <div className="lg:col-span-2 space-y-3">
            <div className="flex gap-2 flex-wrap">
              <select value={propertyFilter} onChange={e => setPropertyFilter(e.target.value)}
                className="text-sm border border-stone-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B4226]">
                <option value="all">Alle Properties</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                className="text-sm border border-stone-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B4226]">
                <option value="all">Alle Kategorien</option>
                {(Object.entries(categoryConfig) as [CostCategory, typeof categoryConfig[CostCategory]][]).map(([k, c]) => (
                  <option key={k} value={k}>{c.label}</option>
                ))}
              </select>
            </div>
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100 text-xs text-stone-500 uppercase tracking-wider">
                      {["Datum","Beschreibung","Kategorie","Property","Frequenz","Betrag",""].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {filtered.map(cost => {
                      const property = properties.find(p => p.id === cost.property_id)
                      const cfg = categoryConfig[cost.category]
                      return (
                        <tr key={cost.id} className="hover:bg-stone-50 transition-colors">
                          <td className="px-4 py-3 text-stone-600 whitespace-nowrap">{formatDate(cost.date)}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-stone-800">{cost.description}</p>
                            {cost.supplier && <p className="text-xs text-stone-400">{cost.supplier}</p>}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>
                              {cfg.icon}{cfg.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-stone-500">{property?.name || "–"}</td>
                          <td className="px-4 py-3 text-xs text-stone-500">{frequencyLabel[cost.frequency]}</td>
                          <td className="px-4 py-3 font-semibold text-stone-900 whitespace-nowrap">{formatCurrency(cost.amount, cost.currency)}</td>
                          <td className="px-4 py-3">
                            <button onClick={() => { if(confirm("Eintrag löschen?")) deleteCost(cost.id) }}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                    {filtered.length > 0 && (
                      <tr className="bg-stone-50 font-semibold">
                        <td colSpan={5} className="px-4 py-3 text-right text-stone-600">Gesamt:</td>
                        <td className="px-4 py-3 text-stone-900">{formatCurrency(filtered.reduce((s,c) => s+c.amount, 0))}</td>
                        <td />
                      </tr>
                    )}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="text-center py-12 text-stone-400">
                    <p className="text-sm">Noch keine Kosten eingetragen</p>
                    <Button size="sm" className="mt-4" onClick={() => setShowForm(true)}>
                      <Plus className="h-3.5 w-3.5" /> Ersten Eintrag erstellen
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
      {showForm && <CostForm onClose={() => setShowForm(false)} />}
    </div>
  )
}
