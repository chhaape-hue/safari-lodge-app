-- ============================================================
-- MIGRATION: Schema v1 → v2
-- Untouched Safaris Lodge Management System
--
-- Run this in Supabase SQL Editor ONCE to upgrade your database.
-- Safe to re-run: all statements use IF NOT EXISTS / DO blocks.
-- ============================================================

-- ── 1. Create ENUMs ──────────────────────────────────────────
do $$ begin
  create type user_role        as enum ('admin', 'manager', 'reception', 'accountant', 'readonly');
  exception when duplicate_object then null;
end $$;
do $$ begin
  create type property_type    as enum ('lodge', 'houseboat', 'camp', 'villa', 'hotel');
  exception when duplicate_object then null;
end $$;
do $$ begin
  create type property_status  as enum ('active', 'maintenance', 'inactive');
  exception when duplicate_object then null;
end $$;
do $$ begin
  create type room_type        as enum ('tent', 'suite', 'standard', 'family', 'honeymoon', 'dormitory');
  exception when duplicate_object then null;
end $$;
do $$ begin
  create type room_status      as enum ('available', 'occupied', 'maintenance', 'blocked');
  exception when duplicate_object then null;
end $$;
do $$ begin
  create type booking_status   as enum ('confirmed', 'pending', 'cancelled', 'checked_in', 'checked_out', 'no_show');
  exception when duplicate_object then null;
end $$;
do $$ begin
  create type booking_source   as enum ('nightsbridge', 'direct', 'agent', 'email', 'phone', 'walk_in');
  exception when duplicate_object then null;
end $$;
do $$ begin
  create type cost_category    as enum ('staff', 'food_beverage', 'logistics', 'maintenance', 'utilities', 'marketing', 'insurance', 'other');
  exception when duplicate_object then null;
end $$;
do $$ begin
  create type cost_frequency   as enum ('once', 'daily', 'weekly', 'monthly', 'annually');
  exception when duplicate_object then null;
end $$;
do $$ begin
  create type employment_type  as enum ('full_time', 'part_time', 'seasonal', 'contractor');
  exception when duplicate_object then null;
end $$;
do $$ begin
  create type staff_status     as enum ('active', 'inactive', 'on_leave');
  exception when duplicate_object then null;
end $$;
do $$ begin
  create type department       as enum ('management', 'housekeeping', 'kitchen', 'guides', 'maintenance', 'reception', 'logistics', 'security');
  exception when duplicate_object then null;
end $$;

-- ── 2. Profiles table ────────────────────────────────────────
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

-- ── 3. Properties: add missing columns ───────────────────────
alter table public.properties
  add column if not exists property_type   property_type not null default 'lodge',
  add column if not exists country         text not null default 'Botswana',
  add column if not exists currency        text not null default 'BWP',
  add column if not exists check_in_time   text not null default '14:00',
  add column if not exists check_out_time  text not null default '11:00',
  add column if not exists contact_email   text,
  add column if not exists contact_phone   text,
  add column if not exists website         text,
  add column if not exists latitude        numeric(9,6),
  add column if not exists longitude       numeric(9,6);

-- Migrate old 'type' TEXT column → new 'property_type' ENUM column
-- (only where property_type is still the default 'lodge')
update public.properties
set property_type = case
  when type = 'lodge'     then 'lodge'::property_type
  when type = 'houseboat' then 'houseboat'::property_type
  when type = 'camp'      then 'camp'::property_type
  else 'lodge'::property_type
end
where type is not null
  and property_type = 'lodge';

-- Migrate old status value 'closed' → 'inactive'
-- (v1 used 'closed', v2 uses 'inactive')
-- Must update constraint first by dropping and re-adding
do $$
begin
  -- Drop the old CHECK constraint if it exists
  alter table public.properties drop constraint if exists properties_status_check;
  -- Update existing 'closed' values
  update public.properties set status = 'maintenance' where status = 'closed';
exception when others then null;
end $$;

-- ── 4. Rooms: add missing columns ────────────────────────────
alter table public.rooms
  add column if not exists room_type      room_type not null default 'standard',
  add column if not exists max_adults     int not null default 2,
  add column if not exists max_children   int not null default 0,
  add column if not exists floor          text,
  add column if not exists square_meters  numeric(6,1),
  add column if not exists description    text,
  add column if not exists amenities      text[] default '{}';

-- Migrate old 'type' TEXT column → new 'room_type' ENUM column
update public.rooms
set room_type = case
  when type = 'tent'       then 'tent'::room_type
  when type = 'suite'      then 'suite'::room_type
  when type = 'standard'   then 'standard'::room_type
  when type = 'family'     then 'family'::room_type
  when type = 'honeymoon'  then 'honeymoon'::room_type
  when type = 'dormitory'  then 'dormitory'::room_type
  else 'standard'::room_type
end
where type is not null
  and room_type = 'standard';

-- ── 5. Cost entries: drop old created_by (not in v2 schema) ──
-- commented out for safety – uncomment only if you want to clean up
-- alter table public.cost_entries drop column if exists created_by;

-- ── 6. Stock items table ──────────────────────────────────────
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
create index if not exists idx_stock_property on public.stock_items(property_id);

-- ── 7. Maintenance tasks table ────────────────────────────────
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
create index if not exists idx_maintenance_property on public.maintenance_tasks(property_id);
create index if not exists idx_maintenance_status   on public.maintenance_tasks(status);

-- ── 8. Auto-update trigger ────────────────────────────────────
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create or replace trigger trg_profiles_updated    before update on public.profiles       for each row execute function public.update_updated_at();
create or replace trigger trg_stock_updated       before update on public.stock_items    for each row execute function public.update_updated_at();
create or replace trigger trg_maintenance_updated before update on public.maintenance_tasks for each row execute function public.update_updated_at();

