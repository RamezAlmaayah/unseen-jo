-- Phase 02B draft content only; target dkhwwvoplhfjccvjegty.
-- Idempotent: existing slugs/edits/publication are never overwritten.
-- No destination images, Storage objects, accounts, activity or invented values.
begin;
with inserted as (
  insert into public.places(slug,name,description,status,is_demo,source_url,
    latitude,longitude,price_min_jod,price_max_jod,duration_min_minutes,duration_max_minutes,
    city,address,best_time_to_visit,transportation_notes,suitable_groups,verified_at,verified_by)
  values('ajloun-forest','Ajloun Forest Reserve','A protected woodland area in the Ajloun highlands of northern Jordan.','draft',false,'https://www.rscn.org.jo/reserve/list?lang=en',
    null,null,null,null,null,null,null,null,null,null,null,null,null)
  on conflict(slug) do nothing returning id
)
insert into public.place_categories(place_id,category_id)
select p.id,c.id from inserted p cross join public.categories c
where c.slug in ('nature') on conflict do nothing;
with inserted as (
  insert into public.places(slug,name,description,status,is_demo,source_url,
    latitude,longitude,price_min_jod,price_max_jod,duration_min_minutes,duration_max_minutes,
    city,address,best_time_to_visit,transportation_notes,suitable_groups,verified_at,verified_by)
  values('salt-historic','As-Salt Historic Centre','The historic centre of As-Salt is recognized by UNESCO for its urban heritage and traditions of hospitality.','draft',false,'https://whc.unesco.org/en/list/689/',
    null,null,null,null,null,null,null,null,null,null,null,null,null)
  on conflict(slug) do nothing returning id
)
insert into public.place_categories(place_id,category_id)
select p.id,c.id from inserted p cross join public.categories c
where c.slug in ('culture','history') on conflict do nothing;
with inserted as (
  insert into public.places(slug,name,description,status,is_demo,source_url,
    latitude,longitude,price_min_jod,price_max_jod,duration_min_minutes,duration_max_minutes,
    city,address,best_time_to_visit,transportation_notes,suitable_groups,verified_at,verified_by)
  values('wadi-mujib','Mujib Biosphere Reserve','A protected landscape beside the Dead Sea in Jordan, managed by the Royal Society for the Conservation of Nature.','draft',false,'https://www.rscn.org.jo/reserve/list?lang=en',
    null,null,null,null,null,null,null,null,null,null,null,null,null)
  on conflict(slug) do nothing returning id
)
insert into public.place_categories(place_id,category_id)
select p.id,c.id from inserted p cross join public.categories c
where c.slug in ('nature','adventure') on conflict do nothing;
with inserted as (
  insert into public.places(slug,name,description,status,is_demo,source_url,
    latitude,longitude,price_min_jod,price_max_jod,duration_min_minutes,duration_max_minutes,
    city,address,best_time_to_visit,transportation_notes,suitable_groups,verified_at,verified_by)
  values('dana-reserve','Dana Biosphere Reserve','A protected area in Jordan with a varied landscape of mountain ridges and valleys along the Great Rift Valley.','draft',false,'https://www.rscn.org.jo/reserve/list?lang=en',
    null,null,null,null,null,null,null,null,null,null,null,null,null)
  on conflict(slug) do nothing returning id
)
insert into public.place_categories(place_id,category_id)
select p.id,c.id from inserted p cross join public.categories c
where c.slug in ('nature') on conflict do nothing;
with inserted as (
  insert into public.places(slug,name,description,status,is_demo,source_url,
    latitude,longitude,price_min_jod,price_max_jod,duration_min_minutes,duration_max_minutes,
    city,address,best_time_to_visit,transportation_notes,suitable_groups,verified_at,verified_by)
  values('iraq-al-amir','Iraq Al-Amir','An area southwest of Amman associated with hillside caves and the ancient Qasr El-Abd monument.','draft',false,'https://international.visitjordan.com/wheretogo/amman/',
    null,null,null,null,null,null,null,null,null,null,null,null,null)
  on conflict(slug) do nothing returning id
)
insert into public.place_categories(place_id,category_id)
select p.id,c.id from inserted p cross join public.categories c
where c.slug in ('culture','history') on conflict do nothing;
with inserted as (
  insert into public.places(slug,name,description,status,is_demo,source_url,
    latitude,longitude,price_min_jod,price_max_jod,duration_min_minutes,duration_max_minutes,
    city,address,best_time_to_visit,transportation_notes,suitable_groups,verified_at,verified_by)
  values('umm-qais','Umm Qais','The modern town associated with ancient Gadara in northern Jordan, with archaeological remains overlooking the Jordan Valley.','draft',false,'https://international.visitjordan.com/wheretogo/umm-qais/',
    null,null,null,null,null,null,null,null,null,null,null,null,null)
  on conflict(slug) do nothing returning id
)
insert into public.place_categories(place_id,category_id)
select p.id,c.id from inserted p cross join public.categories c
where c.slug in ('history','culture') on conflict do nothing;
commit;
