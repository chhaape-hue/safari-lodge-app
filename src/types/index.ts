// ─── Properties ───────────────────────────────────────────────────────────────

export type PropertyType = "lodge" | "houseboat" | "camp" | "villa" | "hotel"
export type PropertyStatus = "active" | "maintenance" | "inactive"

export interface Property {
  id: string
  name: string
  property_type: PropertyType
  /** @deprecated use property_type */
  type?: PropertyType
  status: PropertyStatus
  location: string
  country: string
  currency: string
  description?: string
  check_in_time: string
  check_out_time: string
  contact_email?: string
  contact_phone?: string
  website?: string
  latitude?: number
  longitude?: number
  nightsbridge_property_id?: string
  created_at: string
  updated_at: string
}

// ─── Rooms ────────────────────────────────────────────────────────────────────

export type RoomType = "tent" | "suite" | "standard" | "family" | "honeymoon" | "dormitory"
export type RoomStatus = "available" | "occupied" | "maintenance" | "blocked"

export interface Room {
  id: string
  property_id: string
  property?: Property
  name: string
  room_number: string
  room_type: RoomType
  /** @deprecated use room_type */
  type?: RoomType
  status: RoomStatus
  capacity: number
  max_adults: number
  max_children: number
  base_price_per_night: number
  floor?: string
  square_meters?: number
  description?: string
  amenities: string[]
  nightsbridge_room_id?: string
  created_at: string
  updated_at: string
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export type BookingStatus = "confirmed" | "pending" | "cancelled" | "checked_in" | "checked_out" | "no_show"
export type BookingSource = "nightsbridge" | "direct" | "agent" | "email" | "phone" | "walk_in"

export interface Guest {
  id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  nationality?: string
  passport_number?: string
  notes?: string
  created_at: string
}

export interface Booking {
  id: string
  booking_reference: string
  property_id: string
  property?: Property
  room_id: string
  room?: Room
  guest_id: string
  guest?: Guest
  status: BookingStatus
  source: BookingSource
  check_in: string
  check_out: string
  adults: number
  children: number
  total_amount: number
  paid_amount: number
  notes?: string
  nightsbridge_booking_id?: string
  created_at: string
  updated_at: string
}

// ─── Costs & Finance ──────────────────────────────────────────────────────────

export type CostCategory = "staff" | "food_beverage" | "logistics" | "maintenance" | "utilities" | "marketing" | "insurance" | "other"
export type CostFrequency = "once" | "daily" | "weekly" | "monthly" | "annually"

export interface CostEntry {
  id: string
  property_id?: string
  property?: Property
  category: CostCategory
  description: string
  amount: number
  currency: string
  frequency: CostFrequency
  date: string
  supplier?: string
  invoice_number?: string
  notes?: string
  created_at: string
}

// ─── HR / Staff ───────────────────────────────────────────────────────────────

export type EmploymentType = "full_time" | "part_time" | "seasonal" | "contractor"
export type StaffStatus = "active" | "inactive" | "on_leave"
export type Department = "management" | "housekeeping" | "kitchen" | "guides" | "maintenance" | "reception" | "logistics" | "security"

export interface StaffMember {
  id: string
  property_id?: string
  property?: Property
  first_name: string
  last_name: string
  email?: string
  phone?: string
  department: Department
  position: string
  employment_type: EmploymentType
  status: StaffStatus
  start_date: string
  end_date?: string
  salary: number
  currency: string
  id_number?: string
  notes?: string
  created_at: string
  updated_at: string
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export interface DashboardStats {
  totalProperties: number
  totalRooms: number
  occupancyRate: number
  bookingsThisMonth: number
  revenueThisMonth: number
  costsThisMonth: number
  activeStaff: number
  upcomingCheckIns: number
}
