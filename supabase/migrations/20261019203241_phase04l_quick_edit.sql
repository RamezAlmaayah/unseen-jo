-- Private editor workspaces never replace public rows until an explicit save.
alter table public.places
 add column region text check(char_length(region)<=200),
 add column opening_hours text check(char_length(opening_hours)<=2000),
 add column activities text check(char_length(activities)<=4000),
 add column visitor_information text check(char_length(visitor_information)<=6000);
alter table public.place_translations
 add column region text check(char_length(region)<=200),
 add column opening_hours text check(char_length(opening_hours)<=2000),
 add column activities text check(char_length(activities)<=4000),
 add column visitor_information text check(char_length(visitor_information)<=6000);
create table public.place_quick_drafts(
 place_id uuid not null references public.places(id) on delete cascade,
 editor_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 base_version text not null,
 changes jsonb not null check(jsonb_typeof(changes)='object' and octet_length(changes::text)<=131072),
 updated_at timestamptz not null default now(),
 primary key(place_id,editor_id)
);
alter table public.place_quick_drafts enable row level security;
revoke all on public.place_quick_drafts from public,anon,authenticated;
grant select,insert,update,delete on public.place_quick_drafts to authenticated;
create policy quick_draft_owner on public.place_quick_drafts to authenticated
 using(editor_id=(select auth.uid()) and (select unseen_private.is_admin()))
 with check(editor_id=(select auth.uid()) and (select unseen_private.is_admin()));
create trigger quick_draft_timestamp before update on public.place_quick_drafts for each row execute function unseen_private.set_updated_at();
create trigger quick_draft_audit after insert or update or delete on public.place_quick_drafts for each row execute function unseen_private.audit_change();

create function unseen_private.quick_edit_version(target uuid) returns text
language sql stable security invoker set search_path='' as $$
 select md5(jsonb_build_array(
 (select to_jsonb(p) from public.places p where id=target),
 (select jsonb_agg(i order by id) from public.place_images i where place_id=target),
 (select jsonb_agg(t order by locale) from public.place_translations t where place_id=target),
 (select jsonb_agg(c order by category_id) from public.place_categories c where place_id=target),
 (select to_jsonb(r) from public.place_reviews r where place_id=target))::text)
$$;
revoke all on function unseen_private.quick_edit_version(uuid) from public,anon,authenticated;
grant execute on function unseen_private.quick_edit_version(uuid) to authenticated;
create function public.admin_quick_edit_state(target uuid) returns jsonb
language plpgsql stable security invoker set search_path='' as $$
begin
 if not unseen_private.is_admin() then raise insufficient_privilege using message='Administrator session required'; end if;
 if not exists(select 1 from public.places where id=target) then raise no_data_found using message='Destination unavailable'; end if;
 return jsonb_build_object('version',unseen_private.quick_edit_version(target),'draft',
 (select to_jsonb(d) from public.place_quick_drafts d where place_id=target and editor_id=auth.uid()));
end $$;
create function public.admin_save_quick_draft(target uuid, base_version text, changes jsonb, expected_draft_updated_at timestamptz)
returns timestamptz language plpgsql security invoker set search_path='' as $$
declare saved timestamptz;
begin
 if not unseen_private.is_admin() then raise insufficient_privilege using message='Administrator session required'; end if;
 perform 1 from public.places where id=target for update;
 if not found or unseen_private.quick_edit_version(target) is distinct from base_version then
 raise serialization_failure using message='This destination changed. Reload before saving; your edits are still on this page.'; end if;
 insert into public.place_quick_drafts as d(place_id,editor_id,base_version,changes)
 values(target,auth.uid(),base_version,changes)
 on conflict(place_id,editor_id) do update set changes=excluded.changes,base_version=excluded.base_version
 where d.updated_at=expected_draft_updated_at returning updated_at into saved;
 if saved is null then raise serialization_failure using message='Another editor tab saved this working draft. Reload before saving.'; end if;
 return saved;
