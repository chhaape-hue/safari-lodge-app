"use client"

import { useState, useMemo } from "react"
import { useStore } from "@/lib/store"
import { formatCurrency } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { BookingForm } from "@/components/modules/booking-form"
import type { Booking, Room } from "@/types"

// ─── Config ───────────────────────────────────────────────────────────────────

const DAYS_SHOWN = 28

const BOOKING_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  confirmed:   { bg: "bg-[#C8956B]",   text: "text-white",      border: "border-[#B07A52]" },
  checked_in:  { bg: "bg-[#4A7C59]",   text: "text-white",      border: "border-[#3A6147]" },
  checked_out: { bg: "bg-[#A89880]",   text: "text-white",      border: "border-[#8C7A66]" },
  pending:     { bg: "bg-[#E8C547]",   text: "text-[#5C4A00]",  border: "border-[#C9A830]" },
  cancelled:   { bg: "bg-[#C0392B]",   text: "text-white",      border: "border-[#A93226]" },
  no_show:     { bg: "bg-stone-400",   text: "text-white",      border: "border-stone-500" },
}

const STATUS_LABELS: Record<string, string> = {
  confirmed:   "Bestätigt",
  checked_in:  "Eingecheckt",
  checked_out: "Ausgecheckt",
  pending:     "Ausstehend",
  cancelled:   "Storniert",
  no_show:     "No-Show",
}

const ROOM_STATUS_COLORS: Record<string, string> = {
  available:   "bg-[#E8F4EC]",
  occupied:    "bg-[#FDF3EC]",
  maintenance: "bg-[#FDECEA]",
  blocked:     "bg-stone-100",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function toDateStr(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function isToday(date: Date): boolean {
  return toDateStr(date) === toDateStr(new Date())
}

function isWeekend(date: Date): boolean {
  return date.getDay() === 0 || date.getDay() === 6
}

const DAY_NAMES_SHORT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]
const MONTH_NAMES = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]

// ─── Tooltip ─────────────────────────────────────────────────────────────────

interface TooltipData {
  booking: Booking
  x: number
  y: number
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  selectedPropertyId: string
  onPropertyChange: (id: string) => void
}

