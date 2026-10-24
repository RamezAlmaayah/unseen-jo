-- Reuse the existing owner-only account tables; no content, roles or Storage changes.
alter table public.profiles add column preferred_language text not null default 'en'
  check (preferred_language in ('en','ar-JO'));
grant update(preferred_language) on public.profiles to authenticated;

create function unseen_private.valid_discovery_settings(s jsonb) returns boolean
language plpgsql immutable set search_path = '' as $$
declare k text; v jsonb;
begin
  if s is null or jsonb_typeof(s) <> 'object' or octet_length(s::text)>4096 then return false; end if;
  if s='{}'::jsonb then return true; end if;
  if not (s ?& array['startingLocation','interests','availableTime','budget','travelGroup','transportation','totalBudget','hoursAvailable','strict']) then return false; end if;
  for k,v in select * from jsonb_each(s) loop
    if k not in ('startingLocation','interests','availableTime','budget','travelGroup','transportation','totalBudget','hoursAvailable','strict') then return false; end if;
  end loop;
  for k in select unnest(array['startingLocation','availableTime','budget','travelGroup','transportation']) loop
    if jsonb_typeof(s->k)<>'string' then return false; end if;
  end loop;
  if s->>'startingLocation' not in ('','amman','ajloun','irbid','salt','madaba','aqaba') or jsonb_typeof(s->'startingLocation')<>'string'
    or s->>'availableTime' not in ('','30-min','2-hours','4-hours','half-day','full-day')
    or s->>'budget' not in ('','free','under-10','10-30','over-30','jod:20')
    or s->>'travelGroup' not in ('','solo','couple','friends','family')
    or s->>'transportation' not in ('','car','public','walking') then return false; end if;
  for k in select unnest(array['totalBudget','hoursAvailable']) loop
    if jsonb_typeof(s->k) not in ('string','number') then return false; end if;
    if s->>k <> '' then
      if s->>k !~ '^[0-9]{1,7}(\.[0-9]{1,4})?$' then return false; end if;
      if (s->>k)::numeric > (case when k='hoursAvailable' then 168 else 1000000 end) then return false; end if;
      if k='hoursAvailable' and (s->>k)::numeric<=0 then return false; end if;
    end if;
  end loop;
  if jsonb_typeof(s->'interests')<>'array' or jsonb_array_length(s->'interests')>30 then return false; end if;
  for v in select * from jsonb_array_elements(s->'interests') loop
    if jsonb_typeof(v)<>'string' or v#>>'{}' !~ '^[a-z][a-z0-9-]{0,59}$' then return false; end if;
  end loop;
  if jsonb_typeof(s->'strict')<>'object' then return false; end if;
  for k,v in select * from jsonb_each(s->'strict') loop
    if k not in ('interest','time','budget','location','transport','group') or jsonb_typeof(v)<>'boolean' then return false; end if;
  end loop;
  return true;
end $$;
revoke all on function unseen_private.valid_discovery_settings(jsonb) from public, anon;
grant execute on function unseen_private.valid_discovery_settings(jsonb) to authenticated;
alter table public.user_preferences add column discovery_settings jsonb not null default '{}'
  check (unseen_private.valid_discovery_settings(discovery_settings));
grant insert(discovery_settings),update(discovery_settings) on public.user_preferences to authenticated;

-- Invoker privileges + existing RLS; per-owner lock and expected version prevent lost updates.
create function public.uj_save_preferences(settings jsonb, expected_version timestamptz default null)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare uid uuid := auth.uid(); current_version timestamptz; result jsonb; mins integer; cap numeric;
begin
  if uid is null then raise exception 'Sign in required' using errcode='42501'; end if;
  if not unseen_private.valid_discovery_settings(settings) or settings='{}'::jsonb then raise exception 'Invalid discovery preferences' using errcode='22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text, 606));
  select updated_at into current_version from public.user_preferences where user_id=uid;
  if current_version is distinct from expected_version then raise exception 'Preferences changed on another device. Reload before saving.' using errcode='40001'; end if;
  if exists (select 1 from jsonb_array_elements_text(settings->'interests') i(slug)
    where not exists(select 1 from public.categories c where c.slug=i.slug and c.is_active)) then raise exception 'An interest is unavailable' using errcode='22023'; end if;
  mins := case when settings->>'hoursAvailable'<>'' then greatest(1,round((settings->>'hoursAvailable')::numeric*60)::integer)
    else case settings->>'availableTime' when '30-min' then 30 when '2-hours' then 120 when '4-hours' then 240 when 'half-day' then 240 when 'full-day' then 480 end end;
  cap := case when settings->>'totalBudget'<>'' then (settings->>'totalBudget')::numeric
    else case settings->>'budget' when 'free' then 0 when 'under-10' then 10 when '10-30' then 30 when 'jod:20' then 20 end end;
  insert into public.user_preferences(user_id,starting_city,available_minutes,budget_max_jod,travel_group,transportation,discovery_settings)
    values(uid,nullif(settings->>'startingLocation',''),mins,cap,nullif(settings->>'travelGroup',''),nullif(settings->>'transportation',''),settings)
    on conflict(user_id) do update set starting_city=excluded.starting_city,available_minutes=excluded.available_minutes,
      budget_min_jod=null,budget_max_jod=excluded.budget_max_jod,travel_group=excluded.travel_group,transportation=excluded.transportation,discovery_settings=excluded.discovery_settings;
  delete from public.user_preference_categories where user_id=uid;
  insert into public.user_preference_categories(user_id,category_id)
    select uid,c.id from public.categories c where c.is_active and c.slug in(select jsonb_array_elements_text(settings->'interests'));
  select to_jsonb(p) into result from public.user_preferences p where p.user_id=uid;
  return result;
end $$;
revoke all on function public.uj_save_preferences(jsonb,timestamptz) from public,anon;
grant execute on function public.uj_save_preferences(jsonb,timestamptz) to authenticated;