end $$;

-- The original publication/media guards, source checks, approval RPCs, RLS and
-- audit triggers run normally inside this single transaction. A failure rolls
-- back every public change; existing publication status is never lost.
create function public.admin_apply_quick_edit(changes jsonb, expected_version text, reviewed_changes boolean default false)
returns uuid language plpgsql security invoker set search_path='' as $$
declare p public.places; pid uuid; previous_status text; english jsonb; arabic jsonb;
 category_ids uuid[]; media jsonb; old_image public.place_images; saved_image public.place_images;
 t public.place_translations; metadata_changed boolean; review jsonb;
begin
 if not unseen_private.is_admin() then raise insufficient_privilege using message='Administrator session required'; end if;
 if jsonb_typeof(changes) is distinct from 'object' or octet_length(changes::text)>131072 then raise check_violation using message='The editing form is too large or invalid'; end if;
 english:=changes->'english';arabic:=changes->'arabic';review:=changes->'review';
 if jsonb_typeof(english) is distinct from 'object' or jsonb_typeof(arabic) is distinct from 'object'
 or jsonb_typeof(changes->'images') is distinct from 'array' or jsonb_typeof(changes->'category_ids') is distinct from 'array' then
  raise check_violation using message='The editing form is incomplete. Reload before saving';end if;
 pid:=nullif(english->>'id','')::uuid;
 if pid is not null then
  select * into p from public.places where id=pid for update;
  if not found then raise no_data_found using message='Destination unavailable'; end if;
  -- Lock dependent rows before comparing the complete saved-state fingerprint.
  perform 1 from public.place_images where place_id=pid for update;
  perform 1 from public.place_translations where place_id=pid for update;
  perform 1 from public.place_reviews where place_id=pid for update;
  if unseen_private.quick_edit_version(pid) is distinct from expected_version then raise serialization_failure using message='This destination changed. Reload before saving; your edits are still on this page.'; end if;
  if english->>'slug' is distinct from p.slug then raise check_violation using message='Existing destination links cannot be changed in Quick Edit'; end if;
  previous_status:=p.status;
  if previous_status='published' and not coalesce(reviewed_changes,false) then raise check_violation using message='Save privately or verify your changes before updating the website'; end if;
  if previous_status<>'draft' then perform public.admin_set_place_status(pid,'draft',p.updated_at);end if;
  select * into p from public.places where id=pid;
 else previous_status:='draft';end if;
 select coalesce(array_agg(value::uuid),'{}') into category_ids from jsonb_array_elements_text(changes->'category_ids');
 pid:=public.admin_save_place(english,category_ids,p.updated_at);
 update public.places set region=english->>'region',opening_hours=english->>'opening_hours',
 activities=english->>'activities',visitor_information=english->>'visitor_information' where id=pid;
 -- Clear only the role, not the rights, before assigning a different cover.
 update public.place_images set is_cover=false where place_id=pid and is_cover;
 for media in select value from jsonb_array_elements(changes->'images') loop
  if nullif(media->>'id','') is not null then
   select * into old_image from public.place_images where id=(media->>'id')::uuid and place_id=pid for update;
   if not found or old_image.storage_path is distinct from media->>'storage_path' then raise check_violation using message='An image does not belong to this destination. Reload the editor.'; end if;
   metadata_changed := jsonb_build_array(old_image.alt_text,old_image.attribution,old_image.source_url,old_image.license_basis,old_image.license_evidence)
    is distinct from jsonb_build_array(media->>'alt_text',media->>'attribution',media->>'source_url',media->>'license_basis',media->>'license_evidence');
   update public.place_images set alt_text=media->>'alt_text',attribution=media->>'attribution',source_url=media->>'source_url',license_basis=media->>'license_basis',license_evidence=media->>'license_evidence',
    sort_order=(media->>'sort_order')::integer,is_cover=coalesce((media->>'is_cover')::boolean,false),
    approved_at=case when metadata_changed then null else approved_at end,approved_by=case when metadata_changed then null else approved_by end
    where id=old_image.id returning * into saved_image;
  else
   if split_part(media->>'storage_path','/',1)<>pid::text or not exists(select 1 from storage.objects where bucket_id='place-images' and name=media->>'storage_path') then
    raise check_violation using message='Upload the photograph for this destination before saving';end if;
   insert into public.place_images(place_id,storage_path,alt_text,attribution,source_url,license_basis,license_evidence,sort_order,is_cover)
    values(pid,media->>'storage_path',media->>'alt_text',media->>'attribution',media->>'source_url',media->>'license_basis',media->>'license_evidence',(media->>'sort_order')::integer,coalesce((media->>'is_cover')::boolean,false)) returning * into saved_image;
  end if;
  if coalesce((media->>'rights_confirmed')::boolean,false) then perform public.admin_approve_image(saved_image.id,saved_image.updated_at);end if;
 end loop;
 -- Removing an image unlinks its record; immutable original Storage bytes stay.
 delete from public.place_images i where i.place_id=pid and not exists(
  select 1 from jsonb_array_elements(changes->'images') m where m->>'storage_path'=i.storage_path);
 if coalesce(reviewed_changes,false) then
  select * into p from public.places where id=pid;
  if review->>'location_kind' is null or review->>'coordinate_source' is null then raise check_violation using message='Add a location source and precision in Advanced Details before verifying changes';end if;
  perform public.admin_review_place(pid,p.updated_at,review||'{"location_reviewed":true,"claims_reviewed":true}'::jsonb);
 end if;
 if previous_status='archived' then
  select * into p from public.places where id=pid;perform public.admin_set_place_status(pid,'archived',p.updated_at);
 end if;
 select * into p from public.places where id=pid;
 insert into public.place_translations(place_id,locale,name,description,city,address,best_time_to_visit,transportation_notes,visitor_guidance,region,opening_hours,activities,visitor_information,source_updated_at)
 values(pid,'ar-JO',nullif(arabic->>'name',''),arabic->>'description',arabic->>'city',arabic->>'address',arabic->>'best_time_to_visit',arabic->>'transportation_notes',arabic->>'visitor_guidance',arabic->>'region',arabic->>'opening_hours',arabic->>'activities',arabic->>'visitor_information',p.updated_at)
 on conflict(place_id,locale) do update set name=excluded.name,description=excluded.description,city=excluded.city,address=excluded.address,best_time_to_visit=excluded.best_time_to_visit,transportation_notes=excluded.transportation_notes,visitor_guidance=excluded.visitor_guidance,region=excluded.region,opening_hours=excluded.opening_hours,activities=excluded.activities,visitor_information=excluded.visitor_information,source_updated_at=excluded.source_updated_at;
 if coalesce(reviewed_changes,false) then
  -- This records the explicitly confirmed human review, never machine approval.
  update public.place_translations set editorial_status='reviewed' where place_id=pid and locale='ar-JO';
 end if;
 if previous_status='published' then
  select * into t from public.place_translations where place_id=pid and locale='ar-JO';
  perform public.admin_publish_localized_place(pid,p.updated_at,t.updated_at);
 end if;
 delete from public.place_quick_drafts where place_id=pid and editor_id=auth.uid();
 return pid;
end $$;
revoke all on function public.admin_quick_edit_state(uuid),public.admin_save_quick_draft(uuid,text,jsonb,timestamptz),public.admin_apply_quick_edit(jsonb,text,boolean) from public,anon,authenticated;
grant execute on function public.admin_quick_edit_state(uuid),public.admin_save_quick_draft(uuid,text,jsonb,timestamptz),public.admin_apply_quick_edit(jsonb,text,boolean) to authenticated;
