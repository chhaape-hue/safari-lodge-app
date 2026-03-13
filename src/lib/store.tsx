"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import type { Property, Room, Booking, Guest, CostEntry, StaffMember } from "@/types"
import { DEMO_PROPERTIES, DEMO_ROOMS, DEMO_BOOKINGS, DEMO_GUESTS, DEMO_COSTS, DEMO_STAFF } from "./demo-data"

// ─── Types ────────────────────────────────────────────────────────────────────

interface StoreState {
  properties: Property[]
  rooms: Room[]
  bookings: Booking[]
  guests: Guest[]
  costs: CostEntry[]
  staff: StaffMember[]
}

interface StoreActions {
  // Bookings
  addBooking: (booking: Omit<Booking, "id" | "booking_reference" | "created_at" | "updated_at">) => Booking
  updateBooking: (id: string, updates: Partial<Booking>) => void
  deleteBooking: (id: string) => void
  // Guests
  addGuest: (guest: Omit<Guest, "id" | "created_at">) => Guest
  updateGuest: (id: string, updates: Partial<Guest>) => void
  // Costs
  addCost: (cost: Omit<CostEntry, "id" | "created_at">) => CostEntry
  updateCost: (id: string, updates: Partial<CostEntry>) => void
  deleteCost: (id: string) => void
  // Staff
  addStaff: (member: Omit<StaffMember, "id" | "created_at" | "updated_at">) => StaffMember
  updateStaff: (id: string, updates: Partial<StaffMember>) => void
  deleteStaff: (id: string) => void
  // Properties & Rooms
  addProperty: (property: Omit<Property, "id" | "created_at" | "updated_at">) => Property
  updateProperty: (id: string, updates: Partial<Property>) => void
  deleteProperty: (id: string) => void
  addRoom: (room: Omit<Room, "id" | "created_at" | "updated_at">) => Room
  updateRoom: (id: string, updates: Partial<Room>) => void
  deleteRoom: (id: string) => void
  // Reset
  resetToDemo: () => void
}

type Store = StoreState & StoreActions

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function now(): string {
  return new Date().toISOString()
}

function generateBookingRef(propertyName: string): string {
  const prefix = propertyName
    .split(" ")
    .map(w => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 3)
  const date = new Date()
  const ym = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
  const seq = String(Math.floor(Math.random() * 9000) + 1000)
  return `${prefix}-${ym}-${seq}`
}

// ─── Context ──────────────────────────────────────────────────────────────────

const StoreContext = createContext<Store | null>(null)

const STORAGE_KEY = "safari-lodge-data"

function loadFromStorage(): StoreState | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveToStorage(state: StoreState) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

