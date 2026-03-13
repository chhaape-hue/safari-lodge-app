"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { X, User, BedDouble, Calendar, DollarSign, ChevronDown } from "lucide-react"
import type { BookingSource, BookingStatus } from "@/types"

interface Props {
  onClose: () => void
  prefillRoomId?: string
  prefillPropertyId?: string
  prefillDate?: string
}

const sourceOptions: { value: BookingSource; label: string }[] = [
  { value: "direct", label: "Direkt" },
  { value: "nightsbridge", label: "Nightsbridge" },
  { value: "agent", label: "Reisebüro" },
  { value: "email", label: "E-Mail" },
  { value: "phone", label: "Telefon" },
  { value: "walk_in", label: "Walk-in" },
]

export function BookingForm({ onClose, prefillRoomId, prefillPropertyId, prefillDate }: Props) {
  const { properties, rooms, addBooking, addGuest, guests } = useStore()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Step 1: Property & Room & Dates
  const [propertyId, setPropertyId] = useState(prefillPropertyId || properties[0]?.id || "")
  const [roomId, setRoomId] = useState(prefillRoomId || "")
  const [checkIn, setCheckIn] = useState(prefillDate || "")
  const [checkOut, setCheckOut] = useState("")
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)

  // Step 2: Guest
  const [guestMode, setGuestMode] = useState<"new" | "existing">("new")
  const [existingGuestId, setExistingGuestId] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [nationality, setNationality] = useState("")

  // Step 3: Booking details
  const [source, setSource] = useState<BookingSource>("direct")
  const [totalAmount, setTotalAmount] = useState("")
  const [paidAmount, setPaidAmount] = useState("")
  const [notes, setNotes] = useState("")
  const [nbBookingId, setNbBookingId] = useState("")

  const availableRooms = rooms.filter(r => r.property_id === propertyId)
  const selectedRoom = rooms.find(r => r.id === roomId)

  // Auto-calculate amount when dates + room change
  const nights = checkIn && checkOut
    ? Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 0

  const suggestedAmount = selectedRoom ? nights * selectedRoom.base_price_per_night : 0

  function validateStep1() {
    const e: Record<string, string> = {}
    if (!propertyId) e.property = "Bitte Property wählen"
    if (!roomId) e.room = "Bitte Zimmer wählen"
    if (!checkIn) e.checkIn = "Check-in Datum erforderlich"
    if (!checkOut) e.checkOut = "Check-out Datum erforderlich"
    if (checkIn && checkOut && checkOut <= checkIn) e.checkOut = "Check-out muss nach Check-in sein"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validateStep2() {
    const e: Record<string, string> = {}
    if (guestMode === "existing" && !existingGuestId) e.guest = "Bitte Gast auswählen"
    if (guestMode === "new") {
      if (!firstName.trim()) e.firstName = "Vorname erforderlich"
      if (!lastName.trim()) e.lastName = "Nachname erforderlich"
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!totalAmount) {
      setErrors({ totalAmount: "Betrag erforderlich" })
      return
    }
    setSaving(true)
    try {
      let guestId = existingGuestId
      if (guestMode === "new") {
        const guest = await addGuest({ first_name: firstName, last_name: lastName, email, phone, nationality })
        guestId = guest.id
      }
      await addBooking({
        property_id: propertyId,
        room_id: roomId,
        guest_id: guestId,
        status: "confirmed",
        source,
        check_in: checkIn,
        check_out: checkOut,
        adults,
        children,
        total_amount: parseFloat(totalAmount),
        paid_amount: parseFloat(paidAmount || "0"),
        notes: notes || undefined,
        nightsbridge_booking_id: nbBookingId || undefined,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const inputCls = (err?: string) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4226] transition-colors ${
      err ? "border-red-400 bg-red-50" : "border-stone-300 bg-white"
    }`

  const labelCls = "block text-sm font-medium text-stone-700 mb-1"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-[#FAF7F2] rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Neue Buchung</h2>
            <p className="text-xs text-stone-500">Schritt {step} von 3</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-stone-200 transition-colors">
            <X className="h-4 w-4 text-stone-500" />
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex px-6 pt-4 gap-2">
          {[
            { n: 1, label: "Zimmer & Datum", icon: BedDouble },
            { n: 2, label: "Gast", icon: User },
            { n: 3, label: "Details & Betrag", icon: DollarSign },
          ].map(s => (
            <div key={s.n} className="flex-1">
              <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                step === s.n
                  ? "bg-[#6B4226] text-white"
                  : step > s.n
                    ? "bg-[#4A7C59]/10 text-[#4A7C59]"
                    : "bg-stone-100 text-stone-400"
              }`}>
                <s.icon className="h-3 w-3 shrink-0" />
                <span className="truncate">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 space-y-4">
          {/* ── Step 1: Zimmer & Datum ── */}
          {step === 1 && (
            <>
              <div>
                <label className={labelCls}>Property *</label>
                <select value={propertyId} onChange={e => { setPropertyId(e.target.value); setRoomId("") }}
                  className={inputCls(errors.property)}>
                  <option value="">Bitte wählen...</option>
                  {properties.filter(p => p.status === "active").map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                {errors.property && <p className="text-xs text-red-500 mt-1">{errors.property}</p>}
              </div>

              <div>
                <label className={labelCls}>Zimmer *</label>
                <select value={roomId} onChange={e => setRoomId(e.target.value)}
                  disabled={!propertyId}
                  className={inputCls(errors.room)}>
                  <option value="">Bitte wählen...</option>
                  {availableRooms.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} (#{r.room_number}) – {r.capacity} Pers. – BWP {r.base_price_per_night}/N
                    </option>
                  ))}
                </select>
                {errors.room && <p className="text-xs text-red-500 mt-1">{errors.room}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Check-in *</label>
                  <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
                    className={inputCls(errors.checkIn)} />
                  {errors.checkIn && <p className="text-xs text-red-500 mt-1">{errors.checkIn}</p>}
                </div>
                <div>
                  <label className={labelCls}>Check-out *</label>
                  <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
                    min={checkIn || undefined}
                    className={inputCls(errors.checkOut)} />
                  {errors.checkOut && <p className="text-xs text-red-500 mt-1">{errors.checkOut}</p>}
                </div>
              </div>

              {nights > 0 && selectedRoom && (
                <div className="bg-[#FAF7F2] border border-[#6B4226]/20 rounded-lg px-4 py-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-600">{nights} Nächte × BWP {selectedRoom.base_price_per_night}</span>
                    <span className="font-bold text-[#6B4226]">BWP {suggestedAmount.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Erwachsene</label>
                  <select value={adults} onChange={e => setAdults(Number(e.target.value))} className={inputCls()}>
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Kinder</label>
                  <select value={children} onChange={e => setChildren(Number(e.target.value))} className={inputCls()}>
                    {[0,1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* ── Step 2: Gast ── */}
          {step === 2 && (
            <>
              <div className="flex gap-2">
                <button
                  onClick={() => setGuestMode("new")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    guestMode === "new" ? "bg-[#6B4226] text-white border-[#6B4226]" : "bg-white text-stone-600 border-stone-300"
                  }`}
                >
                  Neuer Gast
                </button>
                <button
                  onClick={() => setGuestMode("existing")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    guestMode === "existing" ? "bg-[#6B4226] text-white border-[#6B4226]" : "bg-white text-stone-600 border-stone-300"
                  }`}
                >
                  Bestehender Gast ({guests.length})
                </button>
              </div>

              {guestMode === "existing" ? (
                <div>
                  <label className={labelCls}>Gast auswählen *</label>
                  <select value={existingGuestId} onChange={e => setExistingGuestId(e.target.value)}
                    className={inputCls(errors.guest)}>
                    <option value="">Bitte wählen...</option>
                    {guests.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.first_name} {g.last_name}{g.email ? ` – ${g.email}` : ""}
                      </option>
                    ))}
                  </select>
                  {errors.guest && <p className="text-xs text-red-500 mt-1">{errors.guest}</p>}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Vorname *</label>
                      <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                        placeholder="Hans" className={inputCls(errors.firstName)} />
                      {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label className={labelCls}>Nachname *</label>
                      <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                        placeholder="Müller" className={inputCls(errors.lastName)} />
                      {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>E-Mail</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="hans@example.com" className={inputCls()} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Telefon</label>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                        placeholder="+49 171 ..." className={inputCls()} />
                    </div>
                    <div>
                      <label className={labelCls}>Nationalität</label>
                      <input type="text" value={nationality} onChange={e => setNationality(e.target.value)}
                        placeholder="Deutsch" className={inputCls()} />
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* ── Step 3: Details ── */}
          {step === 3 && (
            <>
              <div>
                <label className={labelCls}>Buchungsquelle</label>
                <select value={source} onChange={e => setSource(e.target.value as BookingSource)}
                  className={inputCls()}>
                  {sourceOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Gesamtbetrag (BWP) *</label>
                  <input
                    type="number" value={totalAmount}
                    onChange={e => setTotalAmount(e.target.value)}
                    placeholder={suggestedAmount > 0 ? String(suggestedAmount) : "0"}
                    className={inputCls(errors.totalAmount)}
                  />
                  {suggestedAmount > 0 && !totalAmount && (
                    <button
                      onClick={() => setTotalAmount(String(suggestedAmount))}
                      className="text-xs text-[#6B4226] hover:underline mt-1"
                    >
                      Vorschlag übernehmen: BWP {suggestedAmount.toLocaleString()}
                    </button>
                  )}
                  {errors.totalAmount && <p className="text-xs text-red-500 mt-1">{errors.totalAmount}</p>}
                </div>
                <div>
                  <label className={labelCls}>Bereits bezahlt (BWP)</label>
                  <input type="number" value={paidAmount} onChange={e => setPaidAmount(e.target.value)}
                    placeholder="0" className={inputCls()} />
                </div>
              </div>

              {source === "nightsbridge" && (
                <div>
                  <label className={labelCls}>Nightsbridge Buchungs-ID</label>
                  <input type="text" value={nbBookingId} onChange={e => setNbBookingId(e.target.value)}
                    placeholder="NB-12345" className={inputCls()} />
                </div>
              )}

              <div>
                <label className={labelCls}>Notizen / Sonderwünsche</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  rows={3} placeholder="Allergien, Sonderwünsche, interne Notizen..."
                  className={`${inputCls()} resize-none`} />
              </div>

              {/* Summary */}
              <div className="bg-[#FAF7F2] border border-[#6B4226]/20 rounded-lg p-4 space-y-2 text-sm">
                <p className="font-semibold text-stone-700 mb-2">Zusammenfassung</p>
                <div className="flex justify-between text-stone-600">
                  <span>Property</span>
                  <span className="font-medium">{properties.find(p => p.id === propertyId)?.name}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Zimmer</span>
                  <span className="font-medium">{selectedRoom?.name}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Zeitraum</span>
                  <span className="font-medium">{checkIn} → {checkOut} ({nights}N)</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Gast</span>
                  <span className="font-medium">
                    {guestMode === "new" ? `${firstName} ${lastName}` : guests.find(g => g.id === existingGuestId)
                      ? `${guests.find(g => g.id === existingGuestId)?.first_name} ${guests.find(g => g.id === existingGuestId)?.last_name}` : "–"}
                  </span>
                </div>
                {totalAmount && (
                  <div className="flex justify-between font-bold text-stone-800 border-t border-stone-200 pt-2 mt-2">
                    <span>Gesamtbetrag</span>
                    <span className="text-[#6B4226]">BWP {parseFloat(totalAmount).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer buttons */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-stone-100 bg-stone-50 rounded-b-2xl">
          <Button variant="ghost" onClick={step === 1 ? onClose : () => setStep(s => (s - 1) as 1 | 2 | 3)}>
            {step === 1 ? "Abbrechen" : "← Zurück"}
          </Button>
          {step < 3 ? (
            <Button onClick={() => {
              if (step === 1 && !validateStep1()) return
              if (step === 2 && !validateStep2()) return
              setStep(s => (s + 1) as 2 | 3)
              setErrors({})
            }}>
              Weiter →
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Wird gespeichert..." : "Buchung speichern ✓"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
