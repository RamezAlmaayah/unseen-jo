-- Phase 04: additive CMS metadata and fail-closed publishing. No content seed or role grant.
create or replace function unseen_private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select (select auth.uid()) is not null
    and exists (select 1 from public.user_roles where user_id = (select auth.uid()) and role = 'admin')
    and exists (select 1 from auth.sessions s where s.user_id = (select auth.uid())
      and s.id::text = (nullif(current_setting('request.jwt.claims',true),'')::jsonb ->> 'session_id')
      and (s.not_after is null or s.not_after > now()));
$$;

alter table public.places add column primary_category_id uuid references public.categories(id) on delete restrict;
create index places_primary_category_idx on public.places(primary_category_id);
alter table public.place_images add column license_basis text check (license_basis in ('owned','licensed','permission','public_domain'));
alter table public.place_images add column license_evidence text check (char_length(license_evidence) <= 2000);
alter table public.place_images add column approved_at timestamptz;
alter table public.place_images add column approved_by uuid references auth.users(id) on delete set null;
create index place_images_approved_by_idx on public.place_images(approved_by);
alter table public.place_images add constraint image_approval_evidence check (
  approved_at is null or (approved_by is not null and license_basis is not null
    and coalesce(char_length(btrim(license_evidence)),0) >= 12 and coalesce(char_length(btrim(attribution)),0) > 0 and source_url is not null));

create table public.place_reviews (
  place_id uuid primary key references public.places(id) on delete cascade,
  location_kind text check (location_kind in ('attraction','entrance','approximate_center')),
  coordinate_source text check (coordinate_source ~ '^https://[^[:space:]]+$'),
  location_reviewed boolean not null default false,
  claims_reviewed boolean not null default false,
  notes text check (char_length(notes) <= 5000),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  updated_at timestamptz not null default now()
);
create index place_reviews_reviewer_idx on public.place_reviews(reviewed_by);
alter table public.place_reviews enable row level security;
revoke all on public.place_reviews from public, anon, authenticated;
grant select,insert,update,delete on public.place_reviews to authenticated;
create policy uj_reviews_admin on public.place_reviews to authenticated
  using ((select unseen_private.is_admin())) with check ((select unseen_private.is_admin()));
create trigger uj_reviews_timestamp before update on public.place_reviews for each row execute function unseen_private.set_updated_at();
create trigger uj_reviews_audit after insert or update or delete on public.place_reviews for each row execute function unseen_private.audit_change();

-- Publication checks are private review material and are executed under the caller's RLS.
create function public.admin_publication_issues(target uuid) returns text[]
language plpgsql stable security invoker set search_path = '' as $$
declare p public.places; r public.place_reviews; issues text[] := '{}';
begin
  if not unseen_private.is_admin() then raise insufficient_privilege using message='Administrator session required'; end if;
  select * into p from public.places where id=target;
  if not found then raise no_data_found using message='Destination unavailable'; end if;
  select * into r from public.place_reviews where place_id=target;
  if length(btrim(p.name)) < 3 then issues := array_append(issues,'Destination name needs at least 3 characters'); end if;
  if length(btrim(coalesce(p.description,''))) < 80 then issues := array_append(issues,'Useful description needs at least 80 characters'); end if;
  if p.is_demo then issues := array_append(issues,'Demonstration content cannot be published'); end if;
  if p.source_url is null or p.verified_at is null or p.verified_by is null or not coalesce(r.claims_reviewed,false) or r.reviewed_at is null then
    issues := array_append(issues,'Source and essential claims require an explicit review'); end if;
  if p.primary_category_id is null or not exists(select 1 from public.place_categories pc join public.categories c on c.id=pc.category_id
    where pc.place_id=target and c.id=p.primary_category_id and c.is_active) then issues := array_append(issues,'Choose an active primary category'); end if;
  if exists(select 1 from public.place_categories pc join public.categories c on c.id=pc.category_id where pc.place_id=target and not c.is_active) then
    issues := array_append(issues,'Remove inactive category assignments'); end if;
  if p.latitude is null or p.longitude is null or p.latitude not between 29 and 33.6 or p.longitude not between 34.8 and 39.4
    or not coalesce(r.location_reviewed,false) or r.location_kind is null or r.coordinate_source is null then
    issues := array_append(issues,'Review a sourced Jordan location and its precision'); end if;
  if not exists(select 1 from public.place_images i join storage.objects o on o.bucket_id='place-images' and o.name=i.storage_path
    where i.place_id=target and i.is_cover and i.approved_at is not null) then issues := array_append(issues,'An uploaded, rights-approved cover image is required'); end if;
  return issues;
