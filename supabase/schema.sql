-- ============================================================
-- Untouched Safaris – Lodge Management System
-- Schema v2 (Supabase-compatible, no auth schema permissions needed)
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Enums ────────────────────────────────────────────────────
do $$ begin
  create type user_role        as enum ('admin', 'manager', 'reception', 'accountant', 'readonly');
  create type property_type    as enum ('lodge', 'houseboat', 'camp', 'villa', 'hotel');
  create type property_status  as enum ('active', 'maintenance', 'inactive');
  create type room_type        as enum ('tent', 'suite', 'standard', 'family', 'honeymoon', 'dormitory');
  create type room_status      as enum ('available', 'occupied', 'maintenance', 'blocked');
  create type booking_status   as enum ('confirmed', 'pending', 'cancelled', 'checked_in', 'checked_out', 'no_show');
  create type booking_source   as enum ('nightsbridge', 'direct', 'agent', 'email', 'phone', 'walk_in');
  create type cost_category    as enum ('staff', 'food_beverage', 'logistics', 'maintenance', 'utilities', 'marketing', 'insurance', 'other');
  create type cost_frequency   as enum ('once', 'daily', 'weekly', 'monthly', 'annually');
  create type employment_type  as enum ('full_time', 'part_time', 'seasonal', 'contractor');
  create type staff_status     as enum ('active', 'inactive', 'on_leave');
  create type department       as enum ('management', 'housekeeping', 'kitchen', 'guides', 'maintenance', 'reception', 'logistics', 'security');
exception when duplicate_object then null; end $$;

-- ── Profiles (extends auth.users) ────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  full_name    text,
  role         user_role not null default 'readonly',
  property_ids text[] default '{}',
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── Properties ───────────────────────────────────────────────
create table if not exists public.properties (
  id                       uuid primary key default uuid_generate_v4(),
  name                     text not null,
  property_type            property_type not null default 'lodge',
  status                   property_status not null default 'active',
  location                 text not null,
  country                  text not null default 'Botswana',
  currency                 text not null default 'BWP',
  description              text,
  check_in_time            text not null default '14:00',
  check_out_time           text not null default '11:00',
  contact_email            text,
  contact_phone            text,
  website                  text,
  latitude                 numeric(9,6),
  longitude                numeric(9,6),
  nightsbridge_property_id text unique,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- ── Rooms ─────────────────────────────────────────────────────
create table if not exists public.rooms (
  id                   uuid primary key default uuid_generate_v4(),
  property_id          uuid not null references public.properties(id) on delete cascade,
  name                 text not null,
  room_number          text not null,
  room_type            room_type not null default 'standard',
  status               room_status not null default 'available',
  capacity             int not null default 2,
  max_adults           int not null default 2,
  max_children         int not null default 0,
  base_price_per_night numeric(10,2) not null,
  floor                text,
  square_meters        numeric(6,1),
  description          text,
  amenities            text[] default '{}',
  nightsbridge_room_id text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
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
  passport_number text,
  notes           text,
  created_at      timestamptz not null default now()
);

-- ── Bookings ──────────────────────────────────────────────────
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
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  check (check_out > check_in)
);

-- ── Cost Entries ──────────────────────────────────────────────
create table if not exists public.cost_entries (
  id             uuid primary key default uuid_generate_v4(),
  property_id    uuid references public.properties(id) on delete set null,
  category       cost_category not null default 'other',
  description    text not null,
  amount         numeric(12,2) not null,
  currency       text not null default 'BWP',
  frequency      cost_frequency not null default 'once',
  date           date not null,
  supplier       text,
  invoice_number text,
  notes          text,
  created_at     timestamptz not null default now()
);

-- ── Staff ─────────────────────────────────────────────────────
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
  salary          numeric(10,2) not null,
  currency        text not null default 'BWP',
  id_number       text,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── Auto-update timestamps ────────────────────────────────────
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create or replace trigger trg_properties_updated before update on public.properties for each row execute function public.update_updated_at();
create or replace trigger trg_rooms_updated      before update on public.rooms       for each row execute function public.update_updated_at();
create or replace trigger trg_bookings_updated   before update on public.bookings    for each row execute function public.update_updated_at();
create or replace trigger trg_staff_updated      before update on public.staff_members for each row execute function public.update_updated_at();
create or replace trigger trg_profiles_updated   before update on public.profiles    for each row execute function public.update_updated_at();

-- ── Indexes ───────────────────────────────────────────────────
create index if not exists idx_bookings_property   on public.bookings(property_id);
create index if not exists idx_bookings_dates      on public.bookings(check_in, check_out);
create index if not exists idx_bookings_status     on public.bookings(status);
create index if not exists idx_costs_property      on public.cost_entries(property_id);
create index if not exists idx_costs_date          on public.cost_entries(date);
create index if not exists idx_staff_property      on public.staff_members(property_id);

-- ── Row Level Security ────────────────────────────────────────
alter table public.profiles      enable row level security;
alter table public.properties    enable row level security;
alter table public.rooms         enable row level security;
alter table public.guests        enable row level security;
alter table public.bookings      enable row level security;
alter table public.cost_entries  enable row level security;
alter table public.staff_members enable row level security;

