-- Email Brain: synced Gmail threads linked to leads.

create table if not exists public.inbox_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  gmail_thread_id text not null,
  lead_id uuid references public.leads (id) on delete set null,
  subject text,
  snippet text,
  from_email text not null,
  from_name text,
  counterparty_email text not null,
  counterparty_name text,
  last_message_at timestamptz not null,
  direction text not null default 'inbound',
  category text not null default 'other',
  category_reason text,
  urgency_score int not null default 0,
  draft_subject text,
  draft_body text,
  draft_generated_at timestamptz,
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, gmail_thread_id)
);

create index if not exists inbox_threads_user_id_idx on public.inbox_threads (user_id);
create index if not exists inbox_threads_lead_id_idx on public.inbox_threads (lead_id);
create index if not exists inbox_threads_category_idx on public.inbox_threads (user_id, category);
create index if not exists inbox_threads_urgency_idx on public.inbox_threads (user_id, urgency_score desc);

drop trigger if exists inbox_threads_set_updated_at on public.inbox_threads;
create trigger inbox_threads_set_updated_at
  before update on public.inbox_threads
  for each row execute function public.set_updated_at();

alter table public.inbox_threads enable row level security;

create policy inbox_threads_select_own on public.inbox_threads
  for select using (auth.uid() = user_id);

create policy inbox_threads_insert_own on public.inbox_threads
  for insert with check (auth.uid() = user_id);

create policy inbox_threads_update_own on public.inbox_threads
  for update using (auth.uid() = user_id);

create policy inbox_threads_delete_own on public.inbox_threads
  for delete using (auth.uid() = user_id);

-- Sync metadata (server writes via service role).
create table if not exists public.gmail_sync_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  last_synced_at timestamptz,
  last_sync_error text,
  threads_synced int not null default 0,
  updated_at timestamptz not null default now()
);

drop trigger if exists gmail_sync_state_set_updated_at on public.gmail_sync_state;
create trigger gmail_sync_state_set_updated_at
  before update on public.gmail_sync_state
  for each row execute function public.set_updated_at();

alter table public.gmail_sync_state enable row level security;

create policy gmail_sync_state_select_own on public.gmail_sync_state
  for select using (auth.uid() = user_id);

create or replace function public.get_gmail_sync_status()
returns table (
  last_synced_at timestamptz,
  last_sync_error text,
  threads_synced int
)
language sql
stable
security definer
set search_path = public
as $$
  select gs.last_synced_at, gs.last_sync_error, gs.threads_synced
  from public.gmail_sync_state gs
  where gs.user_id = auth.uid();
$$;

revoke all on function public.get_gmail_sync_status() from public;
grant execute on function public.get_gmail_sync_status() to authenticated;
