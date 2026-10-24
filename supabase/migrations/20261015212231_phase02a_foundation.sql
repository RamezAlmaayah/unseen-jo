-- Phase 02A. Additive foundation only. Never use a reset against a remote DB.
-- Preflight must confirm a verified, empty application schema before deployment.
create schema if not exists extensions;
create extension if not exists postgis with schema extensions;
create schema unseen_private;
revoke all on schema unseen_private from public;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) between 1 and 100),
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_avatar_owner check (avatar_path is null or (
    split_part(avatar_path, '/', 1) = id::text and
    avatar_path ~ '^[a-f0-9-]{36}/[A-Za-z0-9][A-Za-z0-9/_.-]{0,240}$' and
    position('..' in avatar_path) = 0
  ))
);

create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'admin', 'partner')),
  assigned_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);
create index user_roles_assigned_by_idx on public.user_roles(assigned_by);

create table public.places (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  name text not null check (char_length(btrim(name)) between 1 and 160),
  description text check (char_length(description) <= 20000),
  city text check (char_length(city) between 1 and 100),
  address text check (char_length(address) <= 500),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  is_demo boolean not null default false,
  source_url text check (source_url ~ '^https://[^[:space:]]+$'),
  verified_at timestamptz,
  verified_by uuid references auth.users(id) on delete set null,
  price_min_jod numeric(10,2) check (price_min_jod >= 0 and price_min_jod <> 'NaN'::numeric),
  price_max_jod numeric(10,2) check (price_max_jod >= 0 and price_max_jod <> 'NaN'::numeric),
  duration_min_minutes integer check (duration_min_minutes > 0),
  duration_max_minutes integer check (duration_max_minutes > 0),
  best_time_to_visit text check (char_length(best_time_to_visit) <= 1000),
  transportation_notes text check (char_length(transportation_notes) <= 2000),
  suitable_groups text[] check (suitable_groups <@ array['solo', 'couple', 'friends', 'family']::text[]),
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  location extensions.geography(Point,4326) generated always as (
    case when latitude is not null and longitude is not null
      then extensions.st_setsrid(extensions.st_makepoint(longitude, latitude),4326)::extensions.geography
      else null end
  ) stored,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((latitude is null) = (longitude is null)),
  check (price_min_jod is null or price_max_jod is null or price_max_jod >= price_min_jod),
  check (duration_min_minutes is null or duration_max_minutes is null or duration_max_minutes >= duration_min_minutes),
  check (not is_demo or status <> 'published'),
  check (verified_by is null or verified_at is not null),
  check (verified_at is null or (source_url is not null and not is_demo))
);
create index places_location_gist_idx on public.places using gist(location);
create index places_published_idx on public.places(created_at desc, id) where status = 'published';
create index places_city_idx on public.places(city) where status = 'published';
create index places_verified_by_idx on public.places(verified_by);
create index places_created_by_idx on public.places(created_by);
create index places_updated_by_idx on public.places(updated_by);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  name text not null unique check (char_length(btrim(name)) between 1 and 80),
  is_active boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.place_categories (
  place_id uuid not null references public.places(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (place_id, category_id)
);
create index place_categories_category_idx on public.place_categories(category_id, place_id);

create table public.place_images (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  storage_path text not null unique,
  alt_text text not null check (char_length(btrim(alt_text)) between 1 and 500),
  sort_order integer not null default 0 check (sort_order >= 0),
  is_cover boolean not null default false,
  attribution text check (char_length(attribution) <= 1000),
  source_url text check (source_url ~ '^https://[^[:space:]]+$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (split_part(storage_path, '/', 1) = place_id::text and
    storage_path ~ '^[a-f0-9-]{36}/[A-Za-z0-9][A-Za-z0-9/_.-]{0,240}$' and
    position('..' in storage_path) = 0)
);
create unique index place_images_one_cover_idx on public.place_images(place_id) where is_cover;
create index place_images_place_order_idx on public.place_images(place_id, sort_order, id);

create table public.user_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  starting_city text check (char_length(btrim(starting_city)) between 1 and 100),
  available_minutes integer check (available_minutes > 0 and available_minutes <= 10080),
  budget_min_jod numeric(10,2) check (budget_min_jod >= 0 and budget_min_jod <> 'NaN'::numeric),
  budget_max_jod numeric(10,2) check (budget_max_jod >= 0 and budget_max_jod <> 'NaN'::numeric),
  travel_group text check (travel_group in ('solo', 'couple', 'friends', 'family')),
  transportation text check (transportation in ('car', 'public', 'walking')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (budget_min_jod is null or budget_max_jod is null or budget_max_jod >= budget_min_jod)
);
-- Normalized interests: category FKs instead of unvalidated arrays of category IDs.
create table public.user_preference_categories (
  user_id uuid not null references public.user_preferences(user_id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key(user_id, category_id)
);
create index user_preference_categories_category_idx on public.user_preference_categories(category_id);

create table public.saved_places (
  user_id uuid not null references public.profiles(id) on delete cascade,
  place_id uuid not null references public.places(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id, place_id)
);
create index saved_places_place_idx on public.saved_places(place_id);

create table public.recommendation_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  place_id uuid not null references public.places(id) on delete cascade,
  reaction text not null check (reaction in ('interested', 'not_interested', 'visited')),
  comment text check (char_length(comment) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, place_id)
);
create index recommendation_feedback_place_idx on public.recommendation_feedback(place_id);

create table public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null check (action in ('INSERT','UPDATE','DELETE')),
  entity_table text not null,
  entity_key jsonb not null,
  changed_columns text[],
  created_at timestamptz not null default now()
);
create index admin_audit_logs_actor_idx on public.admin_audit_logs(actor_id, created_at desc);
create index admin_audit_logs_created_idx on public.admin_audit_logs(created_at desc);

