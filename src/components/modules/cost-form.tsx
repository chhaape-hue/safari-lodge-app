"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import type { CostCategory, CostFrequency } from "@/types"

interface Props { onClose: () => void }

const categories: { value: CostCategory; label: string }[] = [
  { value: "staff", label: "Personal / Löhne" },
  { value: "food_beverage", label: "Lebensmittel & Getränke" },
  { value: "logistics", label: "Logistik & Transport" },
  { value: "maintenance", label: "Wartung & Reparatur" },
  { value: "utilities", label: "Energie & Wasser" },
  { value: "marketing", label: "Marketing & Werbung" },
  { value: "insurance", label: "Versicherung" },
  { value: "other", label: "Sonstiges" },
]

const frequencies: { value: CostFrequency; label: string }[] = [
  { value: "once", label: "Einmalig" },
  { value: "daily", label: "Täglich" },
  { value: "weekly", label: "Wöchentlich" },
  { value: "monthly", label: "Monatlich" },
  { value: "annually", label: "Jährlich" },
]

export function CostForm({ onClose }: Props) {
  const { properties, addCost } = useStore()
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [propertyId, setPropertyId] = useState("")
  const [category, setCategory] = useState<CostCategory>("other")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("BWP")
  const [frequency, setFrequency] = useState<CostFrequency>("once")
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [supplier, setSupplier] = useState("")
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [notes, setNotes] = useState("")

  const inputCls = (err?: string) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4226] transition-colors ${
      err ? "border-red-400 bg-red-50" : "border-stone-300 bg-white"
    }`
  const labelCls = "block text-sm font-medium text-stone-700 mb-1"

  function validate() {
    const e: Record<string, string> = {}
    if (!description.trim()) e.description = "Beschreibung erforderlich"
    if (!amount || isNaN(parseFloat(amount))) e.amount = "Gültiger Betrag erforderlich"
    if (!date) e.date = "Datum erforderlich"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    await addCost({
      property_id: propertyId || undefined,
      category,
      description,
      amount: parseFloat(amount),
      currency,
      frequency,
      date,
      supplier: supplier || undefined,
      invoice_number: invoiceNumber || undefined,
      notes: notes || undefined,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-[#FAF7F2] rounded-t-2xl">
          <h2 className="text-lg font-bold text-stone-900">Kosten eintragen</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-stone-200 transition-colors">
            <X className="h-4 w-4 text-stone-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Kategorie *</label>
              <select value={category} onChange={e => setCategory(e.target.value as CostCategory)} className={inputCls()}>
                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Property</label>
              <select value={propertyId} onChange={e => setPropertyId(e.target.value)} className={inputCls()}>
                <option value="">Alle / Allgemein</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Beschreibung *</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)}
              placeholder="z.B. Lebensmitteleinkauf Woche 12" className={inputCls(errors.description)} />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className={labelCls}>Betrag *</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="0.00" className={inputCls(errors.amount)} />
              {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
            </div>
            <div>
              <label className={labelCls}>Währung</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)} className={inputCls()}>
                <option>BWP</option>
                <option>NAD</option>
                <option>ZAR</option>
                <option>USD</option>
                <option>EUR</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Datum *</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls(errors.date)} />
            </div>
            <div>
              <label className={labelCls}>Frequenz</label>
              <select value={frequency} onChange={e => setFrequency(e.target.value as CostFrequency)} className={inputCls()}>
                {frequencies.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Lieferant / Anbieter</label>
              <input type="text" value={supplier} onChange={e => setSupplier(e.target.value)}
                placeholder="z.B. Choppies Maun" className={inputCls()} />
            </div>
            <div>
              <label className={labelCls}>Rechnungsnummer</label>
              <input type="text" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)}
                placeholder="INV-2025-..." className={inputCls()} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Notizen</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              rows={2} placeholder="Optionale interne Notizen..."
              className={`${inputCls()} resize-none`} />
          </div>
        </div>

        <div className="flex justify-between px-6 py-4 border-t border-stone-100 bg-stone-50 rounded-b-2xl">
          <Button variant="ghost" onClick={onClose}>Abbrechen</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Wird gespeichert..." : "Kosten speichern ✓"}
          </Button>
        </div>
      </div>
    </div>
  )
}
