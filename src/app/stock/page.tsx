"use client"

import { useState } from "react"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/ui/stat-card"
import {
  Package, Plus, Search, AlertTriangle, CheckCircle2,
  ShoppingCart, BarChart3, Filter, Loader2
} from "lucide-react"
import { useStore } from "@/lib/supabase-store"
import type { StockItem } from "@/lib/supabase-store"

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

type OrderItem = { item: StockItem; qty: number }

type StockFormData = {
  name: string
  category: string
  unit: string
  current_qty: number
  minimum_qty: number
  reorder_qty: number
  unit_cost: number
  supplier: string
  notes: string
  property_id: string
}

const emptyForm = (): StockFormData => ({
  name: "",
  category: "Other",
  unit: "unit",
  current_qty: 0,
  minimum_qty: 0,
  reorder_qty: 0,
  unit_cost: 0,
  supplier: "",
  notes: "",
  property_id: "",
})

function stockStatus(item: StockItem): { label: string; variant: "success" | "warning" | "danger" | "info" | "neutral" } {
  if (item.current_qty === 0) return { label: "Out of Stock", variant: "danger" }
  if (item.current_qty < item.minimum_qty) return { label: "Low Stock", variant: "warning" }
  return { label: "In Stock", variant: "success" }
}

export default function StockPage() {
  const { stockItems, properties, loading, error, addStockItem, updateStockItem, deleteStockItem } = useStore()

  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [orderMode, setOrderMode] = useState(false)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editItem, setEditItem] = useState<StockItem | null>(null)
  const [formData, setFormData] = useState<StockFormData>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")

  const filtered = stockItems.filter(item => {
    const matchesSearch = !search
      || item.name.toLowerCase().includes(search.toLowerCase())
      || item.supplier?.toLowerCase().includes(search.toLowerCase())
    const matchesCat = categoryFilter === "all" || item.category === categoryFilter
    return matchesSearch && matchesCat
  })

  const lowStock = stockItems.filter(i => i.current_qty < i.minimum_qty)
  const totalValue = stockItems.reduce((s, i) => s + i.current_qty * i.unit_cost, 0)

  const addToOrder = (item: StockItem) => {
    setOrderItems(prev => {
      const exists = prev.find(o => o.item.id === item.id)
      if (exists) return prev.map(o => o.item.id === item.id ? { ...o, qty: o.qty + item.reorder_qty } : o)
      return [...prev, { item, qty: item.reorder_qty }]
    })
  }

  function openAdd() {
    setEditItem(null)
    setFormData(emptyForm())
    setSaveError("")
    setShowAddForm(true)
  }

  function openEdit(item: StockItem) {
    setEditItem(item)
    setFormData({
      name: item.name,
      category: item.category,
      unit: item.unit,
      current_qty: item.current_qty,
      minimum_qty: item.minimum_qty,
      reorder_qty: item.reorder_qty,
      unit_cost: item.unit_cost,
      supplier: item.supplier || "",
      notes: item.notes || "",
      property_id: item.property_id || "",
    })
    setSaveError("")
    setShowAddForm(true)
  }

  async function handleSave() {
    if (!formData.name.trim()) { setSaveError("Name is required."); return }
    setSaving(true)
    setSaveError("")
    try {
      const payload = {
        ...formData,
        property_id: formData.property_id || undefined,
        supplier: formData.supplier || undefined,
        notes: formData.notes || undefined,
        last_updated: new Date().toISOString().slice(0, 10),
      }
      if (editItem) {
        await updateStockItem(editItem.id, payload)
      } else {
        await addStockItem(payload)
      }
      setShowAddForm(false)
    } catch (err: unknown) {
      setSaveError((err as Error).message || "Failed to save. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this stock item?")) return
    try {
      await deleteStockItem(id)
    } catch (err: unknown) {
      alert((err as Error).message || "Failed to delete.")
    }
  }

  if (loading) {
    return (
      <div>
        <Topbar title="Stock Control" subtitle="Inventory management across all properties" />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Topbar title="Stock Control" subtitle="Inventory management across all properties" />
        <div className="p-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        </div>
      </div>
    )
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
            <Button size="sm" onClick={openAdd}>
              <Plus className="h-3.5 w-3.5" />
              Add Item
            </Button>
          </div>
        }
      />

      <div className="p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Items" value={stockItems.length} icon={Package} color="amber" />
          <StatCard title="Low Stock Alerts" value={lowStock.length} icon={AlertTriangle} color="rose" />
          <StatCard
            title="Stock Value (BWP)"
            value={`P ${totalValue.toLocaleString("en-ZA", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
            icon={BarChart3}
            color="green"
          />
          <StatCard title="Categories" value={categories.length} icon={Filter} color="blue" />
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
                  <button onClick={() => addToOrder(item)} className="text-xs text-[#4A7C59] font-medium hover:underline">
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
            <CardDescription>Current stock levels across all properties.</CardDescription>
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
                    const property = properties.find(p => p.id === item.property_id)
                    return (
                      <tr key={item.id} className={`hover:bg-stone-50 transition-colors ${isInOrder ? "bg-green-50" : ""}`}>
                        <td className="px-5 py-3">
                          <p className="font-medium text-stone-900">{item.name}</p>
                          {item.supplier && <p className="text-xs text-stone-400">{item.supplier}</p>}
                        </td>
                        <td className="px-5 py-3 text-xs text-stone-500">{item.category}</td>
                        <td className="px-5 py-3 text-xs text-stone-500">{property?.name || "All"}</td>
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
                              <Button size="sm" variant={isInOrder ? "secondary" : "ghost"} onClick={() => addToOrder(item)}>
                                {isInOrder ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> : <Plus className="h-3.5 w-3.5" />}
                              </Button>
                            ) : (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>Edit</Button>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(item.id)}>Del</Button>
                              </>
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
                  <p className="text-sm">{stockItems.length === 0 ? "No stock items yet – click Add Item to get started." : "No items match your search."}</p>
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
              <Button className="flex-1" onClick={() => { setShowOrderForm(false); setOrderMode(false); setOrderItems([]) }}>
                Submit Order
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Item modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-stone-900 mb-1">{editItem ? "Edit Stock Item" : "Add Stock Item"}</h2>
            <p className="text-sm text-stone-500 mb-5">Enter the stock item details below.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Item Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] bg-white"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={e => setFormData(p => ({ ...p, unit: e.target.value }))}
                    placeholder="e.g. kg, litre, roll"
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Current Qty</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.current_qty}
                    onChange={e => setFormData(p => ({ ...p, current_qty: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Min Qty</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.minimum_qty}
                    onChange={e => setFormData(p => ({ ...p, minimum_qty: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Reorder Qty</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.reorder_qty}
                    onChange={e => setFormData(p => ({ ...p, reorder_qty: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Unit Cost (BWP)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={formData.unit_cost}
                    onChange={e => setFormData(p => ({ ...p, unit_cost: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Property</label>
                  <select
                    value={formData.property_id}
                    onChange={e => setFormData(p => ({ ...p, property_id: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] bg-white"
                  >
                    <option value="">All Properties</option>
                    {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Supplier</label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={e => setFormData(p => ({ ...p, supplier: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] resize-none"
                />
              </div>
            </div>

            {saveError && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{saveError}</p>
            )}

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" className="flex-1" onClick={() => setShowAddForm(false)} disabled={saving}>Cancel</Button>
              <Button className="flex-1" onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</> : (editItem ? "Update Item" : "Add Item")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
