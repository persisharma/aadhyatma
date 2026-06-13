-- Vedansh push notification token store.
-- Run this in the Supabase SQL editor (Project → SQL Editor → New query).
-- Idempotent: safe to re-run.

create table if not exists public.push_tokens (
  token         text primary key,
  platform      text not null check (platform in ('ios', 'android', 'web')),
  app_version   text,
  expo_runtime  text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  last_seen_at  timestamptz not null default now()
);

create index if not exists push_tokens_last_seen_idx
  on public.push_tokens (last_seen_at desc);

-- Row-level security: anon clients can register/refresh their own token but
-- cannot read the table. The send script uses the service-role key, which
-- bypasses RLS automatically.
alter table public.push_tokens enable row level security;

drop policy if exists "anon can upsert own token"   on public.push_tokens;
drop policy if exists "anon can refresh own token"  on public.push_tokens;

create policy "anon can upsert own token"
  on public.push_tokens
  for insert
  to anon
  with check (true);

create policy "anon can refresh own token"
  on public.push_tokens
  for update
  to anon
  using (true)
  with check (true);

-- Auto-touch updated_at on every UPDATE.
create or replace function public.push_tokens_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists push_tokens_touch_updated_at on public.push_tokens;
create trigger push_tokens_touch_updated_at
  before update on public.push_tokens
  for each row execute function public.push_tokens_touch_updated_at();