end;
$$;
revoke all on function public.admin_publication_issues(uuid) from public,anon,authenticated;
grant execute on function public.admin_publication_issues(uuid) to authenticated;

create function unseen_private.guard_publication() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare issues text[];
begin
  if tg_op='UPDATE' and old.status='published' and new.status='published'
    and (to_jsonb(new)-'updated_at') is distinct from (to_jsonb(old)-'updated_at') then
    raise check_violation using message='Return this destination to draft before editing';
  end if;
  if new.status='published' then
    -- AFTER trigger sees the new row, including direct REST attempts; failed checks roll back the transaction.
    issues := public.admin_publication_issues(new.id);
    if cardinality(issues)>0 then raise check_violation using message=array_to_string(issues,'; '); end if;
  end if;
  return null;
end;
$$;
create trigger uj_publication_guard after insert or update on public.places for each row execute function unseen_private.guard_publication();

create function unseen_private.guard_published_dependencies() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if tg_op <> 'INSERT' and exists(select 1 from public.places where id=old.place_id and status='published') then
    raise check_violation using message='Return the destination to draft before changing media, categories or review'; end if;
  if tg_op <> 'DELETE' and exists(select 1 from public.places where id=new.place_id and status='published') then
    raise check_violation using message='Return the destination to draft before changing media, categories or review'; end if;
  return case when tg_op='DELETE' then old else new end;
end;
$$;
create trigger uj_images_edit_guard before insert or update or delete on public.place_images for each row execute function unseen_private.guard_published_dependencies();
create trigger uj_links_edit_guard before insert or update or delete on public.place_categories for each row execute function unseen_private.guard_published_dependencies();
create trigger uj_reviews_edit_guard before insert or update or delete on public.place_reviews for each row execute function unseen_private.guard_published_dependencies();

create function unseen_private.guard_category() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if not new.is_active and exists(select 1 from public.place_categories pc join public.places p on p.id=pc.place_id where pc.category_id=new.id and p.status='published') then
    raise check_violation using message='Unpublish linked destinations before deactivating this category'; end if;
  return new;
end;
$$;
create trigger uj_category_guard before update on public.categories for each row execute function unseen_private.guard_category();

-- Restrictive policies intersect existing allowances; never broaden private draft/avatar access.
create policy uj_image_approval_anon on public.place_images as restrictive for select to anon using (approved_at is not null);
create policy uj_image_approval_user on public.place_images as restrictive for select to authenticated using ((select unseen_private.is_admin()) or approved_at is not null);
create policy uj_object_approval_anon on storage.objects as restrictive for select to anon using (
  bucket_id <> 'place-images' or exists(select 1 from public.place_images i where i.storage_path=storage.objects.name and i.approved_at is not null));
create policy uj_object_approval_user on storage.objects as restrictive for select to authenticated using (
  bucket_id <> 'place-images' or (select unseen_private.is_admin()) or exists(select 1 from public.place_images i where i.storage_path=storage.objects.name and i.approved_at is not null));
create policy uj_object_immutable_update on storage.objects as restrictive for update to authenticated using (
  bucket_id <> 'place-images' or not exists(select 1 from public.place_images i where i.storage_path=storage.objects.name))
  with check (bucket_id <> 'place-images' or not exists(select 1 from public.place_images i where i.storage_path=storage.objects.name));
