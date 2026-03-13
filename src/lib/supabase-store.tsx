"use client"

/**
 * Supabase-backed data store.
 * Replaces the localStorage store once Supabase is configured.
 * Falls back gracefully if Supabase is not reachable.
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import { supabase } from "./supabase"
import type { Property, Room, Booking, Guest, CostEntry, StaffMember } from "@/types"

// ─── Types ────────────────────────────────────────────────────────────────────

interface StoreState {
  properties: Property[]
  rooms: Room[]
  bookings: Booking[]
  guests: Guest[]
  costs: CostEntry[]
  staff: StaffMember[]
  loading: boolean
  error: string | null
}

interface StoreActions {
  reload: () => Promise<void>
  // Bookings
  addBooking: (b: Omit<Booking, "id" | "booking_reference" | "created_at" | "updated_at">) => Promise<Booking>
  updateBooking: (id: string, updates: Partial<Booking>) => Promise<void>
  deleteBooking: (id: string) => Promise<void>
  // Guests
  addGuest: (g: Omit<Guest, "id" | "created_at">) => Promise<Guest>
  updateGuest: (id: string, updates: Partial<Guest>) => Promise<void>
  // Costs
  addCost: (c: Omit<CostEntry, "id" | "created_at">) => Promise<CostEntry>
  updateCost: (id: string, updates: Partial<CostEntry>) => Promise<void>
  deleteCost: (id: string) => Promise<void>
  // Staff
  addStaff: (m: Omit<StaffMember, "id" | "created_at" | "updated_at">) => Promise<StaffMember>
  updateStaff: (id: string, updates: Partial<StaffMember>) => Promise<void>
  deleteStaff: (id: string) => Promise<void>
  // Properties
  addProperty: (p: Omit<Property, "id" | "created_at" | "updated_at">) => Promise<Property>
  updateProperty: (id: string, updates: Partial<Property>) => Promise<void>
  deleteProperty: (id: string) => Promise<void>
  // Rooms
  addRoom: (r: Omit<Room, "id" | "created_at" | "updated_at">) => Promise<Room>
  updateRoom: (id: string, updates: Partial<Room>) => Promise<void>
  deleteRoom: (id: string) => Promise<void>
}

type SupabaseStore = StoreState & StoreActions

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateRef(propertyName: string) {
  const prefix = propertyName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 3)
  const ym = new Date().toISOString().slice(0, 7)
  return `${prefix}-${ym}-${String(Math.floor(Math.random() * 9000) + 1000)}`
}

// Map Supabase snake_case to our camelCase type field names
function mapProperty(row: Record<string, unknown>): Property {
  return {
    id: row.id as string,
    name: row.name as string,
    property_type: row.property_type as Property["property_type"],
    status: row.status as Property["status"],
    location: row.location as string,
    country: (row.country as string) || "Botswana",
    currency: (row.currency as string) || "BWP",
    description: row.description as string | undefined,
    check_in_time: (row.check_in_time as string) || "14:00",
    check_out_time: (row.check_out_time as string) || "11:00",
    contact_email: row.contact_email as string | undefined,
    contact_phone: row.contact_phone as string | undefined,
    website: row.website as string | undefined,
    latitude: row.latitude as number | undefined,
    longitude: row.longitude as number | undefined,
    nightsbridge_property_id: row.nightsbridge_property_id as string | undefined,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

function mapRoom(row: Record<string, unknown>): Room {
  return {
    id: row.id as string,
    property_id: row.property_id as string,
    name: row.name as string,
    room_number: row.room_number as string,
    room_type: row.room_type as Room["room_type"],
    status: row.status as Room["status"],
    capacity: row.capacity as number,
    max_adults: (row.max_adults as number) || 2,
    max_children: (row.max_children as number) || 0,
    base_price_per_night: row.base_price_per_night as number,
    floor: row.floor as string | undefined,
    square_meters: row.square_meters as number | undefined,
    description: row.description as string | undefined,
    amenities: (row.amenities as string[]) || [],
    nightsbridge_room_id: row.nightsbridge_room_id as string | undefined,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

function mapGuest(row: Record<string, unknown>): Guest {
  return {
    id: row.id as string,
    first_name: row.first_name as string,
    last_name: row.last_name as string,
    email: row.email as string | undefined,
    phone: row.phone as string | undefined,
    nationality: row.nationality as string | undefined,
    passport_number: row.passport_number as string | undefined,
    notes: row.notes as string | undefined,
    created_at: row.created_at as string,
  }
}

function mapBooking(row: Record<string, unknown>): Booking {
  return {
    id: row.id as string,
    booking_reference: row.booking_reference as string,
    property_id: row.property_id as string,
    room_id: row.room_id as string,
    guest_id: row.guest_id as string,
    status: row.status as Booking["status"],
    source: row.source as Booking["source"],
    check_in: row.check_in as string,
    check_out: row.check_out as string,
    adults: row.adults as number,
    children: row.children as number,
    total_amount: row.total_amount as number,
    paid_amount: row.paid_amount as number,
    notes: row.notes as string | undefined,
    nightsbridge_booking_id: row.nightsbridge_booking_id as string | undefined,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

function mapCost(row: Record<string, unknown>): CostEntry {
  return {
    id: row.id as string,
    property_id: row.property_id as string | undefined,
    category: row.category as CostEntry["category"],
    description: row.description as string,
    amount: row.amount as number,
    currency: row.currency as string,
    frequency: row.frequency as CostEntry["frequency"],
    date: row.date as string,
    supplier: row.supplier as string | undefined,
    invoice_number: row.invoice_number as string | undefined,
    notes: row.notes as string | undefined,
    created_at: row.created_at as string,
  }
}

function mapStaff(row: Record<string, unknown>): StaffMember {
  return {
    id: row.id as string,
    property_id: row.property_id as string | undefined,
    first_name: row.first_name as string,
    last_name: row.last_name as string,
    email: row.email as string | undefined,
    phone: row.phone as string | undefined,
    department: row.department as StaffMember["department"],
    position: row.position as string,
    employment_type: row.employment_type as StaffMember["employment_type"],
    status: row.status as StaffMember["status"],
    start_date: row.start_date as string,
    end_date: row.end_date as string | undefined,
    salary: row.salary as number,
    currency: row.currency as string,
    id_number: row.id_number as string | undefined,
    notes: row.notes as string | undefined,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const SupabaseStoreContext = createContext<SupabaseStore | null>(null)

export function SupabaseStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>({
    properties: [], rooms: [], bookings: [], guests: [], costs: [], staff: [],
    loading: true, error: null,
  })

  const reload = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const [props, rooms, guests, bookings, costs, staff] = await Promise.all([
        supabase.from("properties").select("*").order("name"),
        supabase.from("rooms").select("*").order("room_number"),
        supabase.from("guests").select("*").order("last_name"),
        supabase.from("bookings").select("*").order("created_at", { ascending: false }),
        supabase.from("cost_entries").select("*").order("date", { ascending: false }),
        supabase.from("staff_members").select("*").order("last_name"),
      ])

      if (props.error) throw props.error
      setState({
        properties: (props.data || []).map(mapProperty),
        rooms: (rooms.data || []).map(mapRoom),
        guests: (guests.data || []).map(mapGuest),
        bookings: (bookings.data || []).map(mapBooking),
        costs: (costs.data || []).map(mapCost),
        staff: (staff.data || []).map(mapStaff),
        loading: false,
        error: null,
      })
    } catch (err: unknown) {
      setState(s => ({ ...s, loading: false, error: (err as Error).message || "Ladefehler" }))
    }
  }, [])

  useEffect(() => { reload() }, [reload])

  // ── Bookings ──

  const addBooking = useCallback(async (data: Omit<Booking, "id" | "booking_reference" | "created_at" | "updated_at">): Promise<Booking> => {
    const property = state.properties.find(p => p.id === data.property_id)
    const ref = generateRef(property?.name || "BKG")
    const { data: row, error } = await supabase.from("bookings").insert({ ...data, booking_reference: ref }).select().single()
    if (error) throw error
    const booking = mapBooking(row)
    setState(s => ({ ...s, bookings: [booking, ...s.bookings] }))
    return booking
  }, [state.properties])

  const updateBooking = useCallback(async (id: string, updates: Partial<Booking>) => {
    const { error } = await supabase.from("bookings").update(updates).eq("id", id)
    if (error) throw error
    setState(s => ({ ...s, bookings: s.bookings.map(b => b.id === id ? { ...b, ...updates } : b) }))
  }, [])

  const deleteBooking = useCallback(async (id: string) => {
    const { error } = await supabase.from("bookings").delete().eq("id", id)
    if (error) throw error
    setState(s => ({ ...s, bookings: s.bookings.filter(b => b.id !== id) }))
  }, [])

  // ── Guests ──

  const addGuest = useCallback(async (data: Omit<Guest, "id" | "created_at">): Promise<Guest> => {
    const { data: row, error } = await supabase.from("guests").insert(data).select().single()
    if (error) throw error
    const guest = mapGuest(row)
    setState(s => ({ ...s, guests: [...s.guests, guest] }))
    return guest
  }, [])

  const updateGuest = useCallback(async (id: string, updates: Partial<Guest>) => {
    const { error } = await supabase.from("guests").update(updates).eq("id", id)
    if (error) throw error
    setState(s => ({ ...s, guests: s.guests.map(g => g.id === id ? { ...g, ...updates } : g) }))
  }, [])

  // ── Costs ──

  const addCost = useCallback(async (data: Omit<CostEntry, "id" | "created_at">): Promise<CostEntry> => {
    const { data: row, error } = await supabase.from("cost_entries").insert(data).select().single()
    if (error) throw error
    const cost = mapCost(row)
    setState(s => ({ ...s, costs: [cost, ...s.costs] }))
    return cost
  }, [])

  const updateCost = useCallback(async (id: string, updates: Partial<CostEntry>) => {
    const { error } = await supabase.from("cost_entries").update(updates).eq("id", id)
    if (error) throw error
    setState(s => ({ ...s, costs: s.costs.map(c => c.id === id ? { ...c, ...updates } : c) }))
  }, [])

  const deleteCost = useCallback(async (id: string) => {
    const { error } = await supabase.from("cost_entries").delete().eq("id", id)
    if (error) throw error
    setState(s => ({ ...s, costs: s.costs.filter(c => c.id !== id) }))
  }, [])

  // ── Staff ──

  const addStaff = useCallback(async (data: Omit<StaffMember, "id" | "created_at" | "updated_at">): Promise<StaffMember> => {
    const { data: row, error } = await supabase.from("staff_members").insert(data).select().single()
    if (error) throw error
    const member = mapStaff(row)
    setState(s => ({ ...s, staff: [...s.staff, member] }))
    return member
  }, [])

  const updateStaff = useCallback(async (id: string, updates: Partial<StaffMember>) => {
    const { error } = await supabase.from("staff_members").update(updates).eq("id", id)
    if (error) throw error
    setState(s => ({ ...s, staff: s.staff.map(m => m.id === id ? { ...m, ...updates } : m) }))
  }, [])

  const deleteStaff = useCallback(async (id: string) => {
    const { error } = await supabase.from("staff_members").delete().eq("id", id)
    if (error) throw error
    setState(s => ({ ...s, staff: s.staff.filter(m => m.id !== id) }))
  }, [])

  // ── Properties ──

  const addProperty = useCallback(async (data: Omit<Property, "id" | "created_at" | "updated_at">): Promise<Property> => {
    const { data: row, error } = await supabase.from("properties").insert(data).select().single()
    if (error) throw error
    const property = mapProperty(row)
    setState(s => ({ ...s, properties: [...s.properties, property].sort((a, b) => a.name.localeCompare(b.name)) }))
    return property
  }, [])

  const updateProperty = useCallback(async (id: string, updates: Partial<Property>) => {
    const { error } = await supabase.from("properties").update(updates).eq("id", id)
    if (error) throw error
    setState(s => ({ ...s, properties: s.properties.map(p => p.id === id ? { ...p, ...updates } : p) }))
  }, [])

  const deleteProperty = useCallback(async (id: string) => {
    const { error } = await supabase.from("properties").delete().eq("id", id)
    if (error) throw error
    setState(s => ({ ...s, properties: s.properties.filter(p => p.id !== id) }))
  }, [])

  // ── Rooms ──

  const addRoom = useCallback(async (data: Omit<Room, "id" | "created_at" | "updated_at">): Promise<Room> => {
    const { data: row, error } = await supabase.from("rooms").insert(data).select().single()
    if (error) throw error
    const room = mapRoom(row)
    setState(s => ({ ...s, rooms: [...s.rooms, room] }))
    return room
  }, [])

  const updateRoom = useCallback(async (id: string, updates: Partial<Room>) => {
    const { error } = await supabase.from("rooms").update(updates).eq("id", id)
    if (error) throw error
    setState(s => ({ ...s, rooms: s.rooms.map(r => r.id === id ? { ...r, ...updates } : r) }))
  }, [])

  const deleteRoom = useCallback(async (id: string) => {
    const { error } = await supabase.from("rooms").delete().eq("id", id)
    if (error) throw error
    setState(s => ({ ...s, rooms: s.rooms.filter(r => r.id !== id) }))
  }, [])

  const store: SupabaseStore = {
    ...state,
    reload,
    addBooking, updateBooking, deleteBooking,
    addGuest, updateGuest,
    addCost, updateCost, deleteCost,
    addStaff, updateStaff, deleteStaff,
    addProperty, updateProperty, deleteProperty,
    addRoom, updateRoom, deleteRoom,
  }

  return <SupabaseStoreContext.Provider value={store}>{children}</SupabaseStoreContext.Provider>
}

export function useSupabaseStore(): SupabaseStore {
  const ctx = useContext(SupabaseStoreContext)
  if (!ctx) throw new Error("useSupabaseStore must be used within SupabaseStoreProvider")
  return ctx
}
