"use client"

import { useState } from "react"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/ui/stat-card"
import {
  Package, Plus, Search, AlertTriangle, CheckCircle2,
  ShoppingCart, TrendingDown, BarChart3, Filter
} from "lucide-react"

// Stock categories used across all properties
const categories = [
  "Food & Beverage",
  "Housekeeping",
  "Maintenance & Tools",
  "Guest Amenities",
  "Stationery & Office",
  "Safety & Medical",
  "Laundry",
  "Other",
] as const

type StockCategory = typeof categories[number]

interface StockItem {
  id: string
  name: string
  category: StockCategory
  property: string
  unit: string
  current_qty: number
  minimum_qty: number
  reorder_qty: number
  unit_cost: number
  supplier?: string
  last_updated: string
  notes?: string
}

// Demo data – will be replaced by Supabase data in Phase 2
const DEMO_STOCK: StockItem[] = [
  { id: "1", name: "Toilet Paper (rolls)", category: "Housekeeping", property: "O Bona Moremi", unit: "roll", current_qty: 240, minimum_qty: 100, reorder_qty: 300, unit_cost: 2.50, supplier: "Maun Supplies", last_updated: "2025-03-10" },
  { id: "2", name: "Drinking Water (5L bottles)", category: "Food & Beverage", property: "O Bona Moremi", unit: "bottle", current_qty: 48, minimum_qty: 60, reorder_qty: 120, unit_cost: 15.00, supplier: "Pure Water Botswana", last_updated: "2025-03-11" },
  { id: "3", name: "Diesel (litres)", category: "Maintenance & Tools", property: "Nkasa Plains Camp", unit: "litre", current_qty: 820, minimum_qty: 500, reorder_qty: 1000, unit_cost: 12.80, supplier: "Katima Fuel", last_updated: "2025-03-09" },
  { id: "4", name: "Guest Shampoo (sachets)", category: "Guest Amenities", property: "O Bona Moremi", unit: "sachet", current_qty: 180, minimum_qty: 200, reorder_qty: 500, unit_cost: 1.20, supplier: "Hospitality Supplies SA", last_updated: "2025-03-08" },
  { id: "5", name: "Washing Powder (kg)", category: "Laundry", property: "Kiri Camp", unit: "kg", current_qty: 25, minimum_qty: 20, reorder_qty: 50, unit_cost: 45.00, supplier: "Maun Supplies", last_updated: "2025-03-10" },
  { id: "6", name: "First Aid Bandages", category: "Safety & Medical", property: "All", unit: "box", current_qty: 8, minimum_qty: 10, reorder_qty: 20, unit_cost: 35.00, supplier: "Medical Supplies BW", last_updated: "2025-03-05" },
  { id: "7", name: "Coffee (250g bags)", category: "Food & Beverage", property: "Kiri Camp", unit: "bag", current_qty: 12, minimum_qty: 15, reorder_qty: 30, unit_cost: 65.00, supplier: "Gaborone Wholesale", last_updated: "2025-03-07" },
  { id: "8", name: "LED Bulbs (60W)", category: "Maintenance & Tools", property: "All", unit: "unit", current_qty: 45, minimum_qty: 20, reorder_qty: 50, unit_cost: 28.00, supplier: "Maun Electrical", last_updated: "2025-03-06" },
]

type OrderItem = { item: StockItem; qty: number }