create policy uj_object_immutable_delete on storage.objects as restrictive for delete to authenticated using (
  bucket_id <> 'place-images' or not exists(select 1 from public.place_images i where i.storage_path=storage.objects.name));

-- One transaction saves the draft and its complete category set. Optimistic lock prevents lost updates.
create function public.admin_save_place(payload jsonb, category_ids uuid[], expected_updated_at timestamptz default null) returns uuid
language plpgsql security invoker set search_path = '' as $$
declare pid uuid; current_row public.places; next_row public.places;
begin
  if not unseen_private.is_admin() then raise insufficient_privilege using message='Administrator session required'; end if;
  pid := nullif(payload->>'id','')::uuid;
  if pid is not null then
    select * into current_row from public.places where id=pid for update;
    if not found then raise no_data_found using message='Destination unavailable'; end if;
    if expected_updated_at is null or current_row.updated_at<>expected_updated_at then raise serialization_failure using message='This destination changed. Reload before saving'; end if;
  else
    insert into public.places(slug,name,created_by) values(payload->>'slug',payload->>'name',auth.uid()) returning * into current_row;
    pid := current_row.id;
  end if;
  -- Explicit allowlist: client cannot set publication, verification, audit actor or generated location.
  select * into next_row from jsonb_populate_record(current_row,jsonb_build_object(
    'slug',payload->'slug','name',payload->'name','description',payload->'description','city',payload->'city','address',payload->'address',
    'source_url',payload->'source_url','price_min_jod',payload->'price_min_jod','price_max_jod',payload->'price_max_jod',
    'duration_min_minutes',payload->'duration_min_minutes','duration_max_minutes',payload->'duration_max_minutes',
    'best_time_to_visit',payload->'best_time_to_visit','transportation_notes',payload->'transportation_notes','suitable_groups',payload->'suitable_groups',
    'latitude',payload->'latitude','longitude',payload->'longitude','primary_category_id',payload->'primary_category_id'));
  update public.places set slug=next_row.slug,name=next_row.name,description=next_row.description,city=next_row.city,address=next_row.address,
    source_url=next_row.source_url,price_min_jod=next_row.price_min_jod,price_max_jod=next_row.price_max_jod,
    duration_min_minutes=next_row.duration_min_minutes,duration_max_minutes=next_row.duration_max_minutes,
    best_time_to_visit=next_row.best_time_to_visit,transportation_notes=next_row.transportation_notes,suitable_groups=next_row.suitable_groups,
    latitude=next_row.latitude,longitude=next_row.longitude,primary_category_id=next_row.primary_category_id,
    status='draft',verified_at=null,verified_by=null,updated_by=auth.uid() where id=pid;
  delete from public.place_categories where place_id=pid and not (category_id=any(coalesce(category_ids,'{}')));
  insert into public.place_categories(place_id,category_id) select pid,unnest(coalesce(category_ids,'{}')) on conflict do nothing;
  update public.place_reviews set claims_reviewed=false,location_reviewed=false,reviewed_at=null,reviewed_by=null where place_id=pid;
  return pid;
end;
$$;
create function public.admin_review_place(target uuid, expected_updated_at timestamptz, review jsonb) returns void
language plpgsql security invoker set search_path = '' as $$
declare p public.places;
begin
  if not unseen_private.is_admin() then raise insufficient_privilege using message='Administrator session required'; end if;
  select * into p from public.places where id=target for update;
  if not found then raise no_data_found using message='Destination unavailable'; end if;
  if p.updated_at is distinct from expected_updated_at then raise serialization_failure using message='Destination changed. Reload before reviewing'; end if;
  if p.status<>'draft' or p.source_url is null then raise check_violation using message='Save a sourced draft before reviewing'; end if;
  insert into public.place_reviews(place_id,location_kind,coordinate_source,location_reviewed,claims_reviewed,notes,reviewed_at,reviewed_by)
    values(target,review->>'location_kind',review->>'coordinate_source',coalesce((review->>'location_reviewed')::boolean,false),
      coalesce((review->>'claims_reviewed')::boolean,false),review->>'notes',now(),auth.uid())
    on conflict(place_id) do update set location_kind=excluded.location_kind,coordinate_source=excluded.coordinate_source,
      location_reviewed=excluded.location_reviewed,claims_reviewed=excluded.claims_reviewed,notes=excluded.notes,reviewed_at=now(),reviewed_by=auth.uid();
  update public.places set verified_at=now(),verified_by=auth.uid(),updated_by=auth.uid() where id=target;
