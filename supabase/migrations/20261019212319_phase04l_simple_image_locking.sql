-- Lock the destination before Storage proof; compare versions after locking all
-- dependencies to avoid accepting a concurrent media edit while waiting.
create or replace function unseen_private.prepare_image_ownership() returns trigger
language plpgsql security invoker set search_path='' as $$
declare obj storage.objects;
begin
 if not unseen_private.is_admin() then raise insufficient_privilege using message='Administrator session required';end if;
 perform 1 from public.places where id=new.place_id for update;
 if not found then raise check_violation using message='Destination unavailable';end if;
 if split_part(new.storage_path,'/',1)<>new.place_id::text then raise check_violation using message='Choose a photograph uploaded for this destination';end if;
 select * into obj from storage.objects where bucket_id='place-images' and name=new.storage_path for update;
 if not found then raise check_violation using message='Upload the photograph before confirming ownership';end if;
 new.declared_by:=auth.uid();new.declared_at:=now();
 new.statement:='I confirm these are original photographs created or owned by Unseen Jo and the project may publish them.';
 new.object_fingerprint:=jsonb_build_object('id',obj.id,'metadata',to_jsonb(obj)->'metadata');
 return new;
end $$;

create or replace function public.admin_save_simple_images(target uuid,expected_version text,images jsonb,editor_id uuid) returns uuid
language plpgsql security invoker set search_path='' as $$
declare p public.places; item jsonb; saved public.place_images; prepared jsonb; previous_context text; issues text[];
begin
 if not unseen_private.is_admin() or editor_id is distinct from auth.uid() then raise insufficient_privilege using message='Reopen the editor with your administrator account';end if;
 select * into p from public.places where id=target for update;
 if not found then raise no_data_found using message='Destination unavailable';end if;
 perform 1 from public.place_images where place_id=target for update;
 perform 1 from public.place_translations where place_id=target for update;
 perform 1 from public.place_reviews where place_id=target for update;
 perform 1 from public.place_categories where place_id=target for update;
 if unseen_private.quick_edit_version(target) is distinct from expected_version then raise serialization_failure using message='This destination changed. Reload before saving; your edits are still on this page.';end if;
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