const INITIAL: StoreState = {
  properties: DEMO_PROPERTIES,
  rooms: DEMO_ROOMS,
  bookings: DEMO_BOOKINGS,
  guests: DEMO_GUESTS,
  costs: DEMO_COSTS,
  staff: DEMO_STAFF,
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(INITIAL)
  const [loaded, setLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadFromStorage()
    if (saved) setState(saved)
    setLoaded(true)
  }, [])

  // Persist on every change (after initial load)
  useEffect(() => {
    if (loaded) saveToStorage(state)
  }, [state, loaded])

  const update = useCallback((updater: (s: StoreState) => StoreState) => {
    setState(prev => updater(prev))
  }, [])

  // ── Bookings ──

  const addBooking = useCallback((data: Omit<Booking, "id" | "booking_reference" | "created_at" | "updated_at">): Booking => {
    const property = state.properties.find(p => p.id === data.property_id)
    const booking: Booking = {
      ...data,
      id: uid(),
      booking_reference: generateBookingRef(property?.name || "BKG"),
      created_at: now(),
      updated_at: now(),
    }
    update(s => ({ ...s, bookings: [...s.bookings, booking] }))
    return booking
  }, [state.properties, update])

  const updateBooking = useCallback((id: string, updates: Partial<Booking>) => {
    update(s => ({
      ...s,
      bookings: s.bookings.map(b => b.id === id ? { ...b, ...updates, updated_at: now() } : b),
    }))
  }, [update])

  const deleteBooking = useCallback((id: string) => {
    update(s => ({ ...s, bookings: s.bookings.filter(b => b.id !== id) }))
  }, [update])

  // ── Guests ──

  const addGuest = useCallback((data: Omit<Guest, "id" | "created_at">): Guest => {
    const guest: Guest = { ...data, id: uid(), created_at: now() }
    update(s => ({ ...s, guests: [...s.guests, guest] }))
    return guest
  }, [update])

  const updateGuest = useCallback((id: string, updates: Partial<Guest>) => {
    update(s => ({ ...s, guests: s.guests.map(g => g.id === id ? { ...g, ...updates } : g) }))
  }, [update])

  // ── Costs ──

  const addCost = useCallback((data: Omit<CostEntry, "id" | "created_at">): CostEntry => {
    const cost: CostEntry = { ...data, id: uid(), created_at: now() }
    update(s => ({ ...s, costs: [...s.costs, cost] }))
    return cost
  }, [update])

  const updateCost = useCallback((id: string, updates: Partial<CostEntry>) => {
    update(s => ({ ...s, costs: s.costs.map(c => c.id === id ? { ...c, ...updates } : c) }))
  }, [update])

  const deleteCost = useCallback((id: string) => {
    update(s => ({ ...s, costs: s.costs.filter(c => c.id !== id) }))
  }, [update])

  // ── Staff ──

  const addStaff = useCallback((data: Omit<StaffMember, "id" | "created_at" | "updated_at">): StaffMember => {
    const member: StaffMember = { ...data, id: uid(), created_at: now(), updated_at: now() }
    update(s => ({ ...s, staff: [...s.staff, member] }))
    return member
  }, [update])

  const updateStaff = useCallback((id: string, updates: Partial<StaffMember>) => {
    update(s => ({ ...s, staff: s.staff.map(m => m.id === id ? { ...m, ...updates, updated_at: now() } : m) }))
  }, [update])

  const deleteStaff = useCallback((id: string) => {
    update(s => ({ ...s, staff: s.staff.filter(m => m.id !== id) }))
  }, [update])

  // ── Properties & Rooms ──

  const addProperty = useCallback((data: Omit<Property, "id" | "created_at" | "updated_at">): Property => {
    const property: Property = { ...data, id: uid(), created_at: now(), updated_at: now() }
    update(s => ({ ...s, properties: [...s.properties, property] }))
    return property
  }, [update])

  const updateProperty = useCallback((id: string, updates: Partial<Property>) => {
    update(s => ({ ...s, properties: s.properties.map(p => p.id === id ? { ...p, ...updates, updated_at: now() } : p) }))
  }, [update])

  const deleteProperty = useCallback((id: string) => {
    update(s => ({ ...s, properties: s.properties.filter(p => p.id !== id) }))
  }, [update])

  const addRoom = useCallback((data: Omit<Room, "id" | "created_at" | "updated_at">): Room => {
    const room: Room = { ...data, id: uid(), created_at: now(), updated_at: now() }
    update(s => ({ ...s, rooms: [...s.rooms, room] }))
    return room
  }, [update])

  const updateRoom = useCallback((id: string, updates: Partial<Room>) => {
    update(s => ({ ...s, rooms: s.rooms.map(r => r.id === id ? { ...r, ...updates, updated_at: now() } : r) }))
  }, [update])

  const deleteRoom = useCallback((id: string) => {
    update(s => ({ ...s, rooms: s.rooms.filter(r => r.id !== id) }))
  }, [update])

  // ── Reset ──

  const resetToDemo = useCallback(() => {
    setState(INITIAL)
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY)
  }, [])

  const store: Store = {
    ...state,
    addBooking, updateBooking, deleteBooking,
    addGuest, updateGuest,
    addCost, updateCost, deleteCost,
    addStaff, updateStaff, deleteStaff,
    addProperty, updateProperty, deleteProperty,
    addRoom, updateRoom, deleteRoom,
    resetToDemo,
  }

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useStore(): Store {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}