end;
$$;
create function public.admin_set_place_status(target uuid, next_status text, expected_updated_at timestamptz) returns void
language plpgsql security invoker set search_path = '' as $$
declare p public.places;
begin
  if not unseen_private.is_admin() then raise insufficient_privilege using message='Administrator session required'; end if;
  if next_status is null or next_status not in ('draft','published','archived') then raise check_violation using message='Invalid publication status'; end if;
  select * into p from public.places where id=target for update;
  if not found then raise no_data_found using message='Destination unavailable'; end if;
  if p.updated_at is distinct from expected_updated_at then raise serialization_failure using message='Destination changed. Reload before changing status'; end if;
  update public.places set status=next_status,updated_by=auth.uid() where id=target;
end;
$$;
revoke all on function public.admin_save_place(jsonb,uuid[],timestamptz), public.admin_review_place(uuid,timestamptz,jsonb), public.admin_set_place_status(uuid,text,timestamptz) from public,anon,authenticated;
grant execute on function public.admin_save_place(jsonb,uuid[],timestamptz), public.admin_review_place(uuid,timestamptz,jsonb), public.admin_set_place_status(uuid,text,timestamptz) to authenticated;
revoke all on function unseen_private.guard_publication(), unseen_private.guard_published_dependencies(), unseen_private.guard_category() from public,anon,authenticated;

create function public.admin_cms_status() returns jsonb
language plpgsql stable security invoker set search_path = '' as $$
begin
  if not unseen_private.is_admin() then raise insufficient_privilege using message='Administrator session required'; end if;
  return jsonb_build_object('version',4);
end;
$$;
create function public.admin_overview() returns jsonb
language plpgsql stable security invoker set search_path = '' as $$
begin
  if not unseen_private.is_admin() then raise insufficient_privilege using message='Administrator session required'; end if;
  return jsonb_build_object('total',(select count(*) from public.places),
    'published',(select count(*) from public.places where status='published'),
    'draft',(select count(*) from public.places where status='draft'),
    'archived',(select count(*) from public.places where status='archived'),
    'categories',(select count(*) from public.categories where is_active),
    'review',(select count(*) from public.places where status='draft' and verified_at is null),
    'coordinates',(select count(*) from public.places where latitude is null),
    'covers',(select count(*) from public.places p where not exists(select 1 from public.place_images i where i.place_id=p.id and i.is_cover and i.approved_at is not null)),
    'recent',(select coalesce(jsonb_agg(a),'[]') from (select * from public.admin_audit_logs order by created_at desc,id desc limit 8) a));
end;
$$;
create function public.admin_approve_image(target uuid, expected_updated_at timestamptz) returns void
language plpgsql security invoker set search_path = '' as $$
declare i public.place_images;
begin
  if not unseen_private.is_admin() then raise insufficient_privilege using message='Administrator session required'; end if;
  select * into i from public.place_images where id=target for update;
  if not found then raise no_data_found using message='Image unavailable'; end if;
  if i.updated_at is distinct from expected_updated_at then raise serialization_failure using message='Image changed. Reload before approving'; end if;
  if not exists(select 1 from storage.objects where bucket_id='place-images' and name=i.storage_path) then
    raise check_violation using message='Upload must exist before image approval'; end if;
  update public.place_images set approved_at=now(),approved_by=auth.uid() where id=target;
end;
$$;
revoke all on function public.admin_cms_status(),public.admin_overview(),public.admin_approve_image(uuid,timestamptz) from public,anon,authenticated;
grant execute on function public.admin_cms_status(),public.admin_overview(),public.admin_approve_image(uuid,timestamptz) to authenticated;
