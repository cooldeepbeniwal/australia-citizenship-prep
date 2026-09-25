-- Only the payment webhook may grant access. A signed-in user can read their own row.
create table public.mock_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  checkout_session_id text not null unique,
  payment_intent_id text not null unique,
  status text not null default 'paid' check (status in ('paid', 'refunded')),
  purchased_at timestamptz not null default now()
);

alter table public.mock_access enable row level security;

create policy "Read own mock access" on public.mock_access
  for select to authenticated using ((select auth.uid()) = user_id);

revoke all on public.mock_access from public, anon, authenticated;
grant select on public.mock_access to authenticated;
