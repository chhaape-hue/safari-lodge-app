"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RoomForm } from "@/components/modules/room-form"
import { PropertyForm } from "@/components/modules/property-form"
import { formatCurrency } from "@/lib/utils"
import { MapPin, BedDouble, Plus, Settings2, Trash2, Pencil, ToggleLeft, ToggleRight, AlertTriangle } from "lucide-react"
import type { PropertyType, RoomStatus, Room } from "@/types"

const propertyTypeLabel: Record<string, string> = {
  lodge: "Safari Lodge", houseboat: "Houseboat", camp: "Camp", villa: "Villa", hotel: "Hotel",
}
const propertyTypeIcon: Record<string, string> = {
  lodge: "🏕️", houseboat: "🚢", camp: "⛺", villa: "🏡", hotel: "🏨",
}

const propertyStatusConfig = {
  active:      { label: "Active",      variant: "success" as const },
  maintenance: { label: "Maintenance", variant: "warning" as const },
  inactive:    { label: "Inactive",    variant: "neutral" as const },
}

const roomStatusConfig: Record<RoomStatus, { label: string; dot: string; badge: "success" | "warning" | "danger" | "neutral" }> = {
  available:   { label: "Available",   dot: "bg-[#4A7C59]", badge: "success" },
  occupied:    { label: "Occupied",    dot: "bg-[#C8956B]", badge: "warning" },
  maintenance: { label: "Maintenance", dot: "bg-red-400",   badge: "danger" },
  blocked:     { label: "Blocked",     dot: "bg-stone-300", badge: "neutral" },
}

const roomTypeLabel: Record<string, string> = {
  tent: "Safari Tent", suite: "Suite", standard: "Standard",
  family: "Family", honeymoon: "Honeymoon", dormitory: "Dormitory",
}

const ROOM_STATUS_CYCLE: RoomStatus[] = ["available", "occupied", "maintenance", "blocked"]

