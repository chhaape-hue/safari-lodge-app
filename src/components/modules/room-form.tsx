"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import type { Room, RoomType, RoomStatus } from "@/types"

interface Props {
  room?: Room           // if provided → edit mode
  propertyId?: string   // pre-select in add mode
  onClose: () => void
}

const roomTypes: { value: RoomType; label: string }[] = [
  { value: "standard", label: "Standard Room" },
  { value: "suite", label: "Suite" },
  { value: "tent", label: "Safari Tent" },
  { value: "family", label: "Family Room" },
  { value: "honeymoon", label: "Honeymoon Suite" },
  { value: "dormitory", label: "Dormitory" },
]

const roomStatuses: { value: RoomStatus; label: string; color: string }[] = [
  { value: "available",   label: "Available",    color: "text-green-600" },
  { value: "occupied",    label: "Occupied",     color: "text-blue-600" },
  { value: "maintenance", label: "Maintenance",  color: "text-orange-600" },
  { value: "blocked",     label: "Blocked",      color: "text-red-600" },
]

const AMENITY_OPTIONS = [
  "Air Conditioning", "WiFi", "Mini Bar", "Bush View", "Private Pool", "Bathtub",
  "Outdoor Shower", "Four-Poster Bed", "Fireplace", "Butler Service", "Terrace",
  "Refrigerator", "Coffee Machine", "Direct Bush Access",
]

