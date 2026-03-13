-- ============================================================
-- Untouched Safaris – Lodge Management System
-- Complete Schema with Auth & RLS
-- Run this in Supabase SQL Editor (in order)
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Roles/Profiles ───────────────────────────────────────────
-- Extends Supabase auth.users with app-level roles
create type user_role as enum ('admin', 'manager', 'reception', 'accountant', 'readonly');

create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text not null,
  full_name   text,
  role        user_role not null default 'readonly',
  property_ids text[] default '{}',   -- which properties this user can access (empty = all for admin)
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'readonly')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Properties ───────────────────────────────────────────────
create type property_type as enum ('lodge', 'houseboat', 'camp', 'villa', 'hotel');
create type property_status as enum ('active', 'maintenance', 'inactive');

create table if not exists public.properties (
  id                          uuid primary key default uuid_generate_v4(),
  name                        text not null,
  property_type               property_type not null default 'lodge',
  status                      property_status not null default 'active',
  location                    text not null,
  country                     text not null default 'Botswana',
  currency                    text not null default 'BWP',
  description                 text,
  check_in_time               text not null default '14:00',
  check_out_time              text not null default '11:00',
  contact_email               text,
  contact_phone               text,
  website                     text,
  latitude                    numeric(9,6),
  longitude                   numeric(9,6),
  nightsbridge_property_id    text unique,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

-- ── Rooms ─────────────────────────────────────────────────────
create type room_type as enum ('tent', 'suite', 'standard', 'family', 'honeymoon', 'dormitory');
create type room_status as enum ('available', 'occupied', 'maintenance', 'blocked');

create table if not exists public.rooms (
  id                      uuid primary key default uuid_generate_v4(),
  property_id             uuid not null references public.properties(id) on delete cascade,
  name                    text not null,
  room_number             text not null,
  room_type               room_type not null default 'standard',
  status                  room_status not null default 'available',
  capacity                int not null default 2,
  max_adults              int not null default 2,
  max_children            int not null default 0,
  base_price_per_night    numeric(10,2) not null,
  floor                   text,
  square_meters           numeric(6,1),
  description             text,
  amenities               text[] default '{}',
  nightsbridge_room_id    text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  unique(property_id, room_number)
);

-- ── Guests ────────────────────────────────────────────────────
create table if not exists public.guests (
  id              uuid primary key default uuid_generate_v4(),
  first_name      text not null,
  last_name       text not null,
  email           text,
  phone           text,
  nationality     text,
  passport_number text,  -- sensitive – only admin/manager can see
  notes           text,
  created_at      timestamptz not null default now()
);

-- ── Bookings ──────────────────────────────────────────────────
create type booking_status as enum ('confirmed', 'pending', 'cancelled', 'checked_in', 'checked_out', 'no_show');
create type booking_source as enum ('nightsbridge', 'direct', 'agent', 'email', 'phone', 'walk_in');

create table if not exists public.bookings (
  id                      uuid primary key default uuid_generate_v4(),
  booking_reference       text not null unique,
  property_id             uuid not null references public.properties(id),
  room_id                 uuid not null references public.rooms(id),
  guest_id                uuid not null references public.guests(id),
  status                  booking_status not null default 'confirmed',
  source                  booking_source not null default 'direct',
  check_in                date not null,
  check_out               date not null,
  adults                  int not null default 2,
  children                int not null default 0,
  total_amount            numeric(12,2) not null,
  paid_amount             numeric(12,2) not null default 0,
  notes                   text,
  nightsbridge_booking_id text,
  created_by              uuid references auth.users(id),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  check (check_out > check_in),
  check (paid_amount >= 0),
  check (total_amount >= 0)
);

-- ── Cost Entries ──────────────────────────────────────────────
create type cost_category as enum ('staff', 'food_beverage', 'logistics', 'maintenance', 'utilities', 'marketing', 'insurance', 'other');
create type cost_frequency as enum ('once', 'daily', 'weekly', 'monthly', 'annually');

create table if not exists public.cost_entries (
  id              uuid primary key default uuid_generate_v4(),
  property_id     uuid references public.properties(id) on delete set null,
  category        cost_category not null default 'other',
  description     text not null,
  amount          numeric(12,2) not null,
  currency        text not null default 'BWP',
  frequency       cost_frequency not null default 'once',
  date            date not null,
  supplier        text,
  invoice_number  text,
  notes           text,
  created_by      uuid references auth.users(id),
  created_at      timestamptz not null default now()
);

-- ── Staff / HR ────────────────────────────────────────────────
create type employment_type as enum ('full_time', 'part_time', 'seasonal', 'contractor');
create type staff_status as enum ('active', 'inactive', 'on_leave');
create type department as enum ('management', 'housekeeping', 'kitchen', 'guides', 'maintenance', 'reception', 'logistics', 'security');

create table if not exists public.staff_members (
  id              uuid primary key default uuid_generate_v4(),
  property_id     uuid references public.properties(id) on delete set null,
  first_name      text not null,
  last_name       text not null,
  email           text,
  phone           text,
  department      department not null,
  position        text not null,
  employment_type employment_type not null default 'full_time',
  status          staff_status not null default 'active',
  start_date      date not null,
  end_date        date,
  salary          numeric(10,2) not null,   -- sensitive
  currency        text not null default 'BWP',
  id_number       text,                      -- sensitive
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── Auto-update timestamps ────────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger trg_properties_updated   before update on properties   for each row execute function update_updated_at();
create trigger trg_rooms_updated        before update on rooms         for each row execute function update_updated_at();
create trigger trg_bookings_updated     before update on bookings      for each row execute function update_updated_at();
create trigger trg_staff_updated        before update on staff_members for each row execute function update_updated_at();
create trigger trg_profiles_updated     before update on profiles      for each row execute function update_updated_at();

-- ── Indexes ───────────────────────────────────────────────────
create index on bookings(property_id);
create index on bookings(room_id);
create index on bookings(guest_id);
create index on bookings(check_in, check_out);
create index on bookings(status);
create index on cost_entries(property_id);
create index on cost_entries(date);
create index on staff_members(property_id);
create index on staff_members(status);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles      enable row level security;
alter table properties    enable row level security;
alter table rooms         enable row level security;
alter table guests        enable row level security;
alter table bookings      enable row level security;
alter table cost_entries  enable row level security;
alter table staff_members enable row level security;

-- Helper: get current user's role
create or replace function auth.user_role()
returns user_role language sql stable security definer as $$
  select role from public.profiles where id = auth.uid()
$$;

-- Helper: check if user can access property
create or replace function auth.can_access_property(pid uuid)
returns boolean language sql stable security definer as $$
  select exists(
    select 1 from public.profiles
    where id = auth.uid()
    and (role = 'admin' or pid::text = any(property_ids) or array_length(property_ids, 1) is null or array_length(property_ids, 1) = 0)
  )
$$;

-- ── Profiles ──────────────────────────────────────────────────
create policy "Users see own profile"   on profiles for select using (id = auth.uid());
create policy "Admins see all profiles" on profiles for select using (auth.user_role() = 'admin');
create policy "Users update own profile" on profiles for update using (id = auth.uid())
  with check (role = (select role from profiles where id = auth.uid())); -- can't change own role
create policy "Admins manage profiles" on profiles for all using (auth.user_role() = 'admin');

-- ── Properties ────────────────────────────────────────────────
create policy "All authenticated users see properties"
  on properties for select using (auth.uid() is not null);
create policy "Admin/manager insert properties"
  on properties for insert with check (auth.user_role() in ('admin', 'manager'));
create policy "Admin/manager update properties"
  on properties for update using (auth.user_role() in ('admin', 'manager') and auth.can_access_property(id));
create policy "Admin delete properties"
  on properties for delete using (auth.user_role() = 'admin');

-- ── Rooms ─────────────────────────────────────────────────────
create policy "All authenticated users see rooms"
  on rooms for select using (auth.uid() is not null);
create policy "Admin/manager manage rooms"
  on rooms for all using (auth.user_role() in ('admin', 'manager') and auth.can_access_property(property_id));

-- ── Guests ────────────────────────────────────────────────────
create policy "Staff can see guests (no passport)"
  on guests for select using (auth.uid() is not null);
  -- Passport number filtered at query level in app code
create policy "Reception+ can insert guests"
  on guests for insert with check (auth.user_role() in ('admin', 'manager', 'reception'));
create policy "Reception+ can update guests"
  on guests for update using (auth.user_role() in ('admin', 'manager', 'reception'));
create policy "Admin can delete guests"
  on guests for delete using (auth.user_role() = 'admin');

-- ── Bookings ──────────────────────────────────────────────────
create policy "Staff see bookings for their properties"
  on bookings for select using (
    auth.uid() is not null and auth.can_access_property(property_id)
  );
create policy "Reception+ can insert bookings"
  on bookings for insert with check (
    auth.user_role() in ('admin', 'manager', 'reception')
    and auth.can_access_property(property_id)
  );
create policy "Reception+ can update bookings"
  on bookings for update using (
    auth.user_role() in ('admin', 'manager', 'reception')
    and auth.can_access_property(property_id)
  );
create policy "Admin/manager can delete bookings"
  on bookings for delete using (
    auth.user_role() in ('admin', 'manager')
    and auth.can_access_property(property_id)
  );

-- ── Cost Entries ──────────────────────────────────────────────
-- Only admin + accountant see financial data
create policy "Admin/accountant/manager see costs"
  on cost_entries for select using (
    auth.user_role() in ('admin', 'accountant', 'manager')
    and (property_id is null or auth.can_access_property(property_id))
  );
create policy "Admin/accountant/manager insert costs"
  on cost_entries for insert with check (
    auth.user_role() in ('admin', 'accountant', 'manager')
  );
create policy "Admin/accountant/manager update costs"
  on cost_entries for update using (auth.user_role() in ('admin', 'accountant', 'manager'));
create policy "Admin delete costs"
  on cost_entries for delete using (auth.user_role() in ('admin', 'accountant'));

-- ── Staff / HR ────────────────────────────────────────────────
-- Salary data is sensitive – only admin/manager
create policy "Admin/manager see all staff"
  on staff_members for select using (
    auth.user_role() in ('admin', 'manager')
    and (property_id is null or auth.can_access_property(property_id))
  );
create policy "Staff see own record"
  on staff_members for select using (
    email = (select email from auth.users where id = auth.uid())
  );
create policy "Admin/manager manage staff"
  on staff_members for all using (
    auth.user_role() in ('admin', 'manager')
  );

-- ============================================================
-- SEED: First admin user
-- After running this schema, create a user via Supabase Auth,
-- then run:
--   update profiles set role = 'admin' where email = 'your@email.com';
-- ============================================================
