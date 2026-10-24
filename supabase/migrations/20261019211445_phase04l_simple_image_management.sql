-- One explicit original-ownership declaration per stored upload. No blanket
-- account consent, inferred public-domain status or new public Storage access.
create table public.place_image_ownership(
 id uuid primary key default gen_random_uuid(),
 place_id uuid not null references public.places(id) on delete restrict,
 storage_path text not null unique,
 object_fingerprint jsonb not null,
 declared_by uuid not null,
 declared_at timestamptz not null default now(),
 statement text not null
);
create index place_image_ownership_place_idx on public.place_image_ownership(place_id);
alter table public.place_image_ownership enable row level security;
revoke all on public.place_image_ownership from public,anon,authenticated;
grant select,insert on public.place_image_ownership to authenticated;
create policy image_ownership_read on public.place_image_ownership for select to authenticated using((select unseen_private.is_admin()));
create policy image_ownership_insert on public.place_image_ownership for insert to authenticated with check((select unseen_private.is_admin()) and declared_by=(select auth.uid()));
create function unseen_private.prepare_image_ownership() returns trigger
language plpgsql security invoker set search_path='' as $$
declare obj storage.objects;
begin
 if not unseen_private.is_admin() then raise insufficient_privilege using message='Administrator session required';end if;
 if split_part(new.storage_path,'/',1)<>new.place_id::text then raise check_violation using message='Choose a photograph uploaded for this destination';end if;
 select * into obj from storage.objects where bucket_id='place-images' and name=new.storage_path for update;
 if not found then raise check_violation using message='Upload the photograph before confirming ownership';end if;
 new.declared_by:=auth.uid();new.declared_at:=now();
 new.statement:='I confirm these are original photographs created or owned by Unseen Jo and the project may publish them.';
 new.object_fingerprint:=jsonb_build_object('id',obj.id,'metadata',to_jsonb(obj)->'metadata');
 return new;
end $$;
revoke all on function unseen_private.prepare_image_ownership() from public,anon,authenticated;
create trigger prepare_image_ownership before insert on public.place_image_ownership for each row execute function unseen_private.prepare_image_ownership();
create trigger audit_image_ownership after insert on public.place_image_ownership for each row execute function unseen_private.audit_change();

create function public.admin_confirm_original_images(target uuid,uploaded_paths text[],editor_id uuid) returns void
language plpgsql security invoker set search_path='' as $$
declare path text;
begin
 if not unseen_private.is_admin() or editor_id is distinct from auth.uid() then raise insufficient_privilege using message='Reopen the editor with your administrator account';end if;
 if coalesce(cardinality(uploaded_paths),0) not between 1 and 30 then raise check_violation using message='Choose between one and thirty photographs';end if;
 foreach path in array uploaded_paths loop
  insert into public.place_image_ownership(place_id,storage_path,object_fingerprint,declared_by,statement)
  values(target,path,'{}',auth.uid(),'') on conflict(storage_path) do nothing;
 end loop;
end $$;

-- Canonical evidence comes from saved media or an actual object-bound declaration,
-- never editable UI flags, Google results, a filename, or a client's license claim.
create function unseen_private.simple_image_payload(target uuid,requested jsonb) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare item jsonb; result jsonb:='[]'; old_image public.place_images; proof public.place_image_ownership; obj storage.objects;
begin
 if not unseen_private.is_admin() then raise insufficient_privilege using message='Administrator session required';end if;
 if jsonb_typeof(requested) is distinct from 'array' or jsonb_array_length(requested)>100 then raise check_violation using message='Choose a valid image collection';end if;
 for item in select value from jsonb_array_elements(requested) loop
  if nullif(item->>'id','') is not null then
   select * into old_image from public.place_images where id=(item->>'id')::uuid and place_id=target;
   if not found or old_image.storage_path is distinct from item->>'storage_path' then raise check_violation using message='Choose an image belonging to this destination';end if;
   item:=item||jsonb_build_object('attribution',old_image.attribution,'source_url',old_image.source_url,'license_basis',old_image.license_basis,'license_evidence',old_image.license_evidence,'rights_confirmed',false,'rights_ready',old_image.approved_at is not null);
  else
   if split_part(item->>'storage_path','/',1) is distinct from target::text then raise check_violation using message='Choose an image belonging to this destination';end if;
   select * into obj from storage.objects where bucket_id='place-images' and name=item->>'storage_path' for update;
   if not found then raise check_violation using message='Upload the photograph before saving';end if;
   select * into proof from public.place_image_ownership where place_id=target and storage_path=item->>'storage_path'
    and object_fingerprint=jsonb_build_object('id',obj.id,'metadata',to_jsonb(obj)->'metadata');
   if found then
    item:=item||jsonb_build_object('attribution','Unseen Jo — project-owned photograph','source_url','https://dkhwwvoplhfjccvjegty.supabase.co/rest/v1/place_image_ownership?id=eq.'||proof.id,
    'license_basis','owned','license_evidence',format('Project original ownership declaration %s, affirmed by administrator %s at %s. Object identity and ownership statement retained in the private audit evidence.',proof.id,proof.declared_by,proof.declared_at),'rights_confirmed',true,'rights_ready',true);
   else
    item:=item||jsonb_build_object('attribution',null,'source_url',null,'license_basis',null,'license_evidence',null,'rights_confirmed',false,'rights_ready',false);
   end if;
  end if;
  result:=result||jsonb_build_array(item);
 end loop;return result;
