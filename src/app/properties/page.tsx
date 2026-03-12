"use client"

import { useState } from "react"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DEMO_PROPERTIES, DEMO_ROOMS } from "@/lib/demo-data"
import { formatCurrency } from "@/lib/utils"
import { Building2, BedDouble, MapPin, Plus, Eye, Settings2 } from "lucide-react"
import type { Property, PropertyType, RoomStatus } from "@/types"

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

const roomStatusColors: Record<RoomStatus, string> = {
  available: "bg-green-400",
  occupied: "bg-amber-500",
  maintenance: "bg-red-400",
  blocked: "bg-stone-300",
}

const roomTypeLabel: Record<string, string> = {
  tent: "Zelt",
  suite: "Suite",
  standard: "Standard",
  family: "Familie",
  honeymoon: "Honeymoon",
  dormitory: "Schlafsaal",
}

export default function PropertiesPage() {
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null)

  const roomsByProperty = DEMO_ROOMS.reduce((acc, room) => {
    if (!acc[room.property_id]) acc[room.property_id] = []
    acc[room.property_id].push(room)
    return acc
  }, {} as Record<string, typeof DEMO_ROOMS>)

  const selectedProp = selectedProperty
    ? DEMO_PROPERTIES.find(p => p.id === selectedProperty)
    : null
  const selectedRooms = selectedProperty ? (roomsByProperty[selectedProperty] || []) : []

  return (
    <div>
      <Topbar
        title="Properties & Zimmer"
        subtitle="Lodges, Hausboote und Camps verwalten"
        actions={
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" />
            Property hinzufügen
          </Button>
        }
      />

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Property List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider">
              {DEMO_PROPERTIES.length} Properties
            </h2>
            {DEMO_PROPERTIES.map((property) => {
              const rooms = roomsByProperty[property.id] || []
              const occupied = rooms.filter(r => r.status === "occupied").length
              const status = propertyStatusConfig[property.status]
              const isSelected = selectedProperty === property.id

              return (
                <Card
                  key={property.id}
                  onClick={() => setSelectedProperty(isSelected ? null : property.id)}
                  className={isSelected ? "ring-2 ring-amber-500 ring-offset-2" : ""}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{propertyTypeIcon[property.type]}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-stone-900 text-sm truncate">{property.name}</h3>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">{propertyTypeLabel[property.type]}</p>
                        <div className="flex items-center gap-1 mt-1.5 text-xs text-stone-400">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{property.location}</span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-1 text-xs text-stone-500">
                            <BedDouble className="h-3 w-3" />
                            <span>{rooms.length} Zimmer</span>
                            {rooms.length > 0 && (
                              <span className="text-amber-600 ml-1">· {occupied} belegt</span>
                            )}
                          </div>
                          {property.nightsbridge_property_id && (
                            <span className="text-xs text-blue-500 font-medium">NB ✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Room Detail Panel */}
          <div className="lg:col-span-2">
            {selectedProp ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-stone-900">{selectedProp.name}</h2>
                    <p className="text-sm text-stone-500">{selectedProp.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm">
                      <Settings2 className="h-3.5 w-3.5" />
                      Bearbeiten
                    </Button>
                    <Button size="sm">
                      <Plus className="h-3.5 w-3.5" />
                      Zimmer hinzufügen
                    </Button>
                  </div>
                </div>

                {/* Room Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedRooms.map((room) => (
                    <Card key={room.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className={`w-2.5 h-2.5 rounded-full ${roomStatusColors[room.status]}`} />
                              <span className="font-semibold text-stone-900 text-sm">{room.name}</span>
                            </div>
                            <p className="text-xs text-stone-500 mt-0.5 ml-4.5">
                              #{room.room_number} · {roomTypeLabel[room.type]} · {room.capacity} Pers.
                            </p>
                          </div>
                          <Badge
                            variant={
                              room.status === "available" ? "success"
                                : room.status === "occupied" ? "warning"
                                  : room.status === "maintenance" ? "danger"
                                    : "neutral"
                            }
                          >
                            {room.status === "available" ? "Frei"
                              : room.status === "occupied" ? "Belegt"
                                : room.status === "maintenance" ? "Wartung"
                                  : "Gesperrt"}
                          </Badge>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-sm font-semibold text-amber-700">
                            {formatCurrency(room.base_price_per_night)} / Nacht
                          </span>
                          {room.nightsbridge_room_id && (
                            <span className="text-xs text-blue-500">NB: {room.nightsbridge_room_id}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {selectedRooms.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-40 text-stone-400">
                    <BedDouble className="h-8 w-8 mb-2" />
                    <p className="text-sm">Noch keine Zimmer angelegt</p>
                    <Button variant="secondary" size="sm" className="mt-3">
                      <Plus className="h-3.5 w-3.5" />
                      Zimmer hinzufügen
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-80 text-stone-400 border-2 border-dashed border-stone-200 rounded-xl">
                <Building2 className="h-10 w-10 mb-3" />
                <p className="text-sm font-medium">Property auswählen</p>
                <p className="text-xs mt-1">Klicke auf eine Property links um die Zimmer zu sehen</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
