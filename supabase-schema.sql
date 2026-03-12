-- ============================================================
-- UNTOUCHED SAFARIS – Lodge Management App
-- Supabase / PostgreSQL Schema
-- ============================================================
-- Führe dieses Script in deinem Supabase SQL Editor aus:
-- https://app.supabase.com → SQL Editor → New Query
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- PROPERTIES (Lodges, Hausboote, Camps)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('lodge', 'houseboat', 'camp')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'closed')),
  location TEXT NOT NULL,
  description TEXT,
  nightsbridge_property_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- ROOMS (Zimmer, Kabinen, Zelte)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  room_number TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('tent', 'suite', 'standard', 'family', 'honeymoon', 'dormitory')),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'blocked')),
  capacity INT NOT NULL DEFAULT 2,
  base_price_per_night DECIMAL(10,2) NOT NULL,
  nightsbridge_room_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(property_id, room_number)
);

-- ─────────────────────────────────────────────────────────────
-- GUESTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  nationality TEXT,
  passport_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- BOOKINGS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_reference TEXT NOT NULL UNIQUE,
  property_id UUID NOT NULL REFERENCES properties(id),
  room_id UUID NOT NULL REFERENCES rooms(id),
  guest_id UUID NOT NULL REFERENCES guests(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('confirmed', 'pending', 'cancelled', 'checked_in', 'checked_out', 'no_show')
  ),
  source TEXT NOT NULL DEFAULT 'direct' CHECK (
    source IN ('nightsbridge', 'direct', 'agent', 'email', 'phone', 'walk_in')
  ),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  adults INT NOT NULL DEFAULT 2,
  children INT NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  nightsbridge_booking_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (check_out > check_in)
);

-- ─────────────────────────────────────────────────────────────
-- COST ENTRIES (Kostenerfassung)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE cost_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id),
  category TEXT NOT NULL CHECK (
    category IN ('staff', 'food_beverage', 'logistics', 'maintenance', 'utilities', 'marketing', 'insurance', 'other')
  ),
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BWP',
  frequency TEXT NOT NULL DEFAULT 'once' CHECK (
    frequency IN ('once', 'daily', 'weekly', 'monthly', 'annually')
  ),
  date DATE NOT NULL,
  supplier TEXT,
  invoice_number TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- STAFF (Personalverwaltung)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE staff_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  department TEXT NOT NULL CHECK (
    department IN ('management', 'housekeeping', 'kitchen', 'guides', 'maintenance', 'reception', 'logistics', 'security')
  ),
  position TEXT NOT NULL,
  employment_type TEXT NOT NULL CHECK (
    employment_type IN ('full_time', 'part_time', 'seasonal', 'contractor')
  ),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
  start_date DATE NOT NULL,
  end_date DATE,
  salary DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BWP',
  id_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- SHIFT SCHEDULES (Schichtplanung)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE shift_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id),
  date DATE NOT NULL,
  shift_start TIME NOT NULL,
  shift_end TIME NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- NIGHTSBRIDGE SYNC LOG
-- ─────────────────────────────────────────────────────────────
CREATE TABLE nightsbridge_sync_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sync_type TEXT NOT NULL CHECK (sync_type IN ('import', 'export', 'availability')),
  status TEXT NOT NULL CHECK (status IN ('success', 'warning', 'error')),
  message TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- INDEXES for performance
-- ─────────────────────────────────────────────────────────────
CREATE INDEX idx_rooms_property_id ON rooms(property_id);
CREATE INDEX idx_bookings_property_id ON bookings(property_id);
CREATE INDEX idx_bookings_guest_id ON bookings(guest_id);
CREATE INDEX idx_bookings_check_in ON bookings(check_in);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_cost_entries_property_id ON cost_entries(property_id);
CREATE INDEX idx_cost_entries_category ON cost_entries(category);
CREATE INDEX idx_cost_entries_date ON cost_entries(date);
CREATE INDEX idx_staff_members_property_id ON staff_members(property_id);
CREATE INDEX idx_staff_members_status ON staff_members(status);

-- ─────────────────────────────────────────────────────────────
-- AUTO-UPDATE updated_at trigger
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_staff_updated_at BEFORE UPDATE ON staff_members FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (Supabase Auth)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_schedules ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (adjust per role later)
CREATE POLICY "Authenticated users can read properties" ON properties FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage properties" ON properties FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can read rooms" ON rooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage rooms" ON rooms FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can read guests" ON guests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage guests" ON guests FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can read bookings" ON bookings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage bookings" ON bookings FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can read costs" ON cost_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage costs" ON cost_entries FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can read staff" ON staff_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage staff" ON staff_members FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can read shifts" ON shift_schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage shifts" ON shift_schedules FOR ALL TO authenticated USING (true);
