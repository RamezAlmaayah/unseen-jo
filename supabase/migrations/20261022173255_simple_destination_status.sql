-- Three destination statuses already exist. Admin status changes require no
-- editorial, coordinate-review, translation-review or image-approval workflow.
-- Keep ordinary content validation and existing media access policies separate.
create or replace function public.admin_publication_issues(target uuid) returns text[]
language plpgsql stable security invoker set search_path='' as $$
declare p public.places; issues text[]:='{}';
begin
 if not unseen_private.is_admin() then raise insufficient_privilege using message='Administrator session required'; end if;
 select * into p from public.places where id=target;
 if not found then raise no_data_found using message='Destination unavailable'; end if;
 if length(btrim(p.name))<3 then issues:=array_append(issues,'Destination name needs at least 3 characters'); end if;
 if length(btrim(coalesce(p.description,'')))<80 then issues:=array_append(issues,'Useful description needs at least 80 characters'); end if;
 if p.is_demo then issues:=array_append(issues,'Demonstration content cannot be published'); end if;
 if p.primary_category_id is null or not exists(select 1 from public.place_categories pc join public.categories c on c.id=pc.category_id
  where pc.place_id=target and c.id=p.primary_category_id and c.is_active) then issues:=array_append(issues,'Choose an active primary category'); end if;
 if exists(select 1 from public.place_categories pc join public.categories c on c.id=pc.category_id where pc.place_id=target and not c.is_active) then
  issues:=array_append(issues,'Remove inactive category assignments'); end if;
 if p.latitude is null or p.longitude is null or p.latitude not between 29 and 33.6 or p.longitude not between 34.8 and 39.4 then
  issues:=array_append(issues,'A valid Jordan location is required'); end if;
 return issues;
end $$;

-- updated_at is also the English content-version identifier used by Arabic
-- visibility policies. A status-only change is not an English text edit.
-- Keep that version and every translation/review row intact; status changes
-- retain their real timestamp and actor in the existing audit log.
create function unseen_private.preserve_status_content_version() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
 if new.status is distinct from old.status and
  -- Generated location is unavailable in NEW during a BEFORE trigger;
  -- latitude/longitude still participate in the content comparison.
  (to_jsonb(new)-array['status','updated_at','updated_by','location']) is not distinct from
  (to_jsonb(old)-array['status','updated_at','updated_by','location']) then
  new.updated_at:=old.updated_at;
 end if;
 return new;
end $$;
revoke all on function unseen_private.preserve_status_content_version() from public,anon,authenticated;
-- Trigger names determine ordering: run after unseen_jo_updated_at.
create trigger zz_status_content_version before update on public.places
 for each row execute function unseen_private.preserve_status_content_version();

create function public.admin_change_place_status(target uuid,next_status text,expected_updated_at timestamptz,expected_status text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare p public.places;
begin
 if not unseen_private.is_admin() then raise insufficient_privilege using message='Administrator session required'; end if;
 if next_status is null or next_status not in ('published','draft','archived') then raise check_violation using message='Invalid publication status'; end if;
 select * into p from public.places where id=target for update;
 if not found then raise no_data_found using message='Destination unavailable'; end if;
 -- Status and content version together detect another editor's changes.
 if p.updated_at is distinct from expected_updated_at or p.status is distinct from expected_status then
  raise serialization_failure using message='Destination changed. Reload before changing status'; end if;
 if p.status<>next_status then
  -- Existing authorization, RLS, publication/media validation and audit triggers
  -- execute inside this same transaction. Any failed check rolls it all back.
  perform public.admin_set_place_status(target,next_status,expected_updated_at);
 end if;
 select * into p from public.places where id=target;
 return jsonb_build_object('id',p.id,'status',p.status,'updated_at',p.updated_at,'updated_by',p.updated_by,
  'quick_version',unseen_private.quick_edit_version(target));
end $$;
revoke all on function public.admin_change_place_status(uuid,text,timestamptz,text) from public,anon,authenticated;
grant execute on function public.admin_change_place_status(uuid,text,timestamptz,text) to authenticated;
