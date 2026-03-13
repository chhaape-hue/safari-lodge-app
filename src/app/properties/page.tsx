"use client"

import { useState, useEffect } from "react"
import { Topbar } from "@/components/layout/topbar"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import { LayoutGrid, CalendarDays, Plus } from "lucide-react"
import { PropertyGridView } from "@/components/modules/property-grid-view"
import { AvailabilityCalendar } from "@/components/modules/availability-calendar"
import Link from "next/link"

export default function PropertiesPage() {
  const { properties } = useStore()
  const [view, setView] = useState<"calendar" | "grid">("calendar")
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("")

  // Set first property once data loads
  useEffect(() => {
    if (!selectedPropertyId && properties.length > 0) {
      setSelectedPropertyId(properties[0].id)
    }
  }, [properties, selectedPropertyId])

  return (
    <div>
      <Topbar
        title="Properties & Verfügbarkeit"
        subtitle="Zimmer, Belegung und Buchungskalender"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-stone-300 overflow-hidden">
              <button
                onClick={() => setView("calendar")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
                  view === "calendar"
                    ? "bg-[#6B4226] text-white"
                    : "bg-white text-stone-600 hover:bg-stone-50"
                }`}
              >
                <CalendarDays className="h-3.5 w-3.5" />
                Kalender
              </button>
              <button
                onClick={() => setView("grid")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors border-l border-stone-300 ${
                  view === "grid"
                    ? "bg-[#6B4226] text-white"
                    : "bg-white text-stone-600 hover:bg-stone-50"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Übersicht
              </button>
            </div>
            <Link href="/bookings/new">
              <Button size="sm">
                <Plus className="h-3.5 w-3.5" />
                Neue Buchung
              </Button>
            </Link>
          </div>
        }
      />

      {view === "calendar" ? (
        selectedPropertyId ? (
          <AvailabilityCalendar
            selectedPropertyId={selectedPropertyId}
            onPropertyChange={setSelectedPropertyId}
          />
        ) : (
          <div className="p-12 text-center text-stone-500 text-sm">Lade Properties...</div>
        )
      ) : (
        <PropertyGridView />
      )}
    </div>
  )
}
