-- Migration: Alexander's Cleaning MVP
-- Renames Contacts to Customers and adds Jobs, Appointments, Scheduled Messages

-- 1. Rename contacts to customers
alter table contacts rename to customers;
alter table customers rename column id to id; -- explicitly keep id

-- Add missing fields to customers
alter table customers add column first_name text;
alter table customers add column last_name text;
alter table customers add column phone text;
alter table customers add column address_line_1 text;
alter table customers add column city text;
alter table customers add column state text;
alter table customers add column zip text;

-- Migration of 'name' to first/last if possible (optional, but keep name for now)
-- update customers set first_name = split_part(name, ' ', 1), last_name = split_part(name, ' ', 2) where name is not null;

-- 2. Create Jobs/Estimates table
create type job_type as enum ('estimate', 'job');
create type window_service_type as enum ('Exterior Windows', 'Interior + Exterior', 'Gutters', 'Pressure Washing', 'Other');
create type frequency_type as enum ('one-time', 'monthly', 'quarterly', 'annually');

create table if not exists jobs (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references customers(id) on delete cascade not null,
  type job_type default 'estimate' not null,
  service_type text default 'Exterior Windows', -- using text for flexibility but keeping enum in mind
  stories integer default 1,
  panes_count integer default 0,
  hard_water_stains boolean default false,
  frequency text default 'one-time',
  status text default 'estimate_requested' not null,
  price_estimate numeric default 0,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- status values expected:
-- estimate_requested, estimate_scheduled, estimate_sent, estimate_approved, estimate_rejected,
-- job_scheduled, job_in_progress, job_completed, job_cancelled

-- 3. Create Appointments table
create table if not exists appointments (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references jobs(id) on delete cascade not null,
  customer_id uuid references customers(id) on delete cascade not null,
  type text not null, -- 'estimate' | 'job'
  start_time timestamptz not null,
  end_time timestamptz not null,
  tech_name text,
  status text default 'scheduled' not null,
  created_at timestamptz default now() not null
);

-- 4. Create Scheduled Messages table
create table if not exists scheduled_messages (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references customers(id) on delete cascade not null,
  job_id uuid references jobs(id) on delete set null,
  appointment_id uuid references appointments(id) on delete set null,
  to_number text not null,
  body text not null,
  send_at timestamptz not null,
  status text default 'pending' not null,
  created_at timestamptz default now() not null
);

-- 5. Update FKs in other tables
alter table offers rename column contact_id to customer_id;
-- No need to rename the constraint unless desired, but renaming it is good practice
alter table offers drop constraint offers_contact_id_fkey;
alter table offers add constraint offers_customer_id_fkey foreign key (customer_id) references customers(id) on delete set null;

-- 6. Enable RLS and Policies for new tables
alter table jobs enable row level security;
alter table appointments enable row level security;
alter table scheduled_messages enable row level security;

create policy "Authenticated users can do anything on jobs" on jobs for all using (auth.role() = 'authenticated');
create policy "Authenticated users can do anything on appointments" on appointments for all using (auth.role() = 'authenticated');
create policy "Authenticated users can do anything on scheduled_messages" on scheduled_messages for all using (auth.role() = 'authenticated');

-- Public read/insert for jobs (for public booking)
create policy "Public can insert jobs" on jobs for insert with check (true);
create policy "Public can insert customers" on customers for insert with check (true);
create policy "Public can read customers by email/phone" on customers for select using (true); -- needed for lookup

-- 7. Triggers for updated_at
create trigger set_updated_at before update on customers for each row execute function update_updated_at_column();
create trigger set_updated_at before update on jobs for each row execute function update_updated_at_column();
