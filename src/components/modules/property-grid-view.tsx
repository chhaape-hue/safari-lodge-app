"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { MapPin, BedDouble, Plus, Settings2 } from "lucide-react"
import type { PropertyType, RoomStatus } from "@/types"

const propertyTypeLabel: Record<PropertyType, string> = {
  lodge: "Safari Lodge",
  houseboat: "Hausboot",
  camp: "Camp",
}

const propertyTypeIcon: Record<PropertyType, string> = {
  lodge: "🏕️",
  houseboat: "🚢",
  camp: "⛺",
}

const propertyStatusConfig = {
  active: { label: "Aktiv", variant: "success" as const },
  maintenance: { label: "Wartung", variant: "warning" as const },
  closed: { label: "Geschlossen", variant: "danger" as const },
}

const roomStatusConfig: Record<RoomStatus, { label: string; dot: string; badge: "success" | "warning" | "danger" | "neutral" }> = {
  available:   { label: "Frei",     dot: "bg-[#4A7C59]", badge: "success" },
  occupied:    { label: "Belegt",   dot: "bg-[#C8956B]", badge: "warning" },
  maintenance: { label: "Wartung",  dot: "bg-red-400",   badge: "danger" },
  blocked:     { label: "Gesperrt", dot: "bg-stone-300", badge: "neutral" },
}

const roomTypeLabel: Record<string, string> = {
  tent: "Zelt", suite: "Suite", standard: "Standard",
  family: "Familie", honeymoon: "Honeymoon", dormitory: "Schlafsaal",
}

export function PropertyGridView() {
  const { properties: DEMO_PROPERTIES, rooms: DEMO_ROOMS } = useStore()
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null)

  const roomsByProperty = DEMO_ROOMS.reduce((acc, room) => {
    if (!acc[room.property_id]) acc[room.property_id] = []
    acc[room.property_id].push(room)
    return acc
  }, {} as Record<string, typeof DEMO_ROOMS>)

  const selectedProp = selectedProperty ? DEMO_PROPERTIES.find(p => p.id === selectedProperty) : null
  const selectedRooms = selectedProperty ? (roomsByProperty[selectedProperty] || []) : []

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Property List */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider px-1">
            {DEMO_PROPERTIES.length} Properties
          </p>
          {DEMO_PROPERTIES.map((property) => {
            const rooms = roomsByProperty[property.id] || []
            const occupied = rooms.filter(r => r.status === "occupied").length
            const available = rooms.filter(r => r.status === "available").length
            const status = propertyStatusConfig[property.status]
            const isSelected = selectedProperty === property.id

            return (
              <Card
                key={property.id}
                onClick={() => setSelectedProperty(isSelected ? null : property.id)}
                className={isSelected ? "ring-2 ring-[#6B4226] ring-offset-1" : ""}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5">{propertyTypeIcon[property.type]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-stone-900 text-sm leading-tight">{property.name}</h3>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">{propertyTypeLabel[property.type]}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-stone-400">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{property.location}</span>
                      </div>
                      {rooms.length > 0 && (
                        <div className="mt-2.5 space-y-1">
                          <div className="flex gap-1 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#C8956B] rounded-full" style={{ width: `${(occupied / rooms.length) * 100}%` }} />
                            <div className="bg-[#4A7C59] rounded-full" style={{ width: `${(available / rooms.length) * 100}%` }} />
                            <div className="bg-stone-200 rounded-full flex-1" />
                          </div>
                          <div className="flex gap-3 text-[11px] text-stone-400">
                            <span><span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C8956B] mr-1" />{occupied} belegt</span>
                            <span><span className="inline-block w-1.5 h-1.5 rounded-full bg-[#4A7C59] mr-1" />{available} frei</span>
                            <span className="ml-auto">{rooms.length} Zimmer</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Room Detail */}
        <div className="lg:col-span-2">
          {selectedProp ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-stone-900">{selectedProp.name}</h2>
                  <p className="text-sm text-stone-500">{selectedProp.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm"><Settings2 className="h-3.5 w-3.5" />Bearbeiten</Button>
                  <Button size="sm"><Plus className="h-3.5 w-3.5" />Zimmer</Button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedRooms.map((room) => {
                  const sc = roomStatusConfig[room.status]
                  return (
                    <div key={room.id} className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm hover:shadow transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${sc.dot}`} />
                          <div>
                            <p className="font-semibold text-stone-900 text-sm">{room.name}</p>
                            <p className="text-xs text-stone-400">#{room.room_number} · {roomTypeLabel[room.type]} · {room.capacity} Pers.</p>
                          </div>
                        </div>
                        <Badge variant={sc.badge}>{sc.label}</Badge>
                      </div>
                      <div className="mt-3 pt-3 border-t border-stone-50 flex justify-between items-center">
                        <span className="text-sm font-bold text-[#6B4226]">{formatCurrency(room.base_price_per_night)}<span className="text-xs font-normal text-stone-400"> / Nacht</span></span>
                        {room.nightsbridge_room_id && (
                          <span className="text-xs text-blue-500">NB: {room.nightsbridge_room_id}</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              {selectedRooms.length === 0 && (
                <div className="flex flex-col items-center justify-center h-40 text-stone-400 border-2 border-dashed border-stone-200 rounded-xl">
                  <BedDouble className="h-8 w-8 mb-2" />
                  <p className="text-sm">Noch keine Zimmer angelegt</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-stone-400 border-2 border-dashed border-stone-200 rounded-xl">
              <BedDouble className="h-10 w-10 mb-3" />
              <p className="text-sm font-medium">Property auswählen</p>
              <p className="text-xs mt-1">Links auf eine Property klicken</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