-- Helper: get role of current user
create or replace function public.get_my_role()
returns user_role language sql stable security definer as $$
  select role from public.profiles where id = auth.uid()
$$;

-- Helper: check property access
create or replace function public.can_access_property(pid uuid)
returns boolean language sql stable security definer as $$
  select exists(
    select 1 from public.profiles
    where id = auth.uid()
    and (
      role = 'admin'
      or array_length(property_ids, 1) is null
      or array_length(property_ids, 1) = 0
      or pid::text = any(property_ids)
    )
  )
$$;

-- ── RLS Policies ─────────────────────────────────────────────

-- Profiles
create policy "Own profile" on public.profiles for select using (id = auth.uid());
create policy "Admin sees all profiles" on public.profiles for select using (public.get_my_role() = 'admin');
create policy "Admin manages profiles" on public.profiles for all using (public.get_my_role() = 'admin');

-- Properties (all authenticated users can read)
create policy "Auth users see properties" on public.properties for select using (auth.uid() is not null);
create policy "Manager+ insert properties" on public.properties for insert with check (public.get_my_role() in ('admin', 'manager'));
create policy "Manager+ update properties" on public.properties for update using (public.get_my_role() in ('admin', 'manager'));
create policy "Admin delete properties" on public.properties for delete using (public.get_my_role() = 'admin');

-- Rooms
create policy "Auth users see rooms" on public.rooms for select using (auth.uid() is not null);
create policy "Manager+ manage rooms" on public.rooms for all using (public.get_my_role() in ('admin', 'manager'));

-- Guests
create policy "Staff see guests" on public.guests for select using (auth.uid() is not null);
create policy "Reception+ manage guests" on public.guests for all using (public.get_my_role() in ('admin', 'manager', 'reception'));

-- Bookings
create policy "Staff see bookings" on public.bookings for select using (auth.uid() is not null and public.can_access_property(property_id));
create policy "Reception+ insert bookings" on public.bookings for insert with check (public.get_my_role() in ('admin', 'manager', 'reception'));
create policy "Reception+ update bookings" on public.bookings for update using (public.get_my_role() in ('admin', 'manager', 'reception'));
create policy "Manager+ delete bookings" on public.bookings for delete using (public.get_my_role() in ('admin', 'manager'));

-- Costs (finance only)
create policy "Finance sees costs" on public.cost_entries for select using (public.get_my_role() in ('admin', 'manager', 'accountant'));
create policy "Finance manage costs" on public.cost_entries for all using (public.get_my_role() in ('admin', 'manager', 'accountant'));

-- Staff (sensitive: salary visible only to managers)
create policy "Manager+ sees staff" on public.staff_members for select using (public.get_my_role() in ('admin', 'manager'));
create policy "Manager+ manages staff" on public.staff_members for all using (public.get_my_role() in ('admin', 'manager'));

-- ── Stock Items ────────────────────────────────────────────────────────────
create table if not exists public.stock_items (
  id           uuid primary key default uuid_generate_v4(),
  property_id  uuid references public.properties(id) on delete set null,
  name         text not null,
  category     text not null default 'Other',
  unit         text not null default 'unit',
  current_qty  numeric(10,2) not null default 0,
  minimum_qty  numeric(10,2) not null default 0,
  reorder_qty  numeric(10,2) not null default 0,
  unit_cost    numeric(10,2) not null default 0,
  supplier     text,
  notes        text,
  last_updated date not null default current_date,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create or replace trigger trg_stock_updated before update on public.stock_items for each row execute function public.update_updated_at();
create index if not exists idx_stock_property on public.stock_items(property_id);

alter table public.stock_items enable row level security;
create policy "Auth users see stock" on public.stock_items for select using (auth.uid() is not null);
create policy "Manager+ manage stock" on public.stock_items for all using (public.get_my_role() in ('admin', 'manager', 'reception'));

-- ── Maintenance Tasks ──────────────────────────────────────────────────────
create table if not exists public.maintenance_tasks (
  id             uuid primary key default uuid_generate_v4(),
  property_id    uuid references public.properties(id) on delete set null,
  title          text not null,
  description    text,
  category       text not null default 'other'
                   check (category in ('vehicle','building','electrical','plumbing','equipment','other')),
  priority       text not null default 'medium'
                   check (priority in ('critical','high','medium','low')),
  status         text not null default 'open'
                   check (status in ('open','in_progress','completed','deferred')),
  location       text,
  reported_by    text,
  assigned_to    text,
  due_date       date,
  completed_at   timestamptz,
  estimated_cost numeric(10,2),
  actual_cost    numeric(10,2),
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create or replace trigger trg_maintenance_updated before update on public.maintenance_tasks for each row execute function public.update_updated_at();
create index if not exists idx_maintenance_property on public.maintenance_tasks(property_id);
create index if not exists idx_maintenance_status   on public.maintenance_tasks(status);

alter table public.maintenance_tasks enable row level security;
create policy "Auth users see maintenance" on public.maintenance_tasks for select using (auth.uid() is not null);
create policy "Auth users manage maintenance" on public.maintenance_tasks for all using (auth.uid() is not null);

-- ============================================================
-- DONE. Now run:
--   1. Insert your user into profiles (see next query)
--   2. update profiles set role = 'admin' where email = 'your@email.com';
-- ============================================================
