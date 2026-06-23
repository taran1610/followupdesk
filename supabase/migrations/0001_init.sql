-- Follow-Up Desk — initial schema
-- Run against your Supabase project (SQL editor or `supabase db push`).

create extension if not exists "pgcrypto";

-- updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- profiles -------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now()
);

-- leads ----------------------------------------------------------------------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  company text,
  email text,
  phone text,
  status text not null default 'New',
  source text,
  deal_value numeric,
  notes text,
  last_contact_date date,
  next_follow_up_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_user_id_idx on public.leads (user_id);
create index if not exists leads_next_follow_up_idx on public.leads (user_id, next_follow_up_date);
create index if not exists leads_status_idx on public.leads (user_id, status);

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

-- lead_notes -----------------------------------------------------------------
create table if not exists public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists lead_notes_lead_id_idx on public.lead_notes (lead_id);
create index if not exists lead_notes_user_id_idx on public.lead_notes (user_id);

-- followups ------------------------------------------------------------------
create table if not exists public.followups (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  channel text not null default 'email',
  subject text,
  body text,
  status text not null default 'scheduled',
  scheduled_for timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists followups_lead_id_idx on public.followups (lead_id);
create index if not exists followups_user_id_idx on public.followups (user_id);

-- ai_generations -------------------------------------------------------------
create table if not exists public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads (id) on delete set null,
  user_id uuid not null references auth.users (id) on delete cascade,
  prompt_input jsonb not null,
  generated_output jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists ai_generations_user_id_idx on public.ai_generations (user_id);

-- Row Level Security ---------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.lead_notes enable row level security;
alter table public.followups enable row level security;
alter table public.ai_generations enable row level security;

-- profiles: a user can see/manage only their own profile row.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "profiles_upsert_own" on public.profiles;
create policy "profiles_upsert_own" on public.profiles
  for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Generic owner-only policies for the remaining tables.
drop policy if exists "leads_owner_all" on public.leads;
create policy "leads_owner_all" on public.leads
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "lead_notes_owner_all" on public.lead_notes;
create policy "lead_notes_owner_all" on public.lead_notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "followups_owner_all" on public.followups;
create policy "followups_owner_all" on public.followups
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "ai_generations_owner_all" on public.ai_generations;
create policy "ai_generations_owner_all" on public.ai_generations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