end $$;
revoke all on function unseen_private.simple_image_payload(uuid,jsonb) from public,anon,authenticated;
grant execute on function unseen_private.simple_image_payload(uuid,jsonb) to authenticated;
create function public.admin_image_eligibility(target uuid,images jsonb) returns jsonb
language plpgsql security invoker set search_path='' as $$
begin return unseen_private.simple_image_payload(target,images);end $$;

-- Ordinary REST media writes remain locked on published destinations. Only this
-- narrow, caller-authorized transaction permits media-only changes, and an
-- independent deferred trigger validates the final published state as well.
create or replace function unseen_private.guard_published_dependencies() returns trigger
language plpgsql security invoker set search_path='' as $$
declare target uuid;
begin
 target:=case when tg_op='DELETE' then old.place_id else new.place_id end;
 if tg_table_name='place_images' and unseen_private.is_admin()
 and current_setting('unseen.simple_image_target',true)=target::text
 and (tg_op<>'UPDATE' or old.place_id=new.place_id) then return case when tg_op='DELETE' then old else new end;end if;
 if tg_op<>'INSERT' and exists(select 1 from public.places where id=old.place_id and status='published') then raise check_violation using message='Use the image editor to change published photographs';end if;
 if tg_op<>'DELETE' and exists(select 1 from public.places where id=new.place_id and status='published') then raise check_violation using message='Return the destination to draft before changing categories or review';end if;
 return case when tg_op='DELETE' then old else new end;
end $$;
create function unseen_private.check_published_image_state() returns trigger
language plpgsql security invoker set search_path='' as $$
declare target uuid; issues text[];
begin
 target:=case when tg_op='DELETE' then old.place_id else new.place_id end;
 if exists(select 1 from public.places where id=target and status='published') then
  issues:=public.admin_publication_issues(target);
  if coalesce(cardinality(issues),0)>0 then raise check_violation using message=array_to_string(issues,'; ');end if;
 end if;return null;
end $$;
revoke all on function unseen_private.check_published_image_state() from public,anon,authenticated;
create constraint trigger check_published_image_state after insert or update or delete on public.place_images
deferrable initially deferred for each row execute function unseen_private.check_published_image_state();