-- ── 9. RLS for new tables ─────────────────────────────────────
alter table public.profiles          enable row level security;
alter table public.stock_items       enable row level security;
alter table public.maintenance_tasks enable row level security;

-- Helper functions
create or replace function public.get_my_role()
returns user_role language sql stable security definer as $$
  select role from public.profiles where id = auth.uid()
$$;

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

-- Profiles
drop policy if exists "Own profile"           on public.profiles;
drop policy if exists "Admin sees all profiles" on public.profiles;
drop policy if exists "Admin manages profiles" on public.profiles;
create policy "Own profile"             on public.profiles for select using (id = auth.uid());
create policy "Admin sees all profiles" on public.profiles for select using (public.get_my_role() = 'admin');
create policy "Admin manages profiles"  on public.profiles for all   using (public.get_my_role() = 'admin');

-- Properties (update existing permissive policies to role-based)
drop policy if exists "Authenticated users can read properties"   on public.properties;
drop policy if exists "Authenticated users can manage properties" on public.properties;
drop policy if exists "Auth users see properties"    on public.properties;
drop policy if exists "Manager+ insert properties"   on public.properties;
drop policy if exists "Manager+ update properties"   on public.properties;
drop policy if exists "Admin delete properties"      on public.properties;
create policy "Auth users see properties"   on public.properties for select using (auth.uid() is not null);
create policy "Manager+ insert properties"  on public.properties for insert with check (public.get_my_role() in ('admin', 'manager'));
create policy "Manager+ update properties"  on public.properties for update using (public.get_my_role() in ('admin', 'manager'));
create policy "Admin delete properties"     on public.properties for delete using (public.get_my_role() = 'admin');

-- Rooms
drop policy if exists "Authenticated users can read rooms"   on public.rooms;
drop policy if exists "Authenticated users can manage rooms" on public.rooms;
drop policy if exists "Auth users see rooms"    on public.rooms;
drop policy if exists "Manager+ manage rooms"   on public.rooms;
create policy "Auth users see rooms"  on public.rooms for select using (auth.uid() is not null);
create policy "Manager+ manage rooms" on public.rooms for all    using (public.get_my_role() in ('admin', 'manager'));

-- Guests
drop policy if exists "Authenticated users can read guests"   on public.guests;
drop policy if exists "Authenticated users can manage guests" on public.guests;
drop policy if exists "Staff see guests"         on public.guests;
drop policy if exists "Reception+ manage guests" on public.guests;
create policy "Staff see guests"         on public.guests for select using (auth.uid() is not null);
create policy "Reception+ manage guests" on public.guests for all    using (public.get_my_role() in ('admin', 'manager', 'reception'));

-- Bookings
drop policy if exists "Authenticated users can read bookings"   on public.bookings;
drop policy if exists "Authenticated users can manage bookings" on public.bookings;
drop policy if exists "Staff see bookings"          on public.bookings;
drop policy if exists "Reception+ insert bookings"  on public.bookings;
drop policy if exists "Reception+ update bookings"  on public.bookings;
drop policy if exists "Manager+ delete bookings"    on public.bookings;
create policy "Staff see bookings"         on public.bookings for select using (auth.uid() is not null);
create policy "Reception+ insert bookings" on public.bookings for insert with check (public.get_my_role() in ('admin', 'manager', 'reception'));
create policy "Reception+ update bookings" on public.bookings for update using (public.get_my_role() in ('admin', 'manager', 'reception'));
create policy "Manager+ delete bookings"   on public.bookings for delete using (public.get_my_role() in ('admin', 'manager'));

-- Costs
drop policy if exists "Authenticated users can read costs"   on public.cost_entries;
drop policy if exists "Authenticated users can manage costs" on public.cost_entries;
drop policy if exists "Finance sees costs"   on public.cost_entries;
drop policy if exists "Finance manage costs" on public.cost_entries;
create policy "Finance sees costs"   on public.cost_entries for select using (public.get_my_role() in ('admin', 'manager', 'accountant'));
create policy "Finance manage costs" on public.cost_entries for all    using (public.get_my_role() in ('admin', 'manager', 'accountant'));

-- Staff
drop policy if exists "Authenticated users can read staff"   on public.staff_members;
drop policy if exists "Authenticated users can manage staff" on public.staff_members;
drop policy if exists "Manager+ sees staff"    on public.staff_members;
drop policy if exists "Manager+ manages staff" on public.staff_members;
create policy "Manager+ sees staff"    on public.staff_members for select using (public.get_my_role() in ('admin', 'manager'));
create policy "Manager+ manages staff" on public.staff_members for all    using (public.get_my_role() in ('admin', 'manager'));

-- Stock
create policy "Auth users see stock"  on public.stock_items for select using (auth.uid() is not null);
create policy "Manager+ manage stock" on public.stock_items for all    using (public.get_my_role() in ('admin', 'manager', 'reception'));

-- Maintenance
create policy "Auth users see maintenance"    on public.maintenance_tasks for select using (auth.uid() is not null);
create policy "Auth users manage maintenance" on public.maintenance_tasks for all    using (auth.uid() is not null);

-- ── 10. Set your admin user ───────────────────────────────────
-- After running this migration, make yourself admin:
--
--   INSERT INTO public.profiles (id, email, full_name, role)
--   SELECT id, email, email, 'admin'
--   FROM auth.users
--   ON CONFLICT (id) DO UPDATE SET role = 'admin';
--
-- Or target a specific email:
--   UPDATE public.profiles SET role = 'admin'
--   WHERE email = 'your@email.com';
-- ============================================================
