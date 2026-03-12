"use client"

import { useState } from "react"
import { Topbar } from "@/components/layout/topbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DEMO_PROPERTIES } from "@/lib/demo-data"
import { LayoutGrid, CalendarDays, Plus } from "lucide-react"
import { PropertyGridView } from "@/components/modules/property-grid-view"
import { AvailabilityCalendar } from "@/components/modules/availability-calendar"

export default function PropertiesPage() {
  const [view, setView] = useState<"calendar" | "grid">("calendar")
  const [selectedPropertyId, setSelectedPropertyId] = useState(DEMO_PROPERTIES[0].id)

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
            <Button size="sm">
              <Plus className="h-3.5 w-3.5" />
              Neue Buchung
            </Button>
          </div>
        }
      />

      {view === "calendar" ? (
        <AvailabilityCalendar
          selectedPropertyId={selectedPropertyId}
          onPropertyChange={setSelectedPropertyId}
        />
      ) : (
        <PropertyGridView />
      )}
    </div>
  )
}