export function PropertyGridView() {
  const { properties, rooms: allRooms, updateRoom, deleteRoom, deleteProperty, updateProperty } = useStore()
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [showRoomForm, setShowRoomForm] = useState(false)
  const [showPropertyForm, setShowPropertyForm] = useState(false)
  const [editRoom, setEditRoom] = useState<Room | undefined>(undefined)

  const roomsByProperty = allRooms.reduce((acc, room) => {
    if (!acc[room.property_id]) acc[room.property_id] = []
    acc[room.property_id].push(room)
    return acc
  }, {} as Record<string, typeof allRooms>)

  const selectedProp = selectedPropertyId ? properties.find(p => p.id === selectedPropertyId) : null
  const selectedRooms = selectedPropertyId ? (roomsByProperty[selectedPropertyId] || []) : []

  function cycleRoomStatus(room: Room) {
    const idx = ROOM_STATUS_CYCLE.indexOf(room.status)
    const next = ROOM_STATUS_CYCLE[(idx + 1) % ROOM_STATUS_CYCLE.length]
    updateRoom(room.id, { status: next })
  }

  function togglePropertyStatus(id: string, current: string) {
    updateProperty(id, { status: current === "active" ? "maintenance" : "active" })
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Property List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              {properties.length} Properties
            </p>
            <Button size="sm" variant="secondary" onClick={() => setShowPropertyForm(true)}>
              <Plus className="h-3.5 w-3.5" /> New
            </Button>
          </div>

          {properties.map((property) => {
            const rooms = roomsByProperty[property.id] || []
            const occupied = rooms.filter(r => r.status === "occupied").length
            const available = rooms.filter(r => r.status === "available").length
            const status = propertyStatusConfig[property.status] || propertyStatusConfig.active
            const isSelected = selectedPropertyId === property.id

            return (
              <Card key={property.id}
                onClick={() => setSelectedPropertyId(isSelected ? null : property.id)}
                className={`cursor-pointer transition-all ${isSelected ? "ring-2 ring-[#6B4226] ring-offset-1" : "hover:shadow-md"}`}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5">{propertyTypeIcon[property.property_type] || "🏠"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-stone-900 text-sm leading-tight">{property.name}</h3>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge variant={status.variant}>{status.label}</Badge>
                          {/* Status toggle */}
                          <button
                            onClick={e => { e.stopPropagation(); togglePropertyStatus(property.id, property.status) }}
                            title={property.status === "active" ? "Set to Maintenance" : "Activate"}
                            className="p-1 rounded hover:bg-stone-100 transition-colors"
                          >
                            {property.status === "active"
                              ? <ToggleRight className="h-4 w-4 text-[#4A7C59]" />
                              : <ToggleLeft className="h-4 w-4 text-stone-400" />}
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">{propertyTypeLabel[property.property_type] || "–"} · {property.currency}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-stone-400">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{property.location}, {property.country}</span>
                      </div>
                      {rooms.length > 0 && (
                        <div className="mt-2.5 space-y-1">
                          <div className="flex gap-1 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#C8956B] rounded-full" style={{ width: `${(occupied / rooms.length) * 100}%` }} />
                            <div className="bg-[#4A7C59] rounded-full" style={{ width: `${(available / rooms.length) * 100}%` }} />
                            <div className="bg-stone-200 rounded-full flex-1" />
                          </div>
                          <div className="flex gap-3 text-[11px] text-stone-400">
                            <span><span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C8956B] mr-1" />{occupied} occupied</span>
                            <span><span className="inline-block w-1.5 h-1.5 rounded-full bg-[#4A7C59] mr-1" />{available} free</span>
                            <span className="ml-auto">{rooms.length} rooms</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {properties.length === 0 && (
            <div className="text-center py-10 text-stone-400 border-2 border-dashed border-stone-200 rounded-xl">
              <p className="text-sm">No properties yet</p>
              <Button size="sm" className="mt-3" onClick={() => setShowPropertyForm(true)}>
                <Plus className="h-3.5 w-3.5" /> Add First Property
              </Button>
            </div>
          )}
        </div>

        {/* Room Detail */}
        <div className="lg:col-span-2">
          {selectedProp ? (
            <div className="space-y-4">
              {/* Property header */}
              <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{propertyTypeIcon[selectedProp.property_type]}</span>
                      <h2 className="text-lg font-bold text-stone-900">{selectedProp.name}</h2>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-stone-500">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{selectedProp.location}, {selectedProp.country}</span>
                      {selectedProp.contact_email && <span>{selectedProp.contact_email}</span>}
                      {selectedProp.contact_phone && <span>{selectedProp.contact_phone}</span>}
                      <span>Check-in: {selectedProp.check_in_time} · Check-out: {selectedProp.check_out_time}</span>
                    </div>
                    {selectedProp.description && (
                      <p className="text-xs text-stone-400 mt-1 line-clamp-2">{selectedProp.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="secondary" size="sm" onClick={() => { setShowRoomForm(true); setEditRoom(undefined) }}>
                      <Plus className="h-3.5 w-3.5" /> Add Room
                    </Button>
                    <button
                      onClick={() => { if (confirm(`Delete property "${selectedProp.name}"?`)) { deleteProperty(selectedProp.id); setSelectedPropertyId(null) } }}
                      className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                      title="Delete property"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Rooms grid */}
              {selectedRooms.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedRooms.map((room) => {
                    const sc = roomStatusConfig[room.status]
                    return (
                      <div key={room.id} className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm hover:shadow transition-shadow">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${sc.dot}`} />
                            <div className="min-w-0">
                              <p className="font-semibold text-stone-900 text-sm truncate">{room.name}</p>
                              <p className="text-xs text-stone-400">
                                #{room.room_number} · {roomTypeLabel[room.room_type] || room.room_type} · {room.capacity} Pers.
                                {room.square_meters ? ` · ${room.square_meters}m²` : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Badge variant={sc.badge}>{sc.label}</Badge>
                          </div>
                        </div>

                        {/* Amenities */}
                        {room.amenities && room.amenities.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {room.amenities.slice(0, 4).map(a => (
                              <span key={a} className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded">{a}</span>
                            ))}
                            {room.amenities.length > 4 && (
                              <span className="text-[10px] text-stone-400">+{room.amenities.length - 4}</span>
                            )}
                          </div>
                        )}

                        <div className="mt-3 pt-3 border-t border-stone-50 flex items-center justify-between">
                          <span className="text-sm font-bold text-[#6B4226]">
                            {formatCurrency(room.base_price_per_night, selectedProp.currency)}
                            <span className="text-xs font-normal text-stone-400"> / night</span>
                          </span>
                          <div className="flex gap-1">
                            {/* Status cycle button */}
                            <button
                              onClick={() => cycleRoomStatus(room)}
                              title={`Status: ${sc.label} → cycle next`}
                              className="px-2 py-1 text-xs rounded-lg border border-stone-200 text-stone-500 hover:border-[#6B4226] hover:text-[#6B4226] transition-colors"
                            >
                              Status ↻
                            </button>
                            <button onClick={() => { setEditRoom(room); setShowRoomForm(true) }}
                              className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 transition-colors" title="Edit">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => { if (confirm(`Delete room "${room.name}"?`)) deleteRoom(room.id) }}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors" title="Delete">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {room.status === "maintenance" && (
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-orange-600 bg-orange-50 rounded-lg px-2 py-1.5">
                            <AlertTriangle className="h-3 w-3 shrink-0" />
                            Room under maintenance — not bookable
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-stone-400 border-2 border-dashed border-stone-200 rounded-xl">
                  <BedDouble className="h-8 w-8 mb-2" />
                  <p className="text-sm">No rooms added yet</p>
                  <Button size="sm" className="mt-3" onClick={() => { setShowRoomForm(true); setEditRoom(undefined) }}>
                    <Plus className="h-3.5 w-3.5" /> Add First Room
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-stone-400 border-2 border-dashed border-stone-200 rounded-xl">
              <BedDouble className="h-10 w-10 mb-3" />
              <p className="text-sm font-medium">Select a Property</p>
              <p className="text-xs mt-1">Click on a property on the left</p>
            </div>
          )}
        </div>
      </div>

      {showRoomForm && (
        <RoomForm
          room={editRoom}
          propertyId={selectedPropertyId || undefined}
          onClose={() => { setShowRoomForm(false); setEditRoom(undefined) }}
        />
      )}
      {showPropertyForm && (
        <PropertyForm onClose={() => setShowPropertyForm(false)} />
      )}
    </div>
  )
}