create function unseen_private.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end;
$$;

create function unseen_private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.user_roles where user_id = (select auth.uid()) and role = 'admin'
  );
$$;

-- Trigger only: metadata can supply a display name, never authorization roles.
create function unseen_private.on_auth_user_created() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id, display_name)
  values (new.id, nullif(left(btrim(coalesce(new.raw_user_meta_data->>'full_name','')),100),''));
  insert into public.user_roles(user_id, role) values(new.id,'user');
  return new;
end;
$$;
create trigger unseen_jo_auth_user_created after insert on auth.users
for each row execute function unseen_private.on_auth_user_created();

-- Only identifiers and changed column names are logged, not private field values.
create function unseen_private.audit_change() returns trigger
language plpgsql security definer set search_path = '' as $$
declare before_row jsonb := '{}'::jsonb; after_row jsonb := '{}'::jsonb; row_data jsonb; changed text[];
begin
  if tg_op <> 'INSERT' then before_row := to_jsonb(old); end if;
  if tg_op <> 'DELETE' then after_row := to_jsonb(new); end if;
  row_data := case when tg_op = 'DELETE' then before_row else after_row end;
  select array_agg(k order by k) into changed from jsonb_object_keys(before_row || after_row) as fields(k)
    where before_row->k is distinct from after_row->k;
  insert into public.admin_audit_logs(actor_id, action, entity_table, entity_key, changed_columns)
  values ((select auth.uid()), tg_op, tg_table_name,
    jsonb_strip_nulls(jsonb_build_object('id',row_data->'id','user_id',row_data->'user_id',
      'place_id',row_data->'place_id','category_id',row_data->'category_id','role',row_data->'role')),changed);
  return null;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['profiles','places','categories','place_images','user_preferences','recommendation_feedback'] loop
    execute format('create trigger unseen_jo_updated_at before update on public.%I for each row execute function unseen_private.set_updated_at()',t);
  end loop;
  foreach t in array array['places','categories','place_categories','place_images','user_roles'] loop
    execute format('create trigger unseen_jo_audit after insert or update or delete on public.%I for each row execute function unseen_private.audit_change()',t);
  end loop;
end;
$$;

revoke all on function unseen_private.set_updated_at() from public, anon, authenticated;
revoke all on function unseen_private.on_auth_user_created() from public, anon, authenticated;
revoke all on function unseen_private.audit_change() from public, anon, authenticated;
revoke all on function unseen_private.is_admin() from public, anon, authenticated;
grant usage on schema unseen_private to authenticated;
grant execute on function unseen_private.is_admin() to authenticated;

-- Fail closed even between migrations: no application table is ever exposed
-- before its explicit grants and policies are installed by the next migration.
do $$
declare t text;
begin
  foreach t in array array['profiles','user_roles','places','categories','place_categories','place_images',
    'user_preferences','user_preference_categories','saved_places','recommendation_feedback','admin_audit_logs'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on table public.%I from public, anon, authenticated',t);
  end loop;
end;
$$;
