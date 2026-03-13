"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import type { Property, PropertyType } from "@/types"

interface Props {
  property?: Property
  onClose: () => void
}

const propertyTypes: { value: PropertyType; label: string; icon: string }[] = [
  { value: "lodge",      label: "Lodge",        icon: "🏕️" },
  { value: "houseboat",  label: "Hausboot",      icon: "🚢" },
  { value: "camp",       label: "Camp",          icon: "⛺" },
  { value: "villa",      label: "Villa",         icon: "🏡" },
  { value: "hotel",      label: "Hotel",         icon: "🏨" },
]

const CURRENCY_OPTIONS = ["BWP", "NAD", "ZAR", "USD", "EUR"]

export function PropertyForm({ property, onClose }: Props) {
  const { addProperty, updateRoom } = useStore()
  const isEdit = Boolean(property)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [name, setName] = useState(property?.name || "")
  const [type, setType] = useState<PropertyType>(property?.property_type || "lodge")
  const [location, setLocation] = useState(property?.location || "")
  const [country, setCountry] = useState(property?.country || "Botswana")
  const [currency, setCurrency] = useState(property?.currency || "BWP")
  const [description, setDescription] = useState(property?.description || "")
  const [checkInTime, setCheckInTime] = useState(property?.check_in_time || "14:00")
  const [checkOutTime, setCheckOutTime] = useState(property?.check_out_time || "11:00")
  const [status, setStatus] = useState(property?.status || "active")
  const [email, setEmail] = useState(property?.contact_email || "")
  const [phone, setPhone] = useState(property?.contact_phone || "")
  const [website, setWebsite] = useState(property?.website || "")
  const [nbPropertyId, setNbPropertyId] = useState(property?.nightsbridge_property_id || "")
  const [latitude, setLatitude] = useState(property?.latitude?.toString() || "")
  const [longitude, setLongitude] = useState(property?.longitude?.toString() || "")

  const inputCls = (err?: string) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4226] transition-colors ${
      err ? "border-red-400 bg-red-50" : "border-stone-300 bg-white"
    }`
  const labelCls = "block text-sm font-medium text-stone-700 mb-1"

  function validate() {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = "Name erforderlich"
    if (!location.trim()) e.location = "Standort erforderlich"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate()) return
    setSaving(true)
    const data = {
      name: name.trim(),
      property_type: type,
      location: location.trim(),
      country: country.trim(),
      currency,
      description: description || undefined,
      check_in_time: checkInTime,
      check_out_time: checkOutTime,
      status: status as "active" | "inactive" | "maintenance",
      contact_email: email || undefined,
      contact_phone: phone || undefined,
      website: website || undefined,
      nightsbridge_property_id: nbPropertyId || undefined,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
    }
    // Note: updateProperty will be added when needed; for now only add is supported
    addProperty(data)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-[#FAF7F2] rounded-t-2xl">
          <h2 className="text-lg font-bold text-stone-900">
            {isEdit ? `Property bearbeiten` : "Neue Property / Unterkunft"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-stone-200 transition-colors">
            <X className="h-4 w-4 text-stone-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Type selection */}
          <div>
            <label className={labelCls}>Art der Unterkunft</label>
            <div className="grid grid-cols-5 gap-2">
              {propertyTypes.map(t => (
                <button key={t.value} type="button" onClick={() => setType(t.value)}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-xs font-medium transition-all ${
                    type === t.value
                      ? "bg-[#6B4226] text-white border-[#6B4226]"
                      : "bg-white text-stone-600 border-stone-300 hover:border-[#6B4226]"
                  }`}>
                  <span className="text-xl">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className={labelCls}>Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="z.B. Okavango Delta Lodge" className={inputCls(errors.name)} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Location + Country */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className={labelCls}>Standort / Region *</label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                placeholder="Okavango Delta, Maun..." className={inputCls(errors.location)} />
              {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
            </div>
            <div>
              <label className={labelCls}>Land</label>
              <select value={country} onChange={e => setCountry(e.target.value)} className={inputCls()}>
                {["Botswana","Namibia","Südafrika","Sambia","Zimbabwe","Tansania","Kenia"].map(c =>
                  <option key={c}>{c}</option>
                )}
              </select>
            </div>
          </div>

          {/* Currency + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Währung</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)} className={inputCls()}>
                {CURRENCY_OPTIONS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className={inputCls()}>
                <option value="active">Aktiv</option>
                <option value="inactive">Inaktiv</option>
                <option value="maintenance">Wartung</option>
              </select>
            </div>
          </div>

          {/* Check-in/out times */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Check-in Zeit</label>
              <input type="time" value={checkInTime} onChange={e => setCheckInTime(e.target.value)} className={inputCls()} />
            </div>
            <div>
              <label className={labelCls}>Check-out Zeit</label>
              <input type="time" value={checkOutTime} onChange={e => setCheckOutTime(e.target.value)} className={inputCls()} />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Kontakt E-Mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="info@lodge.com" className={inputCls()} />
            </div>
            <div>
              <label className={labelCls}>Telefon</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+267 ..." className={inputCls()} />
            </div>
          </div>

          {/* Website + NB ID */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Website</label>
              <input type="url" value={website} onChange={e => setWebsite(e.target.value)}
                placeholder="https://..." className={inputCls()} />
            </div>
            <div>
              <label className={labelCls}>Nightsbridge Property-ID</label>
              <input type="text" value={nbPropertyId} onChange={e => setNbPropertyId(e.target.value)}
                placeholder="NB-PROP-..." className={inputCls()} />
            </div>
          </div>

          {/* GPS */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Breitengrad (lat)</label>
              <input type="number" value={latitude} onChange={e => setLatitude(e.target.value)}
                placeholder="-19.9..." step="0.0001" className={inputCls()} />
            </div>
            <div>
              <label className={labelCls}>Längengrad (lon)</label>
              <input type="number" value={longitude} onChange={e => setLongitude(e.target.value)}
                placeholder="23.4..." step="0.0001" className={inputCls()} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Beschreibung</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              rows={3} placeholder="Kurzbeschreibung der Unterkunft..."
              className={`${inputCls()} resize-none`} />
          </div>
        </div>

        <div className="flex justify-between px-6 py-4 border-t border-stone-100 bg-stone-50 rounded-b-2xl">
          <Button variant="ghost" onClick={onClose}>Abbrechen</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Wird gespeichert..." : isEdit ? "Änderungen speichern ✓" : "Property anlegen ✓"}
          </Button>
        </div>
      </div>
    </div>
  )
}