export default function StockPage() {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [orderMode, setOrderMode] = useState(false)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [showOrderForm, setShowOrderForm] = useState(false)

  const filtered = DEMO_STOCK.filter(item => {
    const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.supplier?.toLowerCase().includes(search.toLowerCase())
    const matchesCat = categoryFilter === "all" || item.category === categoryFilter
    return matchesSearch && matchesCat
  })

  const lowStock = DEMO_STOCK.filter(i => i.current_qty < i.minimum_qty)
  const totalValue = DEMO_STOCK.reduce((s, i) => s + i.current_qty * i.unit_cost, 0)

  const stockStatus = (item: StockItem): { label: string; variant: "success" | "warning" | "danger" | "info" | "neutral" } => {
    if (item.current_qty === 0) return { label: "Out of Stock", variant: "danger" }
    if (item.current_qty < item.minimum_qty) return { label: "Low Stock", variant: "warning" }
    return { label: "In Stock", variant: "success" }
  }

  const addToOrder = (item: StockItem) => {
    setOrderItems(prev => {
      const exists = prev.find(o => o.item.id === item.id)
      if (exists) return prev.map(o => o.item.id === item.id ? { ...o, qty: o.qty + item.reorder_qty } : o)
      return [...prev, { item, qty: item.reorder_qty }]
    })
  }

  return (
    <div>
      <Topbar
        title="Stock Control"
        subtitle="Inventory management across all properties"
        actions={
          <div className="flex gap-2">
            {orderItems.length > 0 && (
              <Button size="sm" onClick={() => setShowOrderForm(true)}>
                <ShoppingCart className="h-3.5 w-3.5" />
                Order ({orderItems.length} items)
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => setOrderMode(!orderMode)}>
              <ShoppingCart className="h-3.5 w-3.5" />
              {orderMode ? "Cancel Order" : "Create Order"}
            </Button>
            <Button size="sm">
              <Plus className="h-3.5 w-3.5" />
              Add Item
            </Button>
          </div>
        }
      />

      <div className="p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Items" value={DEMO_STOCK.length} icon={Package} color="amber" />
          <StatCard
            title="Low Stock Alerts"
            value={lowStock.length}
            icon={AlertTriangle}
            color="rose"
          />
          <StatCard
            title="Stock Value (BWP)"
            value={`P ${totalValue.toLocaleString("en-ZA", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
            icon={BarChart3}
            color="green"
          />
          <StatCard
            title="Categories"
            value={categories.length}
            icon={Filter}
            color="blue"
          />
        </div>

        {/* Low stock alerts */}
        {lowStock.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <p className="text-sm font-semibold text-amber-800">
                {lowStock.length} item{lowStock.length > 1 ? "s" : ""} below minimum stock level
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {lowStock.map(item => (
                <div key={item.id} className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border border-amber-200">
                  <span className="text-xs font-medium text-stone-800">{item.name}</span>
                  <span className="text-xs text-amber-600">{item.current_qty} / {item.minimum_qty} {item.unit}</span>
                  <button
                    onClick={() => addToOrder(item)}
                    className="text-xs text-[#4A7C59] font-medium hover:underline"
                  >
                    Order
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search & filter */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search items or supplier..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A84C] w-64"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="text-sm border border-stone-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
          >
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {orderMode && (
            <div className="ml-auto text-sm text-amber-700 font-medium flex items-center gap-1.5">
              <ShoppingCart className="h-4 w-4" />
              Order mode active – click items to add to order
            </div>
          )}
        </div>

        {/* Stock table */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
            <CardDescription>
              Current stock levels across all properties.
              {" "}
              <span className="text-amber-600 font-medium">Note: Connect to Supabase to enable live stock tracking with staff submissions.</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 text-xs text-stone-500 uppercase tracking-wider">
                    {["Item", "Category", "Property", "Current", "Min", "Unit", "Unit Cost", "Status", ""].map(h => (
                      <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {filtered.map(item => {
                    const status = stockStatus(item)
                    const isInOrder = orderItems.some(o => o.item.id === item.id)
                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-stone-50 transition-colors ${isInOrder ? "bg-green-50" : ""}`}
                      >
                        <td className="px-5 py-3">
                          <p className="font-medium text-stone-900">{item.name}</p>
                          {item.supplier && <p className="text-xs text-stone-400">{item.supplier}</p>}
                        </td>
                        <td className="px-5 py-3 text-xs text-stone-500">{item.category}</td>
                        <td className="px-5 py-3 text-xs text-stone-500">{item.property}</td>
                        <td className="px-5 py-3">
                          <span className={`font-bold ${item.current_qty < item.minimum_qty ? "text-amber-600" : "text-stone-900"}`}>
                            {item.current_qty}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-stone-500">{item.minimum_qty}</td>
                        <td className="px-5 py-3 text-xs text-stone-500">{item.unit}</td>
                        <td className="px-5 py-3 text-stone-700">P {item.unit_cost.toFixed(2)}</td>
                        <td className="px-5 py-3">
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex gap-1">
                            {orderMode ? (
                              <Button
                                size="sm"
                                variant={isInOrder ? "secondary" : "ghost"}
                                onClick={() => addToOrder(item)}
                              >
                                {isInOrder ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> : <Plus className="h-3.5 w-3.5" />}
                              </Button>
                            ) : (
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-stone-400">
                  <Package className="h-8 w-8 mb-2" />
                  <p className="text-sm">No items found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order summary modal */}
      {showOrderForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-stone-900 mb-1">Create Stock Order</h2>
            <p className="text-sm text-stone-500 mb-5">Review and confirm your stock order.</p>

            <div className="space-y-3 mb-6">
              {orderItems.map(({ item, qty }) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-stone-100 bg-stone-50">
                  <div>
                    <p className="text-sm font-medium text-stone-800">{item.name}</p>
                    <p className="text-xs text-stone-400">{item.supplier}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{qty} {item.unit}</p>
                    <p className="text-xs text-stone-500">P {(qty * item.unit_cost).toFixed(2)}</p>
                  </div>
                </div>
              ))}
              <div className="border-t border-stone-200 pt-3 flex justify-between font-semibold text-sm">
                <span>Estimated Total</span>
                <span>P {orderItems.reduce((s, { item, qty }) => s + qty * item.unit_cost, 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowOrderForm(false)}>Back</Button>
              <Button className="flex-1" onClick={() => {
                setShowOrderForm(false)
                setOrderMode(false)
                setOrderItems([])
                alert("Order submitted! In production this will send to your procurement system.")
              }}>
                Submit Order
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