export function RoomForm({ room, propertyId, onClose }: Props) {
  const { properties, addRoom, updateRoom } = useStore()
  const isEdit = Boolean(room)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saveError, setSaveError] = useState("")

  const [selectedPropertyId, setSelectedPropertyId] = useState(room?.property_id || propertyId || properties[0]?.id || "")
  const [name, setName] = useState(room?.name || "")
  const [roomNumber, setRoomNumber] = useState(room?.room_number || "")
  const [type, setType] = useState<RoomType>(room?.room_type || "standard")
  const [capacity, setCapacity] = useState(room?.capacity || 2)
  const [price, setPrice] = useState(room?.base_price_per_night?.toString() || "")
  const [status, setStatus] = useState<RoomStatus>(room?.status || "available")
  const [floor, setFloor] = useState(room?.floor?.toString() || "")
  const [sqm, setSqm] = useState(room?.square_meters?.toString() || "")
  const [description, setDescription] = useState(room?.description || "")
  const [amenities, setAmenities] = useState<string[]>(room?.amenities || [])
  const [maxAdults, setMaxAdults] = useState(room?.max_adults || 2)
  const [maxChildren, setMaxChildren] = useState(room?.max_children || 0)

  const inputCls = (err?: string) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4226] transition-colors ${
      err ? "border-red-400 bg-red-50" : "border-stone-300 bg-white"
    }`
  const labelCls = "block text-sm font-medium text-stone-700 mb-1"

  function toggleAmenity(a: string) {
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = "Name is required"
    if (!selectedPropertyId) e.property = "Property is required"
    if (!price || isNaN(parseFloat(price))) e.price = "Valid price is required"
    if (!roomNumber.trim()) e.roomNumber = "Room number is required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaveError("")
    setSaving(true)
    try {
      const data = {
        property_id: selectedPropertyId,
        name: name.trim(),
        room_number: roomNumber.trim(),
        room_type: type,
        capacity,
        max_adults: maxAdults,
        max_children: maxChildren,
        base_price_per_night: parseFloat(price),
        status,
        floor: floor ? floor.trim() : undefined,
        square_meters: sqm ? parseFloat(sqm) : undefined,
        description: description || undefined,
        amenities,
      }
      if (isEdit && room) {
        await updateRoom(room.id, data)
      } else {
        await addRoom(data)
      }
      onClose()
    } catch (err: unknown) {
      setSaveError((err as Error).message || "Failed to save. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-[#FAF7F2] rounded-t-2xl">
          <h2 className="text-lg font-bold text-stone-900">
            {isEdit ? `Edit Room: ${room?.name}` : "New Room / Accommodation Unit"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-stone-200 transition-colors">
            <X className="h-4 w-4 text-stone-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Property */}
          {!isEdit && (
            <div>
              <label className={labelCls}>Property *</label>
              <select value={selectedPropertyId} onChange={e => setSelectedPropertyId(e.target.value)}
                className={inputCls(errors.property)}>
                <option value="">Please select...</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {errors.property && <p className="text-xs text-red-500 mt-1">{errors.property}</p>}
            </div>
          )}

          {/* Name + Number */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className={labelCls}>Room / Tent Name *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Leopard Chalet, Okavango Suite" className={inputCls(errors.name)} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className={labelCls}>Room Number *</label>
              <input type="text" value={roomNumber} onChange={e => setRoomNumber(e.target.value)}
                placeholder="101, A2..." className={inputCls(errors.roomNumber)} />
              {errors.roomNumber && <p className="text-xs text-red-500 mt-1">{errors.roomNumber}</p>}
            </div>
          </div>

          {/* Type + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Room Type</label>
              <select value={type} onChange={e => setType(e.target.value as RoomType)} className={inputCls()}>
                {roomTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as RoomStatus)} className={inputCls()}>
                {roomStatuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <p className={`text-xs mt-1 font-medium ${roomStatuses.find(s => s.value === status)?.color}`}>
                {status === "maintenance" ? "Room will show as blocked in the calendar" :
                 status === "blocked" ? "Room is manually blocked (no bookings possible)" : ""}
              </p>
            </div>
          </div>

          {/* Price + Capacity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Base Price / Night (BWP) *</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)}
                placeholder="0" className={inputCls(errors.price)} />
              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className={labelCls}>Total Capacity</label>
              <select value={capacity} onChange={e => setCapacity(Number(e.target.value))} className={inputCls()}>
                {[1,2,3,4,5,6,8,10,12].map(n => <option key={n} value={n}>{n} guests</option>)}
              </select>
            </div>
          </div>

          {/* Max adults + children */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Max Adults</label>
              <select value={maxAdults} onChange={e => setMaxAdults(Number(e.target.value))} className={inputCls()}>
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Max Children</label>
              <select value={maxChildren} onChange={e => setMaxChildren(Number(e.target.value))} className={inputCls()}>
                {[0,1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Size (m²)</label>
              <input type="number" value={sqm} onChange={e => setSqm(e.target.value)}
                placeholder="e.g. 45" className={inputCls()} />
            </div>
          </div>

          {/* Floor */}
          <div>
            <label className={labelCls}>Floor / Location</label>
            <input type="text" value={floor} onChange={e => setFloor(e.target.value)}
              placeholder="e.g. 1, Ground Floor, Riverfront..." className={inputCls()} />
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              rows={2} placeholder="Room / tent description for booking confirmations..."
              className={`${inputCls()} resize-none`} />
          </div>

          {/* Amenities */}
          <div>
            <label className={labelCls}>Amenities</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {AMENITY_OPTIONS.map(a => (
                <button key={a} type="button" onClick={() => toggleAmenity(a)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    amenities.includes(a)
                      ? "bg-[#6B4226] text-white border-[#6B4226]"
                      : "bg-white text-stone-600 border-stone-300 hover:border-[#6B4226] hover:text-[#6B4226]"
                  }`}>
                  {a}
                </button>
              ))}
            </div>
            {amenities.length > 0 && (
              <p className="text-xs text-stone-500 mt-2">{amenities.length} selected</p>
            )}
          </div>
        </div>

        {saveError && (
          <div className="px-6 pb-2">
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{saveError}</p>
          </div>
        )}
        <div className="flex justify-between px-6 py-4 border-t border-stone-100 bg-stone-50 rounded-b-2xl">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Save Changes ✓" : "Create Room ✓"}
          </Button>
        </div>
      </div>
    </div>
  )
}
