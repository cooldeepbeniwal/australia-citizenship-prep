-- Each account owns its practice history. IDs make retries and guest imports idempotent.
create table if not exists public.progress_events (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  constraint progress_payload_object check (jsonb_typeof(payload) = 'object'),
  constraint progress_payload_size check (octet_length(payload::text) <= 50000)
);

create index if not exists progress_events_user_order on public.progress_events (user_id, created_at, id);
alter table public.progress_events enable row level security;

create policy "Read own progress" on public.progress_events
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "Insert own progress" on public.progress_events
  for insert to authenticated with check ((select auth.uid()) = user_id);

-- The client uses an idempotent upsert. Existing events are immutable.
grant select, insert on public.progress_events to authenticated;
revoke all on public.progress_events from anon;
