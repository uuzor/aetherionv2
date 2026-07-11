-- Supabase table for MinorityWin market metadata.
-- Run this in the same Supabase SQL editor as the storage policy.

create table if not exists public.minority_win_markets (
  id text primary key,
  game_id text not null default 'minority-win',
  contract_game_id text not null,
  name text not null,
  prompt text not null,
  question_image_url text,
  options jsonb not null default '[]'::jsonb,
  status text not null default 'OPEN' check (status in ('OPEN', 'VOTING', 'REVEALING', 'CLOSED')),
  players integer not null default 0,
  prize_pool text not null default '0',
  entry_stake text not null,
  time_left text not null,
  chain text not null default 'ETH' check (chain in ('BNB', 'ETH')),
  messages jsonb not null default '[]'::jsonb,
  stake_token_address text not null,
  confidential_token_address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.minority_win_markets enable row level security;

drop policy if exists "minority win markets are publicly readable" on public.minority_win_markets;
drop policy if exists "anon can create minority win markets" on public.minority_win_markets;

create policy "minority win markets are publicly readable"
on public.minority_win_markets
for select
to anon, authenticated
using (true);

create policy "anon can create minority win markets"
on public.minority_win_markets
for insert
to anon, authenticated
with check (
  game_id = 'minority-win'
  and jsonb_typeof(options) = 'array'
  and jsonb_array_length(options) = 3
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_minority_win_markets_updated_at on public.minority_win_markets;
create trigger set_minority_win_markets_updated_at
before update on public.minority_win_markets
for each row execute function public.set_updated_at();

create index if not exists minority_win_markets_created_at_idx
on public.minority_win_markets (created_at desc);

-- Force Supabase/PostgREST to see the new table immediately.
notify pgrst, 'reload schema';
