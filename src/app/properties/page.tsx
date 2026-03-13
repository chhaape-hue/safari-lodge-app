"use client"

import { useState, useEffect } from "react"
import { Topbar } from "@/components/layout/topbar"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import { LayoutGrid, CalendarDays, Plus, Loader2 } from "lucide-react"
import { PropertyGridView } from "@/components/modules/property-grid-view"
import { AvailabilityCalendar } from "@/components/modules/availability-calendar"
import Link from "next/link"

export default function PropertiesPage() {
  const { properties, loading, error } = useStore()
  const [view, setView] = useState<"calendar" | "grid">("calendar")
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("")

  // Set first property once data loads
  useEffect(() => {
    if (!selectedPropertyId && properties.length > 0) {
      setSelectedPropertyId(properties[0].id)
    }
  }, [properties, selectedPropertyId])

  // Switch to grid view automatically when no properties so user can add one
  useEffect(() => {
    if (!loading && properties.length === 0) setView("grid")
  }, [loading, properties.length])

  return (
    <div>
      <Topbar
        title="Properties & Availability"
        subtitle="Rooms, occupancy and booking calendar"
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
                Calendar
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
                Overview
              </button>
            </div>
            <Link href="/bookings/new">
              <Button size="sm">
                <Plus className="h-3.5 w-3.5" />
                New Booking
              </Button>
            </Link>
          </div>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-32 gap-2 text-stone-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading properties…</span>
        </div>
      ) : error ? (
        <div className="p-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        </div>
      ) : view === "calendar" ? (
        selectedPropertyId ? (
          <AvailabilityCalendar
            selectedPropertyId={selectedPropertyId}
            onPropertyChange={setSelectedPropertyId}
          />
        ) : (
          <PropertyGridView />
        )
      ) : (
        <PropertyGridView />
      )}
    </div>
  )
}
