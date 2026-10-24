-- Private prototype overlays never change public places, translations or approvals.
create table public.private_prototype_places (
 place_id uuid primary key references public.places(id) on delete cascade,
 payload jsonb not null check(jsonb_typeof(payload)='object' and octet_length(payload::text)<=60000),
 enabled boolean not null default true,
 updated_by uuid not null references auth.users(id),
 updated_at timestamptz not null default now()
);
alter table public.private_prototype_places enable row level security;
revoke all on public.private_prototype_places from public,anon,authenticated;
grant select,insert,update on public.private_prototype_places to authenticated;
create policy prototype_admin_read on public.private_prototype_places for select to authenticated using((select unseen_private.is_admin()));
create policy prototype_admin_insert on public.private_prototype_places for insert to authenticated with check((select unseen_private.is_admin()) and updated_by=(select auth.uid()));
create policy prototype_admin_update on public.private_prototype_places for update to authenticated using((select unseen_private.is_admin())) with check((select unseen_private.is_admin()) and updated_by=(select auth.uid()));
create trigger prototype_timestamp before update on public.private_prototype_places for each row execute function unseen_private.set_updated_at();
create trigger prototype_audit after insert or update on public.private_prototype_places for each row execute function unseen_private.audit_change();

create function public.admin_save_private_prototype(target uuid, expected_source_version timestamptz, content jsonb) returns void
language plpgsql security invoker set search_path='' as $$
declare p public.places; item jsonb; variant jsonb; k text;
begin
 if not unseen_private.is_admin() then raise insufficient_privilege using message='Administrator session required'; end if;
 select * into p from public.places where id=target for share;
 if not found or p.is_demo or p.status='archived' then raise check_violation using message='Active hosted destination required'; end if;
 if p.updated_at is distinct from expected_source_version then raise serialization_failure using message='Source changed; reload before preparing prototype'; end if;
 if content->>'version'<>'1' or content->>'designation'<>'private_prototype' or content->>'slug'<>p.slug or jsonb_typeof(content->'syntheticFields')<>'array' then raise check_violation using message='Explicit prototype provenance required'; end if;
 for k in select unnest(array['name','description','city','address','region','opening_hours','activities','visitor_information','best_time_to_visit','transportation_notes']) loop
  if coalesce(length(btrim(content->'english'->>k)),0)<2 or coalesce(length(btrim(content->'arabic'->>k)),0)<2 then raise check_violation using message='Complete bilingual content required: '||k; end if;
 end loop;
 if content->'english'->>'name'<>p.name or content->'english'->>'slug'<>p.slug then raise check_violation using message='Destination identity cannot change'; end if;
 for k in select unnest(array['price_min_jod','price_max_jod','duration_min_minutes','duration_max_minutes','latitude','longitude']) loop
  if jsonb_typeof(content->'english'->k) is distinct from 'number' then raise check_violation using message='Numeric prototype field required: '||k; end if;
 end loop;
 for k in select unnest(array['budgetMin','budgetMax','residentAdmission','internationalAdmission','childAdmission']) loop
  if jsonb_typeof(content->'planning'->k) is distinct from 'number' or (content->'planning'->>k)::numeric<0 then raise check_violation using message='Valid prototype planning number required: '||k; end if;
 end loop;
 if (content->'english'->>'latitude')::numeric not between 29 and 33.6 or (content->'english'->>'longitude')::numeric not between 34.8 and 39.4
  or jsonb_typeof(content->'english'->'suitable_groups') is distinct from 'array' or jsonb_typeof(content->'planning'->'transportModes') is distinct from 'array'
  or content->'arabic'->>'name'!~'[ء-ي]' then raise check_violation using message='Valid Jordan coordinates and Arabic identity required'; end if;
 if coalesce((content->'english'->>'price_min_jod')::numeric,-1)<0 or (content->'english'->>'price_max_jod')::numeric < (content->'english'->>'price_min_jod')::numeric
  or coalesce((content->'english'->>'duration_min_minutes')::integer,0)<=0 or (content->'english'->>'duration_max_minutes')::integer < (content->'english'->>'duration_min_minutes')::integer
  or coalesce((content->'planning'->>'budgetMax')::numeric,-1)<coalesce((content->'planning'->>'budgetMin')::numeric,0)
  or jsonb_array_length(coalesce(content->'media','[]'))=0 then raise check_violation using message='Complete valid prices, duration, budget and cover required'; end if;
 for item in select * from jsonb_array_elements(content->'media') loop
  if not exists(select 1 from public.place_images i join storage.objects o on o.bucket_id='place-images' and o.name=i.storage_path
    where i.id=(item->>'imageId')::uuid and i.place_id=target and i.storage_path=item->>'storagePath'
    and length(coalesce(i.license_evidence,''))>=12 and length(coalesce(i.attribution,''))>0 and i.license_basis in('licensed','permission','public_domain','owned')) then
    raise check_violation using message='Private image with documented rights and stored bytes required';
  end if;
  if jsonb_array_length(coalesce(item->'renditions','[]'))=0 then raise check_violation using message='Responsive private variants required'; end if;
  for variant in select * from jsonb_array_elements(item->'renditions') loop
   if split_part(variant->>'storagePath','/',1)<>target::text or coalesce((variant->>'width')::integer,0) not in(320,640,1280,2400)
    or not exists(select 1 from storage.objects where bucket_id='place-images' and name=variant->>'storagePath') then raise check_violation using message='Stored responsive variant required'; end if;
  end loop;
 end loop;
 insert into public.private_prototype_places(place_id,payload,enabled,updated_by) values(target,content,true,auth.uid())
 on conflict(place_id) do update set payload=excluded.payload,enabled=true,updated_by=auth.uid()
 where private_prototype_places.payload is distinct from excluded.payload or not private_prototype_places.enabled;
end $$;
revoke all on function public.admin_save_private_prototype(uuid,timestamptz,jsonb) from public,anon,authenticated;
grant execute on function public.admin_save_private_prototype(uuid,timestamptz,jsonb) to authenticated;

create function public.admin_private_prototype_catalog() returns jsonb
language plpgsql stable security invoker set search_path='' as $$
begin
 if not unseen_private.is_admin() then raise insufficient_privilege using message='Administrator session required'; end if;
 return coalesce((select jsonb_agg(jsonb_build_object('payload',x.payload,'row',to_jsonb(p)||jsonb_build_object(
  'place_translations',(select coalesce(jsonb_agg(to_jsonb(t)),'[]') from public.place_translations t where t.place_id=p.id),
  'place_categories',(select coalesce(jsonb_agg(jsonb_build_object('categories',jsonb_build_object('id',c.id,'slug',c.slug,'name',c.name))),'[]') from public.place_categories pc join public.categories c on c.id=pc.category_id where pc.place_id=p.id and c.is_active),
  'place_images',(select coalesce(jsonb_agg(to_jsonb(i)),'[]') from public.place_images i where i.place_id=p.id))) order by p.slug)
  from public.private_prototype_places x join public.places p on p.id=x.place_id where x.enabled and p.status<>'archived' and not p.is_demo),'[]');
end $$;
revoke all on function public.admin_private_prototype_catalog() from public,anon,authenticated;
grant execute on function public.admin_private_prototype_catalog() to authenticated;