export function AvailabilityCalendar({ selectedPropertyId, onPropertyChange }: Props) {
  const { properties, rooms: allRooms, bookings: allBookings, guests } = useStore()
  const [startDate, setStartDate] = useState<Date>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 3)
    return d
  })
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const [hoveredCell, setHoveredCell] = useState<string | null>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [prefillDate, setPrefillDate] = useState<string | undefined>()
  const [prefillRoomId, setPrefillRoomId] = useState<string | undefined>()

  // Generate day array
  const days = useMemo(() =>
    Array.from({ length: DAYS_SHOWN }, (_, i) => addDays(startDate, i)),
    [startDate]
  )

  const property = properties.find(p => p.id === selectedPropertyId)!
  const rooms = allRooms.filter(r => r.property_id === selectedPropertyId)

  // Bookings for this property, indexed by room
  const bookingsByRoom = useMemo(() => {
    const map: Record<string, Booking[]> = {}
    allBookings
      .filter(b => b.property_id === selectedPropertyId && b.status !== "cancelled")
      .forEach(b => {
        if (!map[b.room_id]) map[b.room_id] = []
        map[b.room_id].push(b)
      })
    return map
  }, [selectedPropertyId, allBookings])

  // For each room+day: which booking spans this day?
  function getBookingForDay(roomId: string, day: Date): Booking | null {
    const dayStr = toDateStr(day)
    return bookingsByRoom[roomId]?.find(b =>
      b.check_in <= dayStr && b.check_out > dayStr
    ) ?? null
  }

  // Calculate booking bar segments
  function getBookingSegments(roomId: string) {
    const segments: Array<{
      booking: Booking
      startIndex: number
      length: number
    }> = []

    const bookings = bookingsByRoom[roomId] || []
    const rangeStart = toDateStr(days[0])
    const rangeEnd = toDateStr(days[days.length - 1])

    bookings.forEach(booking => {
      if (booking.check_out <= rangeStart || booking.check_in > rangeEnd) return

      const startIdx = Math.max(
        0,
        days.findIndex(d => toDateStr(d) >= booking.check_in)
      )
      const endIdx = days.findIndex(d => toDateStr(d) >= booking.check_out)
      const length = (endIdx === -1 ? days.length : endIdx) - startIdx

      if (length > 0) {
        segments.push({ booking, startIndex: startIdx, length })
      }
    })

    return segments
  }

  const navigate = (dir: number) => {
    setStartDate(d => addDays(d, dir * 7))
  }

  const goToToday = () => {
    const d = new Date()
    d.setDate(d.getDate() - 3)
    setStartDate(d)
  }

  // Month header groups
  const monthGroups = useMemo(() => {
    const groups: Array<{ label: string; count: number }> = []
    days.forEach(day => {
      const label = `${MONTH_NAMES[day.getMonth()]} ${day.getFullYear()}`
      if (groups.length === 0 || groups[groups.length - 1].label !== label) {
        groups.push({ label, count: 1 })
      } else {
        groups[groups.length - 1].count++
      }
    })
    return groups
  }, [days])

  const CELL_W = 36 // px width per day cell
  const ROW_H = 44  // px height per room row

  return (
    <div className="p-4 space-y-3">
      {/* Property Tabs */}
      <div className="flex gap-2 flex-wrap">
        {properties.map(p => (
          <button
            key={p.id}
            onClick={() => onPropertyChange(p.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              p.id === selectedPropertyId
                ? "bg-[#6B4226] text-white border-[#6B4226] shadow-sm"
                : "bg-white text-stone-600 border-stone-300 hover:border-[#6B4226] hover:text-[#6B4226]"
            }`}
          >
            <span className="mr-1.5">
              {p.type === "lodge" ? "🏕️" : p.type === "houseboat" ? "🚢" : "⛺"}
            </span>
            {p.name}
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
              p.id === selectedPropertyId ? "bg-white/20" : "bg-stone-100"
            }`}>
              {allRooms.filter(r => r.property_id === p.id).length} Zimmer
            </span>
          </button>
        ))}
      </div>

      {/* Calendar Card */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">

        {/* Header: Nav + Legend */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 bg-[#FAF7F2]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-lg hover:bg-stone-200 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-stone-600" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-xs font-medium rounded-lg bg-white border border-stone-300 text-stone-600 hover:bg-stone-50 transition-colors"
            >
              Heute
            </button>
            <button
              onClick={() => navigate(1)}
              className="p-1.5 rounded-lg hover:bg-stone-200 transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-stone-600" />
            </button>
            <span className="text-sm font-semibold text-stone-700 ml-1">
              {MONTH_NAMES[startDate.getMonth()]} {startDate.getFullYear()}
            </span>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-xs">
            {Object.entries(BOOKING_COLORS).slice(0, 4).map(([status, colors]) => (
              <div key={status} className="flex items-center gap-1">
                <div className={`h-3 w-5 rounded-sm ${colors.bg}`} />
                <span className="text-stone-500">{STATUS_LABELS[status]}</span>
              </div>
            ))}
            <div className="flex items-center gap-1">
              <div className="h-3 w-5 rounded-sm bg-[#E8F4EC] border border-[#4A7C59]/20" />
              <span className="text-stone-500">Frei</span>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          <div style={{ minWidth: `${200 + DAYS_SHOWN * CELL_W}px` }}>

            {/* Month row */}
            <div className="flex border-b border-stone-100">
              <div style={{ width: 200 }} className="shrink-0 bg-[#FAF7F2]" />
              {monthGroups.map((g, i) => (
                <div
                  key={i}
                  style={{ width: g.count * CELL_W }}
                  className="border-l border-stone-200 px-2 py-1 text-xs font-semibold text-stone-500 bg-[#FAF7F2]"
                >
                  {g.label}
                </div>
              ))}
            </div>

            {/* Day header row */}
            <div className="flex border-b border-stone-200">
              <div
                style={{ width: 200 }}
                className="shrink-0 px-3 py-2 bg-[#FAF7F2] border-r border-stone-200"
              >
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Zimmer
                </span>
              </div>
              {days.map((day, i) => {
                const today = isToday(day)
                const weekend = isWeekend(day)
                return (
                  <div
                    key={i}
                    style={{ width: CELL_W }}
                    className={`shrink-0 flex flex-col items-center justify-center py-1.5 border-l border-stone-100 ${
                      today ? "bg-[#6B4226]/10" : weekend ? "bg-stone-50" : "bg-[#FAF7F2]"
                    }`}
                  >
                    <span className={`text-[10px] font-medium ${today ? "text-[#6B4226]" : "text-stone-400"}`}>
                      {DAY_NAMES_SHORT[day.getDay()]}
                    </span>
                    <span className={`text-xs font-bold leading-none mt-0.5 ${
                      today
                        ? "text-white bg-[#6B4226] w-5 h-5 rounded-full flex items-center justify-center text-[11px]"
                        : "text-stone-600"
                    }`}>
                      {day.getDate()}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Room rows */}
            {rooms.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-stone-400 text-sm">
                Keine Zimmer für diese Property angelegt.
              </div>
            ) : (
              rooms.map((room, roomIdx) => {
                const segments = getBookingSegments(room.id)
                return (
                  <div
                    key={room.id}
                    className={`flex border-b border-stone-100 last:border-0 ${
                      roomIdx % 2 === 0 ? "bg-white" : "bg-[#FDFCFA]"
                    }`}
                    style={{ height: ROW_H }}
                  >
                    {/* Room label */}
                    <div
                      style={{ width: 200 }}
                      className="shrink-0 flex items-center gap-2 px-3 border-r border-stone-200"
                    >
                      <div className={`w-2 h-2 rounded-full shrink-0 ${
                        room.status === "available" ? "bg-[#4A7C59]" :
                        room.status === "occupied" ? "bg-[#C8956B]" :
                        room.status === "maintenance" ? "bg-red-400" : "bg-stone-300"
                      }`} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-stone-800 truncate">{room.name}</p>
                        <p className="text-[11px] text-stone-400">
                          #{room.room_number} · {room.capacity} Pers. · {formatCurrency(room.base_price_per_night)}/N
                        </p>
                      </div>
                    </div>

                    {/* Day cells (background) */}
                    <div className="relative flex flex-1">
                      {days.map((day, i) => {
                        const today = isToday(day)
                        const weekend = isWeekend(day)
                        const cellKey = `${room.id}-${i}`
                        return (
                          <div
                            key={i}
                            style={{ width: CELL_W }}
                            className={`shrink-0 h-full border-l border-stone-100 cursor-pointer transition-colors ${
                              today ? "bg-[#6B4226]/5" :
                              weekend ? "bg-stone-50/80" : ""
                            } ${hoveredCell === cellKey ? "bg-[#6B4226]/10" : ""}`}
                            onMouseEnter={() => setHoveredCell(cellKey)}
                            onMouseLeave={() => setHoveredCell(null)}
                          />
                        )
                      })}

                      {/* Booking bars */}
                      {segments.map(({ booking, startIndex, length }) => {
                        const colors = BOOKING_COLORS[booking.status] || BOOKING_COLORS.confirmed
                        const guest = guests.find(g => g.id === booking.guest_id)
                        const nights = length
                        return (
                          <div
                            key={booking.id}
                            style={{
                              position: "absolute",
                              left: startIndex * CELL_W + 2,
                              width: length * CELL_W - 4,
                              top: 6,
                              height: ROW_H - 12,
                            }}
                            className={`
                              rounded-md border ${colors.bg} ${colors.border} ${colors.text}
                              flex items-center px-2 gap-1 overflow-hidden
                              cursor-pointer transition-all hover:brightness-95 hover:shadow-md
                              select-none z-10
                            `}
                            onMouseEnter={e => {
                              setTooltip({
                                booking,
                                x: e.clientX,
                                y: e.clientY,
                              })
                            }}
                            onMouseMove={e => {
                              setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : null)
                            }}
                            onMouseLeave={() => setTooltip(null)}
                          >
                            {length > 1 && (
                              <>
                                <span className="text-[11px] font-bold truncate leading-none">
                                  {guest?.last_name || booking.booking_reference}
                                </span>
                                {length > 2 && (
                                  <span className="text-[10px] opacity-75 truncate leading-none ml-1 hidden sm:block">
                                    · {nights}N
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })
            )}

            {/* Availability summary footer */}
            <div className="flex border-t border-stone-200 bg-[#FAF7F2]" style={{ height: 32 }}>
              <div
                style={{ width: 200 }}
                className="shrink-0 flex items-center px-3 border-r border-stone-200"
              >
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Frei</span>
              </div>
              {days.map((day, i) => {
                const dayStr = toDateStr(day)
                const booked = rooms.filter(r =>
                  bookingsByRoom[r.id]?.some(b => b.check_in <= dayStr && b.check_out > dayStr)
                ).length
                const free = rooms.length - booked
                const pct = rooms.length > 0 ? free / rooms.length : 1
                return (
                  <div
                    key={i}
                    style={{ width: CELL_W }}
                    className={`shrink-0 flex items-center justify-center border-l border-stone-100 ${
                      isToday(day) ? "bg-[#6B4226]/5" : ""
                    }`}
                  >
                    <span className={`text-[11px] font-bold ${
                      free === 0 ? "text-red-500" :
                      pct < 0.3 ? "text-amber-600" :
                      "text-[#4A7C59]"
                    }`}>
                      {free > 0 ? free : "–"}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Zimmer gesamt",
            value: rooms.length,
            color: "text-stone-800",
          },
          {
            label: "Heute belegt",
            value: rooms.filter(r =>
              bookingsByRoom[r.id]?.some(b =>
                b.check_in <= toDateStr(new Date()) && b.check_out > toDateStr(new Date())
              )
            ).length,
            color: "text-[#C8956B]",
          },
          {
            label: "Heute frei",
            value: rooms.filter(r =>
              !bookingsByRoom[r.id]?.some(b =>
                b.check_in <= toDateStr(new Date()) && b.check_out > toDateStr(new Date())
              )
            ).length,
            color: "text-[#4A7C59]",
          },
          {
            label: "In Wartung",
            value: rooms.filter(r => r.status === "maintenance").length,
            color: "text-red-500",
          },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-stone-200 px-4 py-3 shadow-sm">
            <p className="text-xs text-stone-500">{stat.label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {tooltip && <BookingTooltip data={tooltip} />}

      {showBookingForm && (
        <BookingForm
          onClose={() => { setShowBookingForm(false); setPrefillDate(undefined); setPrefillRoomId(undefined) }}
          prefillPropertyId={selectedPropertyId}
          prefillRoomId={prefillRoomId}
          prefillDate={prefillDate}
        />
      )}
    </div>
  )
}

// ─── Tooltip Component ────────────────────────────────────────────────────────

function BookingTooltip({ data }: { data: TooltipData }) {
  const { properties, rooms: allRooms, guests } = useStore()
  const { booking, x, y } = data
  const guest = guests.find(g => g.id === booking.guest_id)
  const property = properties.find(p => p.id === booking.property_id)
  const room = allRooms.find(r => r.id === booking.room_id)
  const colors = BOOKING_COLORS[booking.status] || BOOKING_COLORS.confirmed
  const outstanding = booking.total_amount - booking.paid_amount

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{ left: x + 12, top: y - 10 }}
    >
      <div className="bg-stone-900 text-white rounded-xl shadow-2xl p-3 w-64 text-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold">{guest?.first_name} {guest?.last_name}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
            {STATUS_LABELS[booking.status]}
          </span>
        </div>
        <div className="space-y-1 text-xs text-stone-300">
          <div className="flex justify-between">
            <span>Zimmer</span>
            <span className="text-white font-medium">{room?.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Check-in</span>
            <span className="text-white">{booking.check_in}</span>
          </div>
          <div className="flex justify-between">
            <span>Check-out</span>
            <span className="text-white">{booking.check_out}</span>
          </div>
          <div className="flex justify-between">
            <span>Gäste</span>
            <span className="text-white">{booking.adults} Erw. {booking.children > 0 ? `· ${booking.children} Kinder` : ""}</span>
          </div>
          <div className="flex justify-between">
            <span>Referenz</span>
            <span className="text-white font-mono">{booking.booking_reference}</span>
          </div>
          <div className="border-t border-stone-700 pt-1 mt-1 flex justify-between">
            <span>Gesamtbetrag</span>
            <span className="text-white font-bold">{formatCurrency(booking.total_amount)}</span>
          </div>
          {outstanding > 0 && (
            <div className="flex justify-between text-amber-400">
              <span>Ausstehend</span>
              <span className="font-bold">{formatCurrency(outstanding)}</span>
            </div>
          )}
          {booking.nightsbridge_booking_id && (
            <div className="flex justify-between text-blue-400">
              <span>Nightsbridge</span>
              <span>{booking.nightsbridge_booking_id}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
