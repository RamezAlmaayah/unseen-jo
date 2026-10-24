-- Independent self-reported visits must not overwrite recommendation reactions.
create table public.user_visited_places (
  user_id uuid not null references public.profiles(id) on delete cascade,
  place_id uuid not null references public.places(id) on delete cascade,
  visited_on date check (visited_on is null or visited_on between date '1900-01-01' and current_date),
  created_at timestamptz not null default now(),
  primary key(user_id, place_id)
);
create index user_visited_places_place_idx on public.user_visited_places(place_id);
alter table public.user_visited_places enable row level security;
revoke all on public.user_visited_places from anon, authenticated;
grant select, delete on public.user_visited_places to authenticated;
grant insert(user_id,place_id,visited_on), update(visited_on) on public.user_visited_places to authenticated;
create policy uj_visits_read on public.user_visited_places for select to authenticated
  using (user_id = (select auth.uid()));
create policy uj_visits_insert on public.user_visited_places for insert to authenticated
  with check (user_id = (select auth.uid()) and exists (
    select 1 from public.places p where p.id = place_id and p.status = 'published' and not p.is_demo));
create policy uj_visits_update on public.user_visited_places for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy uj_visits_delete on public.user_visited_places for delete to authenticated
  using (user_id = (select auth.uid()));

-- Only a destination and server timestamp: no location, preferences or page-view tracking.
-- An application presentation UUID makes StrictMode/retries idempotent.
create table public.user_discovery_history (
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid not null,
  place_id uuid not null references public.places(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id, event_id)
);
create index user_discovery_history_recent_idx on public.user_discovery_history(user_id, created_at desc, event_id desc);
create index user_discovery_history_place_idx on public.user_discovery_history(place_id);
alter table public.user_discovery_history enable row level security;
revoke all on public.user_discovery_history from anon, authenticated;
grant select, delete on public.user_discovery_history to authenticated;
grant insert(user_id,event_id,place_id) on public.user_discovery_history to authenticated;
create policy uj_history_read on public.user_discovery_history for select to authenticated
  using (user_id = (select auth.uid()));
create policy uj_history_insert on public.user_discovery_history for insert to authenticated
  with check (user_id = (select auth.uid()) and exists (
    select 1 from public.places p where p.id = place_id and p.status = 'published' and not p.is_demo));
create policy uj_history_delete on public.user_discovery_history for delete to authenticated
  using (user_id = (select auth.uid()));