create function public.admin_save_simple_images(target uuid,expected_version text,images jsonb,editor_id uuid) returns uuid
language plpgsql security invoker set search_path='' as $$
declare p public.places; item jsonb; saved public.place_images; prepared jsonb; previous_context text; issues text[];
begin
 if not unseen_private.is_admin() or editor_id is distinct from auth.uid() then raise insufficient_privilege using message='Reopen the editor with your administrator account';end if;
 select * into p from public.places where id=target for update;
 if not found or unseen_private.quick_edit_version(target) is distinct from expected_version then raise serialization_failure using message='This destination changed. Reload before saving; your edits are still on this page.';end if;
 perform 1 from public.place_images where place_id=target for update;
 prepared:=unseen_private.simple_image_payload(target,images);
 previous_context:=current_setting('unseen.simple_image_target',true);
 perform set_config('unseen.simple_image_target',target::text,true);
 update public.place_images set is_cover=false where place_id=target and is_cover;
 for item in select value from jsonb_array_elements(prepared) loop
  if nullif(item->>'id','') is not null then
   update public.place_images set alt_text=item->>'alt_text',sort_order=(item->>'sort_order')::integer,is_cover=coalesce((item->>'is_cover')::boolean,false)
   where id=(item->>'id')::uuid and place_id=target returning * into saved;
  else
   insert into public.place_images(place_id,storage_path,alt_text,sort_order,is_cover,attribution,source_url,license_basis,license_evidence)
   values(target,item->>'storage_path',item->>'alt_text',(item->>'sort_order')::integer,coalesce((item->>'is_cover')::boolean,false),item->>'attribution',item->>'source_url',item->>'license_basis',item->>'license_evidence') returning * into saved;
   if coalesce((item->>'rights_confirmed')::boolean,false) then perform public.admin_approve_image(saved.id,saved.updated_at);end if;
  end if;
 end loop;
 delete from public.place_images i where place_id=target and not exists(select 1 from jsonb_array_elements(prepared) j where j->>'storage_path'=i.storage_path);
 if p.status='published' then
  issues:=public.admin_publication_issues(target);
  if coalesce(cardinality(issues),0)>0 then raise check_violation using message='This photograph is available in private preview only until its rights are established.';end if;
 end if;
 perform set_config('unseen.simple_image_target',coalesce(previous_context,''),true);
 delete from public.place_quick_drafts d where d.place_id=target and d.editor_id=auth.uid();
 return target;
end $$;
revoke all on function public.admin_confirm_original_images(uuid,text[],uuid),public.admin_image_eligibility(uuid,jsonb),public.admin_save_simple_images(uuid,text,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.admin_confirm_original_images(uuid,text[],uuid),public.admin_image_eligibility(uuid,jsonb),public.admin_save_simple_images(uuid,text,jsonb,uuid) to authenticated;

-- Preserve the full text-save contract; simple media uses canonical backend proof.
alter function public.admin_apply_quick_edit(jsonb,text,boolean) set schema unseen_private;
create or replace function unseen_private.admin_apply_quick_edit(changes jsonb, expected_version text, reviewed_changes boolean default false)
returns uuid language plpgsql security invoker set search_path='' as $$
declare p public.places; pid uuid; previous_status text; english jsonb; arabic jsonb;
 category_ids uuid[]; media jsonb; old_image public.place_images; saved_image public.place_images;
 t public.place_translations; metadata_changed boolean; review jsonb;
begin
 if changes ? 'editor_id' and changes->>'editor_id' is distinct from auth.uid()::text then
 raise insufficient_privilege using message='The signed-in account changed. Reopen the editor before saving.';end if;
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
 if coalesce((changes->>'simple_media')::boolean,false) then
 changes:=jsonb_set(changes,'{images}',unseen_private.simple_image_payload(pid,changes->'images'));end if;
 -- Clear only the role, not the rights, before assigning a different cover.
 update public.place_images set is_cover=false where place_id=pid and is_cover;
 for media in select value from jsonb_array_elements(changes->'images') loop
  if nullif(media->>'id','') is not null then
   select * into old_image from public.place_images where id=(media->>'id')::uuid and place_id=pid for update;
   if not found or old_image.storage_path is distinct from media->>'storage_path' then raise check_violation using message='An image does not belong to this destination. Reload the editor.'; end if;
   metadata_changed := jsonb_build_array(old_image.attribution,old_image.source_url,old_image.license_basis,old_image.license_evidence)
    is distinct from jsonb_build_array(media->>'attribution',media->>'source_url',media->>'license_basis',media->>'license_evidence');
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

create function public.admin_apply_quick_edit(changes jsonb,expected_version text,reviewed_changes boolean default false)
returns uuid language sql security invoker set search_path='' as $$
 select unseen_private.admin_apply_quick_edit(changes,expected_version,reviewed_changes)
$$;
revoke all on function public.admin_apply_quick_edit(jsonb,text,boolean) from public,anon,authenticated;
grant execute on function public.admin_apply_quick_edit(jsonb,text,boolean) to authenticated;
