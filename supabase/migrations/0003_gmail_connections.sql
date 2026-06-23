-- Gmail OAuth tokens for send-as-user (server-side only via service role).

create table if not exists public.gmail_connections (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists gmail_connections_set_updated_at on public.gmail_connections;
create trigger gmail_connections_set_updated_at
  before update on public.gmail_connections
  for each row execute function public.set_updated_at();

alter table public.gmail_connections enable row level security;

-- Tokens are never exposed to the client. Server actions use the service role.

create or replace function public.get_gmail_connection_status()
returns table (email text, connected_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select gc.email, gc.created_at
  from public.gmail_connections gc
  where gc.user_id = auth.uid();
$$;

revoke all on function public.get_gmail_connection_status() from public;
grant execute on function public.get_gmail_connection_status() to authenticated;
